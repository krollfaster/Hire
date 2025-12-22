"use client";

import { useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { useProfileStore } from "@/stores/useProfileStore";

export function useProfile() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const { profile, isLoading, fetchProfile, setProfile, clearAll, currentUserId } = useProfileStore();

    // Fetch profile when user changes
    useEffect(() => {
        if (isAuthLoading) return;

        if (!user) {
            clearAll();
            return;
        }

        // Fetch from server (will use cached data from localStorage while loading)
        fetchProfile(user.id);
    }, [isAuthLoading, user, fetchProfile, clearAll]);

    // Публичная функция refetch с принудительным обновлением
    const refetch = useCallback(async () => {
        if (user) {
            await fetchProfile(user.id, true);
        }
    }, [user, fetchProfile]);

    // Функция для мгновенного обновления профиля (для оптимистичного UI)
    const updateProfileLocally = useCallback((updates: Partial<typeof profile>) => {
        if (profile) {
            setProfile({ ...profile, ...updates });
        }
    }, [profile, setProfile]);

    // Приоритет: профиль из store (включая localStorage) > user_metadata > email
    const displayName = profile?.fullName ||
        user?.user_metadata?.full_name ||
        user?.user_metadata?.name ||
        user?.email ||
        "";

    const avatarUrl = profile?.avatarUrl ||
        user?.user_metadata?.avatar_url ||
        user?.user_metadata?.picture ||
        "";

    return {
        profile,
        isLoading: isAuthLoading,
        displayName,
        avatarUrl,
        email: user?.email || "",
        user,
        refetch,
        updateProfileLocally,
    };
}
