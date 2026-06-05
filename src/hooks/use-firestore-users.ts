'use client';
import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import type { AppUser } from '@/contexts/auth-context';

export function useFirestoreUsers() {
  const [users, setUsers] = useState<AppUser[]>([]);

  useEffect(() => {
    let firestoreUnsub: (() => void) | null = null;

    const authUnsub = onAuthStateChanged(auth, user => {
      if (firestoreUnsub) { firestoreUnsub(); firestoreUnsub = null; }
      if (!user) { setUsers([]); return; }

      firestoreUnsub = onSnapshot(collection(db, 'users'), snap => {
        setUsers(snap.docs.map(d => d.data() as AppUser));
      });
    });

    return () => { authUnsub(); firestoreUnsub?.(); };
  }, []);

  return users;
}
