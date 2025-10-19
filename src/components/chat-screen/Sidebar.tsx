'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { HiPlus } from 'react-icons/hi2';
import { Conversation } from '@/types';
import { RxAvatar } from 'react-icons/rx';

interface ChatSidebarProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
}

export default function Sidebar({
  conversations,
  selectedConversation,
  onSelectConversation,
}: ChatSidebarProps) {
  return (
    <div className='w-80 border-r border-border bg-card'>
      {/* Header */}
      <div className='border-b border-border p-4'>
        <div className='mb-4 flex items-center justify-between'>
          <h1 className='text-2xl font-bold text-foreground'>Chats</h1>
          <Button
            size='icon'
            variant='ghost'
            className='h-10 w-10 rounded-full'
          >
            <HiPlus className='h-5 w-5' />
          </Button>
        </div>

        {/* Search */}
        <Input placeholder='Chats search...' className='bg-background' />
      </div>

      {/* Conversations List */}
      <div className='overflow-y-auto'>
        {conversations.length === 0 ? (
          <div className='flex items-center justify-center p-8 text-muted-foreground'>
            <p>No conversations yet</p>
          </div>
        ) : (
          conversations.map(conversation => (
            <button
              key={conversation.id}
              onClick={() => onSelectConversation(conversation)}
              className={`w-full border-b border-border px-4 py-3 text-left transition-colors hover:bg-muted ${
                selectedConversation?.id === conversation.id ? 'bg-muted' : ''
              }`}
            >
              <div className='flex items-start gap-3'>
                <div className='relative'>
                  <RxAvatar className='h-12 w-12 rounded-full object-cover' />
                  {conversation.user.status === 'online' && (
                    <span className='absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card bg-green-500' />
                  )}
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center justify-between gap-2'>
                    <h3 className='font-semibold text-foreground'>
                      {conversation.user.name}
                    </h3>
                    <span className='text-xs text-muted-foreground'>
                      {conversation.timestamp}
                    </span>
                  </div>
                  <p className='truncate text-sm text-muted-foreground'>
                    ✓ {conversation.lastMessage}
                  </p>
                  {conversation.unreadCount && conversation.unreadCount > 0 && (
                    <div className='mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-xs font-semibold text-white'>
                      {conversation.unreadCount}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
