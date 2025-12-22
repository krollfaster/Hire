import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Types - STAR-Graph (Evidence-Based Competence Graph)

// Node types organized by layers
export type NodeType =
    | "ROLE" | "DOMAIN" | "SKILL"      // Layer 1: Assets (Что у меня есть)
    | "CHALLENGE" | "ACTION"            // Layer 2: Actions (Что я делал)
    | "METRIC" | "ARTIFACT"             // Layer 3: Impact (К чему это привело)
    | "ATTRIBUTE";                      // Layer 4: Attributes (Какой я)

// Edge types for STAR methodology
export type EdgeType =
    | "SOLVED_WITH"    // CHALLENGE -> SKILL/ACTION (Как решена проблема)
    | "USED"           // ACTION -> SKILL (Какие инструменты использованы)
    | "IN_CONTEXT"     // ACTION/ARTIFACT -> DOMAIN (В какой сфере)
    | "RESULTED_IN"    // ACTION -> METRIC/ARTIFACT (К чему привело)
    | "DRIVER"         // ATTRIBUTE -> ACTION (Что помогло)
    | "PERFORMED_AS";  // ACTION -> ROLE (В какой роли)

// Legacy types for backward compatibility
export type LegacyCategory = "skills" | "context" | "artifacts" | "attributes";
export type LegacyEdgeType = "stack" | "in_domain" | "in_role" | "result" | "driver";

// Evidence Level - уровень доказательности компетенции
export type EvidenceLevel =
    | "theory"    // Теоретическая - навык упомянут без доказательств практики
    | "practice"  // Практическая - есть доказательства применения
    | "result";   // Результативная - есть измеримые достижения

export interface TraitRelation {
    targetId: string;
    type: EdgeType | LegacyEdgeType;
}

export interface Trait {
    id: string;
    label: string;
    description: string; // Short description, max 40 words
    type: NodeType | LegacyCategory; // New field, supports legacy categories
    importance: number; // 1 to 5, can be decimal (e.g., 4.3)
    relations: TraitRelation[];
    evidenceLevel?: EvidenceLevel; // Уровень доказательности (опционально для обратной совместимости)
}

// Helper to get layer for a node type
export function getNodeLayer(type: NodeType | LegacyCategory): number {
    const layerMap: Record<string, number> = {
        // Layer 1: Assets
        ROLE: 1, DOMAIN: 1, SKILL: 1,
        skills: 1, context: 1, // legacy mapping
        // Layer 2: Actions
        CHALLENGE: 2, ACTION: 2,
        // Layer 3: Impact
        METRIC: 3, ARTIFACT: 3,
        artifacts: 3, // legacy mapping
        // Layer 4: Attributes
        ATTRIBUTE: 4,
        attributes: 4, // legacy mapping
    };
    return layerMap[type] || 1;
}

// Helper to migrate legacy category to new NodeType
export function migrateCategory(category: LegacyCategory | NodeType): NodeType {
    const migrationMap: Record<string, NodeType> = {
        skills: "SKILL",
        context: "DOMAIN",
        artifacts: "ARTIFACT",
        attributes: "ATTRIBUTE",
    };
    return migrationMap[category] || (category as NodeType);
}

// Helper to migrate legacy edge type to new EdgeType
export function migrateEdgeType(edgeType: LegacyEdgeType | EdgeType): EdgeType {
    const migrationMap: Record<string, EdgeType> = {
        stack: "USED",
        in_domain: "IN_CONTEXT",
        in_role: "PERFORMED_AS",
        result: "RESULTED_IN",
        driver: "DRIVER",
    };
    return migrationMap[edgeType] || (edgeType as EdgeType);
}

// Helper to check if a trait has legacy structure
function isLegacyTrait(trait: any): boolean {
    return trait.category !== undefined && trait.type === undefined;
}

// Helper to migrate a single trait from legacy to new format
export function migrateTrait(trait: any): Trait {
    // If trait has legacy 'category' field, migrate it
    if (isLegacyTrait(trait)) {
        return {
            id: trait.id,
            label: trait.label,
            description: trait.description || "",
            type: migrateCategory(trait.category),
            importance: trait.importance || 3.0,
            relations: (trait.relations || []).map((rel: any) => ({
                targetId: rel.targetId,
                type: migrateEdgeType(rel.type),
            })),
            evidenceLevel: trait.evidenceLevel || "theory", // Default for legacy
        };
    }

    // If trait already has new structure, just ensure relations are migrated
    return {
        ...trait,
        relations: (trait.relations || []).map((rel: any) => ({
            targetId: rel.targetId,
            type: migrateEdgeType(rel.type),
        })),
        evidenceLevel: trait.evidenceLevel || "theory", // Default if not set
    };
}

// Helper to migrate an array of traits
export function migrateTraits(traits: any[]): Trait[] {
    return traits.map(migrateTrait);
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
    traitsCache: Record<string, Trait[]>; // Кэш traits по professionId
    currentProfessionId: string | null; // ID текущей профессии
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
    getContextForAI: () => { id: string; label: string; type: NodeType | LegacyCategory }[];

    // Sync with database
    loadFromServer: (professionId?: string) => Promise<void>;
    saveToServer: () => Promise<void>;

    // External interaction
    externalHighlightIds: string[];
    externalHighlightMode: 'view' | 'delete';
    setExternalHighlightIds: (ids: string[], mode?: 'view' | 'delete') => void;
    deleteTraits: (ids: string[]) => void;

    // Clear all data (for logout)
    clearAll: () => void;
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

export const useTraitsStore = create<TraitsState>()(
    persist(
        (set, get) => ({
            traits: [],
            savedTraits: [],
            traitsCache: {},
            currentProfessionId: null,
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
                return traits.map(({ id, label, type }) => ({ id, label, type }));
            },

            loadFromServer: async (professionId?: string) => {
                const { traitsCache, currentProfessionId } = get();
                const targetProfessionId = professionId || 'default';

                // Если данные уже в кэше - используем их мгновенно
                if (traitsCache[targetProfessionId]) {
                    const cachedTraits = traitsCache[targetProfessionId];
                    set({
                        traits: cachedTraits,
                        savedTraits: cachedTraits,
                        currentProfessionId: targetProfessionId,
                        history: [],
                        historyIndex: -1,
                        isLoading: false
                    });
                    return;
                }

                set({ isLoading: true });
                try {
                    const url = professionId
                        ? `/api/sync/graph?professionId=${professionId}`
                        : "/api/sync/graph";

                    const response = await fetch(url);
                    if (response.ok) {
                        const data = await response.json();
                        if (data.traits && Array.isArray(data.traits)) {
                            // Migrate legacy traits to new STAR-Graph format
                            const migratedTraits = migrateTraits(data.traits);

                            // Обновляем кэш и состояние
                            set((state) => ({
                                traits: migratedTraits,
                                savedTraits: migratedTraits,
                                currentProfessionId: targetProfessionId,
                                traitsCache: {
                                    ...state.traitsCache,
                                    [targetProfessionId]: migratedTraits
                                },
                                history: [],
                                historyIndex: -1
                            }));
                        }
                    }
                } catch (error) {
                    console.error("Failed to load traits from server:", error);
                } finally {
                    set({ isLoading: false });
                }
            },

            saveToServer: async () => {
                const { traits, currentProfessionId } = get();
                set({ isSyncing: true });
                try {
                    await fetch("/api/sync/graph", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ traits }),
                    });
                    // После успешного сохранения обновляем savedTraits, кэш и очищаем историю
                    set((state) => ({
                        savedTraits: traits,
                        traitsCache: currentProfessionId
                            ? { ...state.traitsCache, [currentProfessionId]: traits }
                            : state.traitsCache,
                        history: [],
                        historyIndex: -1
                    }));
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

            clearAll: () => {
                set({
                    traits: [],
                    savedTraits: [],
                    traitsCache: {},
                    currentProfessionId: null,
                    history: [],
                    historyIndex: -1,
                    isLoading: false,
                    isSyncing: false,
                    externalHighlightIds: [],
                    externalHighlightMode: 'view',
                });
            },
        }),
        {
            name: 'traits-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                traitsCache: state.traitsCache,
                currentProfessionId: state.currentProfessionId,
            }),
            // При загрузке восстанавливаем traits из кэша для текущей профессии
            onRehydrateStorage: () => (state) => {
                if (state && state.currentProfessionId && state.traitsCache[state.currentProfessionId]) {
                    const cachedTraits = state.traitsCache[state.currentProfessionId];
                    state.traits = cachedTraits;
                    state.savedTraits = cachedTraits;
                }
            },
        }
    )
);
