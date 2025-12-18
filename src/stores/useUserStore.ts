import { create } from 'zustand';
import { User, Skill, Activity, WorkExperience, Education, Contacts, emptyUser } from '@/data/mock';

interface UserState {
    user: User;
    // Profile methods
    updateProfile: (updates: Partial<Pick<User, 'name' | 'role' | 'avatar' | 'bio' | 'location' | 'relocatable'>>) => void;
    updateContacts: (contacts: Partial<Contacts>) => void;
    // Work history methods
    addWorkExperience: (experience: WorkExperience) => void;
    updateWorkExperience: (id: string, updates: Partial<Omit<WorkExperience, 'id'>>) => void;
    removeWorkExperience: (id: string) => void;
    // Education methods
    addEducation: (education: Education) => void;
    updateEducation: (id: string, updates: Partial<Omit<Education, 'id'>>) => void;
    removeEducation: (id: string) => void;
    // Existing methods
    addSkill: (skill: Skill) => void;
    removeSkill: (skillId: string) => void;
    updateStats: (stats: Partial<User['stats']>) => void;
    addActivity: (activity: Activity) => void;

    // Clear all data (for logout)
    clearAll: () => void;
}

const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const useUserStore = create<UserState>((set) => ({
    user: emptyUser,

    updateProfile: (updates) =>
        set((state) => ({
            user: {
                ...state.user,
                ...updates,
            },
        })),

    updateContacts: (contacts) =>
        set((state) => ({
            user: {
                ...state.user,
                contacts: { ...state.user.contacts, ...contacts },
            },
        })),

    addWorkExperience: (experience) =>
        set((state) => ({
            user: {
                ...state.user,
                workHistory: [{ ...experience, id: experience.id || generateId() }, ...state.user.workHistory],
            },
        })),

    updateWorkExperience: (id, updates) =>
        set((state) => ({
            user: {
                ...state.user,
                workHistory: state.user.workHistory.map((exp) =>
                    exp.id === id ? { ...exp, ...updates } : exp
                ),
            },
        })),

    removeWorkExperience: (id) =>
        set((state) => ({
            user: {
                ...state.user,
                workHistory: state.user.workHistory.filter((exp) => exp.id !== id),
            },
        })),

    addEducation: (education) =>
        set((state) => ({
            user: {
                ...state.user,
                education: [{ ...education, id: education.id || generateId() }, ...state.user.education],
            },
        })),

    updateEducation: (id, updates) =>
        set((state) => ({
            user: {
                ...state.user,
                education: state.user.education.map((edu) =>
                    edu.id === id ? { ...edu, ...updates } : edu
                ),
            },
        })),

    removeEducation: (id) =>
        set((state) => ({
            user: {
                ...state.user,
                education: state.user.education.filter((edu) => edu.id !== id),
            },
        })),

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

    clearAll: () =>
        set(() => ({
            user: emptyUser,
        })),
}));
