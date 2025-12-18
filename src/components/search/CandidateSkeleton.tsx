"use client";

import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

interface CandidateSkeletonProps {
    index: number;
}

export const CandidateSkeleton = ({ index }: CandidateSkeletonProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
                duration: 0.4,
                delay: index * 0.1,
                ease: [0.25, 0.46, 0.45, 0.94]
            }}
            className="relative"
        >
            <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-6 h-full">
                {/* Match Score Badge Skeleton */}
                <div className="absolute -top-3 -right-3">
                    <Skeleton className="w-16 h-7 rounded-full" />
                </div>

                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                    {/* Avatar Skeleton */}
                    <Skeleton className="w-14 h-14 rounded-full shrink-0" />

                    <div className="flex-1 min-w-0 space-y-2">
                        {/* Name Skeleton */}
                        <Skeleton className="h-6 w-32" />
                        {/* Role Skeleton */}
                        <Skeleton className="h-4 w-24" />
                    </div>
                </div>

                {/* Bio Skeleton */}
                <div className="mb-4 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>

                {/* Meta info Skeleton */}
                <div className="flex items-center gap-4 mb-4">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                </div>

                {/* Skills Skeleton */}
                <div className="flex flex-wrap gap-1.5">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-14 rounded-full" />
                    <Skeleton className="h-6 w-18 rounded-full" />
                </div>
            </div>
        </motion.div>
    );
};
