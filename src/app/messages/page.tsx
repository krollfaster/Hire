"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout";
import { ChatList, ChatWindow } from "@/components/messenger";
import { useMessagesStore } from "@/stores/useMessagesStore";
import { useRoleStore } from "@/stores/useRoleStore";
import { createClient } from "@/lib/supabase/client";

function MessagesContent() {
    const searchParams = useSearchParams();
    const { role } = useRoleStore();
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

    // Загружаем чаты при монтировании и при смене режима
    useEffect(() => {
        // Сбрасываем активный чат при смене режима
        setActiveChat(null);
        fetchChats(role);
    }, [fetchChats, role, setActiveChat]);

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

    const handleSelectChat = (chatId: string) => {
        setActiveChat(chatId);
    };

    const handleSend = (text: string) => {
        if (currentUserId) {
            sendMessage(text, currentUserId);
        }
    };

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
