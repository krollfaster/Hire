"use client";

import { useState, useRef, useCallback } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, X, Trash2, Loader2, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AvatarUploadDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentAvatarUrl?: string | null;
    fallbackText?: string;
    onAvatarChange: (url: string | null) => void;
}

export function AvatarUploadDialog({
    open,
    onOpenChange,
    currentAvatarUrl,
    fallbackText = "?",
    onAvatarChange,
}: AvatarUploadDialogProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = useCallback((file: File) => {
        setError(null);

        // Проверка типа файла
        if (!file.type.startsWith("image/")) {
            setError("Пожалуйста, выберите изображение");
            return;
        }

        // Проверка размера (макс 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError("Размер файла не должен превышать 5MB");
            return;
        }

        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);

            const file = e.dataTransfer.files[0];
            if (file) {
                handleFileSelect(file);
            }
        },
        [handleFileSelect]
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                handleFileSelect(file);
            }
        },
        [handleFileSelect]
    );

    const handleUpload = async () => {
        if (!selectedFile) return;

        setIsUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("file", selectedFile);

            const response = await fetch("/api/upload-avatar", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Ошибка загрузки");
            }

            const { url } = await response.json();
            onAvatarChange(url);
            handleClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Ошибка загрузки");
        } finally {
            setIsUploading(false);
        }
    };

    const handleReset = async () => {
        setIsUploading(true);
        setError(null);

        try {
            const response = await fetch("/api/upload-avatar", {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Ошибка сброса аватара");
            }

            onAvatarChange(null);
            handleClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Ошибка сброса");
        } finally {
            setIsUploading(false);
        }
    };

    const handleClose = () => {
        setPreviewUrl(null);
        setSelectedFile(null);
        setError(null);
        setIsDragging(false);
        onOpenChange(false);
    };

    const displayUrl = previewUrl || currentAvatarUrl;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Изменить аватар</DialogTitle>
                    <DialogDescription>
                        Загрузите новое изображение или сбросьте текущий аватар
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Текущий/Превью аватар */}
                    <div className="flex justify-center">
                        <Avatar className="border-2 border-border w-24 h-24">
                            <AvatarImage src={displayUrl || undefined} />
                            <AvatarFallback className="text-2xl">
                                {fallbackText}
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    {/* Зона загрузки */}
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        className={cn(
                            "p-6 border-2 border-dashed rounded-lg text-center transition-colors cursor-pointer",
                            isDragging
                                ? "border-primary bg-primary/5"
                                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
                        )}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleInputChange}
                            className="hidden"
                        />
                        <div className="flex flex-col items-center gap-2">
                            {isDragging ? (
                                <Upload className="w-8 h-8 text-primary animate-bounce" />
                            ) : (
                                <ImageIcon className="w-8 h-8 text-muted-foreground" />
                            )}
                            <div className="text-muted-foreground text-sm">
                                {isDragging ? (
                                    <span className="font-medium text-primary">
                                        Отпустите для загрузки
                                    </span>
                                ) : (
                                    <>
                                        <span className="font-medium text-foreground">
                                            Нажмите для выбора
                                        </span>{" "}
                                        или перетащите файл
                                    </>
                                )}
                            </div>
                            <p className="text-muted-foreground text-xs">
                                PNG, JPG, GIF до 5MB
                            </p>
                        </div>
                    </div>

                    {/* Выбранный файл */}
                    {selectedFile && (
                        <div className="flex justify-between items-center bg-muted/50 p-2 rounded-md">
                            <span className="flex-1 text-sm truncate">
                                {selectedFile.name}
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    setSelectedFile(null);
                                    setPreviewUrl(null);
                                }}
                                className="w-8 h-8"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    )}

                    {/* Ошибка */}
                    {error && (
                        <p className="text-destructive text-sm text-center">
                            {error}
                        </p>
                    )}
                </div>

                <DialogFooter className="sm:flex-row flex-col gap-2">
                    {currentAvatarUrl && !previewUrl && (
                        <Button
                            variant="outline"
                            onClick={handleReset}
                            disabled={isUploading}
                            className="text-destructive hover:text-destructive"
                        >
                            {isUploading ? (
                                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                            ) : (
                                <Trash2 className="mr-2 w-4 h-4" />
                            )}
                            Сбросить аватар
                        </Button>
                    )}
                    <div className="flex flex-1 justify-end gap-2">
                        <Button variant="outline" onClick={handleClose}>
                            Отмена
                        </Button>
                        <Button
                            onClick={handleUpload}
                            disabled={!selectedFile || isUploading}
                        >
                            {isUploading ? (
                                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                            ) : (
                                <Upload className="mr-2 w-4 h-4" />
                            )}
                            Загрузить
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
