"use client";

import { useState, KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface ChatInputProps {
    onSend: (text: string) => void;
    disabled?: boolean;
}

export const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
    const [value, setValue] = useState("");

    const handleSend = () => {
        if (!value.trim()) return;
        onSend(value.trim());
        setValue("");
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex items-center gap-2 p-4 border-t border-border">
            <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Напишите сообщение..."
                disabled={disabled}
                className="flex-1 bg-background"
            />
            <Button
                size="icon"
                onClick={handleSend}
                disabled={disabled || !value.trim()}
            >
                <Send size={18} />
            </Button>
           
        </div>
    );
};

