"use client";

import { useRef, useEffect } from "react";
import { MessageSquare, Loader2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ChatInput } from "./ChatInput";
import { cn } from "@/lib/utils";
import type { Chat, ChatMessage } from "@/stores/useMessagesStore";

interface ChatWindowProps {
    chat: Chat | null;
    messages: ChatMessage[];
    currentUserId?: string;
    isLoading?: boolean;
    onSend: (text: string) => void;
    className?: string;
}

function formatMessageTime(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export const ChatWindow = ({
    chat,
    messages,
    currentUserId,
    isLoading,
    onSend,
    className
}: ChatWindowProps) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Скролл вниз при новых сообщениях
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const getInitials = (name: string | null): string => {
        if (!name) return '?';
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();
    };

    // Empty state
    if (!chat) {
        return (
            <div className={cn("flex flex-col justify-center items-center bg-background h-full", className)}>
                <div className="flex flex-col items-center gap-3 p-6 text-center">
                    <div className="flex justify-center items-center bg-muted rounded-full w-16 h-16">
                        <MessageSquare className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-semibold text-foreground">Выберите диалог</h3>
                        <p className="max-w-[250px] text-muted-foreground text-sm">
                            Выберите диалог из списка слева, чтобы начать общение
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const { companion, context } = chat;
    const initials = getInitials(companion.fullName);

    const getContextLabel = (): string => {
        if (context.type === 'profession' && context.data) {
            return context.data.name || 'Профессия';
        }
        if (context.type === 'search' && context.data) {
            return context.data.query || context.data.name || 'Поиск';
        }
        return '';
    };

    return (
        <div className={cn("flex flex-col bg-background h-full", className)}>
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 shrink-0">
                <Avatar className="w-10 h-10">
                    <AvatarImage src={companion.avatarUrl || undefined} alt={companion.fullName || 'User'} />
                    <AvatarFallback className="bg-muted font-medium text-foreground text-sm">
                        {initials}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-foreground truncate">
                        {companion.fullName || 'Пользователь'}
                    </h2>
                    <p className="text-muted-foreground text-sm truncate">
                        {getContextLabel()}
                    </p>
                </div>
            </div>

            <Separator />

            {/* Messages */}
            <ScrollArea className="flex-1">
                {isLoading ? (
                    <div className="flex justify-center items-center py-8">
                        <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col justify-center items-center px-4 py-8 text-muted-foreground text-center">
                        <p className="text-sm">Нет сообщений</p>
                        <p className="mt-1 text-xs">Напишите первое сообщение</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3 p-4">
                        {messages.map((message) => {
                            const isOwn = message.senderId === currentUserId;

                            return (
                                <div
                                    key={message.id}
                                    className={cn(
                                        "flex gap-2 max-w-[80%]",
                                        isOwn ? "ml-auto flex-row-reverse" : "mr-auto"
                                    )}
                                >
                                    {!isOwn && (
                                        <Avatar className="w-8 h-8 shrink-0">
                                            <AvatarImage
                                                src={message.sender.avatarUrl || undefined}
                                                alt={message.sender.fullName || 'User'}
                                            />
                                            <AvatarFallback className="bg-muted text-xs">
                                                {getInitials(message.sender.fullName)}
                                            </AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div
                                        className={cn(
                                            "px-3 py-2 rounded-2xl",
                                            isOwn
                                                ? "bg-primary text-primary-foreground rounded-br-md"
                                                : "bg-muted text-foreground rounded-bl-md",
                                            message.isOptimistic && "opacity-70"
                                        )}
                                    >
                                        <p className="text-sm break-words whitespace-pre-wrap">
                                            {message.content}
                                        </p>
                                        <p className={cn(
                                            "mt-1 text-[10px]",
                                            isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                                        )}>
                                            {formatMessageTime(message.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </ScrollArea>

            {/* Input */}
            <ChatInput onSend={onSend} />
        </div>
    );
};
