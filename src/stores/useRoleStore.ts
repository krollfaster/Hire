import { create } from 'zustand';

type UserRole = 'candidate' | 'recruiter';

interface RoleState {
    role: UserRole;
    setRole: (role: UserRole) => void;
    isRecruiter: () => boolean;
    isCandidate: () => boolean;
}

export const useRoleStore = create<RoleState>((set, get) => ({
    role: 'candidate',

    setRole: (role) => set({ role }),

    isRecruiter: () => get().role === 'recruiter',

    isCandidate: () => get().role === 'candidate',
}));

