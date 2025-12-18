"use client";

import { useEffect } from "react";
import { AppShell } from "@/components/layout";
import { ChatList, ChatWindow } from "@/components/messenger";
import { useMessagesStore } from "@/stores/useMessagesStore";

export default function MessagesPage() {
    const {
        conversations,
        activeConversationId,
        setActiveConversation,
        sendMessage,
        markAsRead,
    } = useMessagesStore();

    const activeConversation = conversations.find(
        (c) => c.id === activeConversationId
    ) ?? null;

    // Помечаем сообщения как прочитанные при выборе диалога
    useEffect(() => {
        if (activeConversationId) {
            markAsRead(activeConversationId);
        }
    }, [activeConversationId, markAsRead]);

    const handleSend = (text: string) => {
        if (activeConversationId) {
            sendMessage(activeConversationId, text);
        }
    };

    return (
        <AppShell>
            <div className="flex w-full h-full overflow-hidden">
                {/* Список чатов */}
                <div className="w-[425px] min-w-[300px] shrink-0">
                    <ChatList
                        conversations={conversations}
                        activeId={activeConversationId}
                        onSelect={setActiveConversation}
                    />
                </div>

                {/* Область переписки */}
                <div className="flex-1 w-full min-w-0">
                    <ChatWindow
                        conversation={activeConversation}
                        onSend={handleSend}
                    />
                </div>
            </div>
        </AppShell>
    );
}
