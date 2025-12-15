import { ReactNode } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

interface AppShellProps {
    children: ReactNode;
}

export const AppShell = ({ children }: AppShellProps) => {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="flex flex-col flex-1 h-screen overflow-hidden">

                <div className="flex flex-1 overflow-hidden">
                    <div className="flex flex-col justify-center items-center shadow-sm w-full h-full overflow-hidden">
                        {children}
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
};
