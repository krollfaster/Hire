import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

interface AppShellProps {
    children: ReactNode;
}

export const AppShell = ({ children }: AppShellProps) => {
    return (
        <div className="flex bg-background h-screen overflow-hidden">
            <Sidebar />
            <div className="flex flex-1 ml-22">
                <main className="flex-1 bg-background/50 overflow-y-auto">
                    <div className="mx-auto p-3 pl-0 w-full h-full">
                        <div className="flex flex-col justify-center items-center shadow-sm border border-border rounded-xl h-full min-h-[calc(100vh-3rem)] overflow-hidden">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};
