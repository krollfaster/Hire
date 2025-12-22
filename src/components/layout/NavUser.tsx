"use client"

import {
    ArrowLeftRight,
    ChevronRight,
    ChevronsUpDown,
    CreditCard,
    LogOut,
    Settings,
    User,
} from "lucide-react"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
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
import { useState } from "react"
import { AuthModal } from "@/components/auth/AuthModal"
import { signOut } from "@/app/actions/auth"
import { useProfessionStore } from "@/stores/useProfessionStore"
import { useTraitsStore } from "@/stores/useTraitsStore"
import { useUserStore } from "@/stores/useUserStore"
import { useSearchStore } from "@/stores/useSearchStore"
import { useChatStore } from "@/stores/useChatStore"
import { useMessagesStore } from "@/stores/useMessagesStore"
import { useRoleStore } from "@/stores/useRoleStore"
import { useAuthStore } from "@/stores/useAuthStore"

interface NavUserProps {
    user: {
        name: string
        email: string
        avatar: string
    } | null
    isLoading?: boolean
}

export function NavUser({ user, isLoading }: NavUserProps) {
    const { isMobile } = useSidebar()
    const [authModalOpen, setAuthModalOpen] = useState(false)
    const { role, setRole } = useRoleStore()

    const handleLogout = async () => {
        // Clear all user data from stores before logout
        const professionStore = useProfessionStore.getState()
        const traitsStore = useTraitsStore.getState()
        const userStore = useUserStore.getState()
        const searchStore = useSearchStore.getState()
        const chatStore = useChatStore.getState()
        const messagesStore = useMessagesStore.getState()
        const roleStore = useRoleStore.getState()
        const authStore = useAuthStore.getState()

        professionStore.clearAll()
        traitsStore.clearAll()
        userStore.clearAll()
        searchStore.clearAll()
        chatStore.clearAll()
        messagesStore.clearAll()
        roleStore.clearAll()
        authStore.clearAll()

        await signOut()
    }

    const getInitials = (name: string) => {
        const parts = name.split(" ")
        if (parts.length > 1) {
            return (parts[0][0] + parts[1][0]).toUpperCase()
        }
        return name.slice(0, 2).toUpperCase()
    }

    // Show skeleton while loading to prevent flicker
    if (isLoading) {
        return (
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton size="lg" disabled>
                        <div className="bg-muted rounded-lg w-8 h-8 animate-pulse" />
                        <div className="flex-1 gap-1 grid">
                            <div className="bg-muted rounded w-24 h-4 animate-pulse" />
                            <div className="bg-muted rounded w-32 h-3 animate-pulse" />
                        </div>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        )
    }

    if (!user) {
        return (
            <>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <Button
                            variant="ghost"
                            className="justify-start w-full"
                            onClick={() => setAuthModalOpen(true)}
                        >
                            <User className="size-4" />
                            Войти
                            <ChevronRight className="ml-auto size-4" />
                        </Button>
                    </SidebarMenuItem>
                </SidebarMenu>
                <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
            </>
        )
    }

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
                                <Avatar className="rounded-lg w-8 h-8">
                                    <AvatarImage src={user.avatar} alt={user.name} />
                                    <AvatarFallback className="rounded-lg">{getInitials(user.name)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 grid text-sm text-left leading-tight">
                                    <span className="font-semibold truncate">{user.name}</span>
                                    <span className="text-xs truncate">{user.email}</span>
                                </div>
                                <ChevronsUpDown className="ml-auto size-4" />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="rounded-lg w-[--radix-dropdown-menu-trigger-width] min-w-56"
                            side={isMobile ? "bottom" : "right"}
                            align="end"
                            sideOffset={4}
                        >
                            <DropdownMenuLabel className="p-0 font-normal">
                                <div className="flex items-center gap-2 px-1 py-1.5 text-sm text-left">
                                    <Avatar className="rounded-lg w-8 h-8">
                                        <AvatarImage src={user.avatar} alt={user.name} />
                                        <AvatarFallback className="rounded-lg">{getInitials(user.name)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 grid text-sm text-left leading-tight">
                                        <span className="font-semibold truncate">{user.name}</span>
                                        <span className="text-xs truncate">{user.email}</span>
                                    </div>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem disabled>
                                    <CreditCard className="mr-2 size-4" />
                                    Тарифы
                                </DropdownMenuItem>
                                <DropdownMenuItem disabled>
                                    <Settings className="mr-2 size-4" />
                                    Настройки
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => {
                                    setRole(role === 'candidate' ? 'recruiter' : 'candidate')
                                }}>
                                    <ArrowLeftRight className="mr-2 size-4" />
                                    {role === 'candidate' ? 'Переключить на Ресерчер' : 'Переключить на Кандидата'}
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout}>
                                <LogOut className="mr-2 size-4" />
                                Выйти
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>
        </>
    )
}
