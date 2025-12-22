"use client";

import { createElement } from "react";
import { LucideIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
}

export function EmptyState({
    icon,
    title,
    description,
    action,
    className
}: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "flex flex-col justify-center items-center p-8 text-center",
                className
            )}
        >
            <div className="flex justify-center items-center bg-muted mb-4 rounded-full w-20 h-20">
                {createElement(icon, {
                    className: "h-10 w-10 text-muted-foreground",
                    strokeWidth: 1.5
                })}
            </div>
            <h3 className="mb-1 font-semibold text-foreground text-lg">{title}</h3>
            <p className="mb-6 max-w-[280px] text-muted-foreground text-sm">
                {description}
            </p>
            {action && (
                <Button onClick={action.onClick} variant="outline" size="sm">
                    <Plus className="mr-2 w-4 h-4" />
                    {action.label}
                </Button>
            )}
        </motion.div>
    );
}
