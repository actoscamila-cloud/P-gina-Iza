
import api from './api';

export const saveMedia = async (id: string, file: File | Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        await api.post(`/media/${id}`, { data: base64 });
        resolve(id);
      } catch (err) {
        console.error('Error saving media to server:', err);
        reject(err);
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

export const getMediaUrl = async (id: string): Promise<string | null> => {
  if (!id) return null;
  if (id.startsWith('http') || id.startsWith('data:')) return id;
  
  // Return the API URL directly
  // Note: We use a relative path that works with our proxy
  return `/api/media/${id}`;
};

export const deleteMedia = async (id: string): Promise<void> => {
  if (!id || id.startsWith('http') || id.startsWith('data:')) return;
  try {
    await api.delete(`/media/${id}`);
  } catch (err) {
    console.error('Error deleting media from server:', err);
  }
};
