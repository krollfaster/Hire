import { create } from 'zustand';

export interface ResearcherSearch {
    id: string;
    userId: string;
    query: string;
    name: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

interface ResearcherSearchState {
    searches: ResearcherSearch[];
    activeSearch: ResearcherSearch | null;
    isLoading: boolean;

    loadSearches: () => Promise<void>;
    createSearch: (query: string, name?: string) => Promise<ResearcherSearch | null>;
    switchSearch: (searchId: string) => Promise<void>;
    deleteSearch: (searchId: string) => Promise<void>;
    setActiveSearch: (search: ResearcherSearch | null) => void;
    clearAll: () => void;
}

export const useResearcherSearchStore = create<ResearcherSearchState>((set, get) => ({
    searches: [],
    activeSearch: null,
    isLoading: false,

    loadSearches: async () => {
        set({ isLoading: true });
        try {
            const response = await fetch('/api/researcher-searches');
            if (response.ok) {
                const data = await response.json();
                const searches = data.searches || [];
                const active = searches.find((s: ResearcherSearch) => s.isActive) || searches[0] || null;
                set({ searches, activeSearch: active, isLoading: false });
            } else {
                set({ isLoading: false });
            }
        } catch (error) {
            console.error('Failed to load researcher searches:', error);
            set({ isLoading: false });
        }
    },

    createSearch: async (query: string, name?: string) => {
        try {
            const response = await fetch('/api/researcher-searches', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, name }),
            });
            if (response.ok) {
                const data = await response.json();
                const newSearch = data.search;
                set(state => ({
                    searches: [...state.searches, newSearch],
                    activeSearch: newSearch,
                }));
                return newSearch;
            }
            return null;
        } catch (error) {
            console.error('Failed to create researcher search:', error);
            return null;
        }
    },

    switchSearch: async (searchId: string) => {
        const { searches } = get();
        const search = searches.find(s => s.id === searchId);
        if (!search) return;

        try {
            await fetch(`/api/researcher-searches/${searchId}/activate`, {
                method: 'POST',
            });
            set({ activeSearch: search });
        } catch (error) {
            console.error('Failed to switch search:', error);
        }
    },

    deleteSearch: async (searchId: string) => {
        try {
            await fetch(`/api/researcher-searches/${searchId}`, {
                method: 'DELETE',
            });
            set(state => {
                const searches = state.searches.filter(s => s.id !== searchId);
                const activeSearch = state.activeSearch?.id === searchId
                    ? searches[0] || null
                    : state.activeSearch;
                return { searches, activeSearch };
            });
        } catch (error) {
            console.error('Failed to delete search:', error);
        }
    },

    setActiveSearch: (search) => set({ activeSearch: search }),

    clearAll: () => set({
        searches: [],
        activeSearch: null,
        isLoading: false,
    }),
}));
