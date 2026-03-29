import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { firestoreService } from '../firebase/firestore';
import { Room } from '../types';

export const useRooms = () => {
  const { user } = useAuthStore();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadRooms = async () => {
      setLoading(true);
      const userRooms = await firestoreService.getUserRooms(user.uid);
      setRooms(userRooms);
      setLoading(false);
    };

    loadRooms();
  }, [user]);

  const createRoom = async (roomData: any) => {
    if (rooms.length >= 3) {
      throw new Error('You can only create up to 3 rooms');
    }
    const roomId = await firestoreService.createRoom(roomData);
    const newRoom = await firestoreService.getRoom(roomId);
    if (newRoom) {
      setRooms([...rooms, newRoom]);
    }
    return roomId;
  };

  const joinRoom = async (roomId: string) => {
    if (!user) return;
    await firestoreService.joinRoom(roomId, user.uid);
    const room = await firestoreService.getRoom(roomId);
    if (room && !rooms.find(r => r.id === roomId)) {
      setRooms([...rooms, room]);
    }
  };

  const leaveRoom = async (roomId: string) => {
    if (!user) return;
    await firestoreService.leaveRoom(roomId, user.uid);
    setRooms(rooms.filter(r => r.id !== roomId));
  };

  return { rooms, loading, createRoom, joinRoom, leaveRoom };
};
