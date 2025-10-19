import nodemailer from 'nodemailer';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

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

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    const config: EmailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    };

    this.transporter = nodemailer.createTransport(config);
  }

  private generateEmailTemplate(
    user: UserWithUnreadMessages,
    appUrl: string
  ): string {
    const { name, unreadMessages } = user;
    const unreadCount = unreadMessages.length;

    let messagesList = '';
    unreadMessages.forEach((message, index) => {
      const timeAgo = this.getTimeAgo(message.timestamp);
      messagesList += `
        <div style="border-left: 3px solid #3b82f6; padding-left: 12px; margin-bottom: 16px;">
          <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px;">
            ${message.senderName}
          </div>
          <div style="color: #4b5563; margin-bottom: 4px;">
            ${message.content}
          </div>
          <div style="font-size: 12px; color: #9ca3af;">
            ${timeAgo}
          </div>
        </div>
      `;
    });

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Unread Messages - Chat App</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px; margin-bottom: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">
              💬 You have ${unreadCount} unread message${
      unreadCount !== 1 ? 's' : ''
    }
            </h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 16px;">
              Good morning, ${name}! Here's what you missed.
            </p>
          </div>

          <div style="background: #f8fafc; padding: 24px; border-radius: 8px; margin-bottom: 24px;">
            <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 20px;">
              📨 Your Unread Messages
            </h2>
            ${messagesList}
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${appUrl}/chat-screen" 
               style="background: #3b82f6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              Open Chat App
            </a>
          </div>

          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center; color: #6b7280; font-size: 14px;">
            <p style="margin: 0;">
              This is an automated message from your Chat App. 
              <br>
              You're receiving this because you have unread messages.
            </p>
            <p style="margin: 8px 0 0 0;">
              <a href="${appUrl}" style="color: #3b82f6; text-decoration: none;">Visit our website</a> | 
              <a href="#" style="color: #3b82f6; text-decoration: none;">Unsubscribe</a>
            </p>
          </div>
        </body>
      </html>
    `;
  }

  private getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    }
  }

  async sendUnreadMessagesEmail(
    user: UserWithUnreadMessages
  ): Promise<boolean> {
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const htmlContent = this.generateEmailTemplate(user, appUrl);

      const mailOptions = {
        from: `"Chat App" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: `You have ${user.unreadMessages.length} unread message${
          user.unreadMessages.length !== 1 ? 's' : ''
        } - Chat App`,
        html: htmlContent,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully to ${user.email}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to send email to ${user.email}:`, error);
      return false;
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('✅ Email service connection verified');
      return true;
    } catch (error) {
      console.error('❌ Email service connection failed:', error);
      return false;
    }
  }
}

export default EmailService;
