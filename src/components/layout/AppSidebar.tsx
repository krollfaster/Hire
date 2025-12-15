"use client"

import * as React from "react"
import {
    PenLine,
    MessageCircle,
    Search,
    Eye,
    Banknote,
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
import { UserButton } from "@/components/auth"
import { useRoleStore } from "@/stores/useRoleStore"
import { useAuth } from "@/hooks/useAuth"
import { NavUser } from "./NavUser"
import { TeamSwitcher } from "./TeamSwitcher"

interface NavItem {
    href: string;
    label: string;
    icon: React.ElementType;
    disabled?: boolean;
}

const candidateNavItems: NavItem[] = [
    { href: "/builder", label: "Мои навыки", icon: PenLine },
    { href: "/messages", label: "Предложения", icon: MessageCircle },
]

const candidateToolsItems: NavItem[] = [
    { href: "/impressions", label: "Показы", icon: Eye, disabled: true },
    { href: "/salaries", label: "Зарплаты", icon: Banknote, disabled: true },
]

const recruiterNavItems: NavItem[] = [
    { href: "/search", label: "Поиск", icon: Search },
    { href: "/messages", label: "Чат", icon: MessageCircle },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname()

    const { role } = useRoleStore()
    const { user } = useAuth()

    const platformItems = role === 'recruiter' ? recruiterNavItems : candidateNavItems
    const toolsItems = role === 'recruiter' ? [] : candidateToolsItems

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <TeamSwitcher />
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Платформа</SidebarGroupLabel>
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
                                        <Link href={item.disabled ? "#" : item.href}>
                                            <item.icon />
                                            <span>{item.label}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

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
                <NavUser user={user ? {
                    name: user.user_metadata?.full_name || user.user_metadata?.name || user.email,
                    email: user.email || "",
                    avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture || ""
                } : null} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
