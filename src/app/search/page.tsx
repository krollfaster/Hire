"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/layout";
import { SearchHero, CandidateCard, TrialAccessModal } from "@/components/search";
import { useSearchStore } from "@/stores/useSearchStore";
import { useRoleStore } from "@/stores/useRoleStore";
import { AlertCircle, Users } from "lucide-react";
import type { GeneratedCandidate } from "@/app/api/search/route";

export default function SearchPage() {
    const { results, isSearching, error, search, clearResults } = useSearchStore();
    const { setRole } = useRoleStore();
    const [selectedCandidate, setSelectedCandidate] = useState<GeneratedCandidate | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Ensure recruiter role when on this page
    useEffect(() => {
        setRole('recruiter');
    }, [setRole]);

    const handleSearch = async (query: string) => {
        await search(query);
    };

    const handleCandidateClick = (candidate: GeneratedCandidate) => {
        setSelectedCandidate(candidate);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedCandidate(null), 300);
    };

    return (
        <AppShell>
            <div className="relative w-full h-full overflow-hidden">
                {/* Animated background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {/* Gradient mesh */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,var(--tw-gradient-stops))] from-purple-500/5 via-transparent to-transparent" />
                    
                    {/* Floating orbs */}
                    <motion.div
                        animate={{
                            x: [0, 30, 0],
                            y: [0, -20, 0],
                        }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="absolute top-20 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl"
                    />
                    <motion.div
                        animate={{
                            x: [0, -20, 0],
                            y: [0, 30, 0],
                        }}
                        transition={{
                            duration: 10,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="absolute bottom-20 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"
                    />
                    
                    {/* Grid pattern */}
                    <div
                        className="absolute inset-0 opacity-[0.015]"
                        style={{
                            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                            backgroundSize: "48px 48px",
                        }}
                    />
                </div>

                {/* Main content */}
                <div className="relative z-10 w-full h-full overflow-y-auto px-6 py-8">
                    <div className="max-w-6xl mx-auto">
                        {/* Search Hero */}
                        <SearchHero
                            onSearch={handleSearch}
                            isSearching={isSearching}
                            hasResults={results.length > 0}
                        />

                        {/* Error message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-3 bg-destructive/10 border border-destructive/30 rounded-xl p-4 mt-6 max-w-2xl mx-auto"
                            >
                                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                                <p className="text-destructive text-sm">{error}</p>
                            </motion.div>
                        )}

                        {/* Results section */}
                        {results.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="mt-8"
                            >
                                {/* Results header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <Users className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <h2 className="font-semibold text-lg">
                                                Найдено кандидатов: {results.length}
                                            </h2>
                                            <p className="text-muted-foreground text-sm">
                                                Отсортировано по релевантности
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={clearResults}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Очистить
                                    </motion.button>
                                </div>

                                {/* Candidates grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {results.map((candidate, index) => (
                                        <CandidateCard
                                            key={candidate.id}
                                            candidate={candidate}
                                            index={index}
                                            onClick={() => handleCandidateClick(candidate)}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Empty state after search */}
                        {!isSearching && results.length === 0 && !error && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center py-20"
                            >
                                {/* This will only show if user somehow got here without results */}
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Trial Access Modal */}
                <TrialAccessModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    candidate={selectedCandidate}
                />
            </div>
        </AppShell>
    );
}
