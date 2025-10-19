export interface Message {
  id: string;
  sender: 'user' | 'other';
  content: string;
  timestamp: string;
  type: 'text';
}

export interface ChatUser {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline';
}

export interface Conversation {
  id: string;
  user: ChatUser;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
}
