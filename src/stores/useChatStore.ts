import { create } from "zustand";
import type { TraitAction } from "./useTraitsStore";

/**
 * Сообщение AI-чата (builder)
 */
export interface ChatMessage {
    id: string;
    content: string;
    role: "user" | "assistant";
    timestamp: Date;
    actions?: TraitAction[];
}

interface ChatState {
    messages: ChatMessage[];
    isLoading: boolean;
    setMessages: (messages: ChatMessage[]) => void;
    addMessage: (message: ChatMessage) => void;
    reset: () => void;
    clearAll: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
    messages: [],
    isLoading: false,

    setMessages: (messages) => set({ messages }),

    addMessage: (message) =>
        set((state) => ({
            messages: [...state.messages, message],
        })),

    reset: () => set({ messages: [] }),

    clearAll: () =>
        set({
            messages: [],
            isLoading: false,
        }),
}));
