"use client";

import { motion } from "framer-motion";
import { MapPin, Briefcase, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { GeneratedCandidate } from "@/app/api/search/route";

interface CandidateCardProps {
    candidate: GeneratedCandidate;
    index: number;
    onClick: () => void;
}

const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
    if (score >= 80) return "text-green-400 bg-green-500/10 border-green-500/30";
    if (score >= 70) return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
    return "text-orange-400 bg-orange-500/10 border-orange-500/30";
};

const getScoreGlow = (score: number) => {
    if (score >= 90) return "shadow-emerald-500/20";
    if (score >= 80) return "shadow-green-500/20";
    if (score >= 70) return "shadow-yellow-500/20";
    return "shadow-orange-500/20";
};

export const CandidateCard = ({ candidate, index, onClick }: CandidateCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
                duration: 0.4, 
                delay: index * 0.1,
                ease: [0.25, 0.46, 0.45, 0.94]
            }}
            whileHover={{ 
                scale: 1.02,
                y: -4,
            }}
            onClick={onClick}
            className="group relative cursor-pointer"
        >
            {/* Gradient border effect */}
            <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/50 via-purple-500/50 to-pink-500/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
            
            <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-6 h-full transition-all duration-300 group-hover:border-primary/30 group-hover:bg-card/90">
                {/* Match Score Badge */}
                <div className={cn(
                    "absolute -top-3 -right-3 px-3 py-1.5 rounded-full border font-bold text-sm shadow-lg",
                    getScoreColor(candidate.matchScore),
                    getScoreGlow(candidate.matchScore)
                )}>
                    <div className="flex items-center gap-1">
                        <Sparkles size={12} />
                        {candidate.matchScore}%
                    </div>
                </div>

                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                    <motion.div 
                        className="relative"
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 400 }}
                    >
                        <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-border group-hover:ring-primary/50 transition-all">
                            <img
                                src={candidate.avatar}
                                alt={candidate.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {/* Online indicator */}
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-card" />
                    </motion.div>

                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground text-lg truncate group-hover:text-primary transition-colors">
                            {candidate.name}
                        </h3>
                        <p className="text-muted-foreground text-sm truncate">
                            {candidate.role}
                        </p>
                    </div>
                </div>

                {/* Bio */}
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {candidate.bio}
                </p>

                {/* Meta info */}
                <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Briefcase size={12} />
                        <span>{candidate.experience}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <MapPin size={12} />
                        <span className="truncate">{candidate.location}</span>
                    </div>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-1.5">
                    {candidate.skills.slice(0, 4).map((skill, i) => (
                        <Badge
                            key={i}
                            variant="secondary"
                            className="text-xs bg-primary/5 hover:bg-primary/10 border-primary/20 text-foreground/80"
                        >
                            {skill}
                        </Badge>
                    ))}
                    {candidate.skills.length > 4 && (
                        <Badge
                            variant="secondary"
                            className="text-xs bg-muted/50 text-muted-foreground"
                        >
                            +{candidate.skills.length - 4}
                        </Badge>
                    )}
                </div>

                {/* Match explanation on hover */}
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    whileHover={{ opacity: 1, height: "auto" }}
                    className="overflow-hidden"
                >
                    <div className="mt-4 pt-4 border-t border-border/50">
                        <p className="text-xs text-muted-foreground italic">
                            {candidate.matchExplanation}
                        </p>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

