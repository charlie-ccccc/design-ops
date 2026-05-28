'use client';
import { useEffect, useState, useCallback } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DEPTS } from '@/lib/data';

export function useFirestoreSettings() {
  const [depts, setDepts] = useState<string[]>(DEPTS);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, 'settings', 'config'),
      snap => {
        if (snap.exists()) {
          const data = snap.data();
          if (Array.isArray(data.depts)) setDepts(data.depts);
        }
      },
      err => console.error('Settings read error:', err),
    );
    return unsub;
  }, []);

  const updateDepts = useCallback(async (newDepts: string[]) => {
    setDepts(newDepts);
    await setDoc(doc(db, 'settings', 'config'), { depts: newDepts }, { merge: true })
      .catch(err => console.error('Settings write error:', err));
  }, []);

  return { depts, updateDepts };
}
