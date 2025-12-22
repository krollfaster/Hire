"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./useAuth";

interface ProfileData {
    id?: string;
    firstName?: string | null;
    lastName?: string | null;
    fullName?: string | null;
    avatarUrl?: string | null;
    employmentType?: string | null;
    workFormat?: string | null;
}

export function useProfile() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const hasFetched = useRef(false);
    const previousUserId = useRef<string | null>(null);

    const fetchProfile = useCallback(async () => {
        if (!user) {
            setProfile(null);
            setIsLoading(false);
            hasFetched.current = false;
            previousUserId.current = null;
            return;
        }

        // Don't refetch if same user and already fetched
        if (hasFetched.current && previousUserId.current === user.id) {
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch("/api/profile");
            if (response.ok) {
                const data = await response.json();
                setProfile(data.profile || null);
                hasFetched.current = true;
                previousUserId.current = user.id;
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (!isAuthLoading) {
            fetchProfile();
        }
    }, [isAuthLoading, fetchProfile]);

    // Вычисленные значения с fallback на user_metadata
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
        // Only show loading on initial auth load, not on navigation
        isLoading: isAuthLoading,
        displayName,
        avatarUrl,
        email: user?.email || "",
        user,
        refetch: fetchProfile,
    };
}
