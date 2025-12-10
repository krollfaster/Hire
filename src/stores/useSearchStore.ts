import { create } from 'zustand';
import { Candidate, mockCandidates } from '@/data/mock';

interface SearchState {
    query: string;
    results: Candidate[];
    isSearching: boolean;

    setQuery: (query: string) => void;
    search: (query: string) => Promise<void>;
    clearResults: () => void;
}

// Simple keyword matching for demo
const matchCandidates = (query: string, candidates: Candidate[]): Candidate[] => {
    const queryLower = query.toLowerCase();
    const keywords = queryLower.split(/\s+/).filter(Boolean);

    return candidates
        .map((candidate) => {
            let score = candidate.matchScore;

            // Boost score based on keyword matches
            keywords.forEach((keyword) => {
                if (candidate.role.toLowerCase().includes(keyword)) score += 5;
                if (candidate.bio.toLowerCase().includes(keyword)) score += 3;
                candidate.semanticProfile.forEach((skill) => {
                    if (skill.name.toLowerCase().includes(keyword)) score += 4;
                });
            });

            return { ...candidate, matchScore: Math.min(score, 99) };
        })
        .sort((a, b) => b.matchScore - a.matchScore);
};

export const useSearchStore = create<SearchState>((set) => ({
    query: '',
    results: [],
    isSearching: false,

    setQuery: (query) => set({ query }),

    search: async (query) => {
        set({ isSearching: true, query });

        // Simulate AI processing delay
        await new Promise((resolve) => setTimeout(resolve, 1200));

        const results = matchCandidates(query, mockCandidates);
        set({ results, isSearching: false });
    },

    clearResults: () => set({ results: [], query: '' }),
}));
