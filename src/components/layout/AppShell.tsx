"use client"

import { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useProfessionStore } from "@/stores/useProfessionStore";
import { useTraitsStore } from "@/stores/useTraitsStore";
import { useRoleStore } from "@/stores/useRoleStore";

interface AppShellProps {
    children: ReactNode;
}

export const AppShell = ({ children }: AppShellProps) => {
    const isSwitching = useProfessionStore((state) => state.isSwitching);
    const isTraitsLoading = useTraitsStore((state) => state.isLoading);
    const role = useRoleStore((state) => state.role);

    // Показываем спиннер только для кандидата при переключении профессии
    const showLoading = role !== 'recruiter' && (isSwitching || isTraitsLoading);

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="flex flex-col flex-1 h-screen overflow-hidden">
                <div className="flex flex-1 overflow-hidden">
                    <div className="flex flex-col justify-center items-center shadow-sm w-full h-full overflow-hidden">
                        {showLoading ? (
                            <div className="flex flex-col justify-center items-center gap-3">
                                <Loader2 className="size-8 text-primary animate-spin" />
                                <span className="text-muted-foreground text-sm">Загрузка...</span>
                            </div>
                        ) : (
                            children
                        )}
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
};
