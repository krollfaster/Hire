"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus,
    ArrowUp,
    Mic,
    Zap,
    Sparkles,
    Brain,
    Lock,
    ChevronDown,
    Check,
    Trash2,
    X,

    type LucideIcon,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTraitsStore, TraitAction, NodeType, LegacyCategory, Trait } from "@/stores/useTraitsStore";

import { useChatStore } from "@/stores/useChatStore";
import { useProfessionStore } from "@/stores/useProfessionStore";
import { Badge } from "@/components/ui/badge";
import {
    ButtonGroup,
    ButtonGroupSeparator,
    ButtonGroupText,
} from "@/components/ui/button-group";


type ModelOption = {
    id: string;
    label: string;
    provider: string;
    icon: LucideIcon;
    isPremium?: boolean;
};

const MODEL_OPTIONS: ModelOption[] = [
    {
        id: "google/gemini-2.0-flash-001",
        label: "Gemini Flash",
        provider: "Google",
        icon: Sparkles,
    },
    {
        id: "nex-agi/deepseek-v3.1-nex-n1:free",
        label: "DeepSeek V3.1",
        provider: "DeepSeek",
        icon: Sparkles,
    },
    {
        id: "mistralai/devstral-2512:free",
        label: "Devstral 2512",
        provider: "Mistral",
        icon: Sparkles,
    },
    {
        id: "openai/gpt-4.1",
        label: "GPT-5.2",
        provider: "OpenAI",
        icon: Sparkles,
        isPremium: true,
    },
    {
        id: "meta-llama/llama-3.3-70b-instruct",
        label: "Gemini Pro 3",
        provider: "Google",
        icon: Brain,
        isPremium: true,
    },
];

// STAR-Graph node type configuration (8 types + legacy support)
type NodeTypeOrLegacy = NodeType | LegacyCategory;

const nodeTypeConfig: Record<NodeTypeOrLegacy, {
    label: string;
    labelSingular: string;
    color: string;
    bgColor: string;
    borderColor: string;
}> = {
    // Layer 1: Assets (синие оттенки)
    ROLE: {
        label: "Роли",
        labelSingular: "Роль",
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/30",
    },
    DOMAIN: {
        label: "Домены",
        labelSingular: "Домен",
        color: "text-indigo-500",
        bgColor: "bg-indigo-500/10",
        borderColor: "border-indigo-500/30",
    },
    SKILL: {
        label: "Навыки",
        labelSingular: "Навык",
        color: "text-sky-500",
        bgColor: "bg-sky-500/10",
        borderColor: "border-sky-500/30",
    },
    // Layer 2: Actions (оранжевые оттенки)
    CHALLENGE: {
        label: "Вызовы",
        labelSingular: "Вызов",
        color: "text-orange-500",
        bgColor: "bg-orange-500/10",
        borderColor: "border-orange-500/30",
    },
    ACTION: {
        label: "Действия",
        labelSingular: "Действие",
        color: "text-amber-500",
        bgColor: "bg-amber-500/10",
        borderColor: "border-amber-500/30",
    },
    // Layer 3: Impact (зелёные оттенки)
    METRIC: {
        label: "Метрики",
        labelSingular: "Метрика",
        color: "text-green-500",
        bgColor: "bg-green-500/10",
        borderColor: "border-green-500/30",
    },
    ARTIFACT: {
        label: "Артефакты",
        labelSingular: "Артефакт",
        color: "text-emerald-500",
        bgColor: "bg-emerald-500/10",
        borderColor: "border-emerald-500/30",
    },
    // Layer 4: Attributes (фиолетовые оттенки)
    ATTRIBUTE: {
        label: "Атрибуты",
        labelSingular: "Атрибут",
        color: "text-purple-500",
        bgColor: "bg-purple-500/10",
        borderColor: "border-purple-500/30",
    },
    // Legacy categories for backward compatibility
    skills: {
        label: "Навыки",
        labelSingular: "Навык",
        color: "text-sky-500",
        bgColor: "bg-sky-500/10",
        borderColor: "border-sky-500/30",
    },
    context: {
        label: "Контекст",
        labelSingular: "Контекст",
        color: "text-indigo-500",
        bgColor: "bg-indigo-500/10",
        borderColor: "border-indigo-500/30",
    },
    artifacts: {
        label: "Артефакты",
        labelSingular: "Артефакт",
        color: "text-emerald-500",
        bgColor: "bg-emerald-500/10",
        borderColor: "border-emerald-500/30",
    },
    attributes: {
        label: "Атрибуты",
        labelSingular: "Атрибут",
        color: "text-purple-500",
        bgColor: "bg-purple-500/10",
        borderColor: "border-purple-500/30",
    },
};

interface Message {
    id: string;
    content: string;
    role: "user" | "assistant";
    timestamp: Date;
    actions?: TraitAction[];
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
                    className="z-50 fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-card shadow-xl p-6 border border-border rounded-2xl w-[400px]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-foreground text-lg">
                                {workplace ? "Редактировать место работы" : "Новое место работы"}
                            </h3>
                            <div className="flex items-center gap-1">
                                {workplace && onDelete && (
                                    <button
                                        onClick={handleDelete}
                                        className="hover:bg-destructive/10 p-1.5 rounded-lg text-muted-foreground hover:text-destructive transition-colors"
                                        title="Удалить"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                                <button
                                    onClick={onClose}
                                    className="hover:bg-muted p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block mb-1.5 font-medium text-foreground text-sm">
                                    Название компании *
                                </label>
                                <input
                                    type="text"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    placeholder="Например: Google"
                                    className="bg-background px-4 py-3 border border-border focus:border-primary/50 rounded-xl focus:outline-none w-full text-foreground placeholder:text-muted-foreground transition-colors"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block mb-1.5 font-medium text-foreground text-sm">
                                    Должность *
                                </label>
                                <input
                                    type="text"
                                    value={position}
                                    onChange={(e) => setPosition(e.target.value)}
                                    placeholder="Например: Senior Developer"
                                    className="bg-background px-4 py-3 border border-border focus:border-primary/50 rounded-xl focus:outline-none w-full text-foreground placeholder:text-muted-foreground transition-colors"
                                    required
                                />
                            </div>

                            <div className="gap-3 grid grid-cols-2">
                                <div>
                                    <label className="block mb-1.5 font-medium text-foreground text-sm">
                                        Начало работы
                                    </label>
                                    <input
                                        type="text"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        placeholder="Янв 2020"
                                        className="bg-background px-4 py-3 border border-border focus:border-primary/50 rounded-xl focus:outline-none w-full text-foreground placeholder:text-muted-foreground transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1.5 font-medium text-foreground text-sm">
                                        Конец работы
                                    </label>
                                    <input
                                        type="text"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        placeholder="Настоящее время"
                                        className="bg-background px-4 py-3 border border-border focus:border-primary/50 rounded-xl focus:outline-none w-full text-foreground placeholder:text-muted-foreground transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 hover:bg-muted px-4 py-3 border border-border rounded-xl text-foreground transition-colors"
                                >
                                    Отмена
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-primary hover:opacity-90 px-4 py-3 rounded-xl font-medium text-primary-foreground transition-opacity"
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
    const { messages, setMessages } = useChatStore();
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [selectedModel, setSelectedModel] = useState(
        MODEL_OPTIONS.find((model) => !model.isPremium)?.id || MODEL_OPTIONS[0].id
    );
    const [isModelPickerOpen, setIsModelPickerOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const traits = useTraitsStore(state => state.traits);
    const applyActions = useTraitsStore(state => state.applyActions);
    const getContextForAI = useTraitsStore(state => state.getContextForAI);
    const setExternalHighlightIds = useTraitsStore(state => state.setExternalHighlightIds);
    const deleteTraits = useTraitsStore(state => state.deleteTraits);



    // Get active profession for context
    const { activeProfession, setSetupModalOpen } = useProfessionStore();


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleInputClick = () => {
        if (!activeProfession) {
            setSetupModalOpen(true);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

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

            // Prepare profession context
            const professionContext = activeProfession ? {
                name: activeProfession.name,
                grade: activeProfession.grade,
            } : null;

            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: newMessages.map(m => ({ role: m.role, content: m.content })),
                    model: selectedModel,
                    traitsContext,
                    professionContext,
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
                actions: data.actions as TraitAction[],
            };

            setMessages([...newMessages, assistantMessage]);

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
            setMessages([...messages, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="flex flex-col bg-sidebar pt-5 border-border border-l w-[355px] h-full">


                {/* Messages / Empty State */}
                <div className="flex-1 space-y-4 p-5 overflow-y-auto">
                    {messages.length === 0 ? (
                        <div className="flex flex-col justify-center items-center px-4 h-full text-center">
                            <p className="text-muted-foreground text-sm">
                                Опишите свой опыт работы и достижения. ИИ поможет выделить ключевые моменты для резюме.
                            </p>
                        </div>
                    ) : (
                        <>
                            {messages.map((message) => {
                                // Logic to display badges if there are created traits
                                const createdTraits = message.actions?.filter(
                                    (a) => a.type === "create" && a.data
                                ) || [];

                                let content: React.ReactNode = message.content;

                                // Filter actions to only show badges for traits that still exist
                                const validCreatedTraits = createdTraits.filter(action =>
                                    action.type === 'create' && traits.some(t => t.id === action.data.id)
                                );

                                if (message.role === "assistant" && validCreatedTraits.length > 0) {
                                    const counts = validCreatedTraits.reduce((acc, action) => {
                                        if (action.type === "create") {
                                            const nodeType = action.data.type;
                                            acc[nodeType] = (acc[nodeType] || 0) + 1;
                                        }
                                        return acc;
                                    }, {} as Record<NodeTypeOrLegacy, number>);

                                    content = (
                                        <div className="flex flex-wrap gap-2">
                                            {Object.entries(counts).map(([type, count]) => {
                                                const nodeType = type as NodeTypeOrLegacy;
                                                const config = nodeTypeConfig[nodeType];
                                                if (!config) return null;

                                                // Get IDs for this type in this message to pass to highlight/delete
                                                const traitIds = validCreatedTraits
                                                    .filter(a => a.type === "create" && a.data?.type === nodeType)
                                                    .map(a => (a as { type: "create"; data: Trait }).data.id);


                                                return (
                                                    <Badge
                                                        key={nodeType}
                                                        variant="outline"
                                                        className={cn(
                                                            "group/badge relative gap-1.5 py-1 pr-8 pl-3 overflow-hidden font-normal text-sm transition-all duration-300 cursor-default",
                                                            config.color,
                                                            config.borderColor,
                                                            config.bgColor
                                                        )}
                                                        onMouseEnter={() => setExternalHighlightIds(traitIds, 'view')}
                                                        onMouseLeave={() => setExternalHighlightIds([])}
                                                    >
                                                        <span className="font-bold">+{count}</span>
                                                        {count === 1 ? config.labelSingular : config.label}

                                                        {/* Close button always visible, minimal style */}
                                                        <button
                                                            className={cn(
                                                                "top-1/2 right-1.5 absolute flex justify-center items-center p-1 rounded-full -translate-y-1/2 cursor-pointer",
                                                                "text-muted-foreground/50 hover:text-destructive transition-colors duration-200"
                                                            )}

                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                deleteTraits(traitIds);
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.stopPropagation();
                                                                setExternalHighlightIds(traitIds, 'delete');
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.stopPropagation();
                                                                // When leaving delete button but still in badge, revert to view mode
                                                                setExternalHighlightIds(traitIds, 'view');
                                                            }}
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </Badge>


                                                );
                                            })}
                                        </div>
                                    );
                                }

                                return (
                                    <motion.div
                                        key={message.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={cn(
                                            "px-4 py-3 rounded-2xl max-w-[100%] text-sm",
                                            message.role === "user"
                                                ? "ml-auto text-muted-foreground px-0 py-0"
                                                : "bg-muted text-foreground",
                                            // Remove background if displaying badges
                                            message.role === "assistant" && createdTraits.length > 0 && "bg-transparent p-0"
                                        )}
                                    >
                                        {content}
                                    </motion.div>
                                );
                            })}
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
                            "flex flex-col bg-muted/50 focus-within:bg-muted border border-border focus-within:border-primary/50 rounded-2xl transition-colors"
                        )}
                    >
                        <input
                            type="text"
                            value={input}
                            onClick={handleInputClick}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Напишите что-нибудь..."
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
                                        {(() => {
                                            const currentModel =
                                                MODEL_OPTIONS.find((model) => model.id === selectedModel) ||
                                                MODEL_OPTIONS[0];
                                            const Icon = currentModel.icon;
                                            return (
                                                <>
                                                    <Icon size={14} className="text-muted-foreground" />
                                                    <span className="font-medium truncate">
                                                        {currentModel.label}
                                                    </span>
                                                    <span className="text-[11px] text-muted-foreground truncate">
                                                        · {currentModel.provider}
                                                    </span>
                                                </>
                                            );
                                        })()}
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
                                                className="bottom-full left-0 z-50 absolute bg-popover/80 shadow-lg backdrop-blur-lg mb-2 p-1 border border-border rounded-lg w-56"
                                            >
                                                {MODEL_OPTIONS.map((model) => {
                                                    const Icon = model.icon;
                                                    const isSelected = selectedModel === model.id;
                                                    const isLocked = model.isPremium;
                                                    const buttonClasses = cn(
                                                        "flex items-center gap-2 px-3 py-2.5 rounded-md w-full text-left transition-colors",
                                                        isLocked
                                                            ? "opacity-60 cursor-not-allowed"
                                                            : "hover:bg-muted",
                                                        isSelected && !isLocked && "bg-primary/15 text-primary"
                                                    );

                                                    const content = (
                                                        <button
                                                            key={model.id}
                                                            type="button"
                                                            aria-disabled={isLocked}
                                                            onClick={() => {
                                                                if (isLocked) return;
                                                                setSelectedModel(model.id);
                                                                setIsModelPickerOpen(false);
                                                            }}
                                                            className={buttonClasses}
                                                        >
                                                            <Icon
                                                                size={16}
                                                                className={cn(
                                                                    "text-muted-foreground",
                                                                    isSelected && !isLocked && "text-primary"
                                                                )}
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <div className="font-medium text-sm truncate">
                                                                    {model.label}
                                                                </div>
                                                                <div className="text-[11px] text-muted-foreground truncate">
                                                                    {model.provider}
                                                                    {isLocked ? " · Подписка" : ""}
                                                                </div>
                                                            </div>
                                                            {isLocked ? (
                                                                <Lock size={14} className="text-muted-foreground" />
                                                            ) : (
                                                                isSelected && <Check size={14} />
                                                            )}
                                                        </button>
                                                    );

                                                    return isLocked ? (
                                                        <TooltipProvider key={model.id} delayDuration={150}>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>{content}</TooltipTrigger>
                                                                <TooltipContent side="right" className="text-xs">
                                                                    Модель доступна только по подписке
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    ) : (
                                                        content
                                                    );
                                                })}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Right: Send Button */}

                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className={cn(
                                    "flex justify-center items-center rounded-xl w-8 h-8 transition-all duration-200",
                                    input.trim() && !isLoading
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
