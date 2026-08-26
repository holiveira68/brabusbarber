'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from './api';

export type UserRole = 'CLIENTE' | 'BARBEIRO' | 'ADMIN';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Ao carregar a página, tenta restaurar a sessão a partir do localStorage
  useEffect(() => {
    const stored = localStorage.getItem('brabus_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('brabus_user');
      }
    }
    setLoading(false);
  }, []);

  async function login(email: string, password: string) {
    const data = await api.post<{ accessToken: string; user: AuthUser }>(
      '/auth/login',
      { email, password },
    );

    // O painel web é de uso interno (equipe da barbearia) — apenas
    // ADMIN e BARBEIRO têm acesso ao dashboard de gestão.
    if (data.user.role === 'CLIENTE') {
      throw new Error(
        'Esta área é exclusiva da equipe. Clientes agendam pelo aplicativo BRABUS BARBER.',
      );
    }

    localStorage.setItem('brabus_token', data.accessToken);
    localStorage.setItem('brabus_user', JSON.stringify(data.user));
    setUser(data.user);
    router.push('/dashboard');
  }

  function logout() {
    localStorage.removeItem('brabus_token');
    localStorage.removeItem('brabus_user');
    setUser(null);
    router.push('/login');
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de um AuthProvider');
  return ctx;
}
