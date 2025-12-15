"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    FileUser,
    PenLine,
    MessageCircle,
    Settings,
    Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRoleStore } from "@/stores/useRoleStore";

interface NavItem {
    href: string;
    label: string;
    icon: React.ReactNode;
    disabled?: boolean;
}

const candidateNavItems: NavItem[] = [
    { href: "/builder", label: "Написать", icon: <PenLine size={20} /> },
    { href: "/messages", label: "Чат", icon: <MessageCircle size={20} /> },
    { href: "/dashboard", label: "Резюме", icon: <FileUser size={20} /> },
];

const recruiterNavItems: NavItem[] = [
    { href: "/search", label: "Поиск", icon: <Search size={20} /> },
    { href: "/messages", label: "Чат", icon: <MessageCircle size={20} /> },
];

export const Sidebar = () => {
    const pathname = usePathname();
    const { role } = useRoleStore();

    const navItems = role === 'recruiter' ? recruiterNavItems : candidateNavItems;

    return (
        <aside
            className="top-0 left-0 z-40 fixed flex flex-col items-center py-5 border-border w-22 h-screen"
        >
            {/* Logo */}
            <Link href="/" className="mb-6">
                <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="rounded-md w-10 h-10 overflow-hidden"
                >
                    <img
                        src="/logo.jpg"
                        alt="Logo"
                        className="w-full h-full object-cover"
                    />
                </motion.div>
            </Link>

            {/* Navigation */}
            <nav className="flex flex-col flex-1 items-center gap-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");

                    return (
                        <Link
                            key={item.href}
                            href={item.disabled ? "#" : item.href}
                            className={cn(item.disabled && "pointer-events-none cursor-default")}
                            aria-disabled={item.disabled}
                        >
                            <motion.div
                                whileHover={!item.disabled ? { scale: 1.05 } : {}}
                                whileTap={!item.disabled ? { scale: 0.95 } : {}}
                                className={cn(
                                    "relative flex flex-col justify-center items-center gap-1 px-3 py-3 rounded-xl text-center transition-colors",
                                    !item.disabled && isActive
                                        ? "text-foreground"
                                        : "text-muted-foreground hover:text-foreground",
                                    item.disabled && "opacity-50 text-muted-foreground"
                                )}
                            >
                                {item.icon}
                                <span className="font-medium text-[10px] leading-tight">{item.label}</span>
                            </motion.div>
                        </Link>
                    );
                })}
            </nav>

            {/* Settings at bottom */}
            <div className="mt-auto pt-4">
                <Link href="#" className="cursor-default pointer-events-none" aria-disabled={true}>
                    <motion.div
                        className={cn(
                            "flex flex-col justify-center items-center gap-1 opacity-50 px-3 py-3 rounded-xl text-muted-foreground text-center transition-colors"
                        )}
                    >
                        <Settings size={20} />
                        <span className="font-medium text-[10px] leading-tight">Настройки</span>
                    </motion.div>
                </Link>
            </div>
        </aside>
    );
};
