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
                "flex flex-col items-center justify-center w-full",
                !hasResults && "min-h-[60vh]"
            )}
        >
            {/* Title - only show when no results */}
            {!hasResults && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-10"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                        className="flex items-center justify-center gap-2 mb-4"
                    >
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Sparkles className="w-6 h-6 text-primary" />
                        </div>
                    </motion.div>
                    
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text">
                        Найдите идеального кандидата
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-xl mx-auto">
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
                    className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-purple-500/30 to-pink-500/30 rounded-2xl blur-xl"
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
                    <div className="pl-5 pr-2">
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
                            "flex-1 bg-transparent py-5 px-3 text-lg text-foreground placeholder:text-muted-foreground/60 focus:outline-none disabled:cursor-not-allowed",
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
                            className="p-2 mr-2 rounded-full hover:bg-muted/50 transition-colors"
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

            {/* Suggestions - only show when no results and not focused */}
            {!hasResults && !isFocused && !query && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-wrap justify-center gap-2 mt-6"
                >
                    {["React Developer", "UX Designer", "Data Engineer", "Product Manager"].map((suggestion, i) => (
                        <motion.button
                            key={suggestion}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + i * 0.1 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                setQuery(suggestion);
                                inputRef.current?.focus();
                            }}
                            className="px-4 py-2 bg-card/50 border border-border/50 rounded-full text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
                        >
                            {suggestion}
                        </motion.button>
                    ))}
                </motion.div>
            )}
        </motion.div>
    );
};

