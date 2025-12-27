import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { STORAGE_KEYS, MAX_HISTORY_SIZE } from './constants';

// =============================================================================
// Types - STAR-Graph (Evidence-Based Competence Graph)
// =============================================================================

/** Node types organized by layers */
export type NodeType =
    | "ROLE" | "DOMAIN" | "SKILL"      // Layer 1: Assets (Что у меня есть)
    | "CHALLENGE" | "ACTION"            // Layer 2: Actions (Что я делал)
    | "METRIC" | "ARTIFACT"             // Layer 3: Impact (К чему это привело)
    | "ATTRIBUTE";                      // Layer 4: Attributes (Какой я)

/** Edge types for STAR methodology */
export type EdgeType =
    | "SOLVED_WITH"    // CHALLENGE -> SKILL/ACTION (Как решена проблема)
    | "USED"           // ACTION -> SKILL (Какие инструменты использованы)
    | "IN_CONTEXT"     // ACTION/ARTIFACT -> DOMAIN (В какой сфере)
    | "RESULTED_IN"    // ACTION -> METRIC/ARTIFACT (К чему привело)
    | "DRIVER"         // ATTRIBUTE -> ACTION (Что помогло)
    | "PERFORMED_AS";  // ACTION -> ROLE (В какой роли)

/** Legacy types for backward compatibility */
export type LegacyCategory = "skills" | "context" | "artifacts" | "attributes";
export type LegacyEdgeType = "stack" | "in_domain" | "in_role" | "result" | "driver";

/** Evidence Level - уровень доказательности компетенции */
export type EvidenceLevel = "theory" | "practice" | "result";

export interface TraitRelation {
    targetId: string;
    type: EdgeType | LegacyEdgeType;
}

export interface Trait {
    id: string;
    label: string;
    description: string;
    type: NodeType | LegacyCategory;
    importance: number;
    relations: TraitRelation[];
    evidenceLevel?: EvidenceLevel;
}

/** Action types for AI responses */
export type TraitAction =
    | { type: "create"; data: Trait }
    | { type: "update"; id: string; updates: Partial<Omit<Trait, "id">> }
    | { type: "delete"; id: string };

// =============================================================================
// Layer & Migration Helpers
// =============================================================================

const LAYER_MAP: Record<string, number> = {
    // Layer 1: Assets
    ROLE: 1, DOMAIN: 1, SKILL: 1, skills: 1, context: 1,
    // Layer 2: Actions
    CHALLENGE: 2, ACTION: 2,
    // Layer 3: Impact
    METRIC: 3, ARTIFACT: 3, artifacts: 3,
    // Layer 4: Attributes
    ATTRIBUTE: 4, attributes: 4,
};

const CATEGORY_MIGRATION_MAP: Record<string, NodeType> = {
    skills: "SKILL",
    context: "DOMAIN",
    artifacts: "ARTIFACT",
    attributes: "ATTRIBUTE",
};

const EDGE_MIGRATION_MAP: Record<string, EdgeType> = {
    stack: "USED",
    in_domain: "IN_CONTEXT",
    in_role: "PERFORMED_AS",
    result: "RESULTED_IN",
    driver: "DRIVER",
};

/** Get layer for a node type */
export function getNodeLayer(type: NodeType | LegacyCategory): number {
    return LAYER_MAP[type] || 1;
}

/** Migrate legacy category to new NodeType */
export function migrateCategory(category: LegacyCategory | NodeType): NodeType {
    return CATEGORY_MIGRATION_MAP[category] || (category as NodeType);
}

/** Migrate legacy edge type to new EdgeType */
export function migrateEdgeType(edgeType: LegacyEdgeType | EdgeType): EdgeType {
    return EDGE_MIGRATION_MAP[edgeType] || (edgeType as EdgeType);
}

/** Check if a trait has legacy structure */
function isLegacyTrait(trait: Record<string, unknown>): boolean {
    return trait.category !== undefined && trait.type === undefined;
}

/** Migrate a single trait from legacy to new format */
export function migrateTrait(trait: Record<string, unknown>): Trait {
    if (isLegacyTrait(trait)) {
        const relations = trait.relations as Array<{ targetId: string; type: LegacyEdgeType }> || [];
        return {
            id: trait.id as string,
            label: trait.label as string,
            description: (trait.description as string) || "",
            type: migrateCategory(trait.category as LegacyCategory),
            importance: (trait.importance as number) || 3.0,
            relations: relations.map((rel) => ({
                targetId: rel.targetId,
                type: migrateEdgeType(rel.type),
            })),
            evidenceLevel: (trait.evidenceLevel as EvidenceLevel) || "theory",
        };
    }

    const relations = trait.relations as Array<{ targetId: string; type: EdgeType | LegacyEdgeType }> || [];
    return {
        ...(trait as unknown as Trait),
        relations: relations.map((rel) => ({
            targetId: rel.targetId,
            type: migrateEdgeType(rel.type),
        })),
        evidenceLevel: (trait.evidenceLevel as EvidenceLevel) || "theory",
    };
}

/** Migrate an array of traits */
export function migrateTraits(traits: Array<Record<string, unknown>>): Trait[] {
    return traits.map(migrateTrait);
}

// =============================================================================
// History Helpers
// =============================================================================

interface HistoryResult {
    history: Trait[][];
    historyIndex: number;
}

/** Push state to history with size limit */
function pushToHistory(
    history: Trait[][],
    historyIndex: number,
    newState: Trait[]
): HistoryResult {
    // Remove any future states if we're not at the end
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);

    // Limit history size
    if (newHistory.length > MAX_HISTORY_SIZE) {
        newHistory.shift();
        return { history: newHistory, historyIndex: newHistory.length - 1 };
    }

    return { history: newHistory, historyIndex: newHistory.length - 1 };
}

/** Compare two trait arrays for equality */
function traitsAreEqual(a: Trait[], b: Trait[]): boolean {
    if (a.length !== b.length) return false;
    return JSON.stringify(a) === JSON.stringify(b);
}

// =============================================================================
// Store Interface
// =============================================================================

interface TraitsState {
    traits: Trait[];
    savedTraits: Trait[];
    traitsCache: Record<string, Trait[]>;
    currentProfessionId: string | null;
    history: Trait[][];
    historyIndex: number;
    isLoading: boolean;
    isSyncing: boolean;

    // Apply actions from AI response (локально, без сохранения в БД)
    applyActions: (actions: TraitAction[]) => void;
    // Replace all traits (локально, без сохранения в БД)
    replaceAll: (traits: Trait[]) => void;

    // Undo/Redo
    undo: () => void;
    redo: () => void;
    canUndo: () => boolean;
    canRedo: () => boolean;
    hasUnsavedChanges: () => boolean;
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

const INITIAL_STATE = {
    traits: [],
    savedTraits: [],
    traitsCache: {},
    currentProfessionId: null,
    history: [],
    historyIndex: -1,
    isLoading: false,
    isSyncing: false,
    externalHighlightIds: [],
    externalHighlightMode: 'view' as const,
};

// =============================================================================
// Store Implementation
// =============================================================================

export const useTraitsStore = create<TraitsState>()(
    persist(
        (set, get) => ({
            ...INITIAL_STATE,

            applyActions: (actions) => {
                set((state) => {
                    let newTraits = [...state.traits];

                    for (const action of actions) {
                        switch (action.type) {
                            case "create":
                                if (!newTraits.find((t) => t.id === action.data.id)) {
                                    newTraits.push(action.data);
                                }
                                break;

                            case "update":
                                newTraits = newTraits.map((trait) =>
                                    trait.id === action.id
                                        ? { ...trait, ...action.updates }
                                        : trait
                                );
                                break;

                            case "delete":
                                newTraits = newTraits.filter((trait) => trait.id !== action.id);
                                newTraits = newTraits.map((trait) => ({
                                    ...trait,
                                    relations: trait.relations.filter(
                                        (rel) => rel.targetId !== action.id
                                    ),
                                }));
                                break;
                        }
                    }

                    const { history, historyIndex } = pushToHistory(
                        state.history,
                        state.historyIndex,
                        state.traits
                    );

                    return { traits: newTraits, history, historyIndex };
                });
            },

            replaceAll: (traits) => {
                set((state) => {
                    const { history, historyIndex } = pushToHistory(
                        state.history,
                        state.historyIndex,
                        state.traits
                    );

                    return { traits, history, historyIndex };
                });
            },

            undo: () => {
                set((state) => {
                    if (state.historyIndex < 0) return state;

                    let history = state.history;
                    const historyIndex = state.historyIndex;

                    // If we're at the latest position, save current state for redo
                    if (historyIndex === history.length - 1) {
                        history = [...history, state.traits];
                    }

                    const previousState = history[historyIndex];

                    return {
                        traits: previousState,
                        history,
                        historyIndex: historyIndex - 1,
                    };
                });
            },

            redo: () => {
                set((state) => {
                    if (state.historyIndex >= state.history.length - 1) return state;

                    const nextIndex = state.historyIndex + 1;

                    if (state.history[nextIndex + 1]) {
                        return {
                            traits: state.history[nextIndex + 1],
                            historyIndex: nextIndex,
                        };
                    }

                    return state;
                });
            },

            canUndo: () => get().historyIndex >= 0,

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
                    historyIndex: -1,
                }));
            },

            getContextForAI: () => {
                const { traits } = get();
                return traits.map(({ id, label, type }) => ({ id, label, type }));
            },

            loadFromServer: async (professionId?: string) => {
                const { traitsCache } = get();
                const targetProfessionId = professionId || 'default';

                // Используем кэш если доступен
                if (traitsCache[targetProfessionId]) {
                    const cachedTraits = traitsCache[targetProfessionId];
                    set({
                        traits: cachedTraits,
                        savedTraits: cachedTraits,
                        currentProfessionId: targetProfessionId,
                        history: [],
                        historyIndex: -1,
                        isLoading: false,
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
                            const migratedTraits = migrateTraits(data.traits);

                            set((state) => ({
                                traits: migratedTraits,
                                savedTraits: migratedTraits,
                                currentProfessionId: targetProfessionId,
                                traitsCache: {
                                    ...state.traitsCache,
                                    [targetProfessionId]: migratedTraits,
                                },
                                history: [],
                                historyIndex: -1,
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

                    set((state) => ({
                        savedTraits: traits,
                        traitsCache: currentProfessionId
                            ? { ...state.traitsCache, [currentProfessionId]: traits }
                            : state.traitsCache,
                        history: [],
                        historyIndex: -1,
                    }));
                } catch (error) {
                    console.error("Failed to save traits to server:", error);
                } finally {
                    set({ isSyncing: false });
                }
            },

            setExternalHighlightIds: (ids, mode = 'view') =>
                set({ externalHighlightIds: ids, externalHighlightMode: mode }),

            deleteTraits: (ids) => {
                set((state) => {
                    const idsToDelete = new Set(ids);

                    let newTraits = state.traits.filter(
                        (trait) => !idsToDelete.has(trait.id)
                    );

                    newTraits = newTraits.map((trait) => ({
                        ...trait,
                        relations: trait.relations.filter(
                            (rel) => !idsToDelete.has(rel.targetId)
                        ),
                    }));

                    const { history, historyIndex } = pushToHistory(
                        state.history,
                        state.historyIndex,
                        state.traits
                    );

                    return {
                        traits: newTraits,
                        history,
                        historyIndex,
                        externalHighlightIds: [],
                    };
                });
            },

            clearAll: () => set(INITIAL_STATE),
        }),
        {
            name: STORAGE_KEYS.TRAITS,
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                traitsCache: state.traitsCache,
                currentProfessionId: state.currentProfessionId,
            }),
            onRehydrateStorage: () => (state) => {
                if (state?.currentProfessionId && state.traitsCache[state.currentProfessionId]) {
                    const cachedTraits = state.traitsCache[state.currentProfessionId];
                    state.traits = cachedTraits;
                    state.savedTraits = cachedTraits;
                }
            },
        }
    )
);
