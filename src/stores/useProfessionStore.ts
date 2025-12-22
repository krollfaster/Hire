import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type ProfessionStatus = "active_search" | "considering" | "not_searching";

// Ключ для хранения последней активной профессии в localStorage
const LAST_ACTIVE_PROFESSION_KEY = "lastActiveProfessionId";

// Helper функции для работы с localStorage
const getLastActiveProfessionId = (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(LAST_ACTIVE_PROFESSION_KEY);
};

const setLastActiveProfessionId = (id: string | null): void => {
    if (typeof window === "undefined") return;
    if (id) {
        localStorage.setItem(LAST_ACTIVE_PROFESSION_KEY, id);
    } else {
        localStorage.removeItem(LAST_ACTIVE_PROFESSION_KEY);
    }
};

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
    isSwitching: boolean; // Флаг переключения профессии
    isSetupModalOpen: boolean;
    /** Флаг завершения начальной загрузки */
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

export const useProfessionStore = create<ProfessionState>()(
    persist(
        (set, get) => ({
            professions: [],
            activeProfession: null,
            isLoading: false,
            isSyncing: false,
            isSwitching: false,
            isSetupModalOpen: false,
            hasInitialized: false,

            setProfessions: (professions) => {
                const lastActiveId = getLastActiveProfessionId();
                const active = professions.find(p => p.id === lastActiveId) || professions[0] || null;
                if (active) {
                    setLastActiveProfessionId(active.id);
                }
                set({ professions, activeProfession: active });
            },

            setSetupModalOpen: (open) => {
                set({ isSetupModalOpen: open });
            },

            setActiveProfession: (profession) => {
                setLastActiveProfessionId(profession?.id || null);
                set({ activeProfession: profession });
            },

            addProfession: (profession) => {
                set((state) => {
                    const isFirst = state.professions.length === 0;
                    const newActiveProfession = isFirst ? profession : state.activeProfession;
                    if (isFirst) {
                        setLastActiveProfessionId(profession.id);
                    }
                    return {
                        professions: [...state.professions, profession],
                        activeProfession: newActiveProfession,
                    };
                });
            },

            updateProfession: (id, updates) => {
                set((state) => {
                    const professions = state.professions.map(p =>
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
                    const professions = state.professions.filter(p => p.id !== id);
                    const wasActive = state.activeProfession?.id === id;
                    const activeProfession = wasActive
                        ? professions[0] || null
                        : state.activeProfession;
                    if (wasActive) {
                        setLastActiveProfessionId(activeProfession?.id || null);
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
                            // Пробуем найти последнюю активную профессию из localStorage
                            const lastActiveId = getLastActiveProfessionId();
                            const active = data.professions.find((p: Profession) => p.id === lastActiveId)
                                || data.professions[0]
                                || null;
                            // Сохраняем актуальный ID в localStorage
                            if (active) {
                                setLastActiveProfessionId(active.id);
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

                        // Если это первая профессия - делаем её активной
                        set((state) => {
                            const isFirst = state.professions.length === 0;
                            const professions = [...state.professions, profession];
                            const activeProfession = isFirst ? profession : state.activeProfession;
                            if (isFirst) {
                                setLastActiveProfessionId(profession.id);
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

                        // Обновляем локальное состояние
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
                // Переключение теперь только локальное - сохраняем в localStorage
                const activeProfession = get().professions.find(p => p.id === id) || null;

                if (activeProfession) {
                    setLastActiveProfessionId(id);
                    set({
                        activeProfession,
                        isSwitching: skipLoading ? false : true
                    });
                }

                // Сбрасываем флаг переключения после небольшой задержки
                // (нужно для анимации загрузки traits)
                if (!skipLoading) {
                    // isSwitching сбросится в useTraitsStore после загрузки
                }
            },

            setSwitching: (value: boolean) => {
                set({ isSwitching: value });
            },

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
                // Очищаем localStorage при выходе
                setLastActiveProfessionId(null);
                set({
                    professions: [],
                    activeProfession: null,
                    isLoading: false,
                    isSyncing: false,
                    isSwitching: false,
                    isSetupModalOpen: false,
                    hasInitialized: false,
                });
            },
        }),
        {
            name: 'professions-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                professions: state.professions,
                activeProfession: state.activeProfession,
            }),
            onRehydrateStorage: () => (state) => {
                // После регидрации помечаем что данные загружены из кэша
                if (state && state.professions.length > 0) {
                    state.hasInitialized = true;
                }
            },
        }
    )
);

