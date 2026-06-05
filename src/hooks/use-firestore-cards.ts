'use client';
import { useEffect, useState, useCallback } from 'react';
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import type { Card } from '@/lib/types';

export function useFirestoreCards() {
  const [cards, setCards] = useState<Card[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let firestoreUnsub: (() => void) | null = null;

    // Wait for auth before subscribing — prevents permission errors
    // when Firestore subscribes before the auth token is ready
    const authUnsub = onAuthStateChanged(auth, user => {
      if (firestoreUnsub) { firestoreUnsub(); firestoreUnsub = null; }
      if (!user) { setCards([]); setInitialized(false); return; }

      firestoreUnsub = onSnapshot(
        collection(db, 'cards'),
        snap => { setCards(snap.docs.map(d => d.data() as Card)); setInitialized(true); },
        err => { console.error('Firestore cards error:', err); setInitialized(true); },
      );
    });

    return () => { authUnsub(); firestoreUnsub?.(); };
  }, []);

  const addCard = useCallback(async (card: Card) => {
    setCards(prev => [...prev, card]);
    await setDoc(doc(db, 'cards', card.id), card);
  }, []);

  const updateCard = useCallback(async (cardId: string, patch: Partial<Card>) => {
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, ...patch } : c));
    await updateDoc(doc(db, 'cards', cardId), patch as Record<string, unknown>);
  }, []);

  const deleteCard = useCallback(async (cardId: string) => {
    setCards(prev => prev.filter(c => c.id !== cardId));
    await deleteDoc(doc(db, 'cards', cardId));
  }, []);

  return { cards, initialized, addCard, updateCard, deleteCard };
}
