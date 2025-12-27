/**
 * Общие константы приложения
 */

// Валидация
export const MIN_PASSWORD_LENGTH = 6;

// Фильтры поиска
export const DEFAULT_MATCH_SCORE = 70;
export const MIN_MATCH_SCORE = 40;
export const MAX_MATCH_SCORE = 100;

// Грейды
export const GRADES = [
    { value: "Junior", label: "Junior" },
    { value: "Middle", label: "Middle" },
    { value: "Senior", label: "Senior" },
    { value: "Lead", label: "Lead" },
    { value: "Manager", label: "Manager" },
] as const;

export type Grade = typeof GRADES[number]["value"];

// Статусы профессии
export const PROFESSION_STATUSES = [
    { value: "active_search", label: "Активный поиск" },
    { value: "considering", label: "Рассматриваю предложения" },
    { value: "not_searching", label: "Не ищу работу" },
] as const;

export type ProfessionStatusValue = typeof PROFESSION_STATUSES[number]["value"];

// Типы занятости
export const EMPLOYMENT_TYPES = [
    { value: "full-time", label: "Полная занятость" },
    { value: "part-time", label: "Частичная занятость" },
    { value: "project", label: "Проектная работа" },
] as const;

// Форматы работы
export const WORK_FORMATS = [
    { value: "office", label: "Офис" },
    { value: "remote", label: "Удалёнка" },
    { value: "hybrid", label: "Гибрид" },
] as const;

// Время до работы
export const TRAVEL_TIMES = [
    { value: "15", label: "До 15 минут" },
    { value: "30", label: "До 30 минут" },
    { value: "45", label: "До 45 минут" },
    { value: "60", label: "До 1 часа" },
    { value: "90", label: "До 1.5 часов" },
    { value: "any", label: "Не важно" },
] as const;

// Опыт работы (для фильтров поиска)
export const EXPERIENCE_OPTIONS = [
    "Junior (1-3 года)",
    "Middle (3-5 лет)",
    "Senior (5-8 лет)",
    "Lead (8+ лет)",
] as const;

// Локации (для фильтров поиска)
export const LOCATION_OPTIONS = [
    "Москва",
    "Санкт-Петербург",
    "Екатеринбург",
    "Новосибирск",
    "Казань",
    "Удаленно",
] as const;
