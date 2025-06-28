'use client'

import React from 'react';
import { useAuth } from '@/components/AuthProvider';

export default function LoginButton() {
  const { signIn } = useAuth();

  const handleLogin = async () => {
    try {
      await signIn();
    } catch (error) {
      console.error('Erreur de connexion:', error);
    }
  };

  return (
    <button 
      onClick={handleLogin}
      className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
    >
      Se connecter avec Google
    </button>
  );
}
