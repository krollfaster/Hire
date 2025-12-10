"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

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
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            content: input.trim(),
            role: "user",
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        // Имитация ответа ИИ
        setTimeout(() => {
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: "Спасибо за информацию! Я проанализирую ваш опыт и выделю ключевые навыки для резюме.",
                role: "assistant",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, assistantMessage]);
            setIsLoading(false);
        }, 1000);
    };

    return (
        <div className="flex flex-col bg-background border-border border-r w-[400px] h-full">
            {/* Header */}
            <div className="flex items-center px-6 border-border border-b h-16">
                <h2 className="font-bold text-foreground text-l">Чат с ИИ</h2>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-4 p-4 overflow-y-auto">
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

            {/* Input */}
            <div className="p-4 border-border">
                <form onSubmit={handleSubmit} className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Опишите свой опыт..."
                        className="bg-muted px-4 py-3 pr-12 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary w-full text-foreground placeholder:text-muted-foreground text-sm"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className={cn(
                            "top-1/2 right-2 absolute p-2 rounded-lg transition-colors -translate-y-1/2",
                            input.trim() && !isLoading
                                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                : "text-muted-foreground"
                        )}
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
};
