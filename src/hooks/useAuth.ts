"use client";

import { useEffect, useCallback, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/useAuthStore";

export function useAuth() {
  const { user, isHydrated, setUser } = useAuthStore();
  const supabase = createClient();
  // Флаг для отслеживания завершения верификации сессии
  const [isVerifying, setIsVerifying] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      if (supabaseUser) {
        setUser({
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          user_metadata: supabaseUser.user_metadata,
        });
      } else {
        setUser(null);
      }
    } finally {
      setIsVerifying(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- supabase клиент стабилен
  }, [setUser]);

  useEffect(() => {
    // Only fetch user if hydrated and we need to verify
    if (isHydrated) {
      refreshUser();
    }

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            user_metadata: session.user.user_metadata,
          });
        } else {
          setUser(null);
        }
        // Сессия обновилась - верификация завершена
        setIsVerifying(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- supabase клиент стабилен
  }, [refreshUser, isHydrated, setUser]);

  return {
    user,
    // Loading пока не hydrated ИЛИ пока идёт верификация сессии
    isLoading: !isHydrated || isVerifying,
    isAuthenticated: !!user,
    refreshUser,
  };
}
