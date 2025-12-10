"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, SlidersHorizontal, ArrowUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
const MODELS = ["gemini-flash-latest", "gemini-2.0-flash-exp", "gemini-pro-latest"];

interface Message {
    id: string;
    content: string;
    role: "user" | "assistant";
    timestamp: Date;
}

export const ChatPanel = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [selectedModel, setSelectedModel] = useState(MODELS[0]);
    const [isModelPickerOpen, setIsModelPickerOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

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
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: newMessages,
                    model: selectedModel,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || "Failed to fetch response");
            }

            const data = await response.json();

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: data.content,
                role: "assistant",
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            console.error(error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: "Извините, произошла ошибка при обращении к ИИ.",
                role: "assistant",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col bg-background border-border border-r w-[400px] h-full">
            {/* Header */}
            <div className="flex items-center px-6 border-border border-b h-16">
                <h2 className="font-bold text-foreground text-l">Опишите ваши достижения</h2>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-4 p-5 overflow-y-auto">
                {messages.length === 0 && (
                    <div className="flex flex-col justify-center items-center h-full text-center">
                        <p className="text-muted-foreground text-sm">
                            Опишите свой опыт работы, навыки и достижения.
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
                        <span className="bg-muted-foreground rounded-full w-2 h-2 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="bg-muted-foreground rounded-full w-2 h-2 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="bg-muted-foreground rounded-full w-2 h-2 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input & Model Selector */}
            <div className="p-4 border-border">
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col bg-muted/50 focus-within:bg-muted border border-border focus-within:border-primary/50 rounded-2xl transition-colors"
                >
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Напишите что нибудь...)"
                        className="bg-transparent px-4 py-4 focus:outline-none w-full text-foreground placeholder:text-muted-foreground text-sm"
                    />

                    <div className="flex justify-between items-center px-2 pb-2">
                        {/* Left Controls */}
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                className="flex justify-center items-center hover:bg-background/50 rounded-lg w-8 h-8 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <Plus size={18} />
                            </button>
                            <button
                                type="button"
                                className="flex justify-center items-center hover:bg-background/50 rounded-lg w-8 h-8 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <SlidersHorizontal size={16} />
                            </button>

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
                                        className={cn("opacity-50 transition-transform", isModelPickerOpen && "rotate-180")}
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
    );
};
