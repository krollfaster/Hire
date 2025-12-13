import { create } from "zustand";

export interface ResumeEntry {
    id: string;
    title: string;
    text: string;
    createdAt: number;
}

interface ResumeState {
    resumes: ResumeEntry[];
    selectedResumeId: string | null;
    resumeText: string | null;
    chatContext: {
        messages: { role: "user" | "assistant"; content: string }[];
    };
    setChatContext: (context: { messages: { role: "user" | "assistant"; content: string }[] }) => void;
    addResume: (text: string, title?: string) => void;
    selectResume: (id: string) => void;
    setResumeText: (text: string | null) => void;
    clearResume: () => void;
}

const generateResumeId = () => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return `resume-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const useResumeStore = create<ResumeState>((set) => ({
    resumes: [],
    selectedResumeId: null,
    resumeText: null,
    chatContext: { messages: [] },

    setChatContext: (context) => set({ chatContext: context }),

    addResume: (text, title) =>
        set((state) => {
            const id = generateResumeId();
            const entry: ResumeEntry = {
                id,
                title: title || `Резюме ${state.resumes.length + 1}`,
                text,
                createdAt: Date.now(),
            };

            return {
                resumes: [entry, ...state.resumes],
                selectedResumeId: id,
                resumeText: entry.text,
            };
        }),

    selectResume: (id) =>
        set((state) => {
            const current = state.resumes.find((resume) => resume.id === id);
            if (!current) return state;

            return {
                selectedResumeId: id,
                resumeText: current.text,
            };
        }),

    setResumeText: (text) =>
        set((state) => {
            if (!text) {
                return { resumeText: null, selectedResumeId: null, resumes: [] };
            }

            const id = generateResumeId();
            const entry: ResumeEntry = {
                id,
                title: `Резюме ${state.resumes.length + 1}`,
                text,
                createdAt: Date.now(),
            };

            return {
                resumes: [entry, ...state.resumes],
                selectedResumeId: id,
                resumeText: entry.text,
            };
        }),

    clearResume: () => set({ resumeText: null, selectedResumeId: null, resumes: [] }),
}));

