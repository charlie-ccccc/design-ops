'use client';
import { useEffect, useState, useCallback } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DEPTS, DEFAULT_LEAVE } from '@/lib/data';
import type { LeaveEntry } from '@/lib/types';

export function useFirestoreSettings() {
  const [depts, setDepts] = useState<string[]>(DEPTS);
  const [leave, setLeave] = useState<LeaveEntry[]>(DEFAULT_LEAVE);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, 'settings', 'config'),
      snap => {
        if (snap.exists()) {
          const data = snap.data();
          if (Array.isArray(data.depts)) setDepts(data.depts);
          if (Array.isArray(data.leave)) setLeave(data.leave);
        }
      },
      err => console.error('Settings read error:', err),
    );
    return unsub;
  }, []);

  const save = useCallback(async (patch: Record<string, unknown>) => {
    await setDoc(doc(db, 'settings', 'config'), patch, { merge: true })
      .catch(err => console.error('Settings write error:', err));
  }, []);

  const updateDepts = useCallback(async (newDepts: string[]) => {
    setDepts(newDepts);
    await save({ depts: newDepts });
  }, [save]);

  const updateLeave = useCallback(async (newLeave: LeaveEntry[]) => {
    setLeave(newLeave);
    await save({ leave: newLeave });
  }, [save]);

  return { depts, updateDepts, leave, updateLeave };
}
