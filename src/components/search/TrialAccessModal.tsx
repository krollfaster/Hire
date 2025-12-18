"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, Sparkles, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GeneratedCandidate } from "@/app/api/search/route";

interface TrialAccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    candidate: GeneratedCandidate | null;
}

export const TrialAccessModal = ({ isOpen, onClose, candidate }: TrialAccessModalProps) => {
    if (!candidate) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="z-50 fixed inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="top-1/2 left-1/2 z-50 fixed w-full max-w-lg -translate-x-1/2 -translate-y-1/2"
                    >
                        <div className="relative bg-card shadow-2xl border border-border rounded-2xl overflow-hidden">
                            {/* Gradient background */}
                            <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-purple-500/10" />

                            {/* Close button */}
                            <button
                                onClick={onClose}
                                className="top-4 right-4 z-10 absolute bg-muted/50 hover:bg-muted p-2 rounded-full transition-colors"
                            >
                                <X size={18} className="text-muted-foreground" />
                            </button>

                            <div className="relative p-8">
                                {/* Lock icon */}
                                <div className="flex justify-center mb-6">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", delay: 0.1 }}
                                        className="flex justify-center items-center bg-primary/10 rounded-full w-20 h-20"
                                    >
                                        <Lock size={36} className="text-primary" />
                                    </motion.div>
                                </div>

                                {/* Title */}
                                <motion.h2
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15 }}
                                    className="mb-2 font-bold text-2xl text-center"
                                >
                                    Пробный доступ
                                </motion.h2>

                                {/* Candidate preview */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="flex items-center gap-4 bg-muted/30 mb-6 p-4 rounded-xl"
                                >
                                    <img
                                        src={candidate.avatar}
                                        alt={candidate.name}
                                        className="ring-border rounded-full ring-2 w-12 h-12 object-cover"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-foreground truncate">
                                            {candidate.name}
                                        </p>
                                        <p className="text-muted-foreground text-sm truncate">
                                            {candidate.role}
                                        </p>
                                    </div>
                                    <div className="bg-primary/10 px-3 py-1 rounded-full">
                                        <span className="font-bold text-primary text-sm">
                                            {candidate.matchScore}%
                                        </span>
                                    </div>
                                </motion.div>

                                {/* Description */}
                                <motion.p
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.25 }}
                                    className="mb-6 text-muted-foreground text-center"
                                >
                                    Это демо-версия платформы. Для доступа к полным профилям кандидатов и контактной информации необходима подписка.
                                </motion.p>

                                {/* Features */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="space-y-3 mb-8"
                                >
                                    {[
                                        "Полные профили кандидатов",
                                        "Контактная информация",
                                        "Прямое общение с кандидатами",
                                        "ИИ-рекомендации по найму",
                                    ].map((feature, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <CheckCircle size={18} className="text-primary shrink-0" />
                                            <span className="text-foreground text-sm">{feature}</span>
                                        </div>
                                    ))}
                                </motion.div>

                                {/* CTA buttons */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.35 }}
                                    className="flex flex-col gap-3"
                                >
                                    <Button size="lg" className="gap-2 w-full glow-primary">
                                        <Sparkles size={18} />
                                        Получить полный доступ
                                        <ArrowRight size={18} />
                                    </Button>
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        onClick={onClose}
                                        className="w-full"
                                    >
                                        Продолжить демо
                                    </Button>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

