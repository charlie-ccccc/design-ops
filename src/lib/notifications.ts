import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { AppNotification } from '@/lib/types';

export async function createNotification(notif: Omit<AppNotification, 'id'>): Promise<void> {
  await addDoc(collection(db, 'notifications'), notif).catch(console.error);
}
