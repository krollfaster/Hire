import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { STORAGE_KEYS, createLocalStorageHelper } from './constants';
import type { UserRole } from './constants';

// Хелпер для работы с последним активным чатом
const lastActiveProfessionStorage = createLocalStorageHelper<string>(
    STORAGE_KEYS.LAST_ACTIVE_PROFESSION
);

// Типы для чата
interface ChatUser {
    id: string;
    fullName: string | null;
    avatarUrl: string | null;
}

interface ChatContext {
    type: 'profession' | 'search';
    data: {
        id: string;
        name?: string | null;
        query?: string;
        grade?: string | null;
    } | null;
}

interface LastMessage {
    id: string;
    content: string;
    senderId: string;
    isRead: boolean;
    createdAt: string;
}

export interface Chat {
    id: string;
    companion: ChatUser;
    context: ChatContext;
    lastMessage: LastMessage | null;
    unreadCount: number;
    updatedAt: string;
}

export interface ChatMessage {
    id: string;
    chatId: string;
    senderId: string;
    content: string;
    isRead: boolean;
    createdAt: string;
    sender: ChatUser;
    isOptimistic?: boolean;
}

interface MessagesState {
    chats: Chat[];
    activeChat: Chat | null;
    activeChatMessages: ChatMessage[];
    messagesCache: Record<string, ChatMessage[]>;
    isLoading: boolean;
    isLoadingMessages: boolean;

    // Actions
    fetchChats: (mode?: UserRole, contextId?: string) => Promise<void>;
    setActiveChat: (chatId: string | null) => Promise<void>;
    sendMessage: (content: string, currentUserId: string) => Promise<void>;
    createChat: (professionId: string, initialMessage?: string) => Promise<Chat>;
    markAsRead: (chatId: string) => void;
    clearAll: () => void;
}

const INITIAL_STATE: Omit<MessagesState, 'fetchChats' | 'setActiveChat' | 'sendMessage' | 'createChat' | 'markAsRead' | 'clearAll'> = {
    chats: [],
    activeChat: null,
    activeChatMessages: [],
    messagesCache: {},
    isLoading: false,
    isLoadingMessages: false,
};

// Хелпер для создания optimistic сообщения
const createOptimisticMessage = (
    chatId: string,
    content: string,
    currentUserId: string
): ChatMessage => ({
    id: `temp-${Date.now()}`,
    chatId,
    senderId: currentUserId,
    content: content.trim(),
    isRead: false,
    createdAt: new Date().toISOString(),
    sender: {
        id: currentUserId,
        fullName: null,
        avatarUrl: null,
    },
    isOptimistic: true,
});

export const useMessagesStore = create<MessagesState>()(
    persist(
        (set, get) => ({
            ...INITIAL_STATE,

            fetchChats: async (mode: UserRole = 'candidate', contextId?: string) => {
                // Сбрасываем чаты при смене контекста и показываем лоадер
                set({ chats: [], isLoading: true });

                try {
                    const contextParam = mode === 'recruiter'
                        ? (contextId ? `&researcherSearchId=${contextId}` : '')
                        : (contextId ? `&professionId=${contextId}` : '');

                    const response = await fetch(`/api/messages?mode=${mode}${contextParam}`);

                    if (!response.ok) {
                        throw new Error('Failed to fetch chats');
                    }

                    const data = await response.json();
                    set({ chats: data.chats || [], isLoading: false });
                } catch (error) {
                    console.error('Failed to fetch chats:', error);
                    set({ chats: [], isLoading: false });
                }
            },

            setActiveChat: async (chatId) => {
                if (!chatId) {
                    set({ activeChat: null, activeChatMessages: [] });
                    return;
                }

                const { chats, messagesCache } = get();
                const chat = chats.find((c) => c.id === chatId) || null;

                // Stale-While-Revalidate: сразу показываем данные из кэша если есть
                const cachedMessages = messagesCache[chatId];
                if (cachedMessages) {
                    set({
                        activeChat: chat,
                        activeChatMessages: cachedMessages,
                        isLoadingMessages: false,
                    });
                } else {
                    set({ activeChat: chat, isLoadingMessages: true });
                }

                try {
                    // В фоне загружаем свежие данные
                    const response = await fetch(`/api/messages/${chatId}`);

                    if (!response.ok) {
                        throw new Error('Failed to fetch messages');
                    }

                    const data = await response.json();
                    const messages = data.messages || [];

                    // Обновляем состояние и кэш
                    set((state) => ({
                        activeChatMessages: messages,
                        messagesCache: {
                            ...state.messagesCache,
                            [chatId]: messages,
                        },
                        activeChat: chat ? {
                            ...chat,
                            companion: data.chat?.companion || chat.companion,
                            context: data.chat?.context || chat.context,
                        } : null,
                        isLoadingMessages: false,
                    }));

                    // Обновляем счётчик непрочитанных в списке чатов
                    set((state) => ({
                        chats: state.chats.map((c) =>
                            c.id === chatId ? { ...c, unreadCount: 0 } : c
                        ),
                    }));
                } catch (error) {
                    console.error('Failed to fetch messages:', error);
                    // Если была ошибка и не было кэша, сбрасываем loading
                    if (!get().activeChatMessages.length) {
                        set({ isLoadingMessages: false });
                    }
                }
            },

            sendMessage: async (content, currentUserId) => {
                const { activeChat } = get();

                if (!activeChat || !content.trim()) {
                    return;
                }

                const optimisticMessage = createOptimisticMessage(
                    activeChat.id,
                    content,
                    currentUserId
                );
                const tempId = optimisticMessage.id;

                // Optimistic Update UI
                set((state) => {
                    const newMessages = [...state.activeChatMessages, optimisticMessage];
                    return {
                        activeChatMessages: newMessages,
                        messagesCache: {
                            ...state.messagesCache,
                            [activeChat.id]: newMessages,
                        },
                    };
                });

                try {
                    const response = await fetch(`/api/messages/${activeChat.id}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ content }),
                    });

                    if (!response.ok) {
                        throw new Error('Failed to send message');
                    }

                    const data = await response.json();
                    const realMessage = data.message;

                    // Заменяем optimistic сообщение на реальное
                    set((state) => {
                        const newMessages = state.activeChatMessages.map((m) =>
                            m.id === tempId ? realMessage : m
                        );

                        return {
                            activeChatMessages: newMessages,
                            messagesCache: {
                                ...state.messagesCache,
                                [activeChat.id]: newMessages,
                            },
                            chats: state.chats.map((c) =>
                                c.id === activeChat.id
                                    ? {
                                        ...c,
                                        lastMessage: {
                                            id: realMessage.id,
                                            content: realMessage.content,
                                            senderId: realMessage.senderId,
                                            isRead: false,
                                            createdAt: realMessage.createdAt,
                                        },
                                        updatedAt: new Date().toISOString(),
                                    }
                                    : c
                            ),
                        };
                    });
                } catch (error) {
                    console.error('Failed to send message:', error);
                    // Откат optimistic update в случае ошибки
                    set((state) => {
                        const newMessages = state.activeChatMessages.filter(
                            (m) => m.id !== tempId
                        );
                        return {
                            activeChatMessages: newMessages,
                            messagesCache: {
                                ...state.messagesCache,
                                [activeChat.id]: newMessages,
                            },
                        };
                    });
                }
            },

            createChat: async (professionId: string, initialMessage?: string) => {
                set({ isLoading: true });

                try {
                    const response = await fetch('/api/messages/start', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ professionId, initialMessage }),
                    });

                    if (!response.ok) {
                        const error = await response.json();
                        throw new Error(error.error || 'Failed to create chat');
                    }

                    const data = await response.json();
                    const newChat = data.chat;

                    // Добавляем или обновляем чат в списке
                    set((state) => {
                        const existingChatIndex = state.chats.findIndex(
                            (c) => c.id === newChat.id
                        );
                        let updatedChats = [...state.chats];

                        if (existingChatIndex >= 0) {
                            updatedChats[existingChatIndex] = {
                                ...updatedChats[existingChatIndex],
                                ...newChat,
                            };
                        } else {
                            updatedChats = [newChat, ...updatedChats];
                        }

                        return {
                            chats: updatedChats,
                            activeChat: newChat,
                            activeChatMessages: [],
                        };
                    });

                    // Подгружаем сообщения для активного чата
                    await get().setActiveChat(newChat.id);

                    return newChat;
                } catch (error) {
                    console.error('Failed to create chat:', error);
                    throw error;
                } finally {
                    set({ isLoading: false });
                }
            },

            markAsRead: (chatId) => {
                set((state) => ({
                    chats: state.chats.map((c) =>
                        c.id === chatId ? { ...c, unreadCount: 0 } : c
                    ),
                }));
            },

            clearAll: () => set(INITIAL_STATE),
        }),
        {
            name: STORAGE_KEYS.MESSAGES,
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                chats: state.chats,
                messagesCache: state.messagesCache,
            }),
        }
    )
);
