"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Sparkles, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchHeroProps {
    onSearch: (query: string) => void;
    isSearching: boolean;
    hasResults: boolean;
}

const placeholderExamples = [
    "Senior React разработчик с опытом в финтехе",
    "Product Designer из Figma или Яндекса",
    "DevOps инженер со знанием Kubernetes",
    "Data Scientist с ML/AI опытом",
    "Tech Lead для стартапа",
];

export const SearchHero = ({ onSearch, isSearching, hasResults }: SearchHeroProps) => {
    const [query, setQuery] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    // Rotate placeholders
    useEffect(() => {
        if (query || isFocused) return;

        const interval = setInterval(() => {
            setPlaceholderIndex((prev) => (prev + 1) % placeholderExamples.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [query, isFocused]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim() && !isSearching) {
            onSearch(query.trim());
        }
    };

    const handleClear = () => {
        setQuery("");
        inputRef.current?.focus();
    };

    return (
        <motion.div
            initial={false}
            animate={{
                paddingTop: hasResults ? "2rem" : "0",
                paddingBottom: hasResults ? "2rem" : "0",
            }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={cn(
                "flex flex-col justify-center items-center w-full",
                !hasResults && "min-h-[60vh]"
            )}
        >
            {/* Title - only show when no results */}
            {!hasResults && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-10 text-center"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                        className="flex justify-center items-center gap-2 mb-4"
                    >
                        <div className="bg-primary/10 p-2 rounded-lg">
                            <Sparkles className="w-6 h-6 text-primary" />
                        </div>
                    </motion.div>

                    <h1 className="bg-clip-text bg-linear-to-r from-foreground via-foreground to-muted-foreground mb-4 font-bold text-4xl md:text-5xl">
                        Найдите идеального кандидата
                    </h1>
                    <p className="mx-auto w-full max-w-3xl text-muted-foreground text-xs text-center">
                        Опишите, кого вы ищете, и наш ИИ найдёт лучших кандидатов по смыслу, а не по ключевым словам
                    </p>
                </motion.div>
            )}

            {/* Search input */}
            <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className={cn(
                    "relative w-full transition-all duration-500",
                    hasResults ? "max-w-2xl" : "max-w-3xl"
                )}
            >
                {/* Glow effect */}
                <motion.div
                    animate={{
                        opacity: isFocused ? 1 : 0,
                        scale: isFocused ? 1 : 0.95,
                    }}
                    transition={{ duration: 0.3 }}
                    className="absolute -inset-1 bg-linear-to-r from-primary/30 via-purple-500/30 to-pink-500/30 blur-xl rounded-2xl"
                />

                {/* Input container */}
                <div
                    className={cn(
                        "relative flex items-center bg-card/80 backdrop-blur-xl border rounded-2xl transition-all duration-300",
                        isFocused
                            ? "border-primary/50 shadow-lg shadow-primary/10"
                            : "border-border/50 hover:border-border"
                    )}
                >
                    {/* Search icon */}
                    <div className="pr-2 pl-5">
                        {isSearching ? (
                            <Loader2 className="w-6 h-6 text-primary animate-spin" />
                        ) : (
                            <Search className={cn(
                                "w-6 h-6 transition-colors",
                                isFocused ? "text-primary" : "text-muted-foreground"
                            )} />
                        )}
                    </div>

                    {/* Input */}
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder={placeholderExamples[placeholderIndex]}
                        disabled={isSearching}
                        className={cn(
                            "flex-1 bg-transparent px-3 py-5 focus:outline-none text-foreground placeholder:text-muted-foreground/60 text-lg disabled:cursor-not-allowed",
                            hasResults && "py-4 text-base"
                        )}
                    />

                    {/* Clear button */}
                    {query && !isSearching && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            type="button"
                            onClick={handleClear}
                            className="hover:bg-muted/50 mr-2 p-2 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-muted-foreground" />
                        </motion.button>
                    )}

                    {/* Submit button */}
                    <motion.button
                        type="submit"
                        disabled={!query.trim() || isSearching}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                            "mr-2 px-6 py-3 rounded-xl font-medium transition-all duration-300",
                            query.trim() && !isSearching
                                ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25"
                                : "bg-muted text-muted-foreground cursor-not-allowed"
                        )}
                    >
                        {isSearching ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Поиск...
                            </span>
                        ) : (
                            "Найти"
                        )}
                    </motion.button>
                </div>
            </motion.form>


        </motion.div>
    );
};

