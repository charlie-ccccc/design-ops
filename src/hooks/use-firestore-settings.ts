'use client';
import { useEffect, useState, useCallback } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DEPTS, DEFAULT_LEAVE } from '@/lib/data';
import type { LeaveEntry } from '@/lib/types';

export function useFirestoreSettings() {
  const [depts, setDepts] = useState<string[]>(DEPTS);
  const [leave, setLeave] = useState<LeaveEntry[]>(DEFAULT_LEAVE);
  const [allMemberDays, setAllMemberDays] = useState<Record<string, Record<string, number>>>({});
  const [allMemberRatios, setAllMemberRatios] = useState<Record<string, Record<string, number>>>({});

  useEffect(() => {
    const ref = doc(db, 'settings', 'config');
    const unsub = onSnapshot(
      ref,
      snap => {
        if (snap.exists()) {
          const data = snap.data();
          if (Array.isArray(data.depts)) setDepts(data.depts);
          if (Array.isArray(data.leave)) {
            setLeave(data.leave);
          } else {
            setDoc(ref, { leave: DEFAULT_LEAVE }, { merge: true }).catch(console.error);
          }
          if (data.memberDays && typeof data.memberDays === 'object') setAllMemberDays(data.memberDays);
          if (data.memberRatios && typeof data.memberRatios === 'object') setAllMemberRatios(data.memberRatios);
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

  const updateMemberDays = useCallback(async (month: string, days: Record<string, number>) => {
    const updated = { ...allMemberDays, [month]: days };
    setAllMemberDays(updated);
    await save({ memberDays: updated });
  }, [allMemberDays, save]);

  const updateMemberRatios = useCallback(async (month: string, ratios: Record<string, number>) => {
    const updated = { ...allMemberRatios, [month]: ratios };
    setAllMemberRatios(updated);
    await save({ memberRatios: updated });
  }, [allMemberRatios, save]);

  return { depts, updateDepts, leave, updateLeave, allMemberDays, allMemberRatios, updateMemberDays, updateMemberRatios };
}
