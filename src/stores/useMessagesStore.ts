import { create } from 'zustand';
import { Conversation, Message, mockConversations } from '@/data/mock';

interface MessagesState {
    conversations: Conversation[];
    activeConversationId: string | null;

    setActiveConversation: (id: string | null) => void;
    sendMessage: (conversationId: string, text: string) => void;
    markAsRead: (conversationId: string) => void;

    // Clear all data (for logout)
    clearAll: () => void;
}

export const useMessagesStore = create<MessagesState>((set) => ({
    conversations: mockConversations,
    activeConversationId: null,

    setActiveConversation: (id) =>
        set({ activeConversationId: id }),

    sendMessage: (conversationId, text) =>
        set((state) => ({
            conversations: state.conversations.map((conv) =>
                conv.id === conversationId
                    ? {
                        ...conv,
                        messages: [
                            ...conv.messages,
                            {
                                id: `m${Date.now()}`,
                                sender: 'user' as const,
                                text,
                                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            },
                        ],
                        lastActive: 'Just now',
                    }
                    : conv
            ),
        })),

    markAsRead: (conversationId) =>
        set((state) => ({
            conversations: state.conversations.map((conv) =>
                conv.id === conversationId ? { ...conv, unread: 0 } : conv
            ),
        })),

    clearAll: () => set({
        conversations: [],
        activeConversationId: null,
    }),
}));
