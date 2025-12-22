"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Camera, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useProfile } from "@/hooks/useProfile";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";

export default function SettingsPage() {
    const { profile, displayName, avatarUrl, refetch, isLoading: isProfileLoading } = useProfile();

    const [fullName, setFullName] = useState("");
    const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const isInitialized = useRef(false);

    // Инициализация данных из профиля
    useEffect(() => {
        if (profile && !isInitialized.current) {
            setFullName(profile.fullName || "");
            setCurrentAvatarUrl(profile.avatarUrl || null);
            isInitialized.current = true;
        }
    }, [profile]);

    // Fallback для инициалов
    const getInitials = (name: string) => {
        const parts = name.trim().split(" ");
        if (parts.length > 1) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase() || "??";
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError("Размер файла не должен превышать 5MB");
                return;
            }
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setError(null);
            setSaveSuccess(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setError(null);
        setSaveSuccess(false);

        try {
            let finalAvatarUrl = currentAvatarUrl;

            // Загружаем аватар если выбран новый файл
            if (selectedFile) {
                const formData = new FormData();
                formData.append("file", selectedFile);

                const uploadRes = await fetch("/api/upload-avatar", {
                    method: "POST",
                    body: formData,
                });

                if (!uploadRes.ok) {
                    throw new Error("Не удалось загрузить аватар");
                }

                const { url } = await uploadRes.json();
                finalAvatarUrl = url;
            }

            // Обновляем профиль
            const res = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fullName,
                    avatarUrl: finalAvatarUrl,
                }),
            });

            if (!res.ok) {
                throw new Error("Не удалось сохранить профиль");
            }

            const data = await res.json();
            const updatedProfile = data.profile;

            if (updatedProfile) {
                setFullName(updatedProfile.fullName || "");
                setCurrentAvatarUrl(updatedProfile.avatarUrl || null);
            }

            await refetch();
            setSelectedFile(null);
            setPreviewUrl(null);
            setSaveSuccess(true);

            // Сбрасываем индикатор успеха через 3 секунды
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Произошла ошибка");
        } finally {
            setIsSaving(false);
        }
    };

    const displayAvatarUrl = previewUrl || currentAvatarUrl || avatarUrl;
    const initials = getInitials(fullName || displayName);

    // Проверяем, были ли изменения
    const hasChanges =
        fullName !== (profile?.fullName || "") ||
        selectedFile !== null;

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>


                <div className="flex-1 p-6 md:p-10 overflow-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-8 mx-auto max-w-2xl"
                    >
                        <div>
                            <h1 className="font-bold text-2xl tracking-tight">Настройки</h1>
                            <p className="mt-1 text-muted-foreground">
                                Управление вашим профилем
                            </p>
                        </div>

                        {/* Блок General */}
                        <div className="space-y-4">
                            <h2 className="font-semibold text-lg">Основные</h2>

                            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                                <CardContent className="p-0">
                                    {/* Avatar Row */}
                                    <div className="flex justify-between items-center gap-4 p-4 border-border/50 border-b">
                                        <div className="space-y-1">
                                            <span className="font-medium text-sm line-clamp-1">Аватар</span>
                                            <p className="text-muted-foreground text-xs line-clamp-2">
                                                Рекомендуется квадратное изображение высокого качества. Этот аватар будет использоваться в вашем профиле и сообщениях.
                                            </p>
                                        </div>
                                        <div
                                            className="group relative cursor-pointer"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Avatar className="border-2 border-border group-hover:border-primary w-12 h-12 transition-all">
                                                <AvatarImage src={displayAvatarUrl || undefined} />
                                                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                                    {initials}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="absolute inset-0 flex justify-center items-center bg-black/50 opacity-0 group-hover:opacity-100 rounded-full transition-opacity">
                                                <Camera className="w-5 h-5 text-white" />
                                            </div>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleFileChange}
                                            />
                                        </div>
                                    </div>

                                    {/* Full Name Row */}
                                    <div className="flex justify-between items-center gap-4 p-4">
                                        <div className="space-y-1">
                                            <span className="font-medium text-sm line-clamp-1">Имя</span>
                                            <p className="text-muted-foreground text-xs line-clamp-2">
                                                Ваше полное имя (имя и фамилия), которое будет отображаться во всей системе.
                                            </p>
                                        </div>
                                        <Input
                                            value={fullName}
                                            onChange={(e) => {
                                                setFullName(e.target.value);
                                                setSaveSuccess(false);
                                            }}
                                            placeholder="Введите имя"
                                            className="bg-background/50 max-w-[250px]"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-destructive/10 p-3 rounded-lg text-destructive text-sm"
                            >
                                {error}
                            </motion.div>
                        )}

                        {/* Save Button */}
                        <div className="flex justify-end">
                            <Button
                                onClick={handleSave}
                                disabled={isSaving || !hasChanges || isProfileLoading}
                                className="min-w-[140px]"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                                        Сохранение...
                                    </>
                                ) : saveSuccess ? (
                                    <>
                                        <Check className="mr-2 w-4 h-4" />
                                        Сохранено
                                    </>
                                ) : (
                                    "Сохранить"
                                )}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
