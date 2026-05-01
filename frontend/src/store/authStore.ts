import { create } from 'zustand';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

function parseStoredUser(): User | null {
  try {
    return JSON.parse(localStorage.getItem('user') ?? 'null');
  } catch {
    localStorage.removeItem('user');
    return null;
  }
}

const storedToken = localStorage.getItem('accessToken');
const validToken = storedToken && storedToken !== 'undefined' ? storedToken : null;
if (!validToken) {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
}

export const useAuthStore = create<AuthState>((set) => ({
  user: validToken ? parseStoredUser() : null,
  isAuthenticated: !!validToken,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    set({ user: null, isAuthenticated: false });
  },
}));
