import { collection, addDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { AppNotification } from '@/lib/types';

export async function createNotification(notif: Omit<AppNotification, 'id'>): Promise<void> {
  try {
    await addDoc(collection(db, 'notifications'), notif);
  } catch (err) {
    console.error('[createNotification] failed:', err, notif);
  }
}

// Idempotent due-reminder: fixed doc ID = due-{uid}-{cardId}-{localDate}.
// setDoc to the same ID is always an overwrite (no duplicate documents).
// Call-site must guard with localStorage to avoid resetting read/createdAt on refresh.
export async function upsertDueNotification(notif: Omit<AppNotification, 'id'>): Promise<void> {
  const d = new Date(notif.createdAt);
  const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const id = `due-${notif.uid}-${notif.cardId}-${dateStr}`;
  try {
    await setDoc(doc(db, 'notifications', id), notif);
  } catch (err) {
    console.error('[upsertDueNotification] failed:', err);
  }
}

export async function deleteNotification(notifId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'notifications', notifId));
  } catch (err) {
    console.error('[deleteNotification] failed:', err);
  }
}
