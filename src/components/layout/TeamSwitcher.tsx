"use client"

import * as React from "react"
import { ChevronsUpDown, Plus, Briefcase, Pencil, Trash2, Check, Zap, Eye, Moon, LucideIcon } from "lucide-react"

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

const statusConfig: Record<string, { icon: LucideIcon }> = {
    active_search: { icon: Zap },
    considering: { icon: Eye },
    not_searching: { icon: Moon },
};

function getStatusIcon(status: string | null | undefined): LucideIcon {
    if (status && statusConfig[status]) {
        return statusConfig[status].icon;
    }
    return Briefcase;
}

export function TeamSwitcher() {
    const { isMobile } = useSidebar()
    const { professions, activeProfession, switchProfession, removeProfession, isLoading, isSetupModalOpen, setSetupModalOpen } = useProfessionStore()
    const loadTraits = useTraitsStore((state) => state.loadFromServer)
    const traitsCache = useTraitsStore((state) => state.traitsCache)
    const [professionToEdit, setProfessionToEdit] = React.useState<Profession | null>(null);

    const handleSwitchProfession = async (profession: Profession) => {
        if (profession.id === activeProfession?.id) return;

        // Если данные уже в кэше - переключаем без loading state
        const hasCachedData = !!traitsCache[profession.id];

        // switchProfession с skipLoading=true не показывает загрузку
        switchProfession(profession.id, hasCachedData);
        await loadTraits(profession.id);
    };

    const handleAddProfession = () => {
        setProfessionToEdit(null);
        setSetupModalOpen(true);
    };

    const handleEditProfession = (profession: Profession, e: React.MouseEvent) => {
        e.stopPropagation();
        setProfessionToEdit(profession);
        setSetupModalOpen(true);
    };

    const handleDeleteProfession = async (profession: Profession, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm(`Вы уверены, что хотите удалить профессию "${profession.name}"? Это действие нельзя отменить.`)) {
            await removeProfession(profession.id);
        }
    };

    const handleProfessionCreated = async () => {
        // Перезагружаем граф после создания/обновления профессии
        if (activeProfession) {
            await loadTraits(activeProfession.id);
        } else {
            await loadTraits();
        }
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
                                {(() => {
                                    const Icon = getStatusIcon(activeProfession?.status);
                                    return (
                                        <div className="flex justify-center items-center bg-primary/10 rounded-lg size-8 aspect-square">
                                            <Icon className="size-4 text-primary" />
                                        </div>
                                    );
                                })()}
                                <div className="flex-1 grid text-sm text-left leading-tight">
                                    <span className="font-semibold truncate">
                                        {activeProfession?.name || "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u043f\u0440\u043e\u0444\u0435\u0441\u0441\u0438\u044e"}
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
                                Ищу работу
                            </DropdownMenuLabel>
                            {professions.map((profession) => {
                                const salary = formatSalary(profession.salaryMin, profession.salaryMax);
                                const StatusIcon = getStatusIcon(profession.status);
                                return (
                                    <DropdownMenuItem
                                        key={profession.id}
                                        onClick={() => handleSwitchProfession(profession)}
                                        className="group relative gap-2 p-2"
                                    >
                                        <div className="flex justify-center items-center bg-primary/10 border rounded-sm size-6">
                                            <StatusIcon className="size-3 text-primary" />
                                        </div>
                                        <div className="flex flex-col flex-1 min-w-0">
                                            <span className="font-medium truncate">{profession.name}</span>
                                            <span className="text-muted-foreground text-xs truncate">
                                                {profession.grade}
                                                {salary && ` | ${salary}`}
                                            </span>
                                        </div>
                                        <div className="right-2 absolute flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div
                                                role="button"
                                                className="hover:bg-muted p-1 rounded cursor-pointer"
                                                onClick={(e) => handleEditProfession(profession, e)}
                                            >
                                                <Pencil className="size-3 text-muted-foreground hover:text-foreground" />
                                            </div>
                                            <div
                                                role="button"
                                                className="hover:bg-destructive/10 p-1 rounded cursor-pointer"
                                                onClick={(e) => handleDeleteProfession(profession, e)}
                                            >
                                                <Trash2 className="size-3 text-muted-foreground hover:text-destructive" />
                                            </div>
                                        </div>
                                        {profession.isActive && (
                                            <div className="bg-primary group-hover:opacity-0 rounded-full size-2 transition-opacity" />
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
                onOpenChange={(open: boolean) => {
                    setSetupModalOpen(open);
                    if (!open) setTimeout(() => setProfessionToEdit(null), 300); // Wait for animation
                }}
                onSuccess={handleProfessionCreated}
                professionToEdit={professionToEdit}
            />
        </>
    )
}
