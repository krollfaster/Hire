"use client";

import { useState, useMemo, useCallback } from "react";
import { AppShell, ChatPanel } from "@/components/layout";
import { useTraitsStore, Trait, NodeType, LegacyCategory, EvidenceLevel, EdgeType, LegacyEdgeType } from "@/stores/useTraitsStore";
import { useChatStore } from "@/stores/useChatStore";
import { TraitsGraph } from "@/components/graph/TraitsGraph";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Star, Link2, LayoutGrid, GitBranch, ArrowRight, Trash2, Undo2, Redo2, Save, RotateCcw, BookOpen, Wrench, Trophy, Loader2, type LucideIcon } from "lucide-react";
import { useProfessionStore } from "@/stores/useProfessionStore";

type NodeTypeOrLegacy = NodeType | LegacyCategory;
type FilterTab = "all" | NodeTypeOrLegacy;
type ViewMode = "cards" | "graph";

// STAR-Graph filter tabs
const tabs: { id: FilterTab; label: string }[] = [
    { id: "all", label: "Все" },
    // Layer 1: Assets
    { id: "SKILL", label: "Навыки" },
    { id: "ROLE", label: "Роли" },
    { id: "DOMAIN", label: "Домены" },
    // Layer 2: Actions
    { id: "CHALLENGE", label: "Вызовы" },
    { id: "ACTION", label: "Действия" },
    // Layer 3: Impact
    { id: "METRIC", label: "Метрики" },
    { id: "ARTIFACT", label: "Артефакты" },
    // Layer 4: Attributes
    { id: "ATTRIBUTE", label: "Атрибуты" },
];

// STAR-Graph node type configuration
const nodeTypeConfig: Record<NodeTypeOrLegacy, {
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
    hoverBg: string;
    hoverBorder: string;
    badgeHoverColor: string;
    titleHoverColor: string;
}> = {
    // Layer 1: Assets (синие оттенки)
    ROLE: {
        label: "Роль",
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/30",
        hoverBg: "hover:bg-blue-500/5",
        hoverBorder: "hover:border-blue-500/30",
        badgeHoverColor: "group-hover:text-blue-500 group-hover:border-blue-500/50",
        titleHoverColor: "group-hover:text-blue-500",
    },
    DOMAIN: {
        label: "Домен",
        color: "text-indigo-500",
        bgColor: "bg-indigo-500/10",
        borderColor: "border-indigo-500/30",
        hoverBg: "hover:bg-indigo-500/5",
        hoverBorder: "hover:border-indigo-500/30",
        badgeHoverColor: "group-hover:text-indigo-500 group-hover:border-indigo-500/50",
        titleHoverColor: "group-hover:text-indigo-500",
    },
    SKILL: {
        label: "Навык",
        color: "text-sky-500",
        bgColor: "bg-sky-500/10",
        borderColor: "border-sky-500/30",
        hoverBg: "hover:bg-sky-500/5",
        hoverBorder: "hover:border-sky-500/30",
        badgeHoverColor: "group-hover:text-sky-500 group-hover:border-sky-500/50",
        titleHoverColor: "group-hover:text-sky-500",
    },
    // Layer 2: Actions (оранжевые оттенки)
    CHALLENGE: {
        label: "Вызов",
        color: "text-orange-500",
        bgColor: "bg-orange-500/10",
        borderColor: "border-orange-500/30",
        hoverBg: "hover:bg-orange-500/5",
        hoverBorder: "hover:border-orange-500/30",
        badgeHoverColor: "group-hover:text-orange-500 group-hover:border-orange-500/50",
        titleHoverColor: "group-hover:text-orange-500",
    },
    ACTION: {
        label: "Действие",
        color: "text-amber-500",
        bgColor: "bg-amber-500/10",
        borderColor: "border-amber-500/30",
        hoverBg: "hover:bg-amber-500/5",
        hoverBorder: "hover:border-amber-500/30",
        badgeHoverColor: "group-hover:text-amber-500 group-hover:border-amber-500/50",
        titleHoverColor: "group-hover:text-amber-500",
    },
    // Layer 3: Impact (зелёные оттенки)
    METRIC: {
        label: "Метрика",
        color: "text-green-500",
        bgColor: "bg-green-500/10",
        borderColor: "border-green-500/30",
        hoverBg: "hover:bg-green-500/5",
        hoverBorder: "hover:border-green-500/30",
        badgeHoverColor: "group-hover:text-green-500 group-hover:border-green-500/50",
        titleHoverColor: "group-hover:text-green-500",
    },
    ARTIFACT: {
        label: "Артефакт",
        color: "text-emerald-500",
        bgColor: "bg-emerald-500/10",
        borderColor: "border-emerald-500/30",
        hoverBg: "hover:bg-emerald-500/5",
        hoverBorder: "hover:border-emerald-500/30",
        badgeHoverColor: "group-hover:text-emerald-500 group-hover:border-emerald-500/50",
        titleHoverColor: "group-hover:text-emerald-500",
    },
    // Layer 4: Attributes (фиолетовые оттенки)
    ATTRIBUTE: {
        label: "Атрибут",
        color: "text-purple-500",
        bgColor: "bg-purple-500/10",
        borderColor: "border-purple-500/30",
        hoverBg: "hover:bg-purple-500/5",
        hoverBorder: "hover:border-purple-500/30",
        badgeHoverColor: "group-hover:text-purple-500 group-hover:border-purple-500/50",
        titleHoverColor: "group-hover:text-purple-500",
    },
    // Legacy categories for backward compatibility
    skills: {
        label: "Навык",
        color: "text-sky-500",
        bgColor: "bg-sky-500/10",
        borderColor: "border-sky-500/30",
        hoverBg: "hover:bg-sky-500/5",
        hoverBorder: "hover:border-sky-500/30",
        badgeHoverColor: "group-hover:text-sky-500 group-hover:border-sky-500/50",
        titleHoverColor: "group-hover:text-sky-500",
    },
    context: {
        label: "Контекст",
        color: "text-indigo-500",
        bgColor: "bg-indigo-500/10",
        borderColor: "border-indigo-500/30",
        hoverBg: "hover:bg-indigo-500/5",
        hoverBorder: "hover:border-indigo-500/30",
        badgeHoverColor: "group-hover:text-indigo-500 group-hover:border-indigo-500/50",
        titleHoverColor: "group-hover:text-indigo-500",
    },
    artifacts: {
        label: "Артефакт",
        color: "text-emerald-500",
        bgColor: "bg-emerald-500/10",
        borderColor: "border-emerald-500/30",
        hoverBg: "hover:bg-emerald-500/5",
        hoverBorder: "hover:border-emerald-500/30",
        badgeHoverColor: "group-hover:text-emerald-500 group-hover:border-emerald-500/50",
        titleHoverColor: "group-hover:text-emerald-500",
    },
    attributes: {
        label: "Атрибут",
        color: "text-purple-500",
        bgColor: "bg-purple-500/10",
        borderColor: "border-purple-500/30",
        hoverBg: "hover:bg-purple-500/5",
        hoverBorder: "hover:border-purple-500/30",
        badgeHoverColor: "group-hover:text-purple-500 group-hover:border-purple-500/50",
        titleHoverColor: "group-hover:text-purple-500",
    },
};

// Evidence level configuration
const evidenceLevelConfig: Record<EvidenceLevel, {
    icon: LucideIcon;
    label: string;
    color: string;
    bgColor: string;
}> = {
    theory: {
        icon: BookOpen,
        label: "Теория",
        color: "text-slate-400",
        bgColor: "bg-slate-400/10",
    },
    practice: {
        icon: Wrench,
        label: "Практика",
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
    },
    result: {
        icon: Trophy,
        label: "Результат",
        color: "text-green-500",
        bgColor: "bg-green-500/10",
    },
};

function StarRating({ value, max = 5 }: { value: number; max?: number }) {
    const safeValue = value ?? 0;
    const fullStars = Math.floor(safeValue);
    const partialFill = safeValue - fullStars;
    const emptyStars = max - Math.ceil(safeValue);

    return (
        <div className="flex items-center gap-0.5">
            {Array.from({ length: fullStars }).map((_, i) => (
                <Star key={`full-${i}`} size={12} className="fill-amber-400 text-amber-400" />
            ))}

            {partialFill > 0 && (
                <div className="relative">
                    <Star size={12} className="text-muted-foreground/30" />
                    <div
                        className="absolute inset-0 overflow-hidden"
                        style={{ width: `${partialFill * 100}%` }}
                    >
                        <Star size={12} className="fill-amber-400 text-amber-400" />
                    </div>
                </div>
            )}

            {Array.from({ length: emptyStars }).map((_, i) => (
                <Star key={`empty-${i}`} size={12} className="text-muted-foreground/30" />
            ))}

            <span className="ml-1 text-muted-foreground text-xs">{safeValue.toFixed(1)}</span>
        </div>
    );
}

interface TraitCardProps {
    trait: Trait;
    onClick: () => void;
    onHover: (traitId: string | null) => void;
    isHighlighted: boolean;
}

function TraitCard({ trait, onClick, onHover, isHighlighted }: TraitCardProps) {
    const config = nodeTypeConfig[trait.type] || nodeTypeConfig.SKILL;
    const hasRelations = trait.relations && trait.relations.length > 0;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onMouseEnter={() => onHover(trait.id)}
            onMouseLeave={() => onHover(null)}
        >
            <Card
                onClick={onClick}
                className={cn(
                    "group p-4 transition-all duration-300 cursor-pointer",
                    "border-border bg-card",
                    "h-[160px] flex flex-col",
                    config.hoverBg,
                    config.hoverBorder,
                    // Hover effects
                    "hover:shadow-lg hover:shadow-black/5",
                    "hover:-translate-y-1",
                    "active:translate-y-0 active:shadow-md",
                    // Highlighted state (related cards when another card is hovered)
                    isHighlighted && [
                        "shadow-lg -translate-y-1",
                        config.bgColor,
                        config.borderColor,
                    ]
                )}
            >
                <div className="flex justify-between items-start gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                        <h3 className={cn(
                            "font-semibold text-foreground text-sm truncate leading-tight transition-colors",
                            config.titleHoverColor,
                            isHighlighted && config.color
                        )}>
                            {trait.label}
                        </h3>
                    </div>
                    <Badge
                        variant="outline"
                        className={cn(
                            "px-1.5 py-0 h-5 text-[10px] transition-all duration-300 shrink-0",
                            "border-border text-muted-foreground",
                            config.badgeHoverColor,
                            isHighlighted && [config.color, "border-current"]
                        )}
                    >
                        {config.label}
                    </Badge>
                </div>

                <div className="flex-1 py-1 min-h-[32px]">
                    <p className={cn(
                        "text-muted-foreground group-hover:text-foreground/70 text-xs line-clamp-2 transition-colors",
                        isHighlighted && "text-foreground/70"
                    )}>
                        {trait.description || "Нет описания"}
                    </p>
                </div>

                <div className="flex justify-between items-center mt-auto pt-2">
                    <div className="flex items-center gap-2">
                        <StarRating value={trait.importance} />
                        {/* Evidence Level Icon */}
                        {trait.evidenceLevel && (() => {
                            const evidenceConf = evidenceLevelConfig[trait.evidenceLevel];
                            const EvidenceIcon = evidenceConf.icon;
                            return (
                                <div
                                    className={cn(
                                        "flex justify-center items-center rounded-full w-5 h-5 transition-colors",
                                        evidenceConf.bgColor
                                    )}
                                    title={evidenceConf.label}
                                >
                                    <EvidenceIcon size={12} className={evidenceConf.color} />
                                </div>
                            );
                        })()}
                    </div>

                    <div className="flex items-center gap-2">
                        {hasRelations && (
                            <div className={cn(
                                "flex items-center gap-1 text-muted-foreground transition-colors",
                                isHighlighted && config.color
                            )}>
                                <Link2 size={12} />
                                <span className="text-xs">{trait.relations.length}</span>
                            </div>
                        )}
                        <ArrowRight
                            size={14}
                            className={cn(
                                "text-muted-foreground/0 group-hover:text-muted-foreground transition-all -translate-x-2 group-hover:translate-x-0 duration-300",
                                isHighlighted && "text-muted-foreground translate-x-0"
                            )}
                        />
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}

function EmptyState({ message, showIcon = true }: { message?: string; showIcon?: boolean }) {
    return (
        <div className="flex flex-col flex-1 justify-center items-center px-8 py-16 w-full h-full text-center">
            {showIcon && (
                <div className="flex justify-center items-center bg-muted mb-4 rounded-2xl w-20 h-20">
                    <svg
                        className="w-10 h-10 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                    </svg>
                </div>
            )}
            {showIcon ? (
                <>
                    <h3 className="mb-2 font-semibold text-foreground text-lg">
                        Ваш профиль пуст
                    </h3>
                    <p className="max-w-md text-muted-foreground text-sm">
                        Расскажите ИИ о вашем опыте работы в чате справа. Навыки, достижения и
                        компетенции появятся здесь автоматически.
                    </p>
                </>
            ) : (
                <p className="text-muted-foreground text-sm">{message}</p>
            )}
        </div>
    );
}

function TraitsGrid({ traits, onTraitClick }: { traits: Trait[]; onTraitClick: (trait: Trait) => void }) {
    const [hoveredTraitId, setHoveredTraitId] = useState<string | null>(null);

    // useMemo: пересчитываем связи только при изменении hoveredTraitId или traits
    const relatedIds = useMemo(() => {
        if (!hoveredTraitId) return new Set<string>();

        const hoveredTrait = traits.find(t => t.id === hoveredTraitId);
        if (!hoveredTrait) return new Set<string>();

        const ids = new Set<string>();

        // Add directly related traits (outgoing relations)
        hoveredTrait.relations?.forEach(rel => {
            ids.add(rel.targetId);
        });

        // Add traits that have relations pointing to this trait (incoming relations)
        traits.forEach(t => {
            t.relations?.forEach(rel => {
                if (rel.targetId === hoveredTraitId) {
                    ids.add(t.id);
                }
            });
        });

        return ids;
    }, [hoveredTraitId, traits]);

    return (
        <div className="gap-3 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence mode="popLayout">
                {traits.map((trait) => {
                    const isHovered = trait.id === hoveredTraitId;
                    const isRelated = relatedIds.has(trait.id);
                    // Highlight related cards (but not the hovered one - it has its own hover state)
                    const isHighlighted = isRelated && !isHovered;

                    return (
                        <TraitCard
                            key={trait.id}
                            trait={trait}
                            onClick={() => onTraitClick(trait)}
                            onHover={setHoveredTraitId}
                            isHighlighted={isHighlighted}
                        />
                    );
                })}
            </AnimatePresence>
        </div>
    );
}

// STAR-Graph relation type labels (new + legacy)
const relationTypeLabels: Record<string, string> = {
    // New STAR-Graph edge types
    SOLVED_WITH: "Решено с помощью",
    USED: "Использовано",
    IN_CONTEXT: "В контексте",
    RESULTED_IN: "Привело к",
    DRIVER: "Драйвер",
    PERFORMED_AS: "В роли",
    // Legacy edge types
    stack: "Стек",
    in_domain: "В сфере",
    in_role: "В роли",
    result: "Результат",
    driver: "Драйвер",
};

function TraitDetailSheet({
    trait,
    open,
    onOpenChange,
    allTraits
}: {
    trait: Trait | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    allTraits: Trait[];
}) {
    if (!trait) return null;

    const config = nodeTypeConfig[trait.type] || nodeTypeConfig.SKILL;
    const importance = trait.importance ?? 0;

    // Get related traits details (мемоизация не нужна — trait меняется при каждом открытии sheet)
    const relatedTraits = (trait.relations ?? [])
        .map(relation => {
            const relatedTrait = allTraits.find(t => t.id === relation.targetId);
            return relatedTrait ? { ...relatedTrait, relationType: relation.type } : null;
        })
        .filter((item): item is Trait & { relationType: EdgeType | LegacyEdgeType } => item !== null);

    const evidenceConfig = trait.evidenceLevel ? evidenceLevelConfig[trait.evidenceLevel] : null;
    const EvidenceIcon = evidenceConfig?.icon;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-md">
                <SheetHeader className="pb-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Badge
                            className={cn(
                                "text-xs",
                                config.bgColor,
                                config.borderColor,
                                config.color
                            )}
                        >
                            {config.label}
                        </Badge>
                        {evidenceConfig && EvidenceIcon && (
                            <Badge
                                variant="outline"
                                className={cn(
                                    "gap-1 text-xs",
                                    evidenceConfig.bgColor,
                                    evidenceConfig.color
                                )}
                            >
                                <EvidenceIcon size={12} />
                                {evidenceConfig.label}
                            </Badge>
                        )}
                    </div>
                    <SheetTitle className="text-xl">{trait.label}</SheetTitle>
                    {trait.description && (
                        <SheetDescription className="text-sm">
                            {trait.description}
                        </SheetDescription>
                    )}
                </SheetHeader>

                <ScrollArea className="flex-1 -mx-4 px-4">
                    <div className="space-y-6 pb-6">
                        {/* Importance Section */}
                        <div>
                            <h4 className="mb-3 font-medium text-foreground text-sm">Важность</h4>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                                    <div
                                        className={cn(
                                            "rounded-full h-full transition-all duration-500",
                                            config.color.replace("text-", "bg-")
                                        )}
                                        style={{ width: `${(importance / 5) * 100}%` }}
                                    />
                                </div>
                                <span className="min-w-[2.5rem] font-semibold text-foreground text-sm text-right">
                                    {importance.toFixed(1)} / 5
                                </span>
                            </div>
                            <div className="flex justify-center mt-3">
                                <StarRating value={importance} />
                            </div>
                        </div>

                        <Separator />

                        {/* Relations Section */}
                        <div>
                            <h4 className="mb-3 font-medium text-foreground text-sm">
                                Связи {relatedTraits.length > 0 && `(${relatedTraits.length})`}
                            </h4>
                            {relatedTraits.length > 0 ? (
                                <div className="space-y-2">
                                    {relatedTraits.map((related) => {
                                        const relatedConfig = nodeTypeConfig[related.type] || nodeTypeConfig.SKILL;
                                        return (
                                            <div
                                                key={related.id}
                                                className={cn(
                                                    "p-3 border rounded-lg transition-colors",
                                                    "bg-muted/30 border-border",
                                                    "hover:bg-muted/50"
                                                )}
                                            >
                                                <div className="flex justify-between items-center gap-2 mb-1">
                                                    <span className="font-medium text-foreground text-sm">
                                                        {related.label}
                                                    </span>
                                                    <Badge
                                                        variant="outline"
                                                        className={cn(
                                                            "px-1.5 h-5 text-[10px]",
                                                            relatedConfig.color
                                                        )}
                                                    >
                                                        {relatedConfig.label}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                                                    <Link2 size={10} />
                                                    <span>{relationTypeLabels[related.relationType] || related.relationType}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-sm">
                                    Нет связей с другими элементами
                                </p>
                            )}
                        </div>
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}


function TraitsPanel() {
    const traits = useTraitsStore((state) => state.traits);
    const replaceAllTraits = useTraitsStore((state) => state.replaceAll);
    const undo = useTraitsStore((state) => state.undo);
    const redo = useTraitsStore((state) => state.redo);
    const saveToServer = useTraitsStore((state) => state.saveToServer);
    const resetToSaved = useTraitsStore((state) => state.resetToSaved);
    const canUndo = useTraitsStore((state) => state.canUndo);
    const canRedo = useTraitsStore((state) => state.canRedo);
    const hasUnsavedChanges = useTraitsStore((state) => state.hasUnsavedChanges);
    const isSyncing = useTraitsStore((state) => state.isSyncing);

    const { reset: resetChat } = useChatStore();
    const [viewMode, setViewMode] = useState<ViewMode>("graph");
    const [activeTab, setActiveTab] = useState<FilterTab>("all");
    const [selectedTrait, setSelectedTrait] = useState<Trait | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);

    // useMemo: пересчитываем только при изменении traits или activeTab
    const filteredTraits = useMemo(() => {
        const filtered = activeTab === "all" ? traits : traits.filter(trait => trait.type === activeTab);
        // Sort by importance (descending - highest importance first)
        return [...filtered].sort((a, b) => (b.importance ?? 0) - (a.importance ?? 0));
    }, [traits, activeTab]);

    // useCallback: передаётся как проп в TraitsGrid
    const handleTraitClick = useCallback((trait: Trait) => {
        setSelectedTrait(trait);
        setSheetOpen(true);
    }, []);

    const handleClearAll = useCallback(() => {
        resetChat();
        replaceAllTraits([]);
    }, [resetChat, replaceAllTraits]);

    const handleSave = useCallback(async () => {
        await saveToServer();
    }, [saveToServer]);

    const handleResetToSaved = useCallback(() => {
        resetToSaved();
    }, [resetToSaved]);

    const isProfessionSwitching = useProfessionStore((state) => state.isSwitching);
    const isTraitsLoading = useTraitsStore((state) => state.isLoading);
    const isLoading = isProfessionSwitching || isTraitsLoading;

    if (isLoading) {
        return (
            <div className="flex flex-col flex-1 justify-center items-center w-full h-full">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-muted-foreground text-sm">Загрузка навыков...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {traits.length === 0 ? (
                <EmptyState />
            ) : (
                <>
                    {/* Header with Tabs and View Toggle */}
                    <div className="flex justify-between items-center gap-4 mb-6 h-[40px]">
                        <div className="flex items-center gap-2">
                            {/* Undo/Redo кнопки */}
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={undo}
                                disabled={!canUndo()}
                                title="Отменить"
                            >
                                <Undo2 size={14} />
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={redo}
                                disabled={!canRedo()}
                                title="Повторить"
                            >
                                <Redo2 size={14} />
                            </Button>

                            {/* Вернуть сохранённое */}
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleResetToSaved}
                                disabled={!hasUnsavedChanges()}
                                title="Вернуть сохранённое состояние"
                            >
                                <RotateCcw size={14} />
                            </Button>

                            {/* Очистить */}
                            {traits.length > 0 && (
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    className="shadow-sm"
                                    onClick={handleClearAll}
                                    title="Очистить"
                                >
                                    <Trash2 size={14} />
                                </Button>
                            )}

                            {/* Сохранение */}
                            {(hasUnsavedChanges() || isSyncing) && (
                                <Button
                                    size="sm"
                                    variant="default"
                                    onClick={handleSave}
                                    disabled={isSyncing}
                                    className="shadow-sm"
                                    title="Сохранить изменения"
                                >
                                    <Save size={14} className="mr-1.5" />
                                    {isSyncing ? "Сохранение..." : "Сохранить"}
                                </Button>
                            )}
                        </div>

                        {/* View Toggle */}
                        <ToggleGroup
                            type="single"
                            value={viewMode}
                            onValueChange={(value) => value && setViewMode(value as ViewMode)}
                            size="sm"
                        >
                            <ToggleGroupItem value="graph" aria-label="Граф связей">
                                <GitBranch size={16} />
                            </ToggleGroupItem>
                            <ToggleGroupItem value="cards" aria-label="Карточки">
                                <LayoutGrid size={16} />
                            </ToggleGroupItem>
                        </ToggleGroup>
                    </div>

                    {/* Content */}
                    {viewMode === "cards" ? (
                        <div className="flex-1 -mr-6 pr-6 overflow-y-auto">
                            {filteredTraits.length === 0 ? (
                                <EmptyState
                                    message={`Нет карточек в категории "${tabs.find(t => t.id === activeTab)?.label}"`}
                                    showIcon={false}
                                />
                            ) : (
                                <TraitsGrid
                                    traits={filteredTraits}
                                    onTraitClick={handleTraitClick}
                                />
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col flex-1 -mx-6 min-h-0">
                            <div className="flex-1 min-h-0 overflow-hidden">
                                <TraitsGraph traits={filteredTraits} key={activeTab} />
                            </div>
                            <div className="flex justify-center bg-background px-6 shrink-0">
                                <ToggleGroup
                                    type="single"
                                    value={activeTab}
                                    onValueChange={(value) => value && setActiveTab(value as FilterTab)}
                                >
                                    {tabs.map((tab) => (
                                        <ToggleGroupItem key={tab.id} value={tab.id}>
                                            {tab.label}
                                        </ToggleGroupItem>
                                    ))}
                                </ToggleGroup>
                            </div>
                        </div>
                    )}

                    {/* Detail Sheet */}
                    <TraitDetailSheet
                        trait={selectedTrait}
                        open={sheetOpen}
                        onOpenChange={setSheetOpen}
                        allTraits={traits}
                    />
                </>
            )}
        </div>
    );
}

export default function BuilderPage() {
    return (
        <AppShell>
            <div className="flex w-full h-full">
                <div className="flex flex-col flex-1 p-3 px-4 min-h-0">
                    <TraitsPanel />
                </div>
                <ChatPanel />
            </div>
        </AppShell>
    );
}
