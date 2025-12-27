/**
 * Константы для хранилищ Zustand
 * Централизованное место для всех ключей localStorage и магических значений
 */

// Ключи для localStorage
export const STORAGE_KEYS = {
    AUTH: 'auth-storage',
    MESSAGES: 'messages-storage',
    PROFESSIONS: 'professions-storage',
    PROFILE: 'profile-storage',
    RESEARCHER_SEARCHES: 'researcher-searches-storage',
    TRAITS: 'traits-storage',
    LAST_ACTIVE_PROFESSION: 'lastActiveProfessionId',
    LAST_ACTIVE_SEARCH: 'lastActiveResearcherSearchId',
} as const;

// Константы для истории undo/redo
export const MAX_HISTORY_SIZE = 50;

// Режимы пользователя
export type UserRole = 'candidate' | 'recruiter';

// Хелперы для работы с localStorage (переиспользуемые функции)
export const createLocalStorageHelper = <T extends string>(key: string) => ({
    get: (): T | null => {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(key) as T | null;
    },
    set: (value: T | null): void => {
        if (typeof window === 'undefined') return;
        if (value) {
            localStorage.setItem(key, value);
        } else {
            localStorage.removeItem(key);
        }
    },
});

// Хелпер для генерации уникальных ID
export const generateId = (): string => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};
