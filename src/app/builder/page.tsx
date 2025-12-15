"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell, ChatPanel } from "@/components/layout";
import { useTraitsStore, Trait, TraitCategory } from "@/stores/useTraitsStore";
import { useResumeStore } from "@/stores/useResumeStore";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Star, Link2, LayoutGrid, GitBranch, ArrowRight, Loader2, Check, X, AlertCircle } from "lucide-react";

type FilterTab = "all" | TraitCategory;
type ViewMode = "cards" | "graph";

const tabs: { id: FilterTab; label: string }[] = [
    { id: "all", label: "Все" },
    { id: "hard_skills", label: "Технологии" },
    { id: "domain", label: "Сферы" },
    { id: "process", label: "Методологии" },
    { id: "impact", label: "Достижения" },
    { id: "background", label: "Бэкграунд" },
    { id: "culture", label: "Культура" },
    { id: "superpower", label: "Суперсила" },
];

const categoryConfig: Record<TraitCategory, { 
    label: string; 
    color: string; 
    bgColor: string;
    borderColor: string;
    hoverBg: string;
    hoverBorder: string;
    badgeHoverColor: string;
    titleHoverColor: string;
}> = {
    hard_skills: { 
        label: "Технология", 
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/30",
        hoverBg: "hover:bg-blue-500/5",
        hoverBorder: "hover:border-blue-500/30",
        badgeHoverColor: "group-hover:text-blue-500 group-hover:border-blue-500/50",
        titleHoverColor: "group-hover:text-blue-500",
    },
    impact: { 
        label: "Достижение", 
        color: "text-green-500",
        bgColor: "bg-green-500/10",
        borderColor: "border-green-500/30",
        hoverBg: "hover:bg-green-500/5",
        hoverBorder: "hover:border-green-500/30",
        badgeHoverColor: "group-hover:text-green-500 group-hover:border-green-500/50",
        titleHoverColor: "group-hover:text-green-500",
    },
    domain: { 
        label: "Сфера", 
        color: "text-purple-500",
        bgColor: "bg-purple-500/10",
        borderColor: "border-purple-500/30",
        hoverBg: "hover:bg-purple-500/5",
        hoverBorder: "hover:border-purple-500/30",
        badgeHoverColor: "group-hover:text-purple-500 group-hover:border-purple-500/50",
        titleHoverColor: "group-hover:text-purple-500",
    },
    superpower: { 
        label: "Суперсила", 
        color: "text-amber-500",
        bgColor: "bg-amber-500/10",
        borderColor: "border-amber-500/30",
        hoverBg: "hover:bg-amber-500/5",
        hoverBorder: "hover:border-amber-500/30",
        badgeHoverColor: "group-hover:text-amber-500 group-hover:border-amber-500/50",
        titleHoverColor: "group-hover:text-amber-500",
    },
    process: { 
        label: "Методология", 
        color: "text-cyan-500",
        bgColor: "bg-cyan-500/10",
        borderColor: "border-cyan-500/30",
        hoverBg: "hover:bg-cyan-500/5",
        hoverBorder: "hover:border-cyan-500/30",
        badgeHoverColor: "group-hover:text-cyan-500 group-hover:border-cyan-500/50",
        titleHoverColor: "group-hover:text-cyan-500",
    },
    background: { 
        label: "Бэкграунд", 
        color: "text-pink-500",
        bgColor: "bg-pink-500/10",
        borderColor: "border-pink-500/30",
        hoverBg: "hover:bg-pink-500/5",
        hoverBorder: "hover:border-pink-500/30",
        badgeHoverColor: "group-hover:text-pink-500 group-hover:border-pink-500/50",
        titleHoverColor: "group-hover:text-pink-500",
    },
    culture: { 
        label: "Культура", 
        color: "text-orange-500",
        bgColor: "bg-orange-500/10",
        borderColor: "border-orange-500/30",
        hoverBg: "hover:bg-orange-500/5",
        hoverBorder: "hover:border-orange-500/30",
        badgeHoverColor: "group-hover:text-orange-500 group-hover:border-orange-500/50",
        titleHoverColor: "group-hover:text-orange-500",
    },
};

function StarRating({ value, max = 5 }: { value: number; max?: number }) {
    const fullStars = Math.floor(value);
    const partialFill = value - fullStars;
    const emptyStars = max - Math.ceil(value);

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
            
            <span className="ml-1 text-xs text-muted-foreground">{value.toFixed(1)}</span>
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
    const config = categoryConfig[trait.category];
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
                    "group p-4 cursor-pointer transition-all duration-300",
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
                        trait.category === "hard_skills" && "bg-blue-500/5 border-blue-500/30",
                        trait.category === "impact" && "bg-green-500/5 border-green-500/30",
                        trait.category === "domain" && "bg-purple-500/5 border-purple-500/30",
                        trait.category === "superpower" && "bg-amber-500/5 border-amber-500/30",
                        trait.category === "process" && "bg-cyan-500/5 border-cyan-500/30",
                        trait.category === "background" && "bg-pink-500/5 border-pink-500/30",
                        trait.category === "culture" && "bg-orange-500/5 border-orange-500/30",
                    ]
                )}
            >
                <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                        <h3 className={cn(
                            "font-semibold text-foreground text-sm leading-tight transition-colors truncate",
                            config.titleHoverColor,
                            isHighlighted && config.color
                        )}>
                            {trait.label}
                        </h3>
                    </div>
                    <Badge 
                        variant="outline" 
                        className={cn(
                            "text-[10px] px-1.5 py-0 h-5 shrink-0 transition-all duration-300",
                            "border-border text-muted-foreground",
                            config.badgeHoverColor,
                            isHighlighted && [config.color, "border-current"]
                        )}
                    >
                        {config.label}
                    </Badge>
                </div>

                <div className="flex-1 min-h-[32px] py-1">
                    <p className={cn(
                        "text-xs text-muted-foreground line-clamp-2 transition-colors group-hover:text-foreground/70",
                        isHighlighted && "text-foreground/70"
                    )}>
                        {trait.description || "Нет описания"}
                    </p>
                </div>

                <div className="flex items-center justify-between mt-auto pt-2">
                    <StarRating value={trait.importance} />
                    
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
                                "text-muted-foreground/0 group-hover:text-muted-foreground transition-all duration-300 -translate-x-2 group-hover:translate-x-0",
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
        <div className="flex flex-col items-center justify-center flex-1 text-center px-8 py-16 h-full w-full">
            {showIcon && (
                <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
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
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                        Ваш профиль пуст
                    </h3>
                    <p className="text-muted-foreground text-sm max-w-md">
                        Расскажите ИИ о вашем опыте работы в чате слева. Навыки, достижения и
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

    // Get the set of related trait IDs for the hovered trait
    const getRelatedIds = (traitId: string | null): Set<string> => {
        if (!traitId) return new Set();
        
        const hoveredTrait = traits.find(t => t.id === traitId);
        if (!hoveredTrait) return new Set();

        const relatedIds = new Set<string>();
        
        // Add directly related traits (outgoing relations)
        hoveredTrait.relations?.forEach(rel => {
            relatedIds.add(rel.targetId);
        });

        // Add traits that have relations pointing to this trait (incoming relations)
        traits.forEach(t => {
            t.relations?.forEach(rel => {
                if (rel.targetId === traitId) {
                    relatedIds.add(t.id);
                }
            });
        });

        return relatedIds;
    };

    const relatedIds = getRelatedIds(hoveredTraitId);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
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

// Relation type labels
const relationTypeLabels: Record<string, string> = {
    uses: "Использует",
    enables: "Позволяет",
    part_of: "Часть",
    related: "Связано с",
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

    const config = categoryConfig[trait.category];
    
    // Get related traits details
    const relatedTraits = trait.relations
        .map(relation => {
            const relatedTrait = allTraits.find(t => t.id === relation.targetId);
            return relatedTrait ? { ...relatedTrait, relationType: relation.type } : null;
        })
        .filter(Boolean) as (Trait & { relationType: string })[];

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
                            <h4 className="text-sm font-medium text-foreground mb-3">Важность</h4>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                    <div 
                                        className={cn(
                                            "h-full rounded-full transition-all duration-500",
                                            trait.category === "hard_skills" && "bg-blue-500",
                                            trait.category === "impact" && "bg-green-500",
                                            trait.category === "domain" && "bg-purple-500",
                                            trait.category === "superpower" && "bg-amber-500",
                                            trait.category === "process" && "bg-cyan-500",
                                            trait.category === "background" && "bg-pink-500",
                                            trait.category === "culture" && "bg-orange-500"
                                        )}
                                        style={{ width: `${(trait.importance / 5) * 100}%` }}
                                    />
                                </div>
                                <span className="text-sm font-semibold text-foreground min-w-[2.5rem] text-right">
                                    {trait.importance.toFixed(1)} / 5
                                </span>
                            </div>
                            <div className="flex justify-center mt-3">
                                <StarRating value={trait.importance} />
                            </div>
                        </div>

                        <Separator />

                        {/* Relations Section */}
                        <div>
                            <h4 className="text-sm font-medium text-foreground mb-3">
                                Связи {relatedTraits.length > 0 && `(${relatedTraits.length})`}
                            </h4>
                            {relatedTraits.length > 0 ? (
                                <div className="space-y-2">
                                    {relatedTraits.map((related) => {
                                        const relatedConfig = categoryConfig[related.category];
                                        return (
                                            <div 
                                                key={related.id}
                                                className={cn(
                                                    "p-3 rounded-lg border transition-colors",
                                                    "bg-muted/30 border-border",
                                                    "hover:bg-muted/50"
                                                )}
                                            >
                                                <div className="flex items-center justify-between gap-2 mb-1">
                                                    <span className="text-sm font-medium text-foreground">
                                                        {related.label}
                                                    </span>
                                                    <Badge 
                                                        variant="outline" 
                                                        className={cn(
                                                            "text-[10px] px-1.5 h-5",
                                                            relatedConfig.color
                                                        )}
                                                    >
                                                        {relatedConfig.label}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <Link2 size={10} />
                                                    <span>{relationTypeLabels[related.relationType] || related.relationType}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">
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

// Custom Select component for filtering
function FilterSelect({
    activeTab,
    onTabChange,
    traits
}: {
    activeTab: FilterTab;
    onTabChange: (tab: FilterTab) => void;
    traits: Trait[];
}) {
    const getCount = (tabId: FilterTab) => {
        if (tabId === "all") return traits.length;
        return traits.filter(t => t.category === tabId).length;
    };

    const activeTabData = tabs.find(tab => tab.id === activeTab);

    return (
        <Select value={activeTab} onValueChange={(value) => onTabChange(value as FilterTab)}>
            <SelectTrigger className="w-[170px] bg-card">
                <SelectValue>
                    <div className="flex items-center bg-card gap-2">
                        {activeTabData?.label}
                        <Badge variant="secondary" className="px-1.5 py-0 text-xs h-5 min-w-5">
                            {getCount(activeTab)}
                        </Badge>
                    </div>
                </SelectValue>
            </SelectTrigger>
            <SelectContent>
                {tabs.map((tab) => {
                    const count = getCount(tab.id);
                    return (
                        <SelectItem key={tab.id} value={tab.id}>
                            <div className="flex items-center justify-between w-full gap-2">
                                <span>{tab.label}</span>
                                {count > 0 && (
                                    <Badge variant="secondary" className="px-1.5 py-0 text-xs h-5 min-w-5">
                                        {count}
                                    </Badge>
                                )}
                            </div>
                        </SelectItem>
                    );
                })}
            </SelectContent>
        </Select>
    );
}

function TraitsPanel() {
    const traits = useTraitsStore((state) => state.traits);
    const router = useRouter();
    const { chatContext, addResume } = useResumeStore();
    const [viewMode, setViewMode] = useState<ViewMode>("graph");
    const [activeTab, setActiveTab] = useState<FilterTab>("all");
    const [selectedTrait, setSelectedTrait] = useState<Trait | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
    const [resumeStatus, setResumeStatus] = useState<"idle" | "generating" | "success" | "error">("idle");
    const [resumePreview, setResumePreview] = useState("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [abortController, setAbortController] = useState<AbortController | null>(null);
    const statusPhrases = [
        "Обрабатываем текст",
        "Изучаем содержимое",
        "Выделяем важные мысли",
        "Собираем структуру",
        "Полируем формулировки",
        "Сверяем факты и роли",
        "Сокращаем лишнее",
        "Уточняем форматы дат",
        "Проставляем ключевые навыки",
        "Упорядочиваем достижения",
        "Проверяем читабельность",
        "Готовим финальный вариант",
    ];
    const [statusIndex, setStatusIndex] = useState(0);

    const getFilteredTraits = (tabId: FilterTab) => {
        let filtered = tabId === "all" ? traits : traits.filter(trait => trait.category === tabId);
        // Sort by importance (descending - highest importance first)
        return [...filtered].sort((a, b) => b.importance - a.importance);
    };

    const filteredTraits = getFilteredTraits(activeTab);

    const handleTraitClick = (trait: Trait) => {
        setSelectedTrait(trait);
        setSheetOpen(true);
    };

    const handleGenerateResume = async () => {
        if (filteredTraits.length === 0) return;

        const controller = new AbortController();
        setAbortController(controller);
        setIsResumeModalOpen(true);
        setResumeStatus("generating");
        setStatusIndex(0);
        setErrorMessage(null);

        try {
            const response = await fetch("/api/resume", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                signal: controller.signal,
                body: JSON.stringify({
                    traits,
                    chatContext,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || "Не удалось сгенерировать резюме");
            }

            const data = await response.json();
            const resume = (data.resume as string | undefined)?.trim() || "";

            addResume(resume);
            setResumePreview(resume);
            setResumeStatus("success");
            setIsResumeModalOpen(false);
            router.push("/dashboard");
        } catch (error) {
            if ((error as Error).name === "AbortError") {
                setResumeStatus("idle");
                return;
            }
            setErrorMessage(error instanceof Error ? error.message : "Что-то пошло не так");
            setResumeStatus("error");
        } finally {
            setAbortController(null);
        }
    };

    const handleCancel = () => {
        abortController?.abort();
        setAbortController(null);
        setResumeStatus("idle");
        setIsResumeModalOpen(false);
    };

    const handleCloseModal = () => {
        if (resumeStatus === "generating") {
            handleCancel();
            return;
        }
        setIsResumeModalOpen(false);
    };

    const handleGoToResume = () => {
        setIsResumeModalOpen(false);
        router.push("/dashboard");
    };

    useEffect(() => {
        if (resumeStatus !== "generating") return;
        let active = true;
        let timeout: ReturnType<typeof setTimeout> | null = null;

        const schedule = () => {
            const delay = 1500 + Math.random() * 1800; // 1.5s - 3.3s
            timeout = setTimeout(() => {
                if (!active) return;
                setStatusIndex((prev) => (prev + 1) % statusPhrases.length);
                schedule();
            }, delay);
        };

        schedule();

        return () => {
            active = false;
            if (timeout) clearTimeout(timeout);
        };
    }, [resumeStatus, statusPhrases.length]);

    return (
        <div className="flex flex-col h-full">
            {/* Header with Tabs and View Toggle */}
            <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                <FilterSelect
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    traits={traits}
                />
                    {filteredTraits.length > 0 && (
                        <Button size="sm" className="shadow-sm" onClick={handleGenerateResume}>
                            Создать резюме
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
                        <GitBranch size={16} className="mr-2" />
                        Граф связей
                    </ToggleGroupItem>
                    <ToggleGroupItem value="cards" aria-label="Карточки">
                        <LayoutGrid size={16} className="mr-2" />
                        Карточки
                    </ToggleGroupItem>
                </ToggleGroup>
            </div>

            {/* Content */}
            {viewMode === "cards" ? (
                <div className="flex-1 overflow-y-auto -mr-6 pr-6">
                    {filteredTraits.length === 0 ? (
                        traits.length === 0 ? (
                            <EmptyState />
                        ) : (
                            <EmptyState 
                                message={`Нет карточек в категории "${tabs.find(t => t.id === activeTab)?.label}"`} 
                                showIcon={false} 
                            />
                        )
                    ) : (
                        <TraitsGrid 
                            traits={filteredTraits} 
                            onTraitClick={handleTraitClick}
                        />
                    )}
                </div>
            ) : (
                <div className="flex-1 -mx-6 -mb-6 overflow-hidden">
                    <TraitsGraph traits={filteredTraits} key={activeTab} />
                </div>
            )}

            {/* Detail Sheet */}
            <TraitDetailSheet
                trait={selectedTrait}
                open={sheetOpen}
                onOpenChange={setSheetOpen}
                allTraits={traits}
            />

            <AnimatePresence>
                {isResumeModalOpen && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            initial={{ scale: 0.98, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.98, opacity: 0 }}
                            className="relative w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl p-6"
                        >
                            <div className="flex items-start justify-end gap-3 mb-2">
                                <button
                                    onClick={handleCloseModal}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                    aria-label="Закрыть"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {resumeStatus === "generating" && (
                                <div className="space-y-6">
                                    <div className="flex flex-col items-center gap-5 py-6">
                                        <div className="animate-spin rounded-full border-4 border-border border-t-primary w-24 h-24" />
                                        <div className="text-base font-semibold text-foreground text-center">
                                            {statusPhrases[statusIndex]}
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <Button variant="outline" onClick={handleCancel}>
                                            Отменить
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {resumeStatus === "success" && null}

                            {resumeStatus === "error" && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-destructive">
                                        <AlertCircle size={18} />
                                        <span className="text-foreground">Не удалось создать резюме</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {errorMessage || "Попробуйте ещё раз."}
                                    </p>
                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline" onClick={handleCloseModal}>
                                            Закрыть
                                        </Button>
                                        <Button onClick={handleGenerateResume}>Повторить</Button>
                                    </div>
                                </div>
                            )}

                            {resumeStatus === "idle" && (
                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={handleCloseModal}>
                                        Закрыть
                                    </Button>
                                    <Button onClick={handleGenerateResume}>Сгенерировать</Button>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function BuilderPage() {
    return (
        <AppShell>
            <div className="flex w-full h-full">
                <ChatPanel />
                <div className="flex flex-col flex-1 p-6 min-h-0">
                    <TraitsPanel />
                </div>
            </div>
        </AppShell>
    );
}
