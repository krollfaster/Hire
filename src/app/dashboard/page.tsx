"use client";

import { AppShell } from "@/components/layout";

export default function DashboardPage() {
    return (
        <AppShell>
            <div className="gap-6 grid md:grid-cols-2 lg:grid-cols-3">
                <div className="bg-card p-6 border border-border rounded-xl">
                    <h3 className="mb-2 font-semibold text-lg">Семантический профиль</h3>
                    <p className="text-muted-foreground text-sm">Навыки, извлечённые ИИ</p>
                </div>
                <div className="bg-card p-6 border border-border rounded-xl">
                    <h3 className="mb-2 font-semibold text-lg">Просмотры профиля</h3>
                    <p className="font-bold text-primary text-3xl">847</p>
                </div>
                <div className="bg-card p-6 border border-border rounded-xl">
                    <h3 className="mb-2 font-semibold text-lg">Vibe Match Score</h3>
                    <p className="font-bold text-primary text-3xl">92%</p>
                </div>
            </div>
        </AppShell>
    );
}
