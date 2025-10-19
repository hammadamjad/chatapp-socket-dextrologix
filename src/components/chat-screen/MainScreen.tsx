'use client';

import { useState } from 'react';
import ChatSidebar from '@/components/chat-screen/Sidebar';
import ChatContainer from '@/components/chat-screen/ChatContainer';
import CustomInput from '@/components/chat-screen/CustomInput';
import { Conversation, Message, ChatUser, SessionUser } from '@/types';
import ChatHeader from '@/components/chat-screen/Header';

interface ChatScreenProps {
  conversations?: Conversation[];
  messages?: Message[];
  currentUser?: ChatUser;
  user?: SessionUser;
  onSendMessage?: (message: string) => void;
  onLogout?: () => void;
  isConnected?: boolean;
  onSelectConversation?: (conversation: Conversation) => void;
}

export default function ChatScreen({
  conversations = [],
  messages = [],
  user,
  onSendMessage,
  onLogout,
  isConnected = false,
  onSelectConversation,
}: ChatScreenProps) {
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(conversations[0] || null);

  // Use passed messages instead of local state
  const messageList = messages;

  const handleSendMessage = (message: string) => {
    if (!message.trim()) return;
    onSendMessage?.(message);
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    onSelectConversation?.(conversation);
  };

  return (
    <div className='flex h-screen bg-background'>
      {/* Sidebar */}
      <ChatSidebar
        conversations={conversations}
        selectedConversation={selectedConversation}
        onSelectConversation={handleSelectConversation}
        user={user}
        onLogout={onLogout}
        isConnected={isConnected}
      />

      {/* Main Chat Area */}
      <div className='flex flex-1 flex-col'>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <ChatHeader user={selectedConversation.user} />

            {/* Messages */}
            <ChatContainer messages={messageList} />

            {/* Input Area */}
            <CustomInput onSendMessage={handleSendMessage} />
          </>
        ) : (
          <div className='flex flex-1 items-center justify-center text-muted-foreground'>
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
