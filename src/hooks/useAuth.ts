"use client";

import { useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/useAuthStore";

export function useAuth() {
  const { user, isHydrated, setUser } = useAuthStore();
  const supabase = createClient();

  const refreshUser = useCallback(async () => {
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
  }, [supabase.auth, setUser]);

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
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth, refreshUser, isHydrated, setUser]);

  return {
    user,
    // Only show loading if not hydrated yet (first load)
    isLoading: !isHydrated,
    isAuthenticated: !!user,
    refreshUser,
  };
}
