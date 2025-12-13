"use client";

import { cn } from "@/lib/utils";
import { Message } from "@/data/mock";

interface ChatMessageProps {
    message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
    const isUser = message.sender === "user";

    return (
        <div
            className={cn(
                "flex w-full",
                isUser ? "justify-end" : "justify-start"
            )}
        >
            <div
                className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm",
                    isUser
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                )}
            >
                <p className="whitespace-pre-wrap">{message.text}</p>
                <span
                    className={cn(
                        "block text-[10px] mt-1",
                        isUser
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                    )}
                >
                    {message.timestamp}
                </span>
            </div>
        </div>
    );
};

