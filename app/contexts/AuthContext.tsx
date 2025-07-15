'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { loadUserData } from '../lib/database';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isFirstLogin: boolean;
  setIsFirstLogin: (value: boolean) => void;
};

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, isFirstLogin: false, setIsFirstLogin: () => {} });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirstLogin, setIsFirstLogin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const userData = await loadUserData(user.uid);
        setIsFirstLogin(!userData || !userData.sections || userData.sections.length === 0);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isFirstLogin, setIsFirstLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

