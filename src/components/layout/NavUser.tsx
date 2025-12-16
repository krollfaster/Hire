"use client"

import {
    BadgeCheck,
    Bell,
    ChevronRight,
    ChevronsUpDown,
    CreditCard,
    LogOut,
    Sparkles,
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
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { AuthModal } from "@/components/auth/AuthModal"

interface NavUserProps {
    user: {
        name: string
        email: string
        avatar: string
    } | null
}

export function NavUser({ user }: NavUserProps) {
    const { isMobile } = useSidebar()
    const router = useRouter()
    const supabase = createClient()
    const [authModalOpen, setAuthModalOpen] = useState(false)

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.refresh()
    }

    const getInitials = (name: string) => {
        const parts = name.split(" ")
        if (parts.length > 1) {
            return (parts[0][0] + parts[1][0]).toUpperCase()
        }
        return name.slice(0, 2).toUpperCase()
    }

    if (!user) {
        return (
            <>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <Button
                            variant="ghost"
                            className="w-full justify-start"
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
                                <BadgeCheck className="mr-2 size-4" />
                                Аккаунт
                            </DropdownMenuItem>
                            <DropdownMenuItem disabled>
                                <CreditCard className="mr-2 size-4" />
                                Тарифы
                            </DropdownMenuItem>
                            <DropdownMenuItem disabled>
                                <Bell className="mr-2 size-4" />
                                Настройки
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <a href="/">
                                    <Sparkles className="mr-2 size-4" />
                                    Главная
                                </a>
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
    )
}
