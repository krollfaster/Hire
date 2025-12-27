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

            // Проверяем состояние кэша напрямую из store
            const hasCachedProfessions = useProfessionStore.getState().professions.length > 0;
            const cachedActiveProfession = useProfessionStore.getState().activeProfession;

            // Если есть кэшированные профессии с активной профессией
            if (hasCachedProfessions && cachedActiveProfession) {
                // Загружаем traits для активной профессии (из кэша или сервера - решает loadFromServer)
                loadTraits(cachedActiveProfession.id);
                // Синхронизируем профессии с сервером в фоне
                loadProfessions();
            } else {
                // Нет кэша - загружаем всё с сервера
                loadProfessions().then(() => {
                    const activeProfession = useProfessionStore.getState().activeProfession;
                    if (activeProfession) {
                        loadTraits(activeProfession.id);
                    }
                });
            }
        }
    }, [isAuthenticated, authLoading, user?.id, loadTraits, loadProfessions]);

    return {
        isAuthenticated,
        isLoading: authLoading,
    };
}
