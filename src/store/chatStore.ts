import { create } from 'zustand';
import { Room, Message } from '../types';

interface ChatState {
  currentRoom: Room | null;
  currentDM: string | null;
  messages: Message[];
  typingUsers: string[];
  setCurrentRoom: (room: Room | null) => void;
  setCurrentDM: (dmId: string | null) => void;
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  setTypingUsers: (users: string[]) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  currentRoom: null,
  currentDM: null,
  messages: [],
  typingUsers: [],
  setCurrentRoom: (room) => set({ currentRoom: room, currentDM: null, messages: [] }),
  setCurrentDM: (dmId) => set({ currentDM: dmId, currentRoom: null, messages: [] }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setMessages: (messages) => set({ messages }),
  setTypingUsers: (users) => set({ typingUsers: users }),
  clearMessages: () => set({ messages: [] }),
}));
