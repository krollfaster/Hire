"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ArrowUp, ChevronDown, Briefcase, Pencil, X, Trash2, Check, Mic, Zap, Sparkles, Brain, Crown, Rocket, Lock } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useTraitsStore, TraitAction } from "@/stores/useTraitsStore";

const MODELS = [
    "google/gemini-2.0-flash-001",
    "anthropic/claude-3.5-sonnet",
    "openai/gpt-4o-mini",
    "meta-llama/llama-3.3-70b-instruct",
];

interface Message {
    id: string;
    content: string;
    role: "user" | "assistant";
    timestamp: Date;
}

interface Workplace {
    id: string;
    companyName: string;
    position: string;
    startDate: string;
    endDate: string;
}

// Modal for creating/editing workplace
const WorkplaceModal = ({
    isOpen,
    onClose,
    onSave,
    onDelete,
    workplace,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSave: (workplace: Omit<Workplace, "id">) => void;
    onDelete?: () => void;
    workplace?: Workplace | null;
}) => {
    const [companyName, setCompanyName] = useState(workplace?.companyName || "");
    const [position, setPosition] = useState(workplace?.position || "");
    const [startDate, setStartDate] = useState(workplace?.startDate || "");
    const [endDate, setEndDate] = useState(workplace?.endDate || "");

    useEffect(() => {
        if (workplace) {
            setCompanyName(workplace.companyName);
            setPosition(workplace.position);
            setStartDate(workplace.startDate);
            setEndDate(workplace.endDate);
        } else {
            setCompanyName("");
            setPosition("");
            setStartDate("");
            setEndDate("");
        }
    }, [workplace, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!companyName.trim() || !position.trim()) return;
        onSave({ companyName, position, startDate, endDate });
        onClose();
    };

    const handleDelete = () => {
        if (onDelete) {
            onDelete();
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-card border border-border rounded-2xl p-6 w-[400px] shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-foreground">
                                {workplace ? "Редактировать место работы" : "Новое место работы"}
                            </h3>
                            <div className="flex items-center gap-1">
                                {workplace && onDelete && (
                                    <button
                                        onClick={handleDelete}
                                        className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                        title="Удалить"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                                <button
                                    onClick={onClose}
                                    className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1.5">
                                    Название компании *
                                </label>
                                <input
                                    type="text"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    placeholder="Например: Google"
                                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1.5">
                                    Должность *
                                </label>
                                <input
                                    type="text"
                                    value={position}
                                    onChange={(e) => setPosition(e.target.value)}
                                    placeholder="Например: Senior Developer"
                                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">
                                        Начало работы
                                    </label>
                                    <input
                                        type="text"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        placeholder="Янв 2020"
                                        className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">
                                        Конец работы
                                    </label>
                                    <input
                                        type="text"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        placeholder="Настоящее время"
                                        className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-4 py-3 rounded-xl border border-border text-foreground hover:bg-muted transition-colors"
                                >
                                    Отмена
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium"
                                >
                                    {workplace ? "Сохранить" : "Создать"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export const ChatPanel = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [selectedModel, setSelectedModel] = useState(MODELS[0]);
    const [isModelPickerOpen, setIsModelPickerOpen] = useState(false);
    const [workplaces, setWorkplaces] = useState<Workplace[]>([]);
    const [selectedWorkplace, setSelectedWorkplace] = useState<Workplace | null>(null);
    const [isWorkplaceModalOpen, setIsWorkplaceModalOpen] = useState(false);
    const [editingWorkplace, setEditingWorkplace] = useState<Workplace | null>(null);
    const [isWorkplacePickerOpen, setIsWorkplacePickerOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Connect to traits store
    const { applyActions, getContextForAI } = useTraitsStore();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleCreateWorkplace = (workplaceData: Omit<Workplace, "id">) => {
        const newWorkplace: Workplace = {
            id: Date.now().toString(),
            ...workplaceData,
        };
        setWorkplaces((prev) => [...prev, newWorkplace]);
        setSelectedWorkplace(newWorkplace);
        setEditingWorkplace(null);
    };

    const handleEditWorkplace = (workplaceData: Omit<Workplace, "id">) => {
        if (!editingWorkplace) return;
        const updatedWorkplace: Workplace = {
            ...editingWorkplace,
            ...workplaceData,
        };
        setWorkplaces((prev) =>
            prev.map((w) => (w.id === editingWorkplace.id ? updatedWorkplace : w))
        );
        if (selectedWorkplace?.id === editingWorkplace.id) {
            setSelectedWorkplace(updatedWorkplace);
        }
        setEditingWorkplace(null);
    };

    const handleDeleteWorkplace = () => {
        if (!editingWorkplace) return;
        const remainingWorkplaces = workplaces.filter((w) => w.id !== editingWorkplace.id);
        setWorkplaces(remainingWorkplaces);
        if (selectedWorkplace?.id === editingWorkplace.id) {
            setSelectedWorkplace(remainingWorkplaces.length > 0 ? remainingWorkplaces[0] : null);
        }
        setEditingWorkplace(null);
    };

    const openEditModal = () => {
        if (selectedWorkplace) {
            setEditingWorkplace(selectedWorkplace);
            setIsWorkplaceModalOpen(true);
        }
    };

    const openCreateModal = () => {
        setEditingWorkplace(null);
        setIsWorkplaceModalOpen(true);
    };

    const selectWorkplace = (workplace: Workplace) => {
        setSelectedWorkplace(workplace);
        setIsWorkplacePickerOpen(false);
        setMessages([]); // Clear messages when switching workplace
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || !selectedWorkplace) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            content: input.trim(),
            role: "user",
            timestamp: new Date(),
        };

        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput("");
        setIsLoading(true);

        try {
            // Get current traits context for AI
            const traitsContext = getContextForAI();

            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: newMessages.map(m => ({ role: m.role, content: m.content })),
                    model: selectedModel,
                    traitsContext,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || "Failed to fetch response");
            }

            const data = await response.json();

            // Apply actions to the traits store
            if (data.actions && Array.isArray(data.actions) && data.actions.length > 0) {
                applyActions(data.actions as TraitAction[]);
            }

            // Display AI message
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: data.message || "Профиль обновлен.",
                role: "assistant",
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            console.error("Chat error:", error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                content:
                    error instanceof Error
                        ? `Ошибка: ${error.message}`
                        : "Извините, произошла ошибка при обращении к ИИ.",
                role: "assistant",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const hasWorkplace = selectedWorkplace !== null;

    return (
        <>
            <WorkplaceModal
                isOpen={isWorkplaceModalOpen}
                onClose={() => {
                    setIsWorkplaceModalOpen(false);
                    setEditingWorkplace(null);
                }}
                onSave={editingWorkplace ? handleEditWorkplace : handleCreateWorkplace}
                onDelete={editingWorkplace ? handleDeleteWorkplace : undefined}
                workplace={editingWorkplace}
            />

            <div className="flex flex-col bg-background border-border border-r w-[400px] h-full">
                {/* Header */}
                <div className="flex items-center justify-between px-5 border-border border-b h-[54px]">
                    {hasWorkplace ? (
                        <>
                            <div className="relative flex-1 min-w-0">
                                <button
                                    onClick={() => setIsWorkplacePickerOpen(!isWorkplacePickerOpen)}
                                    className="flex items-center gap-2 min-w-0 hover:bg-muted/50 px-2 py-1.5 -ml-2 rounded-lg transition-colors"
                                >
                                    <Briefcase size={16} className="text-muted-foreground shrink-0" />
                                    <span className="font-bold text-foreground truncate">
                                        {selectedWorkplace.companyName}
                                    </span>
                                    <span className="text-muted-foreground text-sm truncate">
                                        · {selectedWorkplace.position}
                                    </span>
                                    <ChevronDown
                                        size={14}
                                        className={cn(
                                            "text-muted-foreground shrink-0 transition-transform",
                                            isWorkplacePickerOpen && "rotate-180"
                                        )}
                                    />
                                </button>

                                {/* Workplace Picker Dropdown */}
                                <AnimatePresence>
                                    {isWorkplacePickerOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                            className="absolute top-full left-0 z-50 mt-1 bg-popover/95 shadow-lg backdrop-blur-lg p-1 border border-border rounded-xl w-full min-w-[280px]"
                                        >
                                            <div className="max-h-[240px] overflow-y-auto">
                                                {workplaces.map((workplace) => (
                                                    <button
                                                        key={workplace.id}
                                                        onClick={() => selectWorkplace(workplace)}
                                                        className={cn(
                                                            "flex items-center gap-2 px-3 py-2.5 rounded-lg w-full text-left transition-colors",
                                                            selectedWorkplace?.id === workplace.id
                                                                ? "bg-primary/10 text-primary"
                                                                : "text-foreground hover:bg-muted"
                                                        )}
                                                    >
                                                        <Briefcase size={14} className="shrink-0 opacity-60" />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-medium text-sm truncate">
                                                                {workplace.companyName}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground truncate">
                                                                {workplace.position}
                                                            </div>
                                                        </div>
                                                        {selectedWorkplace?.id === workplace.id && (
                                                            <Check size={14} className="shrink-0" />
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="border-t border-border mt-1 pt-1">
                                                <button
                                                    onClick={() => {
                                                        setIsWorkplacePickerOpen(false);
                                                        openCreateModal();
                                                    }}
                                                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg w-full text-left text-primary hover:bg-primary/10 transition-colors"
                                                >
                                                    <Plus size={14} />
                                                    <span className="text-sm font-medium">Добавить место работы</span>
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                <button
                                    onClick={openCreateModal}
                                    className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                    title="Добавить место работы"
                                >
                                    <Plus size={16} />
                                </button>
                                <button
                                    onClick={openEditModal}
                                    className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                    title="Редактировать"
                                >
                                    <Pencil size={14} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <h2 className="font-bold text-foreground">Опишите ваши достижения</h2>
                    )}
                </div>

                {/* Messages / Empty State */}
                <div className="flex-1 space-y-4 p-5 overflow-y-auto">
                    {!hasWorkplace ? (
                        <div className="flex flex-col justify-center items-center h-full text-center px-4">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                                <Briefcase size={28} className="text-primary" />
                            </div>
                            <p className="text-foreground font-medium mb-2">
                                Создайте своё первое место работы
                            </p>
                            <p className="text-muted-foreground text-sm mb-6">
                                Расскажите о ваших достижениях и опыте работы.
                                <br />
                                ИИ поможет выделить ключевые моменты для резюме.
                            </p>
                            <button
                                onClick={() => setIsWorkplaceModalOpen(true)}
                                className="px-6 py-3 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium flex items-center gap-2"
                            >
                                <Plus size={18} />
                                Создать место работы
                            </button>
                        </div>
                    ) : (
                        <>
                            {messages.length === 0 && (
                                <div className="flex flex-col justify-center items-center h-full text-center">
                                    <p className="text-muted-foreground text-sm">
                                        Опишите свой опыт работы и достижения в{" "}
                                        <span className="font-medium text-foreground">
                                            {selectedWorkplace.companyName}
                                        </span>
                                        .
                                        <br />
                                        ИИ поможет выделить ключевые моменты для резюме.
                                    </p>
                                </div>
                            )}
                            {messages.map((message) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={cn(
                                        "px-4 py-3 rounded-2xl max-w-[85%] text-sm",
                                        message.role === "user"
                                            ? "ml-auto bg-primary text-primary-foreground"
                                            : "bg-muted text-foreground"
                                    )}
                                >
                                    {message.content}
                                </motion.div>
                            ))}
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex gap-1 px-4 py-3"
                                >
                                    <span
                                        className="bg-muted-foreground rounded-full w-2 h-2 animate-bounce"
                                        style={{ animationDelay: "0ms" }}
                                    />
                                    <span
                                        className="bg-muted-foreground rounded-full w-2 h-2 animate-bounce"
                                        style={{ animationDelay: "150ms" }}
                                    />
                                    <span
                                        className="bg-muted-foreground rounded-full w-2 h-2 animate-bounce"
                                        style={{ animationDelay: "300ms" }}
                                    />
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>

                {/* Input & Model Selector */}
                <div className="p-4 border-border">
                    <form
                        onSubmit={handleSubmit}
                        className={cn(
                            "flex flex-col bg-muted/50 focus-within:bg-muted border border-border focus-within:border-primary/50 rounded-2xl transition-colors",
                            !hasWorkplace && "opacity-50 pointer-events-none"
                        )}
                    >
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={
                                hasWorkplace
                                    ? "Напишите что-нибудь..."
                                    : "Сначала создайте место работы"
                            }
                            disabled={!hasWorkplace}
                            className="bg-transparent px-4 py-4 focus:outline-none w-full text-foreground placeholder:text-muted-foreground text-sm"
                        />

                        <div className="flex justify-between items-center px-2 pb-2">
                            {/* Left Controls */}
                            <div className="flex items-center gap-1">
                                <TooltipProvider delayDuration={300}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button
                                                type="button"
                                                className="flex justify-center items-center hover:bg-background/50 rounded-lg w-8 h-8 text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                <Mic size={16} />
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="max-w-[200px] text-center">
                                            <p>Скоро появится голосовой режим — заполняйте навыки голосом, как на собеседовании</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                                {/* Divider */}
                                <div className="mx-1 bg-border w-px h-4" />

                                {/* Model Selector */}
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setIsModelPickerOpen(!isModelPickerOpen)}
                                        className="flex items-center gap-1.5 hover:bg-background/50 px-2 py-1.5 rounded-lg text-foreground text-xs transition-colors"
                                    >
                                        <span className="font-medium">{selectedModel}</span>
                                        <ChevronDown
                                            size={12}
                                            className={cn(
                                                "opacity-50 transition-transform",
                                                isModelPickerOpen && "rotate-180"
                                            )}
                                        />
                                    </button>

                                    {/* Dropdown */}
                                    <AnimatePresence>
                                        {isModelPickerOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="bottom-full left-0 z-50 absolute bg-popover/80 shadow-lg backdrop-blur-lg mb-2 p-1 border border-border rounded-lg w-48"
                                            >
                                                {MODELS.map((model) => (
                                                    <button
                                                        key={model}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedModel(model);
                                                            setIsModelPickerOpen(false);
                                                        }}
                                                        className={cn(
                                                            "px-3 py-2 rounded-md w-full text-xs text-left transition-colors",
                                                            selectedModel === model
                                                                ? "bg-primary/20 text-primary"
                                                                : "text-foreground hover:bg-muted"
                                                        )}
                                                    >
                                                        {model}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Right: Send Button */}
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading || !hasWorkplace}
                                className={cn(
                                    "flex justify-center items-center rounded-xl w-8 h-8 transition-all duration-200",
                                    input.trim() && !isLoading && hasWorkplace
                                        ? "bg-primary text-primary-foreground hover:opacity-90 shadow-sm"
                                        : "bg-muted-foreground/20 text-muted-foreground cursor-not-allowed"
                                )}
                            >
                                <ArrowUp size={16} strokeWidth={2.5} />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};
