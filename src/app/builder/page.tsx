"use client";

import { useState } from "react";
import { AppShell, ChatPanel } from "@/components/layout";
import { useTraitsStore, Trait, TraitCategory } from "@/stores/useTraitsStore";
import { TraitsGraph } from "@/components/graph/TraitsGraph";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Star, Link2, LayoutGrid, GitBranch, ArrowRight } from "lucide-react";

type FilterTab = "all" | TraitCategory;
type ViewMode = "cards" | "graph";

const tabs: { id: FilterTab; label: string }[] = [
    { id: "all", label: "Все" },
    { id: "hard_skills", label: "Навыки" },
    { id: "impact", label: "Результаты" },
    { id: "superpower", label: "Суперсила" },
    { id: "domain", label: "Сферы" },
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
        label: "Навык", 
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/30",
        hoverBg: "hover:bg-blue-500/5",
        hoverBorder: "hover:border-blue-500/30",
        badgeHoverColor: "group-hover:text-blue-500 group-hover:border-blue-500/50",
        titleHoverColor: "group-hover:text-blue-500",
    },
    impact: { 
        label: "Результат", 
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
        <div className="flex flex-col items-center justify-center flex-1 text-center px-8 py-16">
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
                        Расскажите ИИ о вашем опыте работы в чате слева.
                        <br />
                        Навыки, достижения и компетенции появятся здесь автоматически.
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
                                            trait.category === "superpower" && "bg-amber-500"
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

// Custom TabsList without Radix context dependency
function FilterTabs({ 
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

    return (
        <div className="inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
            {tabs.map((tab) => {
                const count = getCount(tab.id);
                const isActive = activeTab === tab.id;
                
                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={cn(
                            "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 gap-2",
                            isActive 
                                ? "bg-background text-foreground shadow-sm" 
                                : "hover:bg-background/50 hover:text-foreground"
                        )}
                    >
                        {tab.label}
                        {count > 0 && (
                            <Badge variant="secondary" className="px-1.5 py-0 text-xs h-5 min-w-5">
                                {count}
                            </Badge>
                        )}
                    </button>
                );
            })}
        </div>
    );
}

function TraitsPanel() {
    const traits = useTraitsStore((state) => state.traits);
    const [viewMode, setViewMode] = useState<ViewMode>("graph");
    const [activeTab, setActiveTab] = useState<FilterTab>("all");
    const [selectedTrait, setSelectedTrait] = useState<Trait | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);

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

    return (
        <div className="flex flex-col h-full">
            {/* Header with Tabs and View Toggle */}
            <div className="flex items-center justify-between gap-4 mb-6">
                <FilterTabs 
                    activeTab={activeTab} 
                    onTabChange={setActiveTab} 
                    traits={traits}
                />

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
        </div>
    );
}

export default function BuilderPage() {
    return (
        <AppShell>
            <div className="flex w-full h-full">
                <ChatPanel />
                <div className="flex flex-col flex-1 bg-card p-6 min-h-0">
                    <TraitsPanel />
                </div>
            </div>
        </AppShell>
    );
}
