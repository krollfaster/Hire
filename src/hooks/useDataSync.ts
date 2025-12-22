"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "./useAuth";
import { useTraitsStore } from "@/stores/useTraitsStore";
import { useProfessionStore } from "@/stores/useProfessionStore";

export function useDataSync() {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const loadTraits = useTraitsStore((state) => state.loadFromServer);
    const loadProfessions = useProfessionStore((state) => state.loadFromServer);
    const cachedProfessions = useProfessionStore((state) => state.professions);
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
                // Проверяем есть ли кэш traits для активной профессии
                const traitsCache = useTraitsStore.getState().traitsCache;
                const hasCachedTraits = !!traitsCache[cachedActiveProfession.id];

                if (hasCachedTraits) {
                    // Данные уже восстановлены из persist, загружаем их в traits
                    loadTraits(cachedActiveProfession.id);
                } else {
                    // Если traits нет в кэше - загружаем с сервера
                    loadTraits(cachedActiveProfession.id);
                }

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
    }, [isAuthenticated, authLoading, user?.id, loadTraits, loadProfessions, cachedProfessions.length]);

    return {
        isAuthenticated,
        isLoading: authLoading,
    };
}
