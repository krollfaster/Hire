"use client";

import { useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Conversation } from "@/data/mock";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { MessageCircle } from "lucide-react";

interface ChatWindowProps {
    conversation: Conversation | null;
    onSend: (text: string) => void;
}

export const ChatWindow = ({ conversation, onSend }: ChatWindowProps) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [conversation?.messages]);

    if (!conversation) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 w-full">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    <MessageCircle className="w-8 h-8 text-muted-foreground" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                    Выберите чат
                </h3>
                <p className="text-muted-foreground text-sm max-w-sm">
                    Выберите диалог из списка слева, чтобы начать общение с рекрутером
                </p>
            </div>
        );
    }

    const { recruiter, messages } = conversation;

    return (
        <div className="flex flex-col h-full">
            {/* Шапка */}
            <div className="flex items-center gap-3 p-4 border-b border-border bg-card/50">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={recruiter.avatar} alt={recruiter.name} />
                    <AvatarFallback>
                        {recruiter.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm text-foreground truncate">
                        {recruiter.name}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">
                        {recruiter.company} · {recruiter.role}
                    </p>
                </div>
            </div>

            {/* Сообщения */}
            <ScrollArea className="flex-1 p-4">
                <div className="flex flex-col gap-3">
                    {messages.map((message) => (
                        <ChatMessage key={message.id} message={message} />
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </ScrollArea>

            {/* Поле ввода */}
            <ChatInput onSend={onSend} />
        </div>
    );
};

