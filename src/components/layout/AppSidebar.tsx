"use client"

import * as React from "react"
import {
    PenLine,
    MessageCircle,
    Search,
} from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { UserButton } from "@/components/auth"
import { useRoleStore } from "@/stores/useRoleStore"
import { useProfessionStore } from "@/stores/useProfessionStore"
import { useTraitsStore } from "@/stores/useTraitsStore"
import { useProfile } from "@/hooks/useProfile"
import { NavUser } from "./NavUser"
import { TeamSwitcher } from "./TeamSwitcher"
import { ResearcherSwitcher } from "./ResearcherSwitcher"
import { ProBanner } from "./ProBanner"

interface NavItem {
    href: string;
    label: string;
    icon: React.ElementType;
    disabled?: boolean;
}

// Для кандидата - Чаты и Навыки
const candidateSearchItems: NavItem[] = [
    { href: "/messages", label: "Чаты", icon: MessageCircle },
    { href: "/builder", label: "Навыки", icon: PenLine },
]

// Для ресерчера - Поиск и Чат
const recruiterSearchItems: NavItem[] = [
    { href: "/search", label: "Поиск", icon: Search },
    { href: "/messages", label: "Чат", icon: MessageCircle },
]

const candidateNavItems: NavItem[] = []

const analyticsNavItems: NavItem[] = []

const candidateToolsItems: NavItem[] = []

const recruiterNavItems: NavItem[] = []

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname()

    const { role } = useRoleStore()
    const { displayName, avatarUrl, email, user, isLoading: isProfileLoading } = useProfile()
    const isSwitching = useProfessionStore((state) => state.isSwitching)
    const isTraitsLoading = useTraitsStore((state) => state.isLoading)

    // Показываем skeleton только для кандидата при переключении профессии
    const showMenuSkeleton = role !== 'recruiter' && (isSwitching || isTraitsLoading)

    const searchItems = role === 'recruiter' ? recruiterSearchItems : candidateSearchItems
    const platformItems = role === 'recruiter' ? recruiterNavItems : candidateNavItems
    const toolsItems = role === 'recruiter' ? [] : candidateToolsItems

    // Компонент skeleton для пунктов меню
    const MenuSkeleton = () => (
        <SidebarMenu>
            {[1, 2].map((i) => (
                <SidebarMenuItem key={i}>
                    <SidebarMenuButton disabled>
                        <Skeleton className="rounded size-4" />
                        <Skeleton className="w-20 h-4" />
                    </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
        </SidebarMenu>
    )

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                {role === 'recruiter' ? <ResearcherSwitcher /> : <TeamSwitcher />}
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        {showMenuSkeleton ? (
                            <MenuSkeleton />
                        ) : (
                            <SidebarMenu>
                                {searchItems.map((item) => (
                                    <SidebarMenuItem key={item.label}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={pathname === item.href || pathname?.startsWith(item.href + "/")}
                                            disabled={item.disabled}
                                            tooltip={item.label}
                                        >
                                            <Link href={item.disabled ? "#" : item.href} className={item.disabled ? "pointer-events-none opacity-50" : ""}>
                                                <item.icon />
                                                <span>{item.label}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        )}
                    </SidebarGroupContent>
                </SidebarGroup>

                {role !== 'recruiter' && platformItems.length > 0 && (
                    <SidebarGroup>
                        <SidebarGroupLabel>Резюме</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {platformItems.map((item) => (
                                    <SidebarMenuItem key={item.label}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={pathname === item.href || pathname?.startsWith(item.href + "/")}
                                            disabled={item.disabled}
                                            tooltip={item.label}
                                        >
                                            <Link href={item.disabled ? "#" : item.href} className={item.disabled ? "pointer-events-none opacity-50" : ""}>
                                                <item.icon />
                                                <span>{item.label}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}


                {toolsItems.length > 0 && (
                    <SidebarGroup>
                        <SidebarGroupLabel>Инструменты</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {toolsItems.map((item) => (
                                    <SidebarMenuItem key={item.label}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={pathname === item.href}
                                            disabled={item.disabled}
                                            tooltip={item.label}
                                        >
                                            <Link href={item.disabled ? "#" : item.href} className={item.disabled ? "pointer-events-none opacity-50" : ""}>
                                                <item.icon />
                                                <span>{item.label}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}
            </SidebarContent>
            <SidebarFooter>
                <ProBanner />
                <NavUser
                    user={user ? {
                        name: displayName,
                        email: email,
                        avatar: avatarUrl
                    } : null}
                    isLoading={isProfileLoading}
                />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
