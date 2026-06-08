'use client';
import { useEffect, useState, useCallback } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import { DEPTS, DEFAULT_LEAVE } from '@/lib/data';
import type { LeaveEntry, HistoryMonth } from '@/lib/types';

export function useFirestoreSettings() {
  const [depts, setDepts] = useState<string[]>(DEPTS);
  const [deptColors, setDeptColors] = useState<Record<string, string>>({});
  const [leave, setLeave] = useState<LeaveEntry[]>(DEFAULT_LEAVE);
  const [allMemberDays, setAllMemberDays] = useState<Record<string, Record<string, number>>>({});
  const [allMemberRatios, setAllMemberRatios] = useState<Record<string, Record<string, number>>>({});
  const [historyMonths, setHistoryMonths] = useState<HistoryMonth[]>([]);
  const [lastArchivedMonth, setLastArchivedMonth] = useState('');
  const [cardOrder, setCardOrder] = useState<Record<string, string[]>>({});
  const [settingsReady, setSettingsReady] = useState(false);

  useEffect(() => {
    let firestoreUnsub: (() => void) | null = null;

    const authUnsub = onAuthStateChanged(auth, user => {
      if (firestoreUnsub) { firestoreUnsub(); firestoreUnsub = null; }
      if (!user) { setSettingsReady(false); return; }

      const ref = doc(db, 'settings', 'config');
      firestoreUnsub = onSnapshot(
        ref,
        snap => {
          if (snap.exists()) {
            const data = snap.data();
            if (Array.isArray(data.depts)) setDepts(data.depts);
            if (data.deptColors && typeof data.deptColors === 'object') setDeptColors(data.deptColors as Record<string, string>);
            if (Array.isArray(data.leave)) {
              setLeave(data.leave);
            } else {
              setDoc(ref, { leave: DEFAULT_LEAVE }, { merge: true }).catch(console.error);
            }
            if (data.memberDays && typeof data.memberDays === 'object') setAllMemberDays(data.memberDays);
            if (data.memberRatios && typeof data.memberRatios === 'object') setAllMemberRatios(data.memberRatios);
            if (Array.isArray(data.historyMonths)) setHistoryMonths(data.historyMonths);
            if (typeof data.lastArchivedMonth === 'string') setLastArchivedMonth(data.lastArchivedMonth);
            if (data.cardOrder && typeof data.cardOrder === 'object') setCardOrder(data.cardOrder as Record<string, string[]>);
          }
          setSettingsReady(true);
        },
        err => { console.error('Settings read error:', err); setSettingsReady(true); },
      );
    });

    return () => { authUnsub(); firestoreUnsub?.(); };
  }, []);

  const save = useCallback(async (patch: Record<string, unknown>) => {
    await setDoc(doc(db, 'settings', 'config'), patch, { merge: true })
      .catch(err => console.error('Settings write error:', err));
  }, []);

  const updateDepts = useCallback(async (newDepts: string[]) => {
    setDepts(newDepts);
    await save({ depts: newDepts });
  }, [save]);

  const updateDeptColors = useCallback(async (colors: Record<string, string>) => {
    setDeptColors(colors);
    await save({ deptColors: colors });
  }, [save]);

  const updateLeave = useCallback(async (newLeave: LeaveEntry[]) => {
    setLeave(newLeave);
    const clean = newLeave.map(l => Object.fromEntries(Object.entries(l).filter(([, v]) => v !== undefined)));
    await save({ leave: clean });
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

  const updateHistory = useCallback(async (newHistory: HistoryMonth[]) => {
    setHistoryMonths(newHistory);
    await save({ historyMonths: newHistory });
  }, [save]);

  const updateLastArchivedMonth = useCallback(async (month: string) => {
    setLastArchivedMonth(month);
    await save({ lastArchivedMonth: month });
  }, [save]);

  const updateCardOrder = useCallback(async (order: Record<string, string[]>) => {
    setCardOrder(order);
    await save({ cardOrder: order });
  }, [save]);

  return { depts, updateDepts, deptColors, updateDeptColors, leave, updateLeave, allMemberDays, allMemberRatios, updateMemberDays, updateMemberRatios, historyMonths, updateHistory, lastArchivedMonth, updateLastArchivedMonth, cardOrder, updateCardOrder, settingsReady };
}
