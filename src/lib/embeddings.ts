/**
 * Утилиты для работы с профилями для поиска
 * Используем текстовое представление для ИИ-ранжирования (без внешних embeddings API)
 * Поддерживает как legacy категории, так и новые STAR-Graph типы
 */

// STAR-Graph node types
export type NodeType = 
    | "ROLE" | "DOMAIN" | "SKILL"      // Layer 1: Assets
    | "CHALLENGE" | "ACTION"            // Layer 2: Actions
    | "METRIC" | "ARTIFACT"             // Layer 3: Impact
    | "ATTRIBUTE";                      // Layer 4: Attributes

// Legacy categories for backward compatibility
export type LegacyCategory = "skills" | "context" | "artifacts" | "attributes";

export interface Trait {
    id: string;
    label: string;
    description: string;
    type: NodeType | LegacyCategory;
    importance: number;
}

// Helper to get the semantic group for a node type (for text generation)
function getSemanticGroup(type: NodeType | LegacyCategory): string {
    const groupMap: Record<string, string> = {
        // New STAR-Graph types
        SKILL: "skills",
        ROLE: "roles",
        DOMAIN: "domains",
        CHALLENGE: "challenges",
        ACTION: "actions",
        METRIC: "metrics",
        ARTIFACT: "artifacts",
        ATTRIBUTE: "attributes",
        // Legacy categories
        skills: "skills",
        context: "domains",
        artifacts: "artifacts",
        attributes: "attributes",
    };
    return groupMap[type] || "other";
}

/**
 * Конвертирует массив traits в текст для поиска
 * Поддерживает как legacy категории, так и STAR-Graph типы
 */
export function traitsToText(traits: Trait[], professionName?: string, grade?: string): string {
    const parts: string[] = [];

    // Добавляем профессию если есть
    if (professionName) {
        parts.push(`Профессия: ${professionName}${grade ? ` (${grade})` : ""}`);
    }

    // Группируем traits по семантическим группам
    const groups: Record<string, Trait[]> = {
        skills: [],
        roles: [],
        domains: [],
        challenges: [],
        actions: [],
        metrics: [],
        artifacts: [],
        attributes: [],
        other: [],
    };

    for (const trait of traits) {
        const group = getSemanticGroup(trait.type);
        if (groups[group]) {
            groups[group].push(trait);
        } else {
            groups.other.push(trait);
        }
    }

    // Добавляем навыки
    if (groups.skills.length > 0) {
        const texts = groups.skills
            .sort((a, b) => b.importance - a.importance)
            .map(t => `${t.label}: ${t.description}`);
        parts.push(`Навыки: ${texts.join("; ")}`);
    }

    // Добавляем роли
    if (groups.roles.length > 0) {
        const texts = groups.roles
            .sort((a, b) => b.importance - a.importance)
            .map(t => `${t.label}: ${t.description}`);
        parts.push(`Роли: ${texts.join("; ")}`);
    }

    // Добавляем домены/контексты
    if (groups.domains.length > 0) {
        const texts = groups.domains
            .sort((a, b) => b.importance - a.importance)
            .map(t => `${t.label}: ${t.description}`);
        parts.push(`Сферы экспертизы: ${texts.join("; ")}`);
    }

    // Добавляем вызовы (challenges)
    if (groups.challenges.length > 0) {
        const texts = groups.challenges
            .sort((a, b) => b.importance - a.importance)
            .map(t => `${t.label}: ${t.description}`);
        parts.push(`Решённые проблемы: ${texts.join("; ")}`);
    }

    // Добавляем действия
    if (groups.actions.length > 0) {
        const texts = groups.actions
            .sort((a, b) => b.importance - a.importance)
            .map(t => `${t.label}: ${t.description}`);
        parts.push(`Ключевые действия: ${texts.join("; ")}`);
    }

    // Добавляем метрики
    if (groups.metrics.length > 0) {
        const texts = groups.metrics
            .sort((a, b) => b.importance - a.importance)
            .map(t => `${t.label}: ${t.description}`);
        parts.push(`Результаты: ${texts.join("; ")}`);
    }

    // Добавляем артефакты (проекты, продукты)
    if (groups.artifacts.length > 0) {
        const texts = groups.artifacts
            .sort((a, b) => b.importance - a.importance)
            .map(t => `${t.label}: ${t.description}`);
        parts.push(`Проекты и артефакты: ${texts.join("; ")}`);
    }

    // Добавляем атрибуты
    if (groups.attributes.length > 0) {
        const texts = groups.attributes
            .sort((a, b) => b.importance - a.importance)
            .map(t => `${t.label}: ${t.description}`);
        parts.push(`Характеристики: ${texts.join("; ")}`);
    }

    return parts.join("\n\n");
}

/**
 * Простой текстовый поиск по ключевым словам
 */
export function simpleTextMatch(query: string, text: string): number {
    const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const textLower = text.toLowerCase();
    
    if (queryWords.length === 0) return 0;
    
    let matchCount = 0;
    for (const word of queryWords) {
        if (textLower.includes(word)) {
            matchCount++;
        }
    }
    
    return matchCount / queryWords.length;
}
