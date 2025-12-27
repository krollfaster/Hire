"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DEFAULT_MATCH_SCORE } from "@/lib/constants";

interface SearchFilters {
    matchScore: number[];
    experience: string[];
    location: string[];
}

interface ActiveFiltersBadgeProps {
    filters: SearchFilters;
    onFiltersChange: (filters: SearchFilters) => void;
    className?: string;
}

export const ActiveFiltersBadge = ({
    filters,
    onFiltersChange,
    className = ""
}: ActiveFiltersBadgeProps) => {
    const hasActiveFilters = filters.experience.length > 0 || filters.location.length > 0 || filters.matchScore[0] !== DEFAULT_MATCH_SCORE;

    const removeExperienceFilter = (expToRemove: string) => {
        const newFilters = {
            ...filters,
            experience: filters.experience.filter(exp => exp !== expToRemove)
        };
        onFiltersChange(newFilters);
    };

    const removeLocationFilter = (locToRemove: string) => {
        const newFilters = {
            ...filters,
            location: filters.location.filter(loc => loc !== locToRemove)
        };
        onFiltersChange(newFilters);
    };

    const resetMatchScoreFilter = () => {
        const newFilters = {
            ...filters,
            matchScore: [DEFAULT_MATCH_SCORE]
        };
        onFiltersChange(newFilters);
    };

    if (!hasActiveFilters) {
        return null;
    }

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <AnimatePresence mode="popLayout">
                {/* Match Score Badge */}
                {filters.matchScore[0] !== 70 && (
                    <motion.div
                        key="match-score"
                        initial={{ opacity: 0, scale: 0.8, x: -10 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.8, x: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Badge
                            variant="secondary"
                            className="flex items-center gap-1 hover:bg-secondary/80 px-2 py-1 text-xs cursor-pointer"
                        >
                            Совпадение: {filters.matchScore[0]}%
                            <button
                                type="button"
                                onClick={resetMatchScoreFilter}
                                className="hover:bg-muted/50 ml-1 p-0.5 rounded-full transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </Badge>
                    </motion.div>
                )}

                {/* Experience Badges */}
                {filters.experience.map((exp) => (
                    <motion.div
                        key={`exp-${exp}`}
                        initial={{ opacity: 0, scale: 0.8, x: -10 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.8, x: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Badge
                            variant="secondary"
                            className="flex items-center gap-1 hover:bg-secondary/80 px-2 py-1 text-xs cursor-pointer"
                        >
                            {exp}
                            <button
                                type="button"
                                onClick={() => removeExperienceFilter(exp)}
                                className="hover:bg-muted/50 ml-1 p-0.5 rounded-full transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </Badge>
                    </motion.div>
                ))}

                {/* Location Badges */}
                {filters.location.map((loc) => (
                    <motion.div
                        key={`loc-${loc}`}
                        initial={{ opacity: 0, scale: 0.8, x: -10 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.8, x: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Badge
                            variant="secondary"
                            className="flex items-center gap-1 hover:bg-secondary/80 px-2 py-1 text-xs cursor-pointer"
                        >
                            {loc}
                            <button
                                type="button"
                                onClick={() => removeLocationFilter(loc)}
                                className="hover:bg-muted/50 ml-1 p-0.5 rounded-full transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </Badge>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};
