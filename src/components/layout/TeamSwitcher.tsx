"use client"

import * as React from "react"
import { ChevronsUpDown, Plus, Briefcase } from "lucide-react"

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
import { useProfessionStore, Profession } from "@/stores/useProfessionStore"
import { useTraitsStore } from "@/stores/useTraitsStore"
import { ProfessionSetupModal } from "@/components/profession"

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

export function TeamSwitcher() {
    const { isMobile } = useSidebar()
    const { professions, activeProfession, switchProfession, isLoading, isSetupModalOpen, setSetupModalOpen } = useProfessionStore()
    const loadTraits = useTraitsStore((state) => state.loadFromServer)

    const handleSwitchProfession = async (profession: Profession) => {
        if (profession.id === activeProfession?.id) return;
        await switchProfession(profession.id);
        // Перезагружаем граф для новой профессии
        await loadTraits();
    };

    const handleAddProfession = () => {
        setSetupModalOpen(true);
    };

    const handleProfessionCreated = async () => {
        // Перезагружаем граф после создания профессии
        await loadTraits();
    };

    // Определяем нужна ли обязательная модалка (нет профессий)
    const isRequired = professions.length === 0 && !isLoading;

    // Empty state если профессий нет
    if (professions.length === 0 && !isLoading) {
        return (
            <>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            onClick={handleAddProfession}
                            className="data-[state=open]:bg-sidebar-accent border-2 border-muted-foreground/25 hover:border-muted-foreground/50 border-dashed transition-colors data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <div className="flex justify-center items-center bg-muted rounded-lg size-8 aspect-square">
                                <Plus className="size-4 text-muted-foreground" />
                            </div>
                            <div className="flex-1 grid text-sm text-left leading-tight">
                                <span className="font-medium text-muted-foreground truncate">
                                    Добавить профессию
                                </span>
                                <span className="text-muted-foreground/70 text-xs truncate">
                                    Выберите должность
                                </span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <ProfessionSetupModal
                    open={isSetupModalOpen}
                    onOpenChange={setSetupModalOpen}
                    onSuccess={handleProfessionCreated}
                    required={isRequired}
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

    const salaryText = activeProfession
        ? formatSalary(activeProfession.salaryMin, activeProfession.salaryMax)
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
                                    <Briefcase className="size-4 text-primary" />
                                </div>
                                <div className="flex-1 grid text-sm text-left leading-tight">
                                    <span className="font-semibold truncate">
                                        {activeProfession?.name || "Выберите профессию"}
                                    </span>
                                    <span className="text-muted-foreground text-xs truncate">
                                        {activeProfession?.grade}
                                        {salaryText && ` | ${salaryText}`}
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
                                Профессии
                            </DropdownMenuLabel>
                            {professions.map((profession) => {
                                const salary = formatSalary(profession.salaryMin, profession.salaryMax);
                                return (
                                    <DropdownMenuItem
                                        key={profession.id}
                                        onClick={() => handleSwitchProfession(profession)}
                                        className="gap-2 p-2"
                                    >
                                        <div className="flex justify-center items-center bg-primary/10 border rounded-sm size-6">
                                            <Briefcase className="size-3 text-primary" />
                                        </div>
                                        <div className="flex flex-col flex-1 min-w-0">
                                            <span className="font-medium truncate">{profession.name}</span>
                                            <span className="text-muted-foreground text-xs truncate">
                                                {profession.grade}
                                                {salary && ` | ${salary}`}
                                            </span>
                                        </div>
                                        {profession.isActive && (
                                            <div className="bg-primary rounded-full size-2" />
                                        )}
                                    </DropdownMenuItem>
                                );
                            })}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="gap-2 p-2" onClick={handleAddProfession}>
                                <div className="flex justify-center items-center bg-background border rounded-md size-6">
                                    <Plus className="size-4" />
                                </div>
                                <div className="font-medium text-muted-foreground">Добавить профессию</div>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>
            <ProfessionSetupModal
                open={isSetupModalOpen}
                onOpenChange={setSetupModalOpen}
                onSuccess={handleProfessionCreated}
            />
        </>
    )
}
