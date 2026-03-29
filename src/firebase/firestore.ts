import { db } from './config';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  Timestamp,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore';
import { Room, Message, Post, Comment, User, DM, Notification, Announcement, Event, SupportTicket, Report } from '../types';

export const firestoreService = {
  // User operations
  async getUser(userId: string): Promise<User | null> {
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.exists() ? userDoc.data() as User : null;
  },

  async updateUser(userId: string, data: Partial<User>) {
    await updateDoc(doc(db, 'users', userId), data);
  },

  async getAllUsers(): Promise<User[]> {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    return usersSnapshot.docs.map(doc => doc.data() as User);
  },

  // Room operations
  async createRoom(roomData: Omit<Room, 'id' | 'createdAt'>): Promise<string> {
    const roomId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const room: Room = {
      ...roomData,
      id: roomId,
      createdAt: new Date(),
    };
    await setDoc(doc(db, 'rooms', roomId), room);
    return roomId;
  },

  async getRoom(roomId: string): Promise<Room | null> {
    const roomDoc = await getDoc(doc(db, 'rooms', roomId));
    return roomDoc.exists() ? roomDoc.data() as Room : null;
  },

  async getAllRooms(): Promise<Room[]> {
    const roomsSnapshot = await getDocs(collection(db, 'rooms'));
    return roomsSnapshot.docs.map(doc => doc.data() as Room);
  },

  async getUserRooms(userId: string): Promise<Room[]> {
    const q = query(collection(db, 'rooms'), where('members', 'array-contains', userId));
    const roomsSnapshot = await getDocs(q);
    return roomsSnapshot.docs.map(doc => doc.data() as Room);
  },

  async joinRoom(roomId: string, userId: string) {
    const roomRef = doc(db, 'rooms', roomId);
    await updateDoc(roomRef, {
      members: arrayUnion(userId),
      memberCount: increment(1)
    });
  },

  async leaveRoom(roomId: string, userId: string) {
    const roomRef = doc(db, 'rooms', roomId);
    await updateDoc(roomRef, {
      members: arrayRemove(userId),
      memberCount: increment(-1)
    });
  },

  async updateRoom(roomId: string, data: Partial<Room>) {
    await updateDoc(doc(db, 'rooms', roomId), data);
  },

  async deleteRoom(roomId: string) {
    await deleteDoc(doc(db, 'rooms', roomId));
  },

  // Message operations
  async sendMessage(roomId: string, messageData: Omit<Message, 'id' | 'createdAt'>): Promise<string> {
    const messageId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const message: Message = {
      ...messageData,
      id: messageId,
      createdAt: new Date(),
    };
    await setDoc(doc(db, 'rooms', roomId, 'messages', messageId), message);
    return messageId;
  },

  async getMessages(roomId: string, lastDoc: any = null, limitCount: number = 50): Promise<Message[]> {
    let q = query(
      collection(db, 'rooms', roomId, 'messages'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }
    
    const messagesSnapshot = await getDocs(q);
    return messagesSnapshot.docs.map(doc => doc.data() as Message).reverse();
  },

  async updateMessage(roomId: string, messageId: string, data: Partial<Message>) {
    await updateDoc(doc(db, 'rooms', roomId, 'messages', messageId), data);
  },

  async deleteMessage(roomId: string, messageId: string) {
    await updateDoc(doc(db, 'rooms', roomId, 'messages', messageId), { isDeleted: true });
  },

  async addReaction(roomId: string, messageId: string, emoji: string, userId: string) {
    const messageRef = doc(db, 'rooms', roomId, 'messages', messageId);
    const messageDoc = await getDoc(messageRef);
    if (messageDoc.exists()) {
      const reactions = messageDoc.data().reactions || {};
      if (!reactions[emoji]) {
        reactions[emoji] = [];
      }
      if (!reactions[emoji].includes(userId)) {
        reactions[emoji].push(userId);
      }
      await updateDoc(messageRef, { reactions });
    }
  },

  async removeReaction(roomId: string, messageId: string, emoji: string, userId: string) {
    const messageRef = doc(db, 'rooms', roomId, 'messages', messageId);
    const messageDoc = await getDoc(messageRef);
    if (messageDoc.exists()) {
      const reactions = messageDoc.data().reactions || {};
      if (reactions[emoji]) {
        reactions[emoji] = reactions[emoji].filter((id: string) => id !== userId);
        if (reactions[emoji].length === 0) {
          delete reactions[emoji];
        }
      }
      await updateDoc(messageRef, { reactions });
    }
  },

  // Post operations
  async createPost(postData: Omit<Post, 'id' | 'createdAt' | 'likes' | 'commentCount'>): Promise<string> {
    const postId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const post: Post = {
      ...postData,
      id: postId,
      likes: [],
      commentCount: 0,
      createdAt: new Date(),
    };
    await setDoc(doc(db, 'posts', postId), post);
    return postId;
  },

  async getPosts(lastDoc: any = null, limitCount: number = 20): Promise<Post[]> {
    let q = query(
      collection(db, 'posts'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }
    
    const postsSnapshot = await getDocs(q);
    return postsSnapshot.docs.map(doc => doc.data() as Post);
  },

  async likePost(postId: string, userId: string) {
    await updateDoc(doc(db, 'posts', postId), {
      likes: arrayUnion(userId)
    });
  },

  async unlikePost(postId: string, userId: string) {
    await updateDoc(doc(db, 'posts', postId), {
      likes: arrayRemove(userId)
    });
  },

  async addComment(postId: string, commentData: Omit<Comment, 'id' | 'createdAt' | 'likes'>): Promise<string> {
    const commentId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const comment: Comment = {
      ...commentData,
      id: commentId,
      likes: [],
      createdAt: new Date(),
    };
    await setDoc(doc(db, 'posts', postId, 'comments', commentId), comment);
    await updateDoc(doc(db, 'posts', postId), {
      commentCount: increment(1)
    });
    return commentId;
  },

  async getComments(postId: string): Promise<Comment[]> {
    const commentsSnapshot = await getDocs(collection(db, 'posts', postId, 'comments'));
    return commentsSnapshot.docs.map(doc => doc.data() as Comment);
  },

  // DM operations
  async createDM(userId1: string, userId2: string): Promise<string> {
    const dmId = [userId1, userId2].sort().join('_');
    const dm: DM = {
      id: dmId,
      participants: [userId1, userId2],
      lastMessage: '',
      lastMessageAt: new Date(),
      unreadCount: { [userId1]: 0, [userId2]: 0 },
    };
    await setDoc(doc(db, 'dms', dmId), dm);
    return dmId;
  },

  async getDM(dmId: string): Promise<DM | null> {
    const dmDoc = await getDoc(doc(db, 'dms', dmId));
    return dmDoc.exists() ? dmDoc.data() as DM : null;
  },

  async getUserDMs(userId: string): Promise<DM[]> {
    const q = query(collection(db, 'dms'), where('participants', 'array-contains', userId));
    const dmsSnapshot = await getDocs(q);
    return dmsSnapshot.docs.map(doc => doc.data() as DM);
  },

  async sendDMMessage(dmId: string, messageData: Omit<Message, 'id' | 'createdAt'>): Promise<string> {
    const messageId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const message: Message = {
      ...messageData,
      id: messageId,
      createdAt: new Date(),
    };
    await setDoc(doc(db, 'dms', dmId, 'messages', messageId), message);
    
    const dmRef = doc(db, 'dms', dmId);
    const dmDoc = await getDoc(dmRef);
    if (dmDoc.exists()) {
      const dm = dmDoc.data() as DM;
      const newUnreadCount = { ...dm.unreadCount };
      newUnreadCount[messageData.senderId] = 0;
      const otherParticipant = dm.participants.find(p => p !== messageData.senderId);
      if (otherParticipant) {
        newUnreadCount[otherParticipant] = (newUnreadCount[otherParticipant] || 0) + 1;
      }
      await updateDoc(dmRef, {
        lastMessage: messageData.content,
        lastMessageAt: new Date(),
        unreadCount: newUnreadCount
      });
    }
    
    return messageId;
  },

  async getDMMessages(dmId: string, lastDoc: any = null, limitCount: number = 50): Promise<Message[]> {
    let q = query(
      collection(db, 'dms', dmId, 'messages'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }
    
    const messagesSnapshot = await getDocs(q);
    return messagesSnapshot.docs.map(doc => doc.data() as Message).reverse();
  },

  // Notification operations
  async createNotification(userId: string, notificationData: Omit<Notification, 'id' | 'isRead' | 'createdAt'>): Promise<string> {
    const notificationId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const notification: Notification = {
      ...notificationData,
      id: notificationId,
      isRead: false,
      createdAt: new Date(),
    };
    await setDoc(doc(db, 'notifications', userId, 'items', notificationId), notification);
    return notificationId;
  },

  async getUserNotifications(userId: string): Promise<Notification[]> {
    const q = query(
      collection(db, 'notifications', userId, 'items'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const notificationsSnapshot = await getDocs(q);
    return notificationsSnapshot.docs.map(doc => doc.data() as Notification);
  },

  async markNotificationAsRead(userId: string, notificationId: string) {
    await updateDoc(doc(db, 'notifications', userId, 'items', notificationId), { isRead: true });
  },

  async markAllNotificationsAsRead(userId: string) {
    const notifications = await this.getUserNotifications(userId);
    for (const notification of notifications) {
      if (!notification.isRead) {
        await this.markNotificationAsRead(userId, notification.id);
      }
    }
  },

  // Announcement operations
  async createAnnouncement(announcementData: Omit<Announcement, 'id' | 'createdAt'>): Promise<string> {
    const announcementId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const announcement: Announcement = {
      ...announcementData,
      id: announcementId,
      createdAt: new Date(),
    };
    await setDoc(doc(db, 'announcements', announcementId), announcement);
    return announcementId;
  },

  async getActiveAnnouncements(): Promise<Announcement[]> {
    const now = new Date();
    const q = query(
      collection(db, 'announcements'),
      where('expiresAt', '>', now),
      orderBy('createdAt', 'desc')
    );
    const announcementsSnapshot = await getDocs(q);
    return announcementsSnapshot.docs.map(doc => doc.data() as Announcement);
  },

  // Event operations
  async createEvent(eventData: Omit<Event, 'id' | 'createdAt'>): Promise<string> {
    const eventId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const event: Event = {
      ...eventData,
      id: eventId,
      createdAt: new Date(),
    };
    await setDoc(doc(db, 'events', eventId), event);
    return eventId;
  },

  async getUpcomingEvents(): Promise<Event[]> {
    const now = new Date();
    const q = query(
      collection(db, 'events'),
      where('endDate', '>', now),
      orderBy('startDate', 'asc')
    );
    const eventsSnapshot = await getDocs(q);
    return eventsSnapshot.docs.map(doc => doc.data() as Event);
  },

  // Support ticket operations
  async createSupportTicket(ticketData: Omit<SupportTicket, 'id' | 'createdAt' | 'status'>): Promise<string> {
    const ticketId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const ticket: SupportTicket = {
      ...ticketData,
      id: ticketId,
      status: 'open',
      createdAt: new Date(),
    };
    await setDoc(doc(db, 'support_messages', ticketId), ticket);
    return ticketId;
  },

  async getSupportTickets(): Promise<SupportTicket[]> {
    const q = query(collection(db, 'support_messages'), orderBy('createdAt', 'desc'));
    const ticketsSnapshot = await getDocs(q);
    return ticketsSnapshot.docs.map(doc => doc.data() as SupportTicket);
  },

  async updateSupportTicket(ticketId: string, data: Partial<SupportTicket>) {
    await updateDoc(doc(db, 'support_messages', ticketId), data);
  },

  // Report operations
  async createReport(reportData: Omit<Report, 'id' | 'createdAt'>): Promise<string> {
    const reportId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const report: Report = {
      ...reportData,
      id: reportId,
      createdAt: new Date(),
    };
    await setDoc(doc(db, 'reports', reportId), report);
    return reportId;
  },

  async getReports(): Promise<Report[]> {
    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
    const reportsSnapshot = await getDocs(q);
    return reportsSnapshot.docs.map(doc => doc.data() as Report);
  },
};
