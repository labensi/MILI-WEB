import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { firestoreService } from '../firebase/firestore';
import { realtimeService } from '../firebase/realtime';
import { Message } from '../types';

export const useMessages = () => {
  const { user } = useAuthStore();
  const { currentRoom, currentDM, messages, setMessages, addMessage, setTypingUsers } = useChatStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    if (!currentRoom && !currentDM) return;

    const loadMessages = async () => {
      setLoading(true);
      let loadedMessages: Message[] = [];
      
      if (currentRoom) {
        loadedMessages = await firestoreService.getMessages(currentRoom.id);
      } else if (currentDM) {
        loadedMessages = await firestoreService.getDMMessages(currentDM);
      }
      
      setMessages(loadedMessages);
      setLoading(false);
    };

    loadMessages();

    // Set up typing listener
    if (currentRoom) {
      const unsubscribeTyping = realtimeService.onTypingStatus(currentRoom.id, (typers) => {
        const typingUserIds = Object.keys(typers);
        setTypingUsers(typingUserIds);
      });
      return () => unsubscribeTyping();
    }
  }, [currentRoom, currentDM, user]);

  const sendMessage = async (content: string, type: string = 'text', mediaURL: string | null = null) => {
    if (!user) return;
    if (!content.trim() && !mediaURL) return;

    const messageData = {
      senderId: user.uid,
      content,
      type: type as any,
      mediaURL,
      embedData: null,
      reactions: {},
      replyTo: null,
      isPinned: false,
      isDeleted: false,
      editedAt: null,
    };

    let messageId;
    if (currentRoom) {
      messageId = await firestoreService.sendMessage(currentRoom.id, messageData);
    } else if (currentDM) {
      messageId = await firestoreService.sendDMMessage(currentDM, messageData);
    }

    const newMessage: Message = {
      ...messageData,
      id: messageId!,
      createdAt: new Date(),
    };

    addMessage(newMessage);
  };

  const sendTyping = (isTyping: boolean) => {
    if (currentRoom && user) {
      realtimeService.setTypingStatus(currentRoom.id, user.uid, isTyping);
    }
  };

  const addReaction = async (messageId: string, emoji: string) => {
    if (!user) return;
    if (currentRoom) {
      await firestoreService.addReaction(currentRoom.id, messageId, emoji, user.uid);
    } else if (currentDM) {
      // Add reaction for DM
    }
  };

  const removeReaction = async (messageId: string, emoji: string) => {
    if (!user) return;
    if (currentRoom) {
      await firestoreService.removeReaction(currentRoom.id, messageId, emoji, user.uid);
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (currentRoom) {
      await firestoreService.deleteMessage(currentRoom.id, messageId);
    }
  };

  return {
    messages,
    loading,
    sendMessage,
    sendTyping,
    addReaction,
    removeReaction,
    deleteMessage,
  };
};
