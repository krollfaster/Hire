import { AppShell, ChatPanel } from "@/components/layout";

export default function BuilderPage() {
    return (
        <AppShell>
            <div className="flex w-full h-full">
                <ChatPanel />
                <div className="flex flex-col flex-1 justify-center items-center bg-card p-6">
                    <div className="text-center">
                        <p className="text-muted-foreground">Здесь будет визуализация резюме</p>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
