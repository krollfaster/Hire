"use client"

import * as React from "react"
import { ChevronsUpDown, Plus, Search, Pencil, Trash2 } from "lucide-react"

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
import { SearchQuerySetupModal } from "@/components/search/SearchQuerySetupModal"
import { useEffect } from "react"

function formatSalary(min: number | null, max: number | null): string {
    const formatK = (n: number) => {
        if (n >= 1000) {
            return `${Math.round(n / 1000)}к`;
        }
        return n.toString();
    };

    if (min && max) {
        return `${formatK(min)} - ${formatK(max)}`;
    }
    if (min) {
        return `от ${formatK(min)}`;
    }
    if (max) {
        return `до ${formatK(max)}`;
    }
    return "";
}

export function ResearcherSwitcher() {
    const { isMobile } = useSidebar()
    const {
        searches,
        activeSearch,
        isLoading,
        loadSearches,
        switchSearch,
        deleteSearch,
        isSetupModalOpen,
        setSetupModalOpen
    } = useResearcherSearchStore()
    const [searchToEdit, setSearchToEdit] = React.useState<ResearcherSearch | null>(null);

    useEffect(() => {
        loadSearches()
    }, [loadSearches])

    const handleSwitchSearch = async (search: ResearcherSearch) => {
        if (search.id === activeSearch?.id) return
        await switchSearch(search.id)
    }

    const handleAddSearch = () => {
        setSearchToEdit(null);
        setSetupModalOpen(true);
    };

    const handleEditSearch = (search: ResearcherSearch, e: React.MouseEvent) => {
        e.stopPropagation();
        setSearchToEdit(search);
        setSetupModalOpen(true);
    };

    const handleDeleteSearch = async (search: ResearcherSearch, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm(`Вы уверены, что хотите удалить поиск "${search.name || search.query}"? Это действие нельзя отменить.`)) {
            await deleteSearch(search.id);
        }
    };

    const truncateQuery = (query: string, maxLength: number = 25) => {
        return query.length > maxLength ? query.slice(0, maxLength) + '...' : query
    }

    // Empty state - нет активных поисков
    if (searches.length === 0 && !isLoading) {
        return (
            <>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            onClick={handleAddSearch}
                            className="data-[state=open]:bg-sidebar-accent border-2 border-muted-foreground/25 hover:border-muted-foreground/50 border-dashed transition-colors data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <div className="flex justify-center items-center bg-muted rounded-lg size-8 aspect-square">
                                <Plus className="size-4 text-muted-foreground" />
                            </div>
                            <div className="flex-1 grid text-sm text-left leading-tight">
                                <span className="font-medium text-muted-foreground truncate">
                                    Добавить поиск
                                </span>
                                <span className="text-muted-foreground/70 text-xs truncate">
                                    Создайте поисковый запрос
                                </span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <SearchQuerySetupModal
                    open={isSetupModalOpen}
                    onOpenChange={setSetupModalOpen}
                />
            </>
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

    const salaryText = activeSearch
        ? formatSalary(activeSearch.salaryMin, activeSearch.salaryMax)
        : "";

    return (
        <>
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
                                        {activeSearch?.grade || ""}
                                        {activeSearch?.grade && salaryText && " | "}
                                        {salaryText}
                                        {!activeSearch?.grade && !salaryText && (activeSearch?.name ? truncateQuery(activeSearch.query) : "Активный поиск")}
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
                                Поисковые запросы
                            </DropdownMenuLabel>
                            {searches.map((search) => {
                                const salary = formatSalary(search.salaryMin, search.salaryMax);
                                return (
                                    <DropdownMenuItem
                                        key={search.id}
                                        onClick={() => handleSwitchSearch(search)}
                                        className="group relative gap-2 p-2"
                                    >
                                        <div className="flex justify-center items-center bg-primary/10 border rounded-sm size-6">
                                            <Search className="size-3 text-primary" />
                                        </div>
                                        <div className="flex flex-col flex-1 min-w-0">
                                            <span className="font-medium truncate">
                                                {search.name || truncateQuery(search.query)}
                                            </span>
                                            <span className="text-muted-foreground text-xs truncate">
                                                {search.grade || ""}
                                                {search.grade && salary && " | "}
                                                {salary}
                                                {!search.grade && !salary && (search.name ? truncateQuery(search.query) : "")}
                                            </span>
                                        </div>
                                        <div className="right-2 absolute flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div
                                                role="button"
                                                className="hover:bg-muted p-1 rounded cursor-pointer"
                                                onClick={(e) => handleEditSearch(search, e)}
                                            >
                                                <Pencil className="size-3 text-muted-foreground hover:text-foreground" />
                                            </div>
                                            <div
                                                role="button"
                                                className="hover:bg-destructive/10 p-1 rounded cursor-pointer"
                                                onClick={(e) => handleDeleteSearch(search, e)}
                                            >
                                                <Trash2 className="size-3 text-muted-foreground hover:text-destructive" />
                                            </div>
                                        </div>
                                        {search.id === activeSearch?.id && (
                                            <div className="bg-primary group-hover:opacity-0 rounded-full size-2 transition-opacity" />
                                        )}
                                    </DropdownMenuItem>
                                );
                            })}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="gap-2 p-2" onClick={handleAddSearch}>
                                <div className="flex justify-center items-center bg-background border rounded-md size-6">
                                    <Plus className="size-4" />
                                </div>
                                <div className="font-medium text-muted-foreground">Добавить поиск</div>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>
            <SearchQuerySetupModal
                open={isSetupModalOpen}
                onOpenChange={(open: boolean) => {
                    setSetupModalOpen(open);
                    if (!open) setTimeout(() => setSearchToEdit(null), 300);
                }}
                searchToEdit={searchToEdit}
            />
        </>
    )
}
