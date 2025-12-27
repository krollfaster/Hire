"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from './constants';

/**
 * Данные авторизованного пользователя
 */
interface AuthUser {
    id: string;
    email: string;
    user_metadata?: {
        full_name?: string;
        name?: string;
        avatar_url?: string;
        picture?: string;
    };
}

interface AuthState {
    user: AuthUser | null;
    isHydrated: boolean;
    setUser: (user: AuthUser | null) => void;
    setHydrated: (hydrated: boolean) => void;
    clearAll: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isHydrated: false,
            setUser: (user) => set({ user }),
            setHydrated: (hydrated) => set({ isHydrated: hydrated }),
            clearAll: () => set({ user: null }),
        }),
        {
            name: STORAGE_KEYS.AUTH,
            onRehydrateStorage: () => (state) => {
                state?.setHydrated(true);
            },
        }
    )
);
