"use client"

import * as React from "react"
import { ChevronsUpDown, Plus, Search } from "lucide-react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { useResearcherSearchStore, ResearcherSearch } from "@/stores/useResearcherSearchStore"
import { useEffect } from "react"

export function ResearcherSwitcher() {
    const { isMobile } = useSidebar()
    const { searches, activeSearch, isLoading, loadSearches, switchSearch } = useResearcherSearchStore()

    useEffect(() => {
        loadSearches()
    }, [loadSearches])

    const handleSwitchSearch = async (search: ResearcherSearch) => {
        if (search.id === activeSearch?.id) return
        await switchSearch(search.id)
    }

    // Empty state - нет активных поисков
    if (searches.length === 0 && !isLoading) {
        return (
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton
                        size="lg"
                        className="data-[state=open]:bg-sidebar-accent border-2 border-muted-foreground/25 hover:border-muted-foreground/50 border-dashed transition-colors data-[state=open]:text-sidebar-accent-foreground"
                    >
                        <div className="flex justify-center items-center bg-muted rounded-lg size-8 aspect-square">
                            <Search className="size-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 grid text-sm text-left leading-tight">
                            <span className="font-medium text-muted-foreground truncate">
                                Нет активных поисков
                            </span>
                            <span className="text-muted-foreground/70 text-xs truncate">
                                Начните новый поиск
                            </span>
                        </div>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        )
    }

    // Loading state
    if (isLoading) {
        return (
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton size="lg" disabled>
                        <div className="flex justify-center items-center bg-muted rounded-lg size-8 aspect-square animate-pulse" />
                        <div className="flex-1 gap-1 grid text-sm text-left leading-tight">
                            <div className="bg-muted rounded w-24 h-4 animate-pulse" />
                            <div className="bg-muted rounded w-20 h-3 animate-pulse" />
                        </div>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        )
    }

    const truncateQuery = (query: string, maxLength: number = 25) => {
        return query.length > maxLength ? query.slice(0, maxLength) + '...' : query
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <div className="flex justify-center items-center bg-primary/10 rounded-lg size-8 aspect-square">
                                <Search className="size-4 text-primary" />
                            </div>
                            <div className="flex-1 grid text-sm text-left leading-tight">
                                <span className="font-semibold truncate">
                                    {activeSearch?.name || truncateQuery(activeSearch?.query || "Поиск")}
                                </span>
                                <span className="text-muted-foreground text-xs truncate">
                                    {activeSearch?.name ? truncateQuery(activeSearch.query) : "Активный поиск"}
                                </span>
                            </div>
                            <ChevronsUpDown className="ml-auto" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="rounded-lg w-[--radix-dropdown-menu-trigger-width] min-w-56"
                        align="start"
                        side={isMobile ? "bottom" : "right"}
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="text-muted-foreground text-xs">
                            Активные поиски
                        </DropdownMenuLabel>
                        {searches.map((search) => (
                            <DropdownMenuItem
                                key={search.id}
                                onClick={() => handleSwitchSearch(search)}
                                className="gap-2 p-2"
                            >
                                <div className="flex justify-center items-center bg-primary/10 border rounded-sm size-6">
                                    <Search className="size-3 text-primary" />
                                </div>
                                <div className="flex flex-col flex-1 min-w-0">
                                    <span className="font-medium truncate">
                                        {search.name || truncateQuery(search.query)}
                                    </span>
                                    {search.name && (
                                        <span className="text-muted-foreground text-xs truncate">
                                            {truncateQuery(search.query)}
                                        </span>
                                    )}
                                </div>
                                {search.isActive && (
                                    <div className="bg-primary rounded-full size-2" />
                                )}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
