"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useResearcherSearchStore } from "@/stores/useResearcherSearchStore";
import { useRoleStore } from "@/stores/useRoleStore";
import { SearchQuerySetupModal } from "@/components/search/SearchQuerySetupModal";

/**
 * Проверяет наличие поискового запроса у авторизованного ресерчера.
 * Если запросов нет — показывает модалку создания без возможности закрытия.
 */
export function SearchQueryGuard() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const { searches, hasInitialized } = useResearcherSearchStore();
    const { role } = useRoleStore();
    const pathname = usePathname();
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        // Ждём пока загрузятся auth И завершится инициализация поисков
        if (authLoading || !hasInitialized) return;

        // Проверяем только если:
        // 1. Пользователь авторизован
        // 2. Роль — ресерчер
        // 3. Не на главной странице
        // 4. Нет ни одного поискового запроса
        const isRecruiter = role === 'recruiter';
        const isOnMainPage = pathname === '/';
        const hasSearches = searches.length > 0;

        if (isAuthenticated && isRecruiter && !isOnMainPage && !hasSearches) {
            setShowModal(true);
        } else {
            setShowModal(false);
        }
    }, [authLoading, hasInitialized, isAuthenticated, role, pathname, searches.length]);

    return (
        <SearchQuerySetupModal
            open={showModal}
            onOpenChange={setShowModal}
            required={true}
        />
    );
}
