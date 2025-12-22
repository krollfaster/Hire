"use client";

import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Camera, User } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";

interface UserSettingsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function UserSettingsModal({ open, onOpenChange }: UserSettingsModalProps) {
    const { profile, refetch } = useProfile();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fallback for avatar initials
    const initials = (firstName || lastName)
        ? `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase()
        : "??";

    useEffect(() => {
        if (open && profile) {
            setFirstName(profile.firstName || "");
            setLastName(profile.lastName || "");
            setAvatarUrl(profile.avatarUrl || null);
            setPreviewUrl(null);
            setSelectedFile(null);
            setError(null);
        }
    }, [open, profile]);

    const fileInputRef = useRef<HTMLInputElement>(null);

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
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setError(null);
        try {
            let finalAvatarUrl = avatarUrl;

            // Upload avatar if changed
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

            // Update profile
            const res = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    avatarUrl: finalAvatarUrl,
                }),
            });

            if (!res.ok) {
                throw new Error("Не удалось сохранить профиль");
            }

            await refetch();
            onOpenChange(false);
        } catch (error) {
            setError(error instanceof Error ? error.message : "Произошла ошибка");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Настройки аккаунта</DialogTitle>
                </DialogHeader>
                <div className="gap-6 grid py-4">
                    <div className="flex justify-center">
                        <div className="group relative cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <Avatar className="border-2 border-border w-24 h-24">
                                <AvatarImage src={previewUrl || avatarUrl || undefined} />
                                <AvatarFallback className="text-xl">{initials}</AvatarFallback>
                            </Avatar>
                            <div className="absolute inset-0 flex justify-center items-center bg-black/40 opacity-0 group-hover:opacity-100 rounded-full transition-opacity">
                                <Camera className="w-8 h-8 text-white" />
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

                    <div className="gap-2 grid">
                        <Label htmlFor="firstName">Имя</Label>
                        <Input
                            id="firstName"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="Иван"
                        />
                    </div>

                    <div className="gap-2 grid">
                        <Label htmlFor="lastName">Фамилия</Label>
                        <Input
                            id="lastName"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Иванов"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Отмена
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
                        Сохранить
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
