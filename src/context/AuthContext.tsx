
'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state

export type User = { username: string; role: 'admin' | 'guest' };

interface AuthContextType {
  user: User | null;
  login: (username: string, pass: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      // If parsing fails, treat as no user
      localStorage.removeItem('currentUser');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!user && pathname !== '/login') {
        router.push('/login');
      } else if (user && pathname === '/login') {
        router.push('/');
      }
    }
  }, [user, pathname, router, loading]);

  const login = async (usernameInput: string, pass: string): Promise<boolean> => {
    const username = usernameInput.toLowerCase(); // Normalize username
    if (username === 'aranza' && pass === 'aranza1') {
      const userData = { username: 'aranza', role: 'admin' as const };
      setUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      return true;
    }
    if (username === 'invitado' && pass === 'invitado') {
      const userData = { username: 'invitado', role: 'guest' as const };
      setUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm space-y-4">
          <Skeleton className="h-16 w-16 rounded-full mx-auto" />
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-6 w-1/2 mx-auto" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }
  
  // Conditional rendering based on auth state and path
  if (!user && pathname !== '/login') {
     // Waiting for redirect, show minimal loading or null
    return (
       <div className="flex h-screen items-center justify-center bg-background p-4">
          <p>Redirigiendo a login...</p>
       </div>
    );
  }
  if (user && pathname === '/login') {
    // Waiting for redirect, show minimal loading or null
     return (
       <div className="flex h-screen items-center justify-center bg-background p-4">
          <p>Redirigiendo al dashboard...</p>
       </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
