'use client';

import type React from 'react';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MdEmojiEmotions, MdAttachFile, MdMic } from 'react-icons/md';

interface ChatInputAreaProps {
  onSendMessage: (message: string) => void;
}

export default function CustomInput({ onSendMessage }: ChatInputAreaProps) {
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className='border-t border-border bg-card p-4'>
      <div className='flex items-center gap-3'>
        <Button
          size='icon'
          variant='ghost'
          className='h-10 w-10 rounded-full text-muted-foreground hover:text-foreground'
        >
          <MdEmojiEmotions className='h-5 w-5' />
        </Button>

        <Input
          ref={inputRef}
          placeholder='Enter message...'
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className='flex-1 bg-background'
        />

        <Button
          size='icon'
          variant='ghost'
          className='h-10 w-10 rounded-full text-muted-foreground hover:text-foreground'
        >
          <MdAttachFile className='h-5 w-5' />
        </Button>

        <Button
          size='icon'
          variant='ghost'
          className='h-10 w-10 rounded-full text-muted-foreground hover:text-foreground'
        >
          <MdMic className='h-5 w-5' />
        </Button>

        <Button onClick={handleSend} className='rounded-lg px-6 font-semibold'>
          Send
        </Button>
      </div>
    </div>
  );
}
