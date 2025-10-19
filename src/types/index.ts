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
