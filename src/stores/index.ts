/**
 * Centralized exports for all Zustand stores
 * 
 * Usage:
 * import { useAuthStore, useRoleStore } from '@/stores';
 */

// Constants and helpers
export {
    STORAGE_KEYS,
    MAX_HISTORY_SIZE,
    createLocalStorageHelper,
    generateId
} from './constants';
export type { UserRole } from './constants';

// Auth & User
export { useAuthStore } from './useAuthStore';
export { useUserStore } from './useUserStore';
export { useProfileStore } from './useProfileStore';
export { useRoleStore } from './useRoleStore';

// Chat & Messages
export { useChatStore } from './useChatStore';
export type { ChatMessage as AIChatMessage } from './useChatStore';

export { useMessagesStore } from './useMessagesStore';
export type { Chat, ChatMessage } from './useMessagesStore';

// Professions & Search
export { useProfessionStore } from './useProfessionStore';
export type {
    Profession,
    CreateProfessionData,
    ProfessionStatus
} from './useProfessionStore';

export { useResearcherSearchStore } from './useResearcherSearchStore';
export type {
    ResearcherSearch,
    CreateSearchData
} from './useResearcherSearchStore';

export { useSearchStore } from './useSearchStore';

// Traits (STAR-Graph)
export { useTraitsStore } from './useTraitsStore';
export type {
    NodeType,
    EdgeType,
    LegacyCategory,
    LegacyEdgeType,
    EvidenceLevel,
    TraitRelation,
    Trait,
    TraitAction,
} from './useTraitsStore';
export {
    getNodeLayer,
    migrateCategory,
    migrateEdgeType,
    migrateTrait,
    migrateTraits,
} from './useTraitsStore';
