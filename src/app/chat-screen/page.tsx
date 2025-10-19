import ChatScreen from '@/components/chat-screen/MainScreen';
import React from 'react';
import { mockConversations, mockMessages } from '@/lib/data';

function ChatScreenPage() {
  return (
    <div>
      <ChatScreen conversations={mockConversations} messages={mockMessages} />
    </div>
  );
}

export default ChatScreenPage;
