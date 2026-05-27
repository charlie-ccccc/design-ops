'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '@/lib/firebase';

export type Role = 'Admin' | '成員' | '一般';
export type DesignCat = 'UIUX' | '平面視覺';

export interface AppUser {
  uid: string;
  email: string;
  name: string;
  photo?: string;
  roles: Role[];
  cat?: DesignCat;
  dept?: string;
  initial?: string;
  hue?: number;
}

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const ALLOWED_DOMAIN = '@cmoney.com.tw';

async function getOrCreateUser(firebaseUser: User): Promise<AppUser> {
  const ref = doc(db, 'users', firebaseUser.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    return snap.data() as AppUser;
  }

  // First time login — create with default role
  const displayName = firebaseUser.displayName ?? firebaseUser.email!;
  const hue = (firebaseUser.uid.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 8) + 1;
  const newUser: AppUser = {
    uid: firebaseUser.uid,
    email: firebaseUser.email!,
    name: displayName,
    photo: firebaseUser.photoURL ?? undefined,
    roles: ['一般'],
    initial: displayName[0].toUpperCase(),
    hue,
  };
  await setDoc(ref, newUser);
  return newUser;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async firebaseUser => {
      if (firebaseUser) {
        if (!firebaseUser.email?.endsWith(ALLOWED_DOMAIN)) {
          await signOut(auth);
          setError('請使用公司帳號（@cmoney.com.tw）登入');
          setUser(null);
        } else {
          try {
            const appUser = await getOrCreateUser(firebaseUser);
            setUser(appUser);
            setError(null);
          } catch (e) {
            console.error('Firestore error:', e);
            setError('載入使用者資料失敗，請重新整理');
            setUser(null);
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  async function signInWithGoogle() {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch {
      setError('登入失敗，請再試一次');
    }
  }

  async function signOutUser() {
    await signOut(auth);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOutUser, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
