import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { STORAGE_KEYS, createLocalStorageHelper } from './constants';

export type ProfessionStatus = "active_search" | "considering" | "not_searching";

// Хелпер для работы с последней активной профессией
const lastActiveProfessionStorage = createLocalStorageHelper<string>(
    STORAGE_KEYS.LAST_ACTIVE_PROFESSION
);

export interface Profession {
    id: string;
    name: string;
    grade: string;
    salaryMin: number | null;
    salaryMax: number | null;
    status: ProfessionStatus | null;
    employmentType: string | null;
    workFormat: string | null;
    travelTime: string | null;
    businessTrips: boolean | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateProfessionData {
    name: string;
    grade: string;
    salaryMin?: number | null;
    salaryMax?: number | null;
    status?: ProfessionStatus | null;
    employmentType?: string | null;
    workFormat?: string | null;
    travelTime?: string | null;
    businessTrips?: boolean | null;
}

interface ProfessionState {
    professions: Profession[];
    activeProfession: Profession | null;
    isLoading: boolean;
    isSyncing: boolean;
    isSwitching: boolean;
    isSetupModalOpen: boolean;
    hasInitialized: boolean;

    // Actions
    setProfessions: (professions: Profession[]) => void;
    setSetupModalOpen: (open: boolean) => void;
    setActiveProfession: (profession: Profession | null) => void;
    addProfession: (profession: Profession) => void;
    updateProfession: (id: string, updates: Partial<Profession>) => void;
    deleteProfession: (id: string) => void;

    // Server sync
    loadFromServer: () => Promise<void>;
    createProfession: (data: CreateProfessionData) => Promise<Profession | null>;
    editProfession: (id: string, data: Partial<CreateProfessionData>) => Promise<Profession | null>;
    switchProfession: (id: string, skipLoading?: boolean) => Promise<void>;
    setSwitching: (value: boolean) => void;
    removeProfession: (id: string) => Promise<void>;

    // Clear all data (for logout)
    clearAll: () => void;
}

const INITIAL_STATE: Omit<ProfessionState, 'setProfessions' | 'setSetupModalOpen' | 'setActiveProfession' | 'addProfession' | 'updateProfession' | 'deleteProfession' | 'loadFromServer' | 'createProfession' | 'editProfession' | 'switchProfession' | 'setSwitching' | 'removeProfession' | 'clearAll'> = {
    professions: [],
    activeProfession: null,
    isLoading: false,
    isSyncing: false,
    isSwitching: false,
    isSetupModalOpen: false,
    hasInitialized: false,
};

// Хелпер для определения активной профессии
const findActiveProfession = (
    professions: Profession[],
    lastActiveId: string | null
): Profession | null => {
    return professions.find((p) => p.id === lastActiveId) || professions[0] || null;
};

export const useProfessionStore = create<ProfessionState>()(
    persist(
        (set, get) => ({
            ...INITIAL_STATE,

            setProfessions: (professions) => {
                const lastActiveId = lastActiveProfessionStorage.get();
                const active = findActiveProfession(professions, lastActiveId);

                if (active) {
                    lastActiveProfessionStorage.set(active.id);
                }

                set({ professions, activeProfession: active });
            },

            setSetupModalOpen: (open) => set({ isSetupModalOpen: open }),

            setActiveProfession: (profession) => {
                lastActiveProfessionStorage.set(profession?.id || null);
                set({ activeProfession: profession });
            },

            addProfession: (profession) => {
                set((state) => {
                    const isFirst = state.professions.length === 0;
                    const newActiveProfession = isFirst ? profession : state.activeProfession;

                    if (isFirst) {
                        lastActiveProfessionStorage.set(profession.id);
                    }

                    return {
                        professions: [...state.professions, profession],
                        activeProfession: newActiveProfession,
                    };
                });
            },

            updateProfession: (id, updates) => {
                set((state) => {
                    const professions = state.professions.map((p) =>
                        p.id === id ? { ...p, ...updates } : p
                    );
                    const activeProfession = state.activeProfession?.id === id
                        ? { ...state.activeProfession, ...updates }
                        : state.activeProfession;

                    return { professions, activeProfession };
                });
            },

            deleteProfession: (id) => {
                set((state) => {
                    const professions = state.professions.filter((p) => p.id !== id);
                    const wasActive = state.activeProfession?.id === id;
                    const activeProfession = wasActive
                        ? professions[0] || null
                        : state.activeProfession;

                    if (wasActive) {
                        lastActiveProfessionStorage.set(activeProfession?.id || null);
                    }

                    return { professions, activeProfession };
                });
            },

            loadFromServer: async () => {
                set({ isLoading: true });

                try {
                    const response = await fetch("/api/professions");

                    if (response.ok) {
                        const data = await response.json();

                        if (data.professions && Array.isArray(data.professions)) {
                            const lastActiveId = lastActiveProfessionStorage.get();
                            const active = findActiveProfession(data.professions, lastActiveId);

                            if (active) {
                                lastActiveProfessionStorage.set(active.id);
                            }

                            set({ professions: data.professions, activeProfession: active });
                        }
                    }
                } catch (error) {
                    console.error("Failed to load professions from server:", error);
                } finally {
                    set({ isLoading: false, hasInitialized: true });
                }
            },

            createProfession: async (data) => {
                set({ isSyncing: true });

                try {
                    const response = await fetch("/api/professions", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(data),
                    });

                    if (response.ok) {
                        const result = await response.json();
                        const profession = result.profession;

                        set((state) => {
                            const isFirst = state.professions.length === 0;
                            const professions = [...state.professions, profession];
                            const activeProfession = isFirst ? profession : state.activeProfession;

                            if (isFirst) {
                                lastActiveProfessionStorage.set(profession.id);
                            }

                            return { professions, activeProfession };
                        });

                        return profession;
                    }

                    return null;
                } catch (error) {
                    console.error("Failed to create profession:", error);
                    return null;
                } finally {
                    set({ isSyncing: false });
                }
            },

            editProfession: async (id, data) => {
                set({ isSyncing: true });

                try {
                    const response = await fetch(`/api/professions/${id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(data),
                    });

                    if (response.ok) {
                        const result = await response.json();
                        const updatedProfession = result.profession;

                        get().updateProfession(id, updatedProfession);

                        return updatedProfession;
                    }

                    return null;
                } catch (error) {
                    console.error("Failed to edit profession:", error);
                    return null;
                } finally {
                    set({ isSyncing: false });
                }
            },

            switchProfession: async (id, skipLoading = false) => {
                const activeProfession = get().professions.find((p) => p.id === id) || null;

                if (activeProfession) {
                    lastActiveProfessionStorage.set(id);
                    set({
                        activeProfession,
                        isSwitching: !skipLoading,
                    });
                }
            },

            setSwitching: (value: boolean) => set({ isSwitching: value }),

            removeProfession: async (id) => {
                set({ isSyncing: true });

                try {
                    const response = await fetch(`/api/professions/${id}`, {
                        method: "DELETE",
                    });

                    if (response.ok) {
                        get().deleteProfession(id);
                    }
                } catch (error) {
                    console.error("Failed to delete profession:", error);
                } finally {
                    set({ isSyncing: false });
                }
            },

            clearAll: () => {
                lastActiveProfessionStorage.set(null);
                set(INITIAL_STATE);
            },
        }),
        {
            name: STORAGE_KEYS.PROFESSIONS,
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                professions: state.professions,
                activeProfession: state.activeProfession,
            }),
            onRehydrateStorage: () => (state) => {
                if (state && state.professions.length > 0) {
                    state.hasInitialized = true;
                }
            },
        }
    )
);
