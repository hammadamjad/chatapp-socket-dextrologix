'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { socket } from '../socket';
import { SocketUser, SocketMessage, SocketConversation } from '../types';

export const useChat = () => {
  const { data: session } = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState<SocketUser[]>([]);
  const [conversations, setConversations] = useState<SocketConversation[]>([]);
  const [messages, setMessages] = useState<SocketMessage[]>([]);
  const [allUsers, setAllUsers] = useState<SocketUser[]>([]);
  const [currentConversation, setCurrentConversation] =
    useState<SocketConversation | null>(null);

  const loadConversations = useCallback(() => {
    if (socket && session?.user) {
      socket.emit('conversations:get', { userId: session.user.id });
    }
  }, [session?.user]);

  useEffect(() => {
    if (session?.user) {
      // Connect to socket
      socket.connect();

      // Handle connection events
      const onConnect = () => {
        setIsConnected(true);
        socket.emit('user:login', {
          userId: session.user.id,
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
        });
        // Load conversations when connected
        loadConversations();
      };

      const onConnectError = (error: Error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      };

      const onDisconnect = () => {
        setIsConnected(false);
      };

      // Handle active users
      const onActiveUsers = (users: SocketUser[]) => {
        const filteredUsers = users.filter(
          user => user.id !== session.user?.id
        );
        setActiveUsers(filteredUsers);

        // Update all users with online status
        setAllUsers(prevUsers => {
          const updatedUsers = [...prevUsers];
          filteredUsers.forEach(activeUser => {
            const existingIndex = updatedUsers.findIndex(
              u => u.id === activeUser.id
            );
            if (existingIndex >= 0) {
              updatedUsers[existingIndex] = { ...activeUser, isOnline: true };
            } else {
              updatedUsers.push({ ...activeUser, isOnline: true });
            }
          });
          return updatedUsers;
        });
      };

      // Handle conversations
      const onConversationsList = (conversationsList: SocketConversation[]) => {
        setConversations(conversationsList);
      };

      // Handle messages
      const onMessageReceive = (message: SocketMessage) => {
        setMessages(prev => [...prev, message]);
      };

      const onMessageSent = (message: SocketMessage) => {
        setMessages(prev => [...prev, message]);
      };

      const onMessagesHistory = (history: SocketMessage[]) => {
        setMessages(history);
      };

      // Handle conversation creation
      const onConversationCreated = (conversation: SocketConversation) => {
        setConversations(prev => [conversation, ...prev]);
        setCurrentConversation(conversation);
      };

      // Register event listeners
      socket.on('connect', onConnect);
      socket.on('connect_error', onConnectError);
      socket.on('disconnect', onDisconnect);
      socket.on('active:users', onActiveUsers);
      socket.on('conversations:list', onConversationsList);
      socket.on('message:receive', onMessageReceive);
      socket.on('message:sent', onMessageSent);
      socket.on('messages:history', onMessagesHistory);
      socket.on('conversation:created', onConversationCreated);

      // Load conversations on connect
      if (socket.connected) {
        onConnect();
      }

      return () => {
        socket.off('connect', onConnect);
        socket.off('connect_error', onConnectError);
        socket.off('disconnect', onDisconnect);
        socket.off('active:users', onActiveUsers);
        socket.off('conversations:list', onConversationsList);
        socket.off('message:receive', onMessageReceive);
        socket.off('message:sent', onMessageSent);
        socket.off('messages:history', onMessagesHistory);
        socket.off('conversation:created', onConversationCreated);
      };
    }
  }, [session, loadConversations]);

  // Load conversations when user logs in and socket is connected
  useEffect(() => {
    if (session?.user && isConnected) {
      loadConversations();
    }
  }, [session, isConnected, loadConversations]);

  // Load conversations immediately when component mounts
  useEffect(() => {
    if (session?.user) {
      // Try to load conversations immediately
      loadConversations();

      // If socket not connected, wait a bit and try again
      const timer = setTimeout(() => {
        loadConversations();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [session, loadConversations]);

  const sendMessage = (receiverId: string, content: string) => {
    if (socket && session?.user) {
      const conversationId =
        currentConversation?._id || `${session.user.id}-${receiverId}`;

      socket.emit('message:send', {
        senderId: session.user.id,
        receiverId,
        content,
        conversationId,
      });
    }
  };

  const loadMessages = (conversationId: string) => {
    if (socket) {
      setMessages([]);
      socket.emit('messages:get', { conversationId });
    }
  };

  const createConversation = (userId1: string, userId2: string) => {
    if (socket) {
      socket.emit('conversation:create', { userId1, userId2 });
    }
  };

  const selectConversation = (conversation: SocketConversation) => {
    setCurrentConversation(conversation);
    loadMessages(conversation._id);
  };

  const markMessageAsRead = (messageId: string) => {
    setMessages(prev =>
      prev.map(msg => (msg.id === messageId ? { ...msg, read: true } : msg))
    );
  };

  const fetchAllUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const users = await response.json();
        setAllUsers(users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Fetch all users on mount
  useEffect(() => {
    if (session?.user) {
      fetchAllUsers();
    }
  }, [session]);

  return {
    isConnected,
    activeUsers,
    conversations,
    messages,
    allUsers,
    currentConversation,
    sendMessage,
    loadMessages,
    createConversation,
    selectConversation,
    markMessageAsRead,
    fetchAllUsers,
    loadConversations,
  };
};
