/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import User from '../../../../models/User';
import Message from '../../../../models/Message';
import Conversation from '../../../../models/Conversation';
import EmailService from '../../../../lib/emailService';

interface UnreadMessage {
  id: string;
  content: string;
  senderName: string;
  timestamp: Date;
  conversationId: string;
}

interface UserWithUnreadMessages {
  id: string;
  name: string;
  email: string;
  unreadMessages: UnreadMessage[];
}

export async function GET(request: NextRequest) {
  try {
    console.log('📧 Starting daily unread messages email job...');

    // Verify this is a Vercel cron job request
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const emailService = new EmailService();

    // Verify email service connection
    const emailConnected = await emailService.verifyConnection();
    if (!emailConnected) {
      return NextResponse.json(
        { error: 'Email service not available' },
        { status: 500 }
      );
    }

    // Get all users
    const users = await User.find({}, 'name email').lean();
    console.log(`📊 Found ${users.length} users to process`);

    let emailsSent = 0;
    let emailsFailed = 0;

    for (const user of users) {
      try {
        // Get unread messages for this user
        const userId = (user._id as any).toString();
        const unreadMessages = await getUnreadMessagesForUser(userId);

        if (unreadMessages.length > 0) {
          console.log(
            `📨 User ${user.name} has ${unreadMessages.length} unread messages`
          );

          const userWithMessages: UserWithUnreadMessages = {
            id: userId,
            name: user.name,
            email: user.email,
            unreadMessages,
          };

          const emailSent = await emailService.sendUnreadMessagesEmail(
            userWithMessages
          );
          if (emailSent) {
            emailsSent++;
          } else {
            emailsFailed++;
          }
        } else {
          console.log(`✅ User ${user.name} has no unread messages`);
        }
      } catch (error) {
        console.error(`❌ Error processing user ${user.name}:`, error);
        emailsFailed++;
      }
    }

    console.log(
      `📊 Daily email job completed: ${emailsSent} sent, ${emailsFailed} failed`
    );

    return NextResponse.json({
      success: true,
      message: 'Daily email job completed',
      stats: {
        totalUsers: users.length,
        emailsSent,
        emailsFailed,
      },
    });
  } catch (error) {
    console.error('❌ Error in daily email job:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Daily email job failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

async function getUnreadMessagesForUser(
  userId: string
): Promise<UnreadMessage[]> {
  try {
    // Get all conversations where the user is a participant
    const conversations = await Conversation.find({
      participants: userId,
    }).lean();

    const conversationIds = conversations.map(conv => conv._id);

    if (conversationIds.length === 0) {
      return [];
    }

    // Get unread messages for these conversations where the user is the receiver
    const unreadMessages = await Message.find({
      conversationId: { $in: conversationIds },
      receiverId: userId,
      read: false,
    })
      .populate('senderId', 'name')
      .sort({ timestamp: -1 })
      .lean();

    // Transform the data to include sender name
    const transformedMessages: UnreadMessage[] = unreadMessages.map(
      (msg: any) => ({
        id: (msg._id as any).toString(),
        content: msg.content,
        senderName: msg.senderId?.name || 'Unknown',
        timestamp: msg.timestamp,
        conversationId: (msg.conversationId as any).toString(),
      })
    );

    return transformedMessages;
  } catch (error) {
    console.error(
      `❌ Error fetching unread messages for user ${userId}:`,
      error
    );
    return [];
  }
}
