"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProfessionStore } from "@/stores/useProfessionStore";
import { Loader2, Briefcase } from "lucide-react";

const grades = [
    { value: "Junior", label: "Junior" },
    { value: "Middle", label: "Middle" },
    { value: "Senior", label: "Senior" },
    { value: "Lead", label: "Lead" },
    { value: "Manager", label: "Manager" },
];

interface ProfessionSetupModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
    /** Если true - модалка обязательная и её нельзя закрыть */
    required?: boolean;
}

export function ProfessionSetupModal({ open, onOpenChange, onSuccess, required = false }: ProfessionSetupModalProps) {
    const { createProfession, isSyncing } = useProfessionStore();
    const [name, setName] = useState("");
    const [grade, setGrade] = useState("");
    const [salaryMin, setSalaryMin] = useState("");
    const [salaryMax, setSalaryMax] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!name.trim()) {
            setError("Укажите название профессии");
            return;
        }

        if (!grade) {
            setError("Выберите грейд");
            return;
        }

        const result = await createProfession({
            name: name.trim(),
            grade,
            salaryMin: salaryMin ? parseInt(salaryMin, 10) : null,
            salaryMax: salaryMax ? parseInt(salaryMax, 10) : null,
        });

        if (result) {
            setName("");
            setGrade("");
            setSalaryMin("");
            setSalaryMax("");
            onOpenChange(false);
            onSuccess?.();
        } else {
            setError("Не удалось создать профессию. Попробуйте ещё раз.");
        }
    };

    const formatSalary = (value: string) => {
        const num = value.replace(/\D/g, "");
        return num;
    };

    const handleOpenChange = (newOpen: boolean) => {
        // Если модалка обязательная - не даём закрыть
        if (required && !newOpen) return;
        onOpenChange(newOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent
                className="sm:max-w-md"
                onPointerDownOutside={(e) => required && e.preventDefault()}
                onEscapeKeyDown={(e) => required && e.preventDefault()}
                showCloseButton={!required}
            >
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="flex justify-center items-center bg-primary/10 rounded-xl w-10 h-10">
                            <Briefcase className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <DialogTitle>Добавить профессию</DialogTitle>
                            <DialogDescription className="text-sm">
                                Укажите какую должность вы ищете
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Название профессии</Label>
                        <Input
                            id="name"
                            placeholder="Product Designer, Frontend Developer..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={isSyncing}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="grade">Грейд</Label>
                        <Select value={grade} onValueChange={setGrade} disabled={isSyncing}>
                            <SelectTrigger id="grade">
                                <SelectValue placeholder="Выберите грейд" />
                            </SelectTrigger>
                            <SelectContent>
                                {grades.map((g) => (
                                    <SelectItem key={g.value} value={g.value}>
                                        {g.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="gap-3 grid grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="salaryMin">ЗП от (₽)</Label>
                            <Input
                                id="salaryMin"
                                type="text"
                                inputMode="numeric"
                                placeholder="150000"
                                value={salaryMin}
                                onChange={(e) => setSalaryMin(formatSalary(e.target.value))}
                                disabled={isSyncing}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="salaryMax">ЗП до (₽)</Label>
                            <Input
                                id="salaryMax"
                                type="text"
                                inputMode="numeric"
                                placeholder="250000"
                                value={salaryMax}
                                onChange={(e) => setSalaryMax(formatSalary(e.target.value))}
                                disabled={isSyncing}
                            />
                        </div>
                    </div>

                    {error && (
                        <p className="text-destructive text-sm">{error}</p>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                        {!required && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isSyncing}
                            >
                                Закрыть
                            </Button>
                        )}
                        <Button type="submit" disabled={isSyncing}>
                            {isSyncing ? (
                                <>
                                    <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                                    Создание...
                                </>
                            ) : (
                                "Создать"
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog >
    );
}

