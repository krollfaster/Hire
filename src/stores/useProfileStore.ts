import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ProfileData {
    id?: string;
    fullName?: string | null;
    avatarUrl?: string | null;
    employmentType?: string | null;
    workFormat?: string | null;
}

interface ProfileState {
    profile: ProfileData | null;
    isLoading: boolean;
    hasFetched: boolean;
    currentUserId: string | null;

    // Actions
    setProfile: (profile: ProfileData | null) => void;
    setLoading: (loading: boolean) => void;
    fetchProfile: (userId: string, force?: boolean) => Promise<void>;
    clearAll: () => void;
}

export const useProfileStore = create<ProfileState>()(
    persist(
        (set, get) => ({
            profile: null,
            isLoading: false,
            hasFetched: false,
            currentUserId: null,

            setProfile: (profile) => set({ profile }),

            setLoading: (isLoading) => set({ isLoading }),

            fetchProfile: async (userId: string, force = false) => {
                const state = get();

                // Don't refetch if same user and already fetched (unless forced)
                if (!force && state.hasFetched && state.currentUserId === userId) {
                    return;
                }

                set({ isLoading: true });

                try {
                    const response = await fetch("/api/profile");
                    if (response.ok) {
                        const data = await response.json();
                        set({
                            profile: data.profile || null,
                            hasFetched: true,
                            currentUserId: userId,
                        });
                    }
                } catch (error) {
                    console.error("Error fetching profile:", error);
                } finally {
                    set({ isLoading: false });
                }
            },

            clearAll: () => set({
                profile: null,
                isLoading: false,
                hasFetched: false,
                currentUserId: null,
            }),
        }),
        {
            name: 'profile-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                profile: state.profile,
                currentUserId: state.currentUserId,
            }),
        }
    )
);
