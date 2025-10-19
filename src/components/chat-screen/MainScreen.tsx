'use client';

import { useState } from 'react';
import ChatSidebar from '@/components/chat-screen/Sidebar';
import ChatContainer from '@/components/chat-screen/ChatContainer';
import CustomInput from '@/components/chat-screen/CustomInput';
import { Conversation, Message, ChatUser } from '@/types';
import ChatHeader from '@/components/chat-screen/Header';

interface ChatScreenProps {
  conversations?: Conversation[];
  messages?: Message[];
  currentUser?: ChatUser;
  onSendMessage?: (message: string) => void;
}

export default function ChatScreen({
  conversations = [],
  messages = [],
  onSendMessage,
}: ChatScreenProps) {
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(conversations[0] || null);
  const [messageList, setMessageList] = useState<Message[]>(messages);

  const handleSendMessage = (message: string) => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: message,
      timestamp: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      type: 'text',
    };

    setMessageList([...messageList, newMessage]);
    onSendMessage?.(message);
  };

  return (
    <div className='flex h-screen bg-background'>
      {/* Sidebar */}
      <ChatSidebar
        conversations={conversations}
        selectedConversation={selectedConversation}
        onSelectConversation={setSelectedConversation}
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
