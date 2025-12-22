"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useProfessionStore } from "@/stores/useProfessionStore";
import { useRoleStore } from "@/stores/useRoleStore";
import { ProfessionSetupModal } from "@/components/profession/ProfessionSetupModal";

/**
 * Проверяет наличие профессии у авторизованного кандидата.
 * Если профессий нет — показывает модалку создания профессии без возможности закрытия.
 */
export function ProfessionGuard() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const { professions, hasInitialized } = useProfessionStore();
    const { role } = useRoleStore();
    const pathname = usePathname();
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        // Ждём пока загрузятся auth И завершится инициализация профессий
        if (authLoading || !hasInitialized) return;

        // Проверяем только если:
        // 1. Пользователь авторизован
        // 2. Роль — кандидат
        // 3. Не на главной странице
        // 4. Нет ни одной профессии
        const isCandidate = role === 'candidate';
        const isOnMainPage = pathname === '/';
        const hasProfessions = professions.length > 0;

        if (isAuthenticated && isCandidate && !isOnMainPage && !hasProfessions) {
            setShowModal(true);
        } else {
            setShowModal(false);
        }
    }, [authLoading, hasInitialized, isAuthenticated, role, pathname, professions.length]);

    return (
        <ProfessionSetupModal
            open={showModal}
            onOpenChange={setShowModal}
            required={true}
        />
    );
}
