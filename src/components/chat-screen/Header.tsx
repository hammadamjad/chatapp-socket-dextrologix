import { ChatUser } from '@/types';
import Image from 'next/image';
import { BiSolidPhone, BiSolidVideo } from 'react-icons/bi';
import { HiEllipsisVertical } from 'react-icons/hi2';
import { RxAvatar } from 'react-icons/rx';

interface ChatHeaderProps {
  user: ChatUser;
}

export default function ChatHeader({ user }: ChatHeaderProps) {
  return (
    <div className='border-b border-border bg-card px-6 py-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <RxAvatar className='h-10 w-10 rounded-full object-cover' />
          <div>
            <h2 className='font-semibold text-foreground'>{user.name}</h2>
            <p className='text-sm text-muted-foreground'>
              {user.status === 'online' ? (
                <span className='flex items-center gap-1'>
                  <span className='h-2 w-2 rounded-full bg-green-500' />
                  Online
                </span>
              ) : (
                'Offline'
              )}
            </p>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <button className='rounded-lg p-2 hover:bg-muted'>
            <BiSolidVideo className='h-5 w-5 text-foreground' />
          </button>
          <button className='rounded-lg p-2 hover:bg-muted'>
            <BiSolidPhone className='h-5 w-5 text-foreground' />
          </button>
          <button className='rounded-lg p-2 hover:bg-muted'>
            <HiEllipsisVertical className='h-5 w-5 text-foreground' />
          </button>
        </div>
      </div>
    </div>
  );
}
