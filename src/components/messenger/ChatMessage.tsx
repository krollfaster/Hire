"use client";

import { cn } from "@/lib/utils";
import type { Message } from "@/data/mock";

interface ChatMessageProps {
    message: Message;
    className?: string;
}

export const ChatMessage = ({ message, className }: ChatMessageProps) => {
    const isUser = message.sender === "user";

    return (
        <div
            className={cn(
                "flex w-full",
                isUser ? "justify-end" : "justify-start",
                className
            )}
        >
            <div
                className={cn(
                    "px-4 py-2.5 rounded-2xl max-w-[80%] text-sm",
                    isUser
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                )}
            >
                <p className="leading-relaxed">{message.text}</p>
                <span
                    className={cn(
                        "block mt-1 text-[11px]",
                        isUser ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}
                >
                    {message.timestamp}
                </span>
            </div>
        </div>
    );
};
