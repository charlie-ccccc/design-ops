'use client';
import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { AppUser } from '@/contexts/auth-context';

export function useFirestoreUsers() {
  const [users, setUsers] = useState<AppUser[]>([]);
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), snap => {
      setUsers(snap.docs.map(d => d.data() as AppUser));
    });
    return unsub;
  }, []);
  return users;
}
