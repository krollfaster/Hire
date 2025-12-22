"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Chat } from "@/stores/useMessagesStore";

interface ChatListProps {
    chats: Chat[];
    activeId: string | null;
    onSelect: (id: string) => void;
    isLoading?: boolean;
    className?: string;
}

function formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
        return 'Вчера';
    } else if (diffDays < 7) {
        return date.toLocaleDateString('ru-RU', { weekday: 'short' });
    } else {
        return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    }
}

export const ChatList = ({
    chats,
    activeId,
    onSelect,
    isLoading,
    className,
}: ChatListProps) => {
    const getInitials = (name: string | null): string => {
        if (!name) return '?';
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();
    };

    const getContextLabel = (chat: Chat): string => {
        if (chat.context.type === 'profession' && chat.context.data) {
            return chat.context.data.name || 'Профессия';
        }
        if (chat.context.type === 'search' && chat.context.data) {
            return chat.context.data.query || chat.context.data.name || 'Поиск';
        }
        return '';
    };

    return (
        <div className={cn("flex flex-col bg-sidebar border-border border-r h-full", className)}>
            {/* Header */}
            <div className="px-4 py-4 shrink-0">
                <h1 className="font-semibold text-foreground text-lg">Сообщения</h1>
            </div>

            {/* List */}
            <ScrollArea className="flex-1">
                {isLoading ? (
                    <div className="flex justify-center items-center py-8">
                        <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
                    </div>
                ) : chats.length === 0 ? (
                    <div className="flex flex-col justify-center items-center px-4 py-8 text-muted-foreground text-center">
                        <p className="text-sm">Нет диалогов</p>
                        <p className="mt-1 text-xs">Ваши чаты появятся здесь</p>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {chats.map((chat) => {
                            const { companion, lastMessage, unreadCount, updatedAt } = chat;
                            const isActive = chat.id === activeId;
                            const initials = getInitials(companion.fullName);
                            const contextLabel = getContextLabel(chat);

                            return (
                                <button
                                    key={chat.id}
                                    onClick={() => onSelect(chat.id)}
                                    className={cn(
                                        "flex items-start gap-3 px-4 py-3 text-left transition-colors",
                                        "hover:bg-muted/50",
                                        isActive && "bg-muted"
                                    )}
                                >
                                    {/* Avatar */}
                                    <Avatar className="w-10 h-10 shrink-0">
                                        <AvatarImage src={companion.avatarUrl || undefined} alt={companion.fullName || 'User'} />
                                        <AvatarFallback className="bg-muted-foreground/10 font-medium text-foreground text-sm">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center gap-2">
                                            <span className={cn(
                                                "font-medium text-sm truncate",
                                                unreadCount > 0 ? "text-foreground" : "text-foreground"
                                            )}>
                                                {companion.fullName || 'Пользователь'}
                                            </span>
                                            <span className="text-muted-foreground text-xs shrink-0">
                                                {formatTime(lastMessage?.createdAt || updatedAt)}
                                            </span>
                                        </div>
                                        {contextLabel && (
                                            <p className="text-muted-foreground text-xs truncate">
                                                {contextLabel}
                                            </p>
                                        )}
                                        <div className="flex justify-between items-center gap-2 mt-1">
                                            <p className={cn(
                                                "text-sm truncate",
                                                unreadCount > 0 ? "text-foreground font-medium" : "text-muted-foreground"
                                            )}>
                                                {lastMessage?.content || "Нет сообщений"}
                                            </p>
                                            {unreadCount > 0 && (
                                                <Badge
                                                    variant="default"
                                                    className="px-1.5 rounded-full min-w-5 h-5 font-medium text-xs shrink-0"
                                                >
                                                    {unreadCount}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </ScrollArea>
        </div>
    );
};
