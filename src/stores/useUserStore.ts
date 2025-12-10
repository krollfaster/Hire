import { create } from 'zustand';
import { User, Skill, Activity, mockUser } from '@/data/mock';

interface UserState {
    user: User;
    addSkill: (skill: Skill) => void;
    removeSkill: (skillId: string) => void;
    updateStats: (stats: Partial<User['stats']>) => void;
    addActivity: (activity: Activity) => void;
}

export const useUserStore = create<UserState>((set) => ({
    user: mockUser,

    addSkill: (skill) =>
        set((state) => ({
            user: {
                ...state.user,
                semanticProfile: [...state.user.semanticProfile, skill],
            },
        })),

    removeSkill: (skillId) =>
        set((state) => ({
            user: {
                ...state.user,
                semanticProfile: state.user.semanticProfile.filter((s) => s.id !== skillId),
            },
        })),

    updateStats: (stats) =>
        set((state) => ({
            user: {
                ...state.user,
                stats: { ...state.user.stats, ...stats },
            },
        })),

    addActivity: (activity) =>
        set((state) => ({
            user: {
                ...state.user,
                recentActivity: [activity, ...state.user.recentActivity].slice(0, 10),
            },
        })),
}));
