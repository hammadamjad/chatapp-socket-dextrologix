'use client';

import ChatScreen from '@/components/chat-screen/MainScreen';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { mockConversations, mockMessages } from '@/lib/data';

function ChatScreenPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading
    if (!session) router.push('/login'); // Not authenticated
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-lg'>Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect to login
  }

  return (
    <div>
      <ChatScreen
        conversations={mockConversations}
        messages={mockMessages}
        user={session.user}
        onLogout={() => signOut({ callbackUrl: '/login' })}
      />
    </div>
  );
}

export default ChatScreenPage;
