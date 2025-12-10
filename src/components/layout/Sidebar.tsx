"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    FileUser,
    PenLine,
    MessageCircle,
    Settings,
    Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
    href: string;
    label: string;
    icon: React.ReactNode;
}

const navItems: NavItem[] = [
    { href: "/builder", label: "Написать", icon: <PenLine size={20} /> },
    { href: "/dashboard", label: "Резюме", icon: <FileUser size={20} /> },
    { href: "/messages", label: "Чат", icon: <MessageCircle size={20} /> },
];

export const Sidebar = () => {
    const pathname = usePathname();

    return (
        <motion.aside
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="top-0 left-0 z-40 fixed flex flex-col items-center bg-sidebar py-5 border-border w-20 h-screen"
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
                        <Link key={item.href} href={item.href}>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={cn(
                                    "relative flex flex-col justify-center items-center gap-1 px-3 py-3 rounded-xl text-center transition-colors",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeNavCollapsed"
                                        className="top-1/2 -left-3 absolute bg-primary rounded-r-full w-1 h-6 -translate-y-1/2"
                                    />
                                )}
                                {item.icon}
                                <span className="font-medium text-[10px] leading-tight">{item.label}</span>
                            </motion.div>
                        </Link>
                    );
                })}
            </nav>

            {/* Settings at bottom */}
            <div className="mt-auto pt-4">
                <Link href="/settings">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={cn(
                            "flex flex-col justify-center items-center gap-1 px-3 py-3 rounded-xl text-center transition-colors",
                            pathname === "/settings"
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                    >
                        <Settings size={20} />
                        <span className="font-medium text-[10px] leading-tight">Настройки</span>
                    </motion.div>
                </Link>
            </div>
        </motion.aside>
    );
};
