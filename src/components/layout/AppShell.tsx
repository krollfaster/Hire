"use client";

import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

interface AppShellProps {
    children: ReactNode;
}

export const AppShell = ({ children }: AppShellProps) => {
    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex flex-col flex-1 ml-20">
                <div className="flex-1 p-6">{children}</div>
            </main>
        </div>
    );
};
