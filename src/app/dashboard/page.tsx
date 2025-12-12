"use client";

import { AppShell } from "@/components/layout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Link2 } from "lucide-react";

export default function DashboardPage() {
    return (
        <AppShell>
            <div className="flex flex-col justify-center items-center text-center px-6 py-12 w-full max-w-xl">
                <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    <Link2 className="w-10 h-10 text-muted-foreground" strokeWidth={1.5} />
                </div>

                <h3 className="text-lg font-semibold text-foreground mb-2">Нет элементов для отображения</h3>
                <p className="text-muted-foreground text-sm max-w-md mb-4">
                    Создайте резюме в разделе «Написать», чтобы оно появилось здесь. Можно добавить
                    навыки и достижения через чат.
                </p>

                <Button asChild>
                    <Link href="/builder">Создать резюме</Link>
                </Button>
            </div>
        </AppShell>
    );
}
