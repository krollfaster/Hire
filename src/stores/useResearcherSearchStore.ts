import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Ключ для хранения последнего активного поискового запроса в localStorage
const LAST_ACTIVE_SEARCH_KEY = 'lastActiveResearcherSearchId';

// Helper функции для работы с localStorage
const getLastActiveSearchId = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(LAST_ACTIVE_SEARCH_KEY);
};

const setLastActiveSearchId = (id: string | null): void => {
    if (typeof window === 'undefined') return;
    if (id) {
        localStorage.setItem(LAST_ACTIVE_SEARCH_KEY, id);
    } else {
        localStorage.removeItem(LAST_ACTIVE_SEARCH_KEY);
    }
};

export interface ResearcherSearch {
    id: string;
    userId: string;
    query: string;
    name: string | null;
    grade: string | null;
    salaryMin: number | null;
    salaryMax: number | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateSearchData {
    query: string;
    name?: string | null;
    grade?: string | null;
    salaryMin?: number | null;
    salaryMax?: number | null;
}

interface ResearcherSearchState {
    searches: ResearcherSearch[];
    activeSearch: ResearcherSearch | null;
    isLoading: boolean;
    isSyncing: boolean;
    isSetupModalOpen: boolean;
    hasInitialized: boolean;

    // Actions
    setSearches: (searches: ResearcherSearch[]) => void;
    setSetupModalOpen: (open: boolean) => void;
    setActiveSearch: (search: ResearcherSearch | null) => void;

    // Server sync
    loadSearches: () => Promise<void>;
    createSearch: (data: CreateSearchData) => Promise<ResearcherSearch | null>;
    editSearch: (id: string, data: Partial<CreateSearchData>) => Promise<ResearcherSearch | null>;
    switchSearch: (searchId: string) => Promise<void>;
    deleteSearch: (searchId: string) => Promise<void>;

    // Clear all data (for logout)
    clearAll: () => void;
}

export const useResearcherSearchStore = create<ResearcherSearchState>()(
    persist(
        (set, get) => ({
            searches: [],
            activeSearch: null,
            isLoading: false,
            isSyncing: false,
            isSetupModalOpen: false,
            hasInitialized: false,

            setSearches: (searches) => {
                const lastActiveId = getLastActiveSearchId();
                const active = searches.find(s => s.id === lastActiveId) || searches[0] || null;
                if (active) {
                    setLastActiveSearchId(active.id);
                }
                set({ searches, activeSearch: active });
            },

            setSetupModalOpen: (open) => {
                set({ isSetupModalOpen: open });
            },

            setActiveSearch: (search) => {
                setLastActiveSearchId(search?.id || null);
                set({ activeSearch: search });
            },

            loadSearches: async () => {
                set({ isLoading: true });
                try {
                    const response = await fetch('/api/researcher-searches');
                    if (response.ok) {
                        const data = await response.json();
                        const searches = data.searches || [];
                        // Пробуем найти последний активный поиск из localStorage
                        const lastActiveId = getLastActiveSearchId();
                        const active = searches.find((s: ResearcherSearch) => s.id === lastActiveId)
                            || searches[0]
                            || null;
                        // Сохраняем актуальный ID в localStorage
                        if (active) {
                            setLastActiveSearchId(active.id);
                        }
                        set({ searches, activeSearch: active, isLoading: false });
                    } else {
                        set({ isLoading: false });
                    }
                } catch (error) {
                    console.error('Failed to load researcher searches:', error);
                    set({ isLoading: false });
                } finally {
                    set({ hasInitialized: true });
                }
            },

            createSearch: async (data) => {
                set({ isSyncing: true });
                try {
                    const response = await fetch('/api/researcher-searches', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data),
                    });

                    if (response.ok) {
                        const result = await response.json();
                        const newSearch = result.search;

                        // Если это первый поиск - делаем его активным
                        set((state) => {
                            const isFirst = state.searches.length === 0;
                            const searches = [...state.searches, newSearch];
                            const activeSearch = isFirst ? newSearch : state.activeSearch;
                            if (isFirst) {
                                setLastActiveSearchId(newSearch.id);
                            }
                            return { searches, activeSearch };
                        });

                        return newSearch;
                    }
                    return null;
                } catch (error) {
                    console.error('Failed to create researcher search:', error);
                    return null;
                } finally {
                    set({ isSyncing: false });
                }
            },

            editSearch: async (id, data) => {
                set({ isSyncing: true });
                try {
                    const response = await fetch(`/api/researcher-searches/${id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data),
                    });

                    if (response.ok) {
                        const result = await response.json();
                        const updatedSearch = result.search;

                        // Обновляем локальное состояние
                        set((state) => {
                            const searches = state.searches.map(s =>
                                s.id === id ? { ...s, ...updatedSearch } : s
                            );
                            const activeSearch = state.activeSearch?.id === id
                                ? { ...state.activeSearch, ...updatedSearch }
                                : state.activeSearch;
                            return { searches, activeSearch };
                        });

                        return updatedSearch;
                    }
                    return null;
                } catch (error) {
                    console.error('Failed to edit researcher search:', error);
                    return null;
                } finally {
                    set({ isSyncing: false });
                }
            },

            switchSearch: async (searchId: string) => {
                const { searches } = get();
                const search = searches.find(s => s.id === searchId);
                if (!search) return;

                // Локальное переключение - сохраняем в localStorage
                setLastActiveSearchId(searchId);
                set({ activeSearch: search });
            },

            deleteSearch: async (searchId: string) => {
                set({ isSyncing: true });
                try {
                    const response = await fetch(`/api/researcher-searches/${searchId}`, {
                        method: 'DELETE',
                    });

                    if (response.ok) {
                        set(state => {
                            const searches = state.searches.filter(s => s.id !== searchId);
                            const wasActive = state.activeSearch?.id === searchId;
                            const activeSearch = wasActive
                                ? searches[0] || null
                                : state.activeSearch;
                            if (wasActive) {
                                setLastActiveSearchId(activeSearch?.id || null);
                            }
                            return { searches, activeSearch };
                        });
                    }
                } catch (error) {
                    console.error('Failed to delete search:', error);
                } finally {
                    set({ isSyncing: false });
                }
            },

            clearAll: () => {
                setLastActiveSearchId(null);
                set({
                    searches: [],
                    activeSearch: null,
                    isLoading: false,
                    isSyncing: false,
                    isSetupModalOpen: false,
                    hasInitialized: false,
                });
            },
        }),
        {
            name: 'researcher-searches-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                searches: state.searches,
                activeSearch: state.activeSearch,
            }),
            onRehydrateStorage: () => (state) => {
                // После регидрации помечаем что данные загружены из кэша
                if (state && state.searches.length > 0) {
                    state.hasInitialized = true;
                }
            },
        }
    )
);
