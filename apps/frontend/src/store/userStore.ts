// src/store/userStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type UserRole = 'Admin' | 'Seller' | 'Buyer';

// Thêm "export" vào đây để các file khác có thể import và sử dụng interface này
export interface User {
  id: number;
  email: string;
  role: UserRole;
  walletAddress: string;
}

interface UserState {
  user: User | null;
  token: string | null;
  setUser: (user: User, token: string) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setUser: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'user-storage',
    }
  )
);