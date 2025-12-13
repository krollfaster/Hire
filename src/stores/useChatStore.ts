import { create } from "zustand";

export interface ChatMessage {
    id: string;
    content: string;
    role: "user" | "assistant";
    timestamp: Date;
}

interface ChatState {
    messages: ChatMessage[];
    setMessages: (messages: ChatMessage[]) => void;
    addMessage: (message: ChatMessage) => void;
    reset: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
    messages: [],

    setMessages: (messages) => set({ messages }),

    addMessage: (message) =>
        set((state) => ({
            messages: [...state.messages, message],
        })),

    reset: () => set({ messages: [] }),
}));

