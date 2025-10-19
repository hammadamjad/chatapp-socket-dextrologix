// Mock data
import { Conversation, Message } from '@/types';

export const mockConversations: Conversation[] = [
  {
    id: '1',
    user: {
      id: 'user1',
      name: 'Farand Hume',
      avatar: '/avatar-farand.jpg',
      status: 'online',
    },
    lastMessage: 'How about 7 PM at the new Italian pla...',
    timestamp: 'Yesterday',
  },
  {
    id: '2',
    user: {
      id: 'user2',
      name: 'Ossie Peasey',
      avatar: '/avatar-ossie.jpg',
      status: 'online',
    },
    lastMessage: 'Hey Bonnie, yes, definitely! What tim...',
    timestamp: '13',
    unreadCount: 0,
  },
  {
    id: '3',
    user: {
      id: 'user3',
      name: 'Hall Negri',
      avatar: '/avatar-hall.jpg',
      status: 'offline',
    },
    lastMessage: "No worries at all! I'll grab a table and w...",
    timestamp: '2 days',
  },
  {
    id: '4',
    user: {
      id: 'user4',
      name: 'Elyssa Segot',
      avatar: '/avatar-elyssa.jpg',
      status: 'online',
    },
    lastMessage: 'She just told me today.',
    timestamp: 'Yesterday',
  },
  {
    id: '5',
    user: {
      id: 'user5',
      name: 'Gil Wilfing',
      avatar: '/avatar-gil.jpg',
      status: 'offline',
    },
    lastMessage: 'See you in 5 minutes!',
    timestamp: '1 day',
  },
  {
    id: '6',
    user: {
      id: 'user6',
      name: 'Bab Cleaton',
      avatar: '/avatar-bab.jpg',
      status: 'offline',
    },
    lastMessage: 'If it takes long you can mail',
    timestamp: '3 hours',
  },
  {
    id: '7',
    user: {
      id: 'user7',
      name: 'Janith Satch',
      avatar: '/avatar-janith.jpg',
      status: 'online',
    },
    lastMessage: "It's amazing to see he...",
    timestamp: '1 day',
    unreadCount: 2,
  },
];

export const mockMessages: Message[] = [
  {
    id: '1',
    sender: 'other',
    content: 'Hey! How are you doing?',
    timestamp: '10:30 AM',
    type: 'text',
  },
  {
    id: '2',
    sender: 'user',
    content: "I'm doing great! How about you?",
    timestamp: '10:32 AM',
    type: 'text',
  },
  {
    id: '3',
    sender: 'other',
    content: 'Pretty good! Want to grab coffee later?',
    timestamp: '10:35 AM',
    type: 'text',
  },
];
