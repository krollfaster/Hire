import { create } from 'zustand';
import type { UserRole } from './constants';

interface RoleState {
    role: UserRole;
    setRole: (role: UserRole) => void;
    isRecruiter: () => boolean;
    isCandidate: () => boolean;
    clearAll: () => void;
}

const DEFAULT_ROLE: UserRole = 'candidate';

export const useRoleStore = create<RoleState>((set, get) => ({
    role: DEFAULT_ROLE,

    setRole: (role) => set({ role }),

    isRecruiter: () => get().role === 'recruiter',

    isCandidate: () => get().role === 'candidate',

    clearAll: () => set({ role: DEFAULT_ROLE }),
}));
