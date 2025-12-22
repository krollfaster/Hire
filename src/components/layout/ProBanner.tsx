"use client"

import { Sparkles } from "lucide-react"
import Link from "next/link"
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar"

export function ProBanner() {
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton
                    asChild
                    size="lg"
                    className="bg-linear-to-r from-violet-600 hover:from-violet-700 to-indigo-600 hover:to-indigo-700 shadow-md hover:shadow-lg group-data-[collapsible=icon]:p-0! text-white hover:text-white transition-all duration-300"
                >
                    <Link href="/pro">
                        <div className="flex justify-center items-center bg-white/20 rounded-lg ring-1 ring-white/20 size-8 aspect-square text-white">
                            <Sparkles className="fill-white size-4" />
                        </div>
                        <div className="group-data-[collapsible=icon]:hidden flex-1 grid text-sm text-left leading-tight">
                            <span className="font-bold truncate">Оформи PRO подписку</span>
                            <span className="text-white/80 text-xs truncate">Скидка -20% до конца недели</span>
                        </div>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
