"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Conversation } from "@/data/mock";

interface ChatListProps {
    conversations: Conversation[];
    activeId: string | null;
    onSelect: (id: string) => void;
}

export const ChatList = ({ conversations, activeId, onSelect }: ChatListProps) => {
    return (
        <div className="flex flex-col h-full border-r border-border w-full">
            <div className="px-5 border-b border-border">
                <h2 className="text-lg h-[64px] flex items-center font-semibold text-foreground">Сообщения</h2>
            </div>
            <ScrollArea className="flex-1 w-full h-full">
                <div className="flex flex-col w-[425px]">
                    {conversations.map((conv) => {
                        const lastMessage = conv.messages[conv.messages.length - 1];
                        const isActive = conv.id === activeId;

                        return (
                            <button
                                key={conv.id}
                                onClick={() => onSelect(conv.id)}
                                className={cn(
                                    "flex items-start gap-3 p-4 text-left transition-colors hover:bg-muted/50 w-full",
                                    isActive && "bg-muted"
                                )}
                            >
                                <Avatar className="h-11 w-11 flex-shrink-0">
                                    <AvatarImage src={conv.recruiter.avatar} alt={conv.recruiter.name} />
                                    <AvatarFallback>
                                        {conv.recruiter.name.slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="font-medium text-sm text-foreground truncate">
                                            {conv.recruiter.name}
                                        </span>
                                        <span className="text-xs text-muted-foreground flex-shrink-0">
                                            {conv.lastActive}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                                        {conv.recruiter.company} · {conv.recruiter.role}
                                    </p>
                                    <div className="flex items-center justify-between gap-2 mt-1">
                                        <p className="text-sm text-muted-foreground truncate w-full">
                                            {lastMessage?.sender === "user" && "Вы: "}
                                            {lastMessage?.text}
                                        </p>
                                        {conv.unread > 0 && (
                                            <Badge
                                                variant="default"
                                                className="h-5 min-w-5 flex items-center justify-center rounded-full text-xs px-1.5"
                                            >
                                                {conv.unread}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </ScrollArea>
        </div>
    );
};

