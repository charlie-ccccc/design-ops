'use client';
import { useEffect, useState, useCallback } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { AppNotification } from '@/lib/types';

export function useNotifications(uid: string | null) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (!uid) { setNotifications([]); return; }
    const q = query(collection(db, 'notifications'), where('uid', '==', uid), limit(60));
    const unsub = onSnapshot(q, snap => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as AppNotification));
      all.sort((a, b) => b.createdAt - a.createdAt);
      setNotifications(all);
    }, err => console.error('Notifications error:', err));
    return unsub;
  }, [uid]);

  const markRead = useCallback(async (notifId: string) => {
    await updateDoc(doc(db, 'notifications', notifId), { read: true }).catch(console.error);
  }, []);

  const markAllRead = useCallback(async (notifs: AppNotification[]) => {
    await Promise.all(
      notifs.filter(n => !n.read).map(n =>
        updateDoc(doc(db, 'notifications', n.id), { read: true })
      )
    ).catch(console.error);
  }, []);

  return { notifications, markRead, markAllRead };
}
