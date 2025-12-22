import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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
    isOptimistic?: boolean; // Флаг для оптимайстик сообщений
}

interface MessagesState {
    chats: Chat[];
    activeChat: Chat | null;
    activeChatMessages: ChatMessage[];
    messagesCache: Record<string, ChatMessage[]>; // Кэш сообщений: chatId -> messages
    isLoading: boolean;
    isLoadingMessages: boolean;

    // Actions
    fetchChats: (mode?: 'candidate' | 'recruiter') => Promise<void>;
    setActiveChat: (chatId: string | null) => Promise<void>;
    sendMessage: (content: string, currentUserId: string) => Promise<void>;
    createChat: (professionId: string, initialMessage?: string) => Promise<Chat>;
    markAsRead: (chatId: string) => void;
    clearAll: () => void;
}

export const useMessagesStore = create<MessagesState>()(
    persist(
        (set, get) => ({
            chats: [],
            activeChat: null,
            activeChatMessages: [],
            messagesCache: {},
            isLoading: false,
            isLoadingMessages: false,

            fetchChats: async (mode: 'candidate' | 'recruiter' = 'candidate') => {
                // Если чаты уже есть, не ставим isLoading в true, чтобы не мигало
                // Но если чатов нет, показываем лоадер
                if (get().chats.length === 0) {
                    set({ isLoading: true });
                }

                try {
                    const response = await fetch(`/api/messages?mode=${mode}`);
                    if (!response.ok) throw new Error('Failed to fetch chats');
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

                // 1. Сразу показываем данные из кэша если есть (Stale-While-Revalidate)
                const cachedMessages = messagesCache[chatId];
                if (cachedMessages) {
                    set({
                        activeChat: chat,
                        activeChatMessages: cachedMessages,
                        isLoadingMessages: false
                    });
                } else {
                    // Если кэша нет, показываем лоадер
                    set({ activeChat: chat, isLoadingMessages: true });
                }

                try {
                    // 2. В фоне загружаем свежие данные
                    const response = await fetch(`/api/messages/${chatId}`);
                    if (!response.ok) throw new Error('Failed to fetch messages');
                    const data = await response.json();

                    // 3. Обновляем состояние и кэш
                    set((state) => ({
                        activeChatMessages: data.messages || [],
                        messagesCache: {
                            ...state.messagesCache,
                            [chatId]: data.messages || []
                        },
                        // Обновляем activeChat с данными из API
                        activeChat: chat ? {
                            ...chat,
                            companion: data.chat?.companion || chat.companion,
                            context: data.chat?.context || chat.context,
                        } : null,
                        isLoadingMessages: false
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
                const { activeChat, activeChatMessages } = get();
                if (!activeChat || !content.trim()) return;

                const tempId = `temp-${Date.now()}`;

                // Создаем optimistic сообщение
                // Нам нужно знать currentUserId для правильного отображения. 
                // Передадим его параметром или возьмем заглушку пока не придет ответ.
                // В идеале store должен знать currentUserId, но пока передадим аргументом.
                const optimisticMessage: ChatMessage = {
                    id: tempId,
                    chatId: activeChat.id,
                    senderId: currentUserId,
                    content: content.trim(),
                    isRead: false,
                    createdAt: new Date().toISOString(),
                    sender: {
                        id: currentUserId,
                        fullName: null, // Будет обновлено сервером
                        avatarUrl: null
                    },
                    isOptimistic: true
                };

                // 1. Optimistic Update UI
                set((state) => {
                    const newMessages = [...state.activeChatMessages, optimisticMessage];
                    return {
                        activeChatMessages: newMessages,
                        // Сразу обновляем кэш
                        messagesCache: {
                            ...state.messagesCache,
                            [activeChat.id]: newMessages
                        }
                    };
                });

                try {
                    const response = await fetch(`/api/messages/${activeChat.id}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ content }),
                    });

                    if (!response.ok) throw new Error('Failed to send message');
                    const data = await response.json();

                    // 2. Заменяем optimistic сообщение на реальное
                    set((state) => {
                        const realMessage = data.message;
                        const newMessages = state.activeChatMessages.map(m =>
                            m.id === tempId ? realMessage : m
                        );

                        return {
                            activeChatMessages: newMessages,
                            messagesCache: {
                                ...state.messagesCache,
                                [activeChat.id]: newMessages
                            },
                            // Обновляем последнее сообщение в списке чатов
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
                        const newMessages = state.activeChatMessages.filter(m => m.id !== tempId);
                        return {
                            activeChatMessages: newMessages,
                            messagesCache: {
                                ...state.messagesCache,
                                [activeChat.id]: newMessages
                            }
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

                    // Если чат уже был в списке, обновляем его
                    // Если нет, добавляем в начало
                    set((state) => {
                        const existingChatIndex = state.chats.findIndex(c => c.id === newChat.id);
                        let updatedChats = [...state.chats];

                        if (existingChatIndex >= 0) {
                            updatedChats[existingChatIndex] = { ...updatedChats[existingChatIndex], ...newChat };
                        } else {
                            updatedChats = [newChat, ...updatedChats];
                        }

                        return {
                            chats: updatedChats,
                            activeChat: newChat,
                            activeChatMessages: [], // Сообщения подгрузятся через setActiveChat
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

            clearAll: () => set({
                chats: [],
                activeChat: null,
                activeChatMessages: [],
                messagesCache: {},
            }),
        }),
        {
            name: 'messages-storage', // уникальное имя для localStorage
            storage: createJSONStorage(() => localStorage),
            // Сохраняем только список чатов и кэш сообщений
            partialize: (state) => ({
                chats: state.chats,
                messagesCache: state.messagesCache, // Можно добавить ограничение размера кэша
            }),
        }
    )
);
