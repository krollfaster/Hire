"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "./AuthModal";

export function AuthGuard() {
    const { isAuthenticated, isLoading } = useAuth();
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        // Если загрузка завершена, пользователь не авторизован и это не главная страница
        if (!isLoading && !isAuthenticated && pathname !== "/") {
            setOpen(true);
        }
    }, [isLoading, isAuthenticated, pathname]);

    return <AuthModal open={open} onOpenChange={setOpen} />;
}
