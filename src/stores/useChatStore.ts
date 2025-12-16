import { create } from "zustand";
import { TraitAction } from "./useTraitsStore";


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
}

export const useChatStore = create<ChatState>((set) => ({
    messages: [],
    isLoading: false,

    setMessages: (messages) => {
        set({ messages });
    },

    addMessage: (message) => {
        set((state) => ({
            messages: [...state.messages, message],
        }));
    },

    reset: () => {
        set({ messages: [] });
    },
}));
