import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { AppNotification } from '@/lib/types';

export async function createNotification(notif: Omit<AppNotification, 'id'>): Promise<void> {
  try {
    await addDoc(collection(db, 'notifications'), notif);
  } catch (err) {
    console.error('[createNotification] failed:', err, notif);
  }
}

export async function deleteNotification(notifId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'notifications', notifId));
  } catch (err) {
    console.error('[deleteNotification] failed:', err);
  }
}
