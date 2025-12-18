import { create } from 'zustand';
import type { GeneratedCandidate } from '@/app/api/search/route';

interface SearchState {
    query: string;
    results: GeneratedCandidate[];
    isSearching: boolean;
    error: string | null;

    setQuery: (query: string) => void;
    search: (query: string) => Promise<void>;
    clearResults: () => void;

    // Clear all data (for logout)
    clearAll: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
    query: '',
    results: [],
    isSearching: false,
    error: null,

    setQuery: (query) => set({ query }),

    search: async (query) => {
        set({ isSearching: true, query, error: null });

        try {
            const response = await fetch('/api/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query }),
            });

            const data = await response.json();

            if (data.error) {
                set({ error: data.error, results: [], isSearching: false });
                return;
            }

            set({ results: data.candidates || [], isSearching: false, error: null });
        } catch (error) {
            console.error('Search error:', error);
            set({
                error: 'Произошла ошибка при поиске. Попробуйте ещё раз.',
                results: [],
                isSearching: false,
            });
        }
    },

    clearResults: () => set({ results: [], query: '', error: null }),

    clearAll: () => set({
        query: '',
        results: [],
        isSearching: false,
        error: null,
    }),
}));
