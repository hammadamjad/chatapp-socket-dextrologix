'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { HiPlus } from 'react-icons/hi2';
import { HiLogout } from 'react-icons/hi';
import { Conversation, SessionUser } from '@/types';
import { RxAvatar } from 'react-icons/rx';
import Image from 'next/image';

interface ChatSidebarProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  user?: SessionUser;
  onLogout?: () => void;
  isConnected?: boolean;
}

export default function Sidebar({
  conversations,
  selectedConversation,
  onSelectConversation,
  user,
  onLogout,
  isConnected = false,
}: ChatSidebarProps) {
  return (
    <div className='w-80 border-r border-border bg-card flex flex-col'>
      {/* Header */}
      <div className='border-b border-border p-4'>
        <div className='mb-4 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <h1 className='text-2xl font-bold text-foreground'>Active Users</h1>
            <div
              className={`h-2 w-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}
              title={isConnected ? 'Connected' : 'Disconnected'}
            />
          </div>
          <Button
            size='icon'
            variant='ghost'
            className='h-10 w-10 rounded-full'
          >
            <HiPlus className='h-5 w-5' />
          </Button>
        </div>

        {/* Search */}
        <Input placeholder='Search active users...' className='bg-background' />
      </div>

      {/* Conversations List */}
      <div className='overflow-y-auto flex-1'>
        {conversations.length === 0 ? (
          <div className='flex items-center justify-center p-8 text-muted-foreground'>
            <div className='text-center'>
              <p>No other users online</p>
              <p className='text-xs mt-1'>
                Connection: {isConnected ? 'Connected' : 'Disconnected'}
              </p>
            </div>
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

      {/* User Profile Section */}
      {user && (
        <div className='border-t border-border p-4 justify-end bg-amber-100'>
          <div className='flex items-center gap-3'>
            <div className='relative'>
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name || 'User'}
                  width={40}
                  height={40}
                  className='h-10 w-10 rounded-full object-cover'
                />
              ) : (
                <RxAvatar className='h-10 w-10 rounded-full' />
              )}
            </div>
            <div className='flex-1 min-w-0'>
              <p className='font-semibold text-foreground truncate'>
                {user.name || 'User'}
              </p>
              <p className='text-xs text-muted-foreground truncate'>
                {user.email || 'No email'}
              </p>
            </div>
            <Button
              size='icon'
              variant='ghost'
              onClick={onLogout}
              className='h-8 w-8 text-muted-foreground hover:text-foreground'
              title='Logout'
            >
              <HiLogout className='h-4 w-4' />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
