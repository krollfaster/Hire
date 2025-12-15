import { create } from 'zustand';

// Types
export type TraitCategory = "hard_skills" | "impact" | "domain" | "superpower" | "process" | "background" | "culture";

export interface TraitRelation {
    targetId: string;
    type: "uses" | "enables" | "part_of" | "related";
}

export interface Trait {
    id: string;
    label: string;
    description: string; // Short description, max 15 words
    category: TraitCategory;
    importance: number; // 1 to 5, can be decimal (e.g., 4.3)
    relations: TraitRelation[];
}

// Action types for AI responses
export type TraitAction =
    | { type: "create"; data: Trait }
    | { type: "update"; id: string; updates: Partial<Omit<Trait, "id">> }
    | { type: "delete"; id: string };

interface TraitsState {
    traits: Trait[];
    previousState: Trait[] | null;
    isLoading: boolean;
    isSyncing: boolean;
    
    // Apply actions from AI response
    applyActions: (actions: TraitAction[]) => void;
    
    // Replace all traits (for "Optimize" feature)
    replaceAll: (traits: Trait[]) => void;
    
    // Undo last change
    undo: () => void;
    
    // Get simplified context for AI (to save tokens)
    getContextForAI: () => { id: string; label: string; category: TraitCategory }[];
    
    // Sync with database
    loadFromServer: () => Promise<void>;
    saveToServer: () => Promise<void>;
}

// Debounce function for saving
let saveTimeout: ReturnType<typeof setTimeout> | null = null;

export const useTraitsStore = create<TraitsState>((set, get) => ({
    traits: [],
    previousState: null,
    isLoading: false,
    isSyncing: false,

    applyActions: (actions) => {
        set((state) => {
            // Save current state for undo
            const previousState = [...state.traits];
            let newTraits = [...state.traits];

            for (const action of actions) {
                switch (action.type) {
                    case "create":
                        // Check if trait with this id already exists
                        if (!newTraits.find(t => t.id === action.data.id)) {
                            newTraits.push(action.data);
                        }
                        break;
                    
                    case "update":
                        newTraits = newTraits.map(trait =>
                            trait.id === action.id
                                ? { ...trait, ...action.updates }
                                : trait
                        );
                        break;
                    
                    case "delete":
                        newTraits = newTraits.filter(trait => trait.id !== action.id);
                        // Also remove references from relations
                        newTraits = newTraits.map(trait => ({
                            ...trait,
                            relations: trait.relations.filter(rel => rel.targetId !== action.id)
                        }));
                        break;
                }
            }

            return { traits: newTraits, previousState };
        });

        // Debounced save to server
        if (saveTimeout) clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            get().saveToServer();
        }, 2000);
    },

    replaceAll: (traits) => {
        set((state) => ({
            traits,
            previousState: [...state.traits]
        }));

        // Save to server
        if (saveTimeout) clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            get().saveToServer();
        }, 500);
    },

    undo: () => {
        set((state) => {
            if (state.previousState === null) return state;
            return {
                traits: state.previousState,
                previousState: null
            };
        });

        // Save to server after undo
        if (saveTimeout) clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            get().saveToServer();
        }, 500);
    },

    getContextForAI: () => {
        const { traits } = get();
        return traits.map(({ id, label, category }) => ({ id, label, category }));
    },

    loadFromServer: async () => {
        set({ isLoading: true });
        try {
            const response = await fetch("/api/sync/graph");
            if (response.ok) {
                const data = await response.json();
                if (data.traits && Array.isArray(data.traits)) {
                    set({ traits: data.traits });
                }
            }
        } catch (error) {
            console.error("Failed to load traits from server:", error);
        } finally {
            set({ isLoading: false });
        }
    },

    saveToServer: async () => {
        const { traits } = get();
        set({ isSyncing: true });
        try {
            await fetch("/api/sync/graph", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ traits }),
            });
        } catch (error) {
            console.error("Failed to save traits to server:", error);
        } finally {
            set({ isSyncing: false });
        }
    },
}));
