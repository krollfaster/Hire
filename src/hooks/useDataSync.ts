"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "./useAuth";
import { useTraitsStore } from "@/stores/useTraitsStore";
import { useProfessionStore } from "@/stores/useProfessionStore";

export function useDataSync() {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const loadTraits = useTraitsStore((state) => state.loadFromServer);
    const loadProfessions = useProfessionStore((state) => state.loadFromServer);
    const hasLoaded = useRef(false);
    const prevUserId = useRef<string | null>(null);

    useEffect(() => {
        // Ждем пока auth загрузится
        if (authLoading) return;

        // Если пользователь изменился (вошел/вышел/другой пользователь)
        const currentUserId = user?.id || null;
        if (currentUserId !== prevUserId.current) {
            prevUserId.current = currentUserId;
            hasLoaded.current = false;
        }

        // Загружаем данные только если пользователь авторизован и данные еще не загружены
        if (isAuthenticated && !hasLoaded.current) {
            hasLoaded.current = true;
            // Сначала загружаем профессии, затем traits (граф активной профессии)
            loadProfessions().then(() => {
                loadTraits();
            });
        }
    }, [isAuthenticated, authLoading, user?.id, loadTraits, loadProfessions]);

    return {
        isAuthenticated,
        isLoading: authLoading,
    };
}
