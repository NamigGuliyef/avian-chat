import { useState, useEffect } from 'react';
import { AuthSession, User, CrmUserRole } from '@/types/crm';

const STORAGE_KEY = 'crm_auth_session';

// Demo users
const demoUsers: User[] = [
  {
    id: 'admin-1',
    name: 'Admin',
    email: 'admin@culture.gov.az',
    password: 'demo123',
    role: 'admin',
    companyId: 'company-1',
    isActive: true,
    createdAt: '2024-01-01',
  },
  {
    id: 'user-1',
    name: 'User Demo',
    email: 'user@culture.gov.az',
    password: 'demo123',
    role: 'agent',
    companyId: 'company-1',
    isActive: true,
    createdAt: '2024-01-15',
  },
];

export function useAuth() {
  const [session, setSession] = useState<AuthSession>({ user: null, isAuthenticated: false });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSession(parsed);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, password: string): { success: boolean; error?: string } => {
    const user = demoUsers.find(u => u.email === email && u.password === password);
    
    if (!user) {
      return { success: false, error: 'Email və ya şifrə yanlışdır' };
    }

    if (!user.isActive) {
      return { success: false, error: 'Hesabınız deaktiv edilib' };
    }

    const newSession: AuthSession = { user, isAuthenticated: true };
    setSession(newSession);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
    return { success: true };
  };

  const logout = () => {
    setSession({ user: null, isAuthenticated: false });
    localStorage.removeItem(STORAGE_KEY);
  };

  return { session, isLoading, login, logout };
}
