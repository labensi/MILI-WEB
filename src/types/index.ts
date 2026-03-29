export interface User {
  uid: string;
  email: string;
  username: string;
  displayName: string;
  photoURL: string | null;
  bannerURL: string | null;
  bio: string | null;
  accentColor: string;
  fontStyle: string;
  fontColor: string;
  fontAnimation: string;
  avatarFrame: number;
  profileEffect: number;
  theme: string;
  darkMode: boolean;
  soundVolume: number;
  isAdmin: boolean;
  isBanned: boolean;
  createdAt: Date;
  lastSeen: Date;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  type: 'public' | 'private';
  code: string | null;
  theme: number;
  primaryColor: string;
  glowColor: string;
  glowIntensity: number;
  backgroundImage: string | null;
  backgroundPreset: string | null;
  fontStyle: string;
  members: string[];
  memberCount: number;
  createdAt: Date;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'embed';
  mediaURL: string | null;
  embedData: any | null;
  reactions: Record<string, string[]>;
  replyTo: string | null;
  isPinned: boolean;
  isDeleted: boolean;
  editedAt: Date | null;
  createdAt: Date;
}

export interface Post {
  id: string;
  authorId: string;
  type: 'image' | 'video' | 'text';
  content: string;
  mediaURL: string | null;
  filterName: string | null;
  frameName: string | null;
  bgStyle: string | null;
  likes: string[];
  commentCount: number;
  createdAt: Date;
}

export interface Comment {
  id: string;
  authorId: string;
  content: string;
  likes: string[];
  replyTo: string | null;
  createdAt: Date;
}

export interface DM {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: Record<string, number>;
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'dm' | 'invite' | 'announcement' | 'mention';
  fromUserId: string;
  targetId: string;
  isRead: boolean;
  createdAt: Date;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdBy: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  bannerURL: string | null;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  messages: SupportMessage[];
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  createdAt: Date;
}

export interface SupportMessage {
  from: string;
  content: string;
  timestamp: Date;
}

export interface Report {
  id: string;
  reporterId: string;
  targetType: 'message' | 'post' | 'user';
  targetId: string;
  reason: string;
  createdAt: Date;
}

export interface Presence {
  online: boolean;
  lastSeen: Date;
}

export interface TypingStatus {
  isTyping: boolean;
  timestamp: Date;
}
