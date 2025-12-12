export type UserRole = 'admin' | 'client';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

const STORAGE_KEY = 'increscendo_user';

export const authService = {
  login: (email: string, password: string, role: UserRole = 'client'): User | null => {
    // Mock authentication
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name: role === 'admin' ? 'Administrador' : 'Cliente Usuario',
      role
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
  },

  loginDemo: (role: UserRole): User => {
    const user: User = {
      id: `demo-${role}`,
      email: `demo-${role}@increscendo.com`,
      name: role === 'admin' ? 'Demo Administrador' : 'Demo Cliente',
      role
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem(STORAGE_KEY);
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  isAuthenticated: (): boolean => {
    return !!authService.getCurrentUser();
  },

  isAdmin: (): boolean => {
    const user = authService.getCurrentUser();
    return user?.role === 'admin';
  }
};
