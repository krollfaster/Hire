"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export function AuthGuard() {
    const { isAuthenticated, isLoading } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        // Если загрузка завершена, пользователь не авторизован и это не главная страница
        if (!isLoading && !isAuthenticated && pathname !== "/" && !pathname.startsWith("/auth")) {
            router.replace("/");
        }
    }, [isLoading, isAuthenticated, pathname, router]);

    return null;
}
