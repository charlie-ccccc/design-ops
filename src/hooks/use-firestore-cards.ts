'use client';
import { useEffect, useState, useCallback } from 'react';
import { collection, onSnapshot, doc, setDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Card } from '@/lib/types';

export function useFirestoreCards() {
  const [cards, setCards] = useState<Card[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'cards'), snap => {
      setCards(snap.docs.map(d => d.data() as Card));
      setInitialized(true);
    });
    return unsub;
  }, []);

  const addCard = useCallback(async (card: Card) => {
    await setDoc(doc(db, 'cards', card.id), card);
  }, []);

  const updateCard = useCallback(async (cardId: string, patch: Partial<Card>) => {
    await updateDoc(doc(db, 'cards', cardId), patch as Record<string, unknown>);
  }, []);

  const seedCards = useCallback(async (seedData: Card[]) => {
    const batch = writeBatch(db);
    seedData.forEach(card => {
      batch.set(doc(db, 'cards', card.id), card);
    });
    await batch.commit();
  }, []);

  return { cards, initialized, addCard, updateCard, seedCards };
}
