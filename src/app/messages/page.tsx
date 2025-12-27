"use client";

import React, { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout";
import { ChatList, ChatWindow } from "@/components/messenger";
import { useMessagesStore } from "@/stores/useMessagesStore";
import { useRoleStore } from "@/stores/useRoleStore";
import { useProfessionStore } from "@/stores/useProfessionStore";
import { useResearcherSearchStore } from "@/stores/useResearcherSearchStore";
import { createClient } from "@/lib/supabase/client";

function MessagesContent() {
    const searchParams = useSearchParams();
    const { role } = useRoleStore();
    const { activeProfession } = useProfessionStore();
    const { activeSearch } = useResearcherSearchStore();
    const {
        chats,
        activeChat,
        activeChatMessages,
        isLoading,
        isLoadingMessages,
        fetchChats,
        setActiveChat,
        sendMessage,
    } = useMessagesStore();

    // Загружаем чаты при монтировании и при смене режима или контекста
    useEffect(() => {
        // Сбрасываем активный чат при смене режима/контекста
        setActiveChat(null);
        const contextId = role === 'recruiter'
            ? activeSearch?.id
            : activeProfession?.id;
        fetchChats(role, contextId);
    }, [fetchChats, role, setActiveChat, activeProfession?.id, activeSearch?.id]);

    // Открываем чат если передан chatId в URL
    useEffect(() => {
        const chatId = searchParams.get('chatId');
        if (chatId && chats.length > 0 && !activeChat) {
            setActiveChat(chatId);
        }
    }, [searchParams, chats.length, activeChat, setActiveChat]);

    // Получаем текущего пользователя для определения своих сообщений
    const [currentUserId, setCurrentUserId] = useState<string | undefined>();

    useEffect(() => {
        const getUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setCurrentUserId(user.id);
            }
        };
        getUser();
    }, []);

    const handleSelectChat = useCallback((chatId: string) => {
        setActiveChat(chatId);
    }, [setActiveChat]);

    const handleSend = useCallback((text: string) => {
        if (currentUserId) {
            sendMessage(text, currentUserId);
        }
    }, [currentUserId, sendMessage]);

    return (
        <div className="flex w-full h-full overflow-hidden">
            {/* Список чатов */}
            <div className="w-[425px] min-w-[300px] shrink-0">
                <ChatList
                    chats={chats}
                    activeId={activeChat?.id ?? null}
                    onSelect={handleSelectChat}
                    isLoading={isLoading}
                />
            </div>

            {/* Область переписки */}
            <div className="flex-1 w-full min-w-0">
                <ChatWindow
                    chat={activeChat}
                    messages={activeChatMessages}
                    currentUserId={currentUserId}
                    isLoading={isLoadingMessages}
                    onSend={handleSend}
                />
            </div>
        </div>
    );
}

export default function MessagesPage() {
    return (
        <AppShell>
            <Suspense fallback={<div className="flex justify-center items-center w-full h-full"><span className="text-muted-foreground">Загрузка...</span></div>}>
                <MessagesContent />
            </Suspense>
        </AppShell>
    );
}
