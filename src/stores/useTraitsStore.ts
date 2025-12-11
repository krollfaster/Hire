import { create } from 'zustand';

// Types
export type TraitCategory = "hard_skills" | "impact" | "domain" | "superpower";

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
    
    // Apply actions from AI response
    applyActions: (actions: TraitAction[]) => void;
    
    // Replace all traits (for "Optimize" feature)
    replaceAll: (traits: Trait[]) => void;
    
    // Undo last change
    undo: () => void;
    
    // Get simplified context for AI (to save tokens)
    getContextForAI: () => { id: string; label: string; category: TraitCategory }[];
}

export const useTraitsStore = create<TraitsState>((set, get) => ({
    traits: [],
    previousState: null,

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
    },

    replaceAll: (traits) => {
        set((state) => ({
            traits,
            previousState: [...state.traits]
        }));
    },

    undo: () => {
        set((state) => {
            if (state.previousState === null) return state;
            return {
                traits: state.previousState,
                previousState: null
            };
        });
    },

    getContextForAI: () => {
        const { traits } = get();
        return traits.map(({ id, label, category }) => ({ id, label, category }));
    }
}));
