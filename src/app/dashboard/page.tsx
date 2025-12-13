"use client";

import { AppShell } from "@/components/layout";
import { PersonalInfoPanel } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MarkdownText } from "@/components/ui/markdown-text";
import { useResumeStore } from "@/stores/useResumeStore";
import Link from "next/link";
import { Link2 } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function DashboardPage() {
    const { resumeText, resumes, selectedResumeId, selectResume } = useResumeStore();
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (!resumeText) return;
        setShowConfetti(true);
        const timer = setTimeout(() => setShowConfetti(false), 1800);
        return () => clearTimeout(timer);
    }, [resumeText]);

    return (
        <AppShell>
            <div className="flex flex-col w-full h-full p-0 gap-6 min-h-0" style={{ paddingTop: '0px', paddingBottom: '0px', paddingLeft: '0px', paddingRight: '0px' }}>
                <div className="flex-1 min-h-0">
                    <div className="flex h-full w-full min-w-0 rounded-2xl bg-card/60 overflow-hidden divide-x divide-border">
                        {/* Личные данные */}
                        <div className="w-[425px] min-w-[380px] max-w-[425px] flex-shrink-0 p-6 pr-2 overflow-hidden">
                            <PersonalInfoPanel />
                        </div>

                        {/* Секция резюме */}
                        <ScrollArea className="relative flex-1 min-w-0 h-full p-6 overflow-hidden">
                            <div className="relative flex flex-col gap-4 min-h-full">
                                {showConfetti && (
                                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                                        {Array.from({ length: 80 }).map((_, i) => {
                                            const colors = [
                                                "#7c8cf8",
                                                "#5f7bff",
                                                "#9ea8ff",
                                                "#6da3ff",
                                                "#7dd3fc",
                                                "#f472b6",
                                                "#facc15",
                                                "#34d399",
                                            ];
                                            const color = colors[i % colors.length];
                                            return (
                                                <motion.span
                                                    key={i}
                                                    className="absolute rounded-sm"
                                                    style={{
                                                        left: `${Math.random() * 100}%`,
                                                        top: `${Math.random() * 100}%`,
                                                        width: `${4 + Math.random() * 6}px`,
                                                        height: `${12 + Math.random() * 12}px`,
                                                        backgroundColor: color,
                                                    }}
                                                    initial={{
                                                        opacity: 0,
                                                        scale: 0.5 + Math.random() * 0.4,
                                                        y: 0,
                                                        x: 0,
                                                    }}
                                                    animate={{
                                                        opacity: [0, 1, 0],
                                                        y: [
                                                            -20 - Math.random() * 40,
                                                            -100 - Math.random() * 120,
                                                            -160 - Math.random() * 40,
                                                        ],
                                                        x: [
                                                            Math.random() * 20 - 10,
                                                            Math.random() * 60 - 30,
                                                            Math.random() * 80 - 40,
                                                        ],
                                                        rotate: [
                                                            -30 + Math.random() * 20,
                                                            40 + Math.random() * 50,
                                                            120 + Math.random() * 60,
                                                        ],
                                                    }}
                                                    transition={{
                                                        duration: 1.3 + Math.random() * 0.7,
                                                        delay: Math.random() * 0.45,
                                                        ease: "easeOut",
                                                    }}
                                                />
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Если резюме не создано - показываем empty state */}
                                {!resumeText || resumes.length === 0 ? (
                                    <div className="flex flex-1 items-center justify-center">
                                        <div className="flex flex-col items-center text-center px-6 py-12 w-full max-w-xl mx-auto">
                                            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
                                                <Link2 className="w-10 h-10 text-muted-foreground" strokeWidth={1.5} />
                                            </div>

                                            <h3 className="text-lg font-semibold text-foreground mb-2">Резюме не создано</h3>
                                            <p className="text-muted-foreground text-sm max-w-md mb-4">
                                                Создайте резюме в разделе «Написать», чтобы оно появилось здесь. Можно добавить
                                                навыки и достижения через чат.
                                            </p>

                                            <Button asChild>
                                                <Link href="/builder">Создать резюме</Link>
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    /* Если резюме создано - показываем селектор и текст */
                                    <>
                                        <div className="flex items-center gap-3">
                                            <Select
                                                value={selectedResumeId ?? undefined}
                                                onValueChange={selectResume}
                                            >
                                                <SelectTrigger className="w-[280px]">
                                                    <SelectValue placeholder="Выберите резюме" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {resumes.map((resume) => (
                                                        <SelectItem key={resume.id} value={resume.id}>
                                                            {resume.title}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <MarkdownText content={resumeText} />
                                    </>
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
