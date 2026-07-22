import { create } from 'zustand';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: string;
  canResetPassword: boolean;
}

interface AuthState {
  user: UserSession | null;
  login: (user: UserSession) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('pos_user') || 'null'),
  login: (user) => {
    localStorage.setItem('pos_user', JSON.stringify(user));
    set({ user });
  },
  logout: () => {
    localStorage.removeItem('pos_user');
    set({ user: null });
  },
}));
