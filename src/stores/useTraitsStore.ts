import { create } from 'zustand';

// Types
export type TraitCategory = "skills" | "context" | "artifacts" | "attributes";

export interface TraitRelation {
    targetId: string;
    type: "stack" | "in_domain" | "in_role" | "result" | "driver";
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

// Maximum history size to prevent memory issues
const MAX_HISTORY_SIZE = 50;

interface TraitsState {
    traits: Trait[];           // Рабочее состояние
    savedTraits: Trait[];      // Сохранённое в БД состояние
    history: Trait[][];        // Стек истории для undo/redo
    historyIndex: number;      // Текущая позиция в истории (-1 = начало)
    isLoading: boolean;
    isSyncing: boolean;

    // Apply actions from AI response (локально, без сохранения в БД)
    applyActions: (actions: TraitAction[]) => void;

    // Replace all traits (локально, без сохранения в БД)
    replaceAll: (traits: Trait[]) => void;

    // Undo/Redo
    undo: () => void;
    redo: () => void;

    // Computed getters
    canUndo: () => boolean;
    canRedo: () => boolean;
    hasUnsavedChanges: () => boolean;

    // Reset to saved state
    resetToSaved: () => void;

    // Get simplified context for AI (to save tokens)
    getContextForAI: () => { id: string; label: string; category: TraitCategory }[];

    // Sync with database
    loadFromServer: () => Promise<void>;
    saveToServer: () => Promise<void>;

    // External interaction
    externalHighlightIds: string[];
    externalHighlightMode: 'view' | 'delete';
    setExternalHighlightIds: (ids: string[], mode?: 'view' | 'delete') => void;
    deleteTraits: (ids: string[]) => void;
}


// Helper to push state to history
function pushToHistory(history: Trait[][], historyIndex: number, newState: Trait[]): { history: Trait[][]; historyIndex: number } {
    // Remove any future states if we're not at the end
    const newHistory = history.slice(0, historyIndex + 1);

    // Add new state
    newHistory.push(newState);

    // Limit history size
    if (newHistory.length > MAX_HISTORY_SIZE) {
        newHistory.shift();
        return { history: newHistory, historyIndex: newHistory.length - 1 };
    }

    return { history: newHistory, historyIndex: newHistory.length - 1 };
}

// Helper to compare two trait arrays
function traitsAreEqual(a: Trait[], b: Trait[]): boolean {
    if (a.length !== b.length) return false;
    return JSON.stringify(a) === JSON.stringify(b);
}

export const useTraitsStore = create<TraitsState>((set, get) => ({
    traits: [],
    savedTraits: [],
    history: [],
    historyIndex: -1,
    isLoading: false,
    isSyncing: false,

    applyActions: (actions) => {
        set((state) => {
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

            // Push current state to history before applying changes
            const { history, historyIndex } = pushToHistory(
                state.history,
                state.historyIndex,
                state.traits
            );

            return {
                traits: newTraits,
                history,
                historyIndex
            };
        });
    },

    replaceAll: (traits) => {
        set((state) => {
            // Push current state to history before replacing
            const { history, historyIndex } = pushToHistory(
                state.history,
                state.historyIndex,
                state.traits
            );

            return {
                traits,
                history,
                historyIndex
            };
        });
    },

    undo: () => {
        set((state) => {
            if (state.historyIndex < 0) return state;

            // Save current state to history if we're at the end
            let history = state.history;
            let historyIndex = state.historyIndex;

            // If we're at the latest position and haven't saved current state yet
            if (historyIndex === history.length - 1) {
                // Push current state so we can redo back to it
                history = [...history, state.traits];
            }

            // Get previous state from history
            const previousState = history[historyIndex];

            return {
                traits: previousState,
                history,
                historyIndex: historyIndex - 1
            };
        });
    },

    redo: () => {
        set((state) => {
            if (state.historyIndex >= state.history.length - 1) return state;

            const nextIndex = state.historyIndex + 1;
            const nextState = state.history[nextIndex + 1] || state.history[nextIndex];

            // If there's a state after the next index, use it
            if (state.history[nextIndex + 1]) {
                return {
                    traits: state.history[nextIndex + 1],
                    historyIndex: nextIndex
                };
            }

            return state;
        });
    },

    canUndo: () => {
        const { historyIndex } = get();
        return historyIndex >= 0;
    },

    canRedo: () => {
        const { history, historyIndex } = get();
        return historyIndex < history.length - 1;
    },

    hasUnsavedChanges: () => {
        const { traits, savedTraits } = get();
        return !traitsAreEqual(traits, savedTraits);
    },

    resetToSaved: () => {
        set((state) => ({
            traits: [...state.savedTraits],
            history: [],
            historyIndex: -1
        }));
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
                    set({
                        traits: data.traits,
                        savedTraits: data.traits,
                        history: [],
                        historyIndex: -1
                    });
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
            // После успешного сохранения обновляем savedTraits и очищаем историю
            set({
                savedTraits: traits,
                history: [],
                historyIndex: -1
            });
        } catch (error) {
            console.error("Failed to save traits to server:", error);
        } finally {
            set({ isSyncing: false });
        }
    },

    externalHighlightIds: [],
    externalHighlightMode: 'view',
    setExternalHighlightIds: (ids, mode = 'view') => set({ externalHighlightIds: ids, externalHighlightMode: mode }),

    deleteTraits: (ids) => {
        set((state) => {
            // Find all traits to delete including the given ids and anything that depends on them?
            // For now, we only delete the specific traits requested (and their relations will be cleaned up by the delete logic)
            // But wait, our 'delete' action in applyActions handles single ID. 
            // We need to batch delete.

            const idsToDelete = new Set(ids);

            // Also find connections to remove
            let newTraits = state.traits.filter(trait => !idsToDelete.has(trait.id));

            // Cleanup relations in remaining traits
            newTraits = newTraits.map(trait => ({
                ...trait,
                relations: trait.relations.filter(rel => !idsToDelete.has(rel.targetId))
            }));

            // Push to history
            const { history, historyIndex } = pushToHistory(
                state.history,
                state.historyIndex,
                state.traits
            );

            return {
                traits: newTraits,
                history,
                historyIndex,
                externalHighlightIds: [] // Clear highlights after delete
            };
        });
    },
}));
