'use client'

import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Button } from '@/components/ui/button';

export const LogoutButton: React.FC = () => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('ログアウトに失敗しました:', error);
    }
  };

  return <Button onClick={handleLogout}>ログアウト</Button>;
};

