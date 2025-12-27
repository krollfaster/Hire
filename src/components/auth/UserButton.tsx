"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AuthModal } from "./AuthModal";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export function UserButton() {
  const { user, isLoading } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const handleClick = () => {
    if (!user) {
      setAuthModalOpen(true);
    }
    // Если пользователь авторизован - пока ничего не делаем
  };

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return "U";
  };

  return (
    <>
      <button onClick={handleClick} className="focus:outline-none">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "flex flex-col justify-center items-center gap-1 px-3 py-3 rounded-xl text-center transition-colors",
            user
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {isLoading ? (
            <div className="w-5 h-5 rounded-full bg-muted animate-pulse" />
          ) : user ? (
            <Avatar className="h-6 w-6">
              <AvatarImage src={user.user_metadata?.avatar_url || user.user_metadata?.picture} />
              <AvatarFallback className="text-[10px]">
                {getInitials(user.user_metadata?.full_name || user.user_metadata?.name, user.email)}
              </AvatarFallback>
            </Avatar>
          ) : (
            <User size={20} />
          )}
          <span className="font-medium text-[10px] leading-tight">
            {user ? "Профиль" : "Войти"}
          </span>
        </motion.div>
      </button>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </>
  );
}

