export interface Message {
  id: string;
  sender: 'user' | 'other';
  content: string;
  timestamp: string;
  type: 'text';
  read?: boolean;
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

// Authentication types
export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  provider: 'credentials' | 'google';
  emailVerified?: Date;
}

// NextAuth session user type
export interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  provider?: 'credentials' | 'google';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
}

// Socket-related types
export interface SocketUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  isOnline?: boolean;
}

export interface SocketMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  conversationId: string;
  timestamp: string;
  read?: boolean;
}

export interface SocketConversation {
  _id: string;
  participants: string[];
  lastMessage: string;
  lastMessageTime: string;
  messageCount: number;
}

// Active user type (same as SocketUser but with different name for clarity)
export interface ActiveUser {
  id: string;
  name: string;
  email: string;
  image?: string;
}
