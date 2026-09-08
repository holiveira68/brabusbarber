import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';
import { registerPushTokenAsync } from '../services/notifications';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: 'CLIENTE' | 'BARBEIRO' | 'ADMIN';
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('brabus_user').then((stored) => {
      if (stored) {
        setUser(JSON.parse(stored));
        registerPushTokenAsync().catch(() => {});
      }
      setLoading(false);
    });
  }, []);

  async function persistSession(accessToken: string, authUser: AuthUser) {
    await AsyncStorage.setItem('brabus_token', accessToken);
    await AsyncStorage.setItem('brabus_user', JSON.stringify(authUser));
    setUser(authUser);
    registerPushTokenAsync().catch(() => {});
  }

  async function login(email: string, password: string) {
    const data = await api.post<{ accessToken: string; user: AuthUser }>('/auth/login', {
      email,
      password,
    });
    await persistSession(data.accessToken, data.user);
  }

  async function register(name: string, email: string, password: string, phone?: string) {
    const data = await api.post<{ accessToken: string; user: AuthUser }>('/auth/register', {
      name,
      email,
      password,
      phone,
    });
    await persistSession(data.accessToken, data.user);
  }

  async function logout() {
    await AsyncStorage.multiRemove(['brabus_token', 'brabus_user']);
    setUser(null);
  }

  return (
    <AuthContext value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de um AuthProvider');
  return ctx;
}

