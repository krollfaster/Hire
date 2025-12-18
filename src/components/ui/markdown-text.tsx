"use client";

import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface MarkdownTextProps {
    content: string;
    className?: string;
}

type ParsedLine = {
    type: "h1" | "h2" | "h3" | "h4" | "paragraph" | "bullet" | "empty";
    content: string;
    key: number;
};

/**
 * Парсит markdown-текст и рендерит заголовки в стиле Notion
 */
export function MarkdownText({ content, className }: MarkdownTextProps) {
    const parsedContent = useMemo(() => {
        if (!content) return [];

        const lines = content.split("\n");
        const result: ParsedLine[] = [];

        lines.forEach((line, index) => {
            const trimmedLine = line.trim();

            if (trimmedLine === "") {
                result.push({ type: "empty", content: "", key: index });
            } else if (trimmedLine.startsWith("#### ")) {
                result.push({
                    type: "h4",
                    content: trimmedLine.replace(/^####\s*/, ""),
                    key: index,
                });
            } else if (trimmedLine.startsWith("### ")) {
                result.push({
                    type: "h3",
                    content: trimmedLine.replace(/^###\s*/, ""),
                    key: index,
                });
            } else if (trimmedLine.startsWith("## ")) {
                result.push({
                    type: "h2",
                    content: trimmedLine.replace(/^##\s*/, ""),
                    key: index,
                });
            } else if (trimmedLine.startsWith("# ")) {
                result.push({
                    type: "h1",
                    content: trimmedLine.replace(/^#\s*/, ""),
                    key: index,
                });
            } else if (trimmedLine.startsWith("- ") || trimmedLine.startsWith("• ") || trimmedLine.startsWith("* ")) {
                result.push({
                    type: "bullet",
                    content: trimmedLine.replace(/^[-•*]\s*/, ""),
                    key: index,
                });
            } else {
                result.push({
                    type: "paragraph",
                    content: line,
                    key: index,
                });
            }
        });

        return result;
    }, [content]);

    const renderInlineFormatting = (text: string) => {
        // Обработка жирного текста **text**
        const parts = text.split(/(\*\*[^*]+\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith("**") && part.endsWith("**")) {
                return (
                    <strong key={i} className="font-semibold text-foreground">
                        {part.slice(2, -2)}
                    </strong>
                );
            }
            return part;
        });
    };

    return (
        <div className={cn("space-y-1", className)}>
            {parsedContent.map((line) => {
                switch (line.type) {
                    case "h1":
                        return (
                            <h1
                                key={line.key}
                                className="mt-6 first:mt-0 mb-2 pb-2 border-border/50 border-b font-bold text-foreground text-2xl"
                            >
                                {renderInlineFormatting(line.content)}
                            </h1>
                        );
                    case "h2":
                        return (
                            <h2
                                key={line.key}
                                className="mt-5 first:mt-0 mb-1.5 font-semibold text-foreground text-xl"
                            >
                                {renderInlineFormatting(line.content)}
                            </h2>
                        );
                    case "h3":
                        return (
                            <h3
                                key={line.key}
                                className="mt-4 first:mt-0 mb-1 font-semibold text-foreground text-lg"
                            >
                                {renderInlineFormatting(line.content)}
                            </h3>
                        );
                    case "h4":
                        return (
                            <h4
                                key={line.key}
                                className="mt-3 first:mt-0 mb-0.5 font-medium text-foreground/90 text-base"
                            >
                                {renderInlineFormatting(line.content)}
                            </h4>
                        );
                    case "bullet":
                        return (
                            <div key={line.key} className="flex items-start gap-2 pl-1">
                                <span className="bg-muted-foreground/60 mt-1.5 rounded-full w-1.5 h-1.5 text-muted-foreground shrink-0" />
                                <p className="text-[15px] text-foreground/90 leading-relaxed">
                                    {renderInlineFormatting(line.content)}
                                </p>
                            </div>
                        );
                    case "empty":
                        return <div key={line.key} className="h-2" />;
                    case "paragraph":
                    default:
                        return (
                            <p
                                key={line.key}
                                className="text-[15px] text-foreground/90 leading-relaxed"
                            >
                                {renderInlineFormatting(line.content)}
                            </p>
                        );
                }
            })}
        </div>
    );
}

