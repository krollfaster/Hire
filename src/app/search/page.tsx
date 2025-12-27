"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Loader2, Mic, ArrowUp, User, Sparkles, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { CandidateCard, CandidateSkeleton, SearchFiltersSidebar, ActiveFiltersBadge } from "@/components/search";
import type { SearchCandidate } from "@/app/api/search/route";
import { useMessagesStore } from "@/stores/useMessagesStore";
import { useResearcherSearchStore } from "@/stores/useResearcherSearchStore";

interface SearchFilters {
    matchScore: number[];
    experience: string[];
    location: string[];
}

// Константа для дефолтного значения фильтра
const DEFAULT_MATCH_SCORE = 70;

export default function SearchPage() {
    const router = useRouter();
    const { createChat } = useMessagesStore();
    const [searchPrompt, setSearchPrompt] = useState("");
    const [candidates, setCandidates] = useState<SearchCandidate[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<SearchFilters>({
        matchScore: [DEFAULT_MATCH_SCORE],
        experience: [],
        location: []
    });

    const inputRef = useRef<HTMLInputElement>(null);

    const handleSearch = useCallback(async () => {
        if (!searchPrompt.trim()) return;

        // Mark as submitted and start search
        setHasSubmitted(true);
        setIsSearching(true);
        setError(null);
        setCandidates([]);
    }, [searchPrompt]);

    // Handle filters sidebar appearance with proper cleanup
    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (hasSubmitted) {
            timer = setTimeout(() => {
                setShowFilters(true);
            }, 500);
        }

        return () => {
            if (timer) {
                clearTimeout(timer);
            }
        };
    }, [hasSubmitted]);

    // Execute search when isSearching becomes true
    useEffect(() => {
        if (!isSearching) return;

        const executeSearch = async () => {
            try {
                const response = await fetch('/api/search', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ query: searchPrompt }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Произошла ошибка при поиске');
                }

                if (data.candidates && data.candidates.length > 0) {
                    setCandidates(data.candidates);
                } else {
                    setCandidates([]);
                    setError(data.message || "Кандидаты не найдены. Попробуйте изменить запрос.");
                }
            } catch (err) {
                console.error('Search error:', err);
                setError(err instanceof Error ? err.message : 'Произошла ошибка при поиске кандидатов');
                setCandidates([]);
            } finally {
                setIsSearching(false);
            }
        };

        executeSearch();
    }, [isSearching, searchPrompt]);

    const isResearcherLoading = useResearcherSearchStore((state) => state.isLoading);

    if (isResearcherLoading) {
        return (
            <AppShell>
                <div className="flex flex-col flex-1 justify-center items-center w-full h-full">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        <p className="text-muted-foreground text-sm">Загрузка поиска...</p>
                    </div>
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell>
            <div className="relative flex w-full h-full">
                {/* Main Content */}
                <div className="relative flex flex-col flex-1 h-full overflow-hidden">

                    {/* Scrollable content area */}
                    <div className={cn(
                        "flex-1 overflow-y-auto",
                        hasSubmitted ? "pb-[0px]" : ""
                    )}>

                        {/* Initial centered content (before search) */}
                        <AnimatePresence mode="wait">
                            {!hasSubmitted ? (
                                <motion.div
                                    key="hero"
                                    initial={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.4, ease: "easeOut" }}
                                    className="flex flex-col justify-center items-center px-8 min-h-full"
                                >
                                    {/* Header */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: 0.1 }}
                                        className="space-y-4 mb-8 text-center"
                                    >
                                        <div className="flex justify-center items-center gap-3 mb-6">
                                            <div className="bg-primary/10 p-3 rounded-xl">
                                                <Sparkles className="w-8 h-8 text-primary" />
                                            </div>
                                        </div>
                                        <h1 className="font-bold text-4xl md:text-5xl">Найдите идеального кандидата</h1>
                                        <p className="mx-auto max-w-2xl text-muted-foreground text-lg text-center">
                                            Опишите, кого вы ищете, и наш ИИ найдёт лучших кандидатов по смыслу, а не по ключевым словам
                                        </p>
                                    </motion.div>

                                    {/* Search Input - centered */}
                                    <motion.form
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: 0.2 }}
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            handleSearch();
                                        }}
                                        className="flex flex-col bg-card/95 shadow-lg backdrop-blur-xl border border-border focus-within:border-primary/50 rounded-2xl w-full max-w-3xl transition-colors"
                                    >
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            value={searchPrompt}
                                            onChange={(e) => setSearchPrompt(e.target.value)}
                                            placeholder="Опишите идеального кандидата..."
                                            disabled={isSearching}
                                            className="bg-transparent px-5 py-5 focus:outline-none w-full text-foreground placeholder:text-muted-foreground"
                                        />

                                        <div className="flex justify-between items-center px-3 pb-3">
                                            {/* Left Controls */}
                                            <div className="flex items-center gap-2">
                                                <TooltipProvider delayDuration={300}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <button
                                                                type="button"
                                                                className="flex justify-center items-center hover:bg-background/50 rounded-lg w-10 h-10 text-muted-foreground hover:text-foreground transition-colors"
                                                            >
                                                                <Mic size={18} />
                                                            </button>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="top" className="max-w-[200px] text-center">
                                                            <p>Скоро появится голосовой режим — ищите кандидатов голосом</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>

                                                {/* Active Filters Badges or Filters Button */}
                                                {(filters.experience.length > 0 || filters.location.length > 0 || filters.matchScore[0] !== DEFAULT_MATCH_SCORE) ? (
                                                    <ActiveFiltersBadge
                                                        filters={filters}
                                                        onFiltersChange={setFilters}
                                                        className="max-w-[200px]"
                                                    />
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowFilters(true)}
                                                        className="flex justify-center items-center hover:bg-background/50 rounded-lg w-10 h-10 text-muted-foreground hover:text-foreground transition-colors"
                                                    >
                                                        <SlidersHorizontal size={18} />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Right: Search Button */}
                                            <motion.button
                                                type="submit"
                                                disabled={!searchPrompt.trim() || isSearching}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className={cn(
                                                    "flex justify-center items-center rounded-full w-10 h-10 transition-all duration-200",
                                                    searchPrompt.trim() && !isSearching
                                                        ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25"
                                                        : "bg-muted-foreground/20 text-muted-foreground cursor-not-allowed"
                                                )}
                                            >
                                                {isSearching ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <ArrowUp size={18} strokeWidth={2.5} />
                                                )}
                                            </motion.button>
                                        </div>
                                    </motion.form>
                                </motion.div>
                            ) : (
                                // Results area (after search submitted)
                                <motion.div
                                    key="results"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                    className="mx-auto px-6 pt-8 max-w-4xl"
                                >
                                    {/* Results header */}
                                    {!isSearching && candidates.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mb-6"
                                        >
                                            <h2 className="font-bold text-lg">
                                                Результаты поиска: <span className="text-primary">{candidates.length} кандидатов</span>
                                            </h2>
                                        </motion.div>
                                    )}

                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-destructive/10 mb-6 p-4 border border-destructive/30 rounded-md text-destructive"
                                        >
                                            {error}
                                        </motion.div>
                                    )}

                                    {/* Cards Grid */}
                                    <AnimatePresence mode="wait">
                                        {isSearching ? (
                                            // Skeleton Loading State
                                            <motion.div
                                                key="skeletons"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="gap-6 grid md:grid-cols-2 lg:grid-cols-2"
                                            >
                                                {Array.from({ length: 6 }).map((_, i) => (
                                                    <CandidateSkeleton key={`skeleton-${i}`} index={i} />
                                                ))}
                                            </motion.div>
                                        ) : candidates.length > 0 ? (
                                            // Real Results
                                            <motion.div
                                                key="candidates"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="gap-6 grid md:grid-cols-1 lg:grid-cols-2"
                                            >
                                                {candidates.map((candidate, index) => (
                                                    <CandidateCard
                                                        key={candidate.id}
                                                        candidate={{
                                                            id: candidate.id,
                                                            name: candidate.name,
                                                            role: candidate.professionName,
                                                            bio: candidate.matchExplanation || "",
                                                            avatar: candidate.avatar,
                                                            matchScore: candidate.matchScore,
                                                            matchExplanation: candidate.matchExplanation || "",
                                                            experience: candidate.grade || "Не указан",
                                                            location: "Не указан",
                                                            skills: []
                                                        }}
                                                        index={index}
                                                        onClick={() => { }}
                                                        onWrite={async () => {
                                                            try {
                                                                const chat = await createChat(candidate.id, `Здравствуйте! Меня заинтересовал ваш профиль на позицию ${candidate.professionName}.`);
                                                                router.push(`/messages?chatId=${chat.id}`);
                                                            } catch (error) {
                                                                console.error("Failed to start chat:", error);
                                                                // Можно добавить toast уведомление об ошибке
                                                            }
                                                        }}
                                                    />
                                                ))}
                                            </motion.div>
                                        ) : !error && (
                                            // No Results State
                                            <motion.div
                                                key="no-results"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="py-16 text-center"
                                            >
                                                <User className="opacity-50 mx-auto mb-4 w-16 h-16" />
                                                <p className="text-muted-foreground text-lg">Кандидаты не найдены</p>
                                                <p className="mt-2 text-muted-foreground text-sm">
                                                    Попробуйте изменить запрос или фильтры
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Fixed Search Input - when submitted */}
                    <AnimatePresence>
                        {hasSubmitted && (
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 50 }}
                                transition={{
                                    duration: 0.5,
                                    delay: 0.3,
                                    ease: [0.25, 0.46, 0.45, 0.94]
                                }}
                                className="right-0 bottom-[16px] left-0 z-10 absolute flex justify-center px-6"
                            >
                                <motion.form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handleSearch();
                                    }}
                                    className="flex flex-col bg-card/95 shadow-2xl backdrop-blur-xl border border-border focus-within:border-primary/50 rounded-2xl w-full max-w-4xl transition-colors"
                                >
                                    <input
                                        type="text"
                                        value={searchPrompt}
                                        onChange={(e) => setSearchPrompt(e.target.value)}
                                        placeholder="Опишите идеального кандидата..."
                                        disabled={isSearching}
                                        className="bg-transparent px-4 py-4 focus:outline-none w-full text-foreground placeholder:text-muted-foreground text-sm"
                                    />

                                    <div className="flex justify-between items-center px-3 pb-2">
                                        {/* Left Controls */}
                                        <div className="flex items-center gap-2">
                                            <TooltipProvider delayDuration={300}>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <button
                                                            type="button"
                                                            className="flex justify-center items-center hover:bg-background/50 rounded-lg w-8 h-8 text-muted-foreground hover:text-foreground transition-colors"
                                                        >
                                                            <Mic size={18} />
                                                        </button>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top" className="max-w-[200px] text-center">
                                                        <p>Скоро появится голосовой режим — ищите кандидатов голосом</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>

                                            {/* Active Filters Badges or Filters Button */}
                                            {(filters.experience.length > 0 || filters.location.length > 0 || filters.matchScore[0] !== DEFAULT_MATCH_SCORE) ? (
                                                <ActiveFiltersBadge
                                                    filters={filters}
                                                    onFiltersChange={setFilters}
                                                    className="max-w-[150px]"
                                                />
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => setShowFilters(true)}
                                                    className="flex justify-center items-center hover:bg-background/50 rounded-lg w-8 h-8 text-muted-foreground hover:text-foreground transition-colors"
                                                >
                                                    <SlidersHorizontal size={18} />
                                                </button>
                                            )}
                                        </div>

                                        {/* Right: Search Button */}
                                        <motion.button
                                            type="submit"
                                            disabled={!searchPrompt.trim() || isSearching}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={cn(
                                                "flex justify-center items-center rounded-full w-8 h-8 transition-all duration-200",
                                                searchPrompt.trim() && !isSearching
                                                    ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25"
                                                    : "bg-muted-foreground/20 text-muted-foreground cursor-not-allowed"
                                            )}
                                        >
                                            {isSearching ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <ArrowUp size={18} strokeWidth={2.5} />
                                            )}
                                        </motion.button>
                                    </div>
                                </motion.form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Filters Sidebar */}
                <SearchFiltersSidebar
                    isOpen={showFilters}
                    onClose={() => setShowFilters(false)}
                    filters={filters}
                    onFiltersChange={setFilters}
                />
            </div>
        </AppShell>
    );
}
