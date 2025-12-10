import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

interface AppShellProps {
    children: ReactNode;
}

export const AppShell = ({ children }: AppShellProps) => {
    return (
        <div className="flex bg-background h-screen overflow-hidden">
            <Sidebar />
            <div className="flex flex-1 ml-20">
                <main className="flex-1 bg-background/50 overflow-y-auto">
                    <div className="mx-auto p-4 w-full h-full">
                        <div className="flex flex-col justify-center items-center bg-card shadow-sm border border-border rounded-xl h-full min-h-[calc(100vh-3rem)] overflow-hidden">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};
