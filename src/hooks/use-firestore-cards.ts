'use client';
import { useEffect, useState, useCallback } from 'react';
import { collection, onSnapshot, doc, setDoc, updateDoc, writeBatch, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Card } from '@/lib/types';

export function useFirestoreCards() {
  const [cards, setCards] = useState<Card[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'cards'),
      snap => {
        setCards(snap.docs.map(d => d.data() as Card));
        setInitialized(true);
      },
      err => {
        console.error('Firestore cards permission error:', err);
        setInitialized(true); // don't block the app — Firestore rules may not be updated yet
      },
    );
    return unsub;
  }, []);

  const addCard = useCallback(async (card: Card) => {
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

  const clearAllCards = useCallback(async (currentCards: Card[]) => {
    const batch = writeBatch(db);
    currentCards.forEach(c => batch.delete(doc(db, 'cards', c.id)));
    await batch.commit();
    setCards([]);
  }, []);

  const seedCards = useCallback(async (seedData: Card[]) => {
    const batch = writeBatch(db);
    seedData.forEach(card => {
      batch.set(doc(db, 'cards', card.id), card);
    });
    await batch.commit();
  }, []);

  return { cards, initialized, addCard, updateCard, deleteCard, clearAllCards, seedCards };
}
