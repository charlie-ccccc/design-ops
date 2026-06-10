import { collection, addDoc, deleteDoc, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { AppNotification } from '@/lib/types';

export async function createNotification(notif: Omit<AppNotification, 'id'>): Promise<void> {
  try {
    await addDoc(collection(db, 'notifications'), notif);
  } catch (err) {
    console.error('[createNotification] failed:', err, notif);
  }
}

// Idempotent due-reminder: uses deterministic doc ID so duplicate calls are no-ops.
export async function upsertDueNotification(notif: Omit<AppNotification, 'id'>): Promise<void> {
  const dateStr = new Date(notif.createdAt).toISOString().slice(0, 10);
  const id = `due-${notif.uid}-${notif.cardId}-${dateStr}`;
  const ref = doc(db, 'notifications', id);
  try {
    const snap = await getDoc(ref);
    if (snap.exists()) return;
    await setDoc(ref, notif);
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
