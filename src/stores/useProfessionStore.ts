import { create } from "zustand";

export type ProfessionStatus = "active_search" | "considering" | "not_searching";

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
    isActive: boolean;
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

export const useProfessionStore = create<ProfessionState>((set, get) => ({
    professions: [],
    activeProfession: null,
    isLoading: false,
    isSyncing: false,
    isSwitching: false,
    isSetupModalOpen: false,
    hasInitialized: false,

    setProfessions: (professions) => {
        const active = professions.find(p => p.isActive) || professions[0] || null;
        set({ professions, activeProfession: active });
    },

    setSetupModalOpen: (open) => {
        set({ isSetupModalOpen: open });
    },

    setActiveProfession: (profession) => {
        set({ activeProfession: profession });
    },

    addProfession: (profession) => {
        set((state) => ({
            professions: [...state.professions, profession],
            activeProfession: profession.isActive ? profession : state.activeProfession,
        }));
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
            const activeProfession = state.activeProfession?.id === id
                ? professions[0] || null
                : state.activeProfession;
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
                    const active = data.professions.find((p: Profession) => p.isActive) || data.professions[0] || null;
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

                // Если это первая профессия или она активна - обновляем состояние
                set((state) => {
                    const professions = [...state.professions, profession];
                    const activeProfession = profession.isActive ? profession : state.activeProfession;
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
        // Оптимистичное обновление: сначала меняем локально
        const previousProfessions = get().professions;
        const previousActive = get().activeProfession;

        set((state) => {
            const professions = state.professions.map(p => ({
                ...p,
                isActive: p.id === id,
            }));
            const activeProfession = professions.find(p => p.id === id) || null;
            // Если skipLoading - не показываем loading state (данные из кэша)
            return {
                professions,
                activeProfession,
                isSyncing: true,
                isSwitching: skipLoading ? false : true
            };
        });

        try {
            const response = await fetch(`/api/professions/${id}/activate`, {
                method: "POST",
            });

            if (!response.ok) {
                throw new Error("Failed to switch profession");
            }
        } catch (error) {
            console.error("Failed to switch profession:", error);
            // Откат при ошибке
            set({ professions: previousProfessions, activeProfession: previousActive });
        } finally {
            set({ isSyncing: false, isSwitching: false });
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
}));

