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
        <div className="flex flex-col border-border border-r w-full h-full">
            <div className="px-5 border-border border-b">
                <h2 className="flex items-center h-[64px] font-semibold text-foreground text-lg">Сообщения</h2>
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
                                    "flex items-start gap-3 hover:bg-muted/50 p-4 w-full text-left transition-colors",
                                    isActive && "bg-muted"
                                )}
                            >
                                <Avatar className="w-11 h-11 shrink-0">
                                    <AvatarImage src={conv.recruiter.avatar} alt={conv.recruiter.name} />
                                    <AvatarFallback>
                                        {conv.recruiter.name.slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center gap-2">
                                        <span className="font-medium text-foreground text-sm truncate">
                                            {conv.recruiter.name}
                                        </span>
                                        <span className="text-muted-foreground text-xs shrink-0">
                                            {conv.lastActive}
                                        </span>
                                    </div>
                                    <p className="mt-0.5 text-muted-foreground text-xs truncate">
                                        {conv.recruiter.company} · {conv.recruiter.role}
                                    </p>
                                    <div className="flex justify-between items-center gap-2 mt-1">
                                        <p className="w-full text-muted-foreground text-sm truncate">
                                            {lastMessage?.sender === "user" && "Вы: "}
                                            {lastMessage?.text}
                                        </p>
                                        {conv.unread > 0 && (
                                            <Badge
                                                variant="default"
                                                className="flex justify-center items-center px-1.5 rounded-full min-w-5 h-5 text-xs"
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

