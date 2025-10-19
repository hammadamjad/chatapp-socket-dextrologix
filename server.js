import { createServer } from 'node:http';
import next from 'next';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import Message from './src/models/Message.js';
import Conversation from './src/models/Conversation.js';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

// Connect to MongoDB
const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://admin:admin@cluster0.kd2xzet.mongodb.net/chat-app?retryWrites=true&w=majority&appName=Cluster0';

console.log('Connecting to MongoDB:', MONGODB_URI);

let isDbConnected = false;

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    isDbConnected = true;
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log(
      '⚠️  Running without database - messages will not be persisted'
    );
    isDbConnected = false;
  });

// Store active users
const activeUsers = new Map();

// In-memory storage for when database is not available
const inMemoryMessages = new Map();
const inMemoryConversations = new Map();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer, {
    cors: {
      origin: dev ? 'http://localhost:3000' : process.env.NEXT_PUBLIC_APP_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', socket => {
    console.log('User connected:', socket.id);

    // Handle user login
    socket.on('user:login', async userData => {
      const { userId, name, email, image } = userData;
      console.log('User login received:', { userId, name, email });

      activeUsers.set(userId, {
        id: userId,
        name,
        email,
        image,
        socketId: socket.id,
      });

      console.log('Total active users:', activeUsers.size);

      // Send all active users to everyone
      io.emit('active:users', Array.from(activeUsers.values()));

      console.log(`User ${name} logged in`);
    });

    // Handle sending messages
    socket.on('message:send', async messageData => {
      const { senderId, receiverId, content, conversationId } = messageData;

      try {
        const message = {
          id: Date.now().toString(),
          senderId,
          receiverId,
          content,
          conversationId,
          timestamp: new Date(),
          read: false,
        };

        if (isDbConnected) {
          // Save message to database
          const dbMessage = new Message(message);
          await dbMessage.save();
          message.id = dbMessage._id;

          // Update conversation last message
          await Conversation.findOneAndUpdate(
            { _id: conversationId },
            {
              lastMessage: content,
              lastMessageTime: new Date(),
              $inc: { messageCount: 1 },
            }
          );
        } else {
          // Store in memory
          if (!inMemoryMessages.has(conversationId)) {
            inMemoryMessages.set(conversationId, []);
          }
          inMemoryMessages.get(conversationId).push(message);

          // Update in-memory conversation
          if (inMemoryConversations.has(conversationId)) {
            const conversation = inMemoryConversations.get(conversationId);
            conversation.lastMessage = content;
            conversation.lastMessageTime = message.timestamp.toISOString();
            conversation.messageCount = (conversation.messageCount || 0) + 1;
            inMemoryConversations.set(conversationId, conversation);
          }
        }

        // Send message to receiver if they're online
        const receiver = activeUsers.get(receiverId);
        if (receiver) {
          io.to(receiver.socketId).emit('message:receive', {
            id: message.id,
            senderId,
            receiverId,
            content,
            conversationId,
            timestamp: message.timestamp.toISOString(),
            read: false,
          });
        }

        // Send confirmation back to sender
        socket.emit('message:sent', {
          id: message.id,
          senderId,
          receiverId,
          content,
          conversationId,
          timestamp: message.timestamp.toISOString(),
          read: true,
        });
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('message:error', 'Failed to send message');
      }
    });

    // Handle getting conversations for a user
    socket.on('conversations:get', async data => {
      const { userId } = data;

      try {
        if (isDbConnected) {
          // Database is connected - use MongoDB
          const conversations = await Conversation.find({
            participants: userId,
          })
            .populate('participants', 'name email image')
            .sort({ lastMessageTime: -1 });

          socket.emit('conversations:list', conversations);
        } else {
          // Database not connected - use in-memory storage
          const conversations = Array.from(inMemoryConversations.values())
            .filter(conv => conv.participants.includes(userId))
            .sort(
              (a, b) =>
                new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
            );

          socket.emit('conversations:list', conversations);
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
        socket.emit('conversations:error', 'Failed to fetch conversations');
      }
    });

    // Handle getting messages for a conversation
    socket.on('messages:get', async data => {
      const { conversationId } = data;

      try {
        if (isDbConnected) {
          // Database is connected - fetch from MongoDB
          const messages = await Message.find({ conversationId })
            .sort({ timestamp: 1 })
            .limit(50); // Limit to last 50 messages

          socket.emit('messages:history', messages);
        } else {
          // Database not connected - use in-memory storage
          const messages = inMemoryMessages.get(conversationId) || [];
          socket.emit('messages:history', messages);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        socket.emit('messages:error', 'Failed to fetch messages');
      }
    });

    // Handle creating a new conversation
    socket.on('conversation:create', async data => {
      const { userId1, userId2 } = data;

      try {
        if (isDbConnected) {
          // Database is connected - use MongoDB
          let conversation = await Conversation.findOne({
            participants: { $all: [userId1, userId2] },
          });

          if (!conversation) {
            conversation = new Conversation({
              participants: [userId1, userId2],
              lastMessage: '',
              lastMessageTime: new Date(),
              messageCount: 0,
            });
            await conversation.save();
          }

          socket.emit('conversation:created', conversation);
        } else {
          // Database not connected - use in-memory storage
          // Use consistent format (smaller ID first)
          const ids = [userId1, userId2].sort();
          const conversationId = `${ids[0]}-${ids[1]}`;
          const conversation = {
            _id: conversationId,
            participants: [userId1, userId2],
            lastMessage: '',
            lastMessageTime: new Date().toISOString(),
            messageCount: 0,
          };

          inMemoryConversations.set(conversationId, conversation);
          socket.emit('conversation:created', conversation);
        }
      } catch (error) {
        console.error('Error creating conversation:', error);
        socket.emit('conversation:error', 'Failed to create conversation');
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);

      // Remove user from active users
      for (const [userId, user] of activeUsers.entries()) {
        if (user.socketId === socket.id) {
          activeUsers.delete(userId);
          io.emit('active:users', Array.from(activeUsers.values()));
          console.log(`User ${user.name} disconnected`);
          break;
        }
      }
    });
  });

  httpServer
    .once('error', err => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
