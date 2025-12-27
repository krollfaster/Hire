"use client";

import { useState, type KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ChatInputProps {
    onSend: (text: string) => void;
    disabled?: boolean;
    placeholder?: string;
    className?: string;
}

export const ChatInput = ({
    onSend,
    disabled = false,
    placeholder = "Написать сообщение...",
    className,
}: ChatInputProps) => {
    const [value, setValue] = useState("");

    const handleSend = () => {
        const trimmed = value.trim();
        if (!trimmed || disabled) return;
        onSend(trimmed);
        setValue("");
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const canSend = value.trim().length > 0 && !disabled;

    return (
        <div className={cn("flex items-end gap-2 p-4 border-border border-t", className)}>
            <Textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={disabled}
                className="bg-muted/50 border-border rounded-xl focus-visible:ring-1 min-h-10 max-h-32 resize-none"
                rows={1}
            />
            <Button
                size="icon"
                onClick={handleSend}
                disabled={!canSend}
                className={cn(
                    "rounded-xl w-10 h-10 transition-all shrink-0",
                    canSend && "bg-primary hover:bg-primary/90"
                )}
            >
                <Send className="w-4 h-4" />
            </Button>
        </div>
    );
};
