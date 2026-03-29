import { storage } from './config';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  listAll
} from 'firebase/storage';

export const storageService = {
  async uploadFile(file: File, path: string): Promise<string> {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  },

  async uploadImage(file: File, userId: string, type: 'avatar' | 'banner' | 'post' | 'room'): Promise<string> {
    const extension = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${extension}`;
    const path = `${type}s/${userId}/${fileName}`;
    return await this.uploadFile(file, path);
  },

  async uploadVideo(file: File, userId: string): Promise<string> {
    const extension = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${extension}`;
    const path = `videos/${userId}/${fileName}`;
    return await this.uploadFile(file, path);
  },

  async uploadSticker(file: File, userId: string): Promise<string> {
    const extension = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${extension}`;
    const path = `stickers/${userId}/${fileName}`;
    return await this.uploadFile(file, path);
  },

  async uploadCustomEmoji(file: File, userId: string): Promise<string> {
    const extension = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${extension}`;
    const path = `emojis/${userId}/${fileName}`;
    return await this.uploadFile(file, path);
  },

  async deleteFile(path: string) {
    const fileRef = ref(storage, path);
    await deleteObject(fileRef);
  },

  async getUserStickers(userId: string): Promise<string[]> {
    const stickersRef = ref(storage, `stickers/${userId}`);
    const result = await listAll(stickersRef);
    const urls = await Promise.all(result.items.map(item => getDownloadURL(item)));
    return urls;
  },

  async getUserEmojis(userId: string): Promise<string[]> {
    const emojisRef = ref(storage, `emojis/${userId}`);
    const result = await listAll(emojisRef);
    const urls = await Promise.all(result.items.map(item => getDownloadURL(item)));
    return urls;
  },
};
