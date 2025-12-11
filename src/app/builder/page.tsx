"use client";

import { useState } from "react";
import { AppShell, ChatPanel } from "@/components/layout";
import { useTraitsStore, Trait, TraitCategory } from "@/stores/useTraitsStore";
import { TraitsGraph } from "@/components/graph/TraitsGraph";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Star, Link2, LayoutGrid, GitBranch } from "lucide-react";

type FilterTab = "all" | TraitCategory;
type ViewMode = "cards" | "graph";

const tabs: { id: FilterTab; label: string }[] = [
    { id: "all", label: "Все" },
    { id: "hard_skills", label: "Навыки" },
    { id: "impact", label: "Результаты" },
    { id: "superpower", label: "Суперсила" },
    { id: "domain", label: "Сферы" },
];

const categoryConfig: Record<TraitCategory, { label: string; color: string; hoverBg: string }> = {
    hard_skills: { 
        label: "Навык", 
        color: "text-blue-500", 
        hoverBg: "group-hover:bg-blue-500/5 group-hover:border-blue-500/20" 
    },
    impact: { 
        label: "Результат", 
        color: "text-green-500", 
        hoverBg: "group-hover:bg-green-500/5 group-hover:border-green-500/20" 
    },
    domain: { 
        label: "Сфера", 
        color: "text-purple-500", 
        hoverBg: "group-hover:bg-purple-500/5 group-hover:border-purple-500/20" 
    },
    superpower: { 
        label: "Суперсила", 
        color: "text-amber-500", 
        hoverBg: "group-hover:bg-amber-500/5 group-hover:border-amber-500/20" 
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

function TraitCard({ trait }: { trait: Trait }) {
    const config = categoryConfig[trait.category];
    const hasRelations = trait.relations && trait.relations.length > 0;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
        >
            <Card className={cn(
                "group p-4 cursor-default transition-all duration-200 hover:shadow-md",
                "border-border bg-card",
                config.hoverBg
            )}>
                <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground text-sm leading-tight">
                            {trait.label}
                        </h3>
                    </div>
                    <Badge 
                        variant="outline" 
                        className={cn(
                            "text-[10px] px-1.5 py-0 h-5 shrink-0 transition-colors",
                            "border-border text-muted-foreground",
                            `group-hover:${config.color} group-hover:border-current`
                        )}
                    >
                        {config.label}
                    </Badge>
                </div>

                {trait.description && (
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                        {trait.description}
                    </p>
                )}

                <div className="flex items-center justify-between">
                    <StarRating value={trait.importance} />
                    
                    {hasRelations && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                            <Link2 size={12} />
                            <span className="text-xs">{trait.relations.length}</span>
                        </div>
                    )}
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

function TraitsGrid({ traits }: { traits: Trait[] }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            <AnimatePresence mode="popLayout">
                {traits.map((trait) => (
                    <TraitCard key={trait.id} trait={trait} />
                ))}
            </AnimatePresence>
        </div>
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
    const [viewMode, setViewMode] = useState<ViewMode>("cards");
    const [activeTab, setActiveTab] = useState<FilterTab>("all");

    const getFilteredTraits = (tabId: FilterTab) => {
        if (tabId === "all") return traits;
        return traits.filter(trait => trait.category === tabId);
    };

    const filteredTraits = getFilteredTraits(activeTab);

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
                    <ToggleGroupItem value="cards" aria-label="Карточки">
                        <LayoutGrid size={16} className="mr-2" />
                        Карточки
                    </ToggleGroupItem>
                    <ToggleGroupItem value="graph" aria-label="Граф связей">
                        <GitBranch size={16} className="mr-2" />
                        Граф связей
                    </ToggleGroupItem>
                </ToggleGroup>
            </div>

            {/* Content */}
            {viewMode === "cards" ? (
                <div className="flex-1">
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
                        <TraitsGrid traits={filteredTraits} />
                    )}
                </div>
            ) : (
                <div className="flex-1 -mx-6 -mb-6">
                    <TraitsGraph traits={filteredTraits} key={activeTab} />
                </div>
            )}
        </div>
    );
}

export default function BuilderPage() {
    return (
        <AppShell>
            <div className="flex w-full h-full">
                <ChatPanel />
                <div className="flex flex-col flex-1 bg-card p-6 overflow-hidden">
                    <TraitsPanel />
                </div>
            </div>
        </AppShell>
    );
}
