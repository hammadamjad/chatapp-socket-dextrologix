'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useChat } from '@/hooks/useChat';
import MainScreen from '@/components/chat-screen/MainScreen';
import {
  Conversation,
  Message,
  ActiveUser,
  SocketMessage,
  SocketConversation,
  SocketUser,
} from '@/types';

export default function ChatScreen() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const {
    isConnected,
    activeUsers,
    conversations,
    messages,
    allUsers,
    sendMessage,
    createConversation,
    selectConversation,
  } = useChat();
  const [selectedUser, setSelectedUser] = useState<ActiveUser | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) router.push('/login');
  }, [session, status, router]);

  // Convert all users to conversations format
  const conversationsList: Conversation[] = (allUsers as SocketUser[])
    .filter(user => user.id !== session?.user?.id)
    .map(user => {
      // Find existing conversation for this user
      const existingConversation = (conversations as SocketConversation[]).find(
        conv => conv.participants.some((p: string) => p === user.id)
      );

      // Get last message from existing conversation or use placeholder
      const lastMessage =
        existingConversation?.lastMessage || 'Start a conversation...';
      const lastMessageTime = existingConversation?.lastMessageTime
        ? new Date(existingConversation.lastMessageTime).toLocaleTimeString()
        : new Date().toLocaleTimeString();

      // Check if user is online
      const isUserOnline = activeUsers.some(
        activeUser => activeUser.id === user.id
      );

      return {
        id: user.id,
        user: {
          id: user.id,
          name: user.name,
          avatar: user.image || '/default-avatar.jpg',
          status: isUserOnline ? 'online' : 'offline',
        },
        lastMessage,
        timestamp: lastMessageTime,
      };
    });

  // Convert messages to the expected format
  const messagesList: Message[] = (messages as SocketMessage[]).map(msg => ({
    id: msg.id,
    sender: msg.senderId === session?.user?.id ? 'user' : 'other',
    content: msg.content,
    timestamp: new Date(msg.timestamp).toLocaleTimeString(),
    type: 'text' as const,
    read: msg.read || false,
  }));

  const handleSendMessage = (message: string) => {
    if (selectedUser) {
      sendMessage(selectedUser.id, message);
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    const user = (allUsers as SocketUser[]).find(u => u.id === conversation.id);

    if (user) {
      setSelectedUser(user);

      // Find existing conversation or create new one
      const existingConversation = (conversations as SocketConversation[]).find(
        conv => conv.participants.some((p: string) => p === user.id)
      );

      if (existingConversation) {
        selectConversation(existingConversation);
      } else {
        createConversation(session?.user?.id || '', user.id);
      }
    }
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  if (status === 'loading') {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-lg'>Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <MainScreen
      conversations={conversationsList}
      messages={messagesList}
      user={session.user}
      onSendMessage={handleSendMessage}
      onLogout={handleLogout}
      isConnected={isConnected}
      onSelectConversation={handleSelectConversation}
    />
  );
}
