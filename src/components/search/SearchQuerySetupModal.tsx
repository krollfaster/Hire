"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useResearcherSearchStore, ResearcherSearch } from "@/stores/useResearcherSearchStore";
import { Loader2, Search } from "lucide-react";

const grades = [
    { value: "Junior", label: "Junior" },
    { value: "Middle", label: "Middle" },
    { value: "Senior", label: "Senior" },
    { value: "Lead", label: "Lead" },
    { value: "Manager", label: "Manager" },
];

interface SearchQuerySetupModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
    required?: boolean;
    searchToEdit?: ResearcherSearch | null;
}

export function SearchQuerySetupModal({
    open,
    onOpenChange,
    onSuccess,
    required = false,
    searchToEdit = null
}: SearchQuerySetupModalProps) {
    const { createSearch, editSearch, isSyncing } = useResearcherSearchStore();

    // Поля формы
    const [name, setName] = useState("");
    const [query, setQuery] = useState("");
    const [grade, setGrade] = useState("");
    const [salaryMin, setSalaryMin] = useState("");
    const [salaryMax, setSalaryMax] = useState("");

    const [error, setError] = useState<string | null>(null);

    const isEditMode = !!searchToEdit;

    useEffect(() => {
        if (searchToEdit) {
            setName(searchToEdit.name || "");
            setQuery(searchToEdit.query || "");
            setGrade(searchToEdit.grade || "");
            setSalaryMin(searchToEdit.salaryMin?.toString() || "");
            setSalaryMax(searchToEdit.salaryMax?.toString() || "");
        } else {
            resetForm();
        }
    }, [searchToEdit, open]);

    const resetForm = () => {
        setName("");
        setQuery("");
        setGrade("");
        setSalaryMin("");
        setSalaryMax("");
        setError(null);
    };

    const validate = (): boolean => {
        if (!query.trim()) {
            setError("Укажите должность для поиска");
            return false;
        }
        setError(null);
        return true;
    };

    const handleSave = async () => {
        if (!validate()) return;

        setError(null);

        const data = {
            query: query.trim(),
            name: name.trim() || null,
            grade: grade || null,
            salaryMin: salaryMin ? parseInt(salaryMin, 10) : null,
            salaryMax: salaryMax ? parseInt(salaryMax, 10) : null,
        };

        let result;

        if (isEditMode && searchToEdit) {
            result = await editSearch(searchToEdit.id, data);
        } else {
            result = await createSearch(data);
        }

        if (result) {
            resetForm();
            onOpenChange(false);
            onSuccess?.();
        } else {
            setError(isEditMode
                ? "Не удалось сохранить изменения. Попробуйте ещё раз."
                : "Не удалось создать поисковый запрос. Попробуйте ещё раз."
            );
        }
    };

    const formatSalary = (value: string) => {
        return value.replace(/\D/g, "");
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (required && !newOpen) return;
        if (!newOpen) {
            resetForm();
        }
        onOpenChange(newOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent
                className="sm:max-w-md overflow-hidden"
                onPointerDownOutside={(e) => required && e.preventDefault()}
                onEscapeKeyDown={(e) => required && e.preventDefault()}
                showCloseButton={!required}
            >
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="flex justify-center items-center bg-primary/10 rounded-xl w-10 h-10">
                            <Search className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <DialogTitle>
                                {isEditMode ? "Редактировать поиск" : "Новый поисковый запрос"}
                            </DialogTitle>
                            <DialogDescription className="text-sm">
                                Укажите параметры поиска кандидатов
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="query">Должность <span className="text-destructive">*</span></Label>
                        <Input
                            id="query"
                            placeholder="Product Designer, Frontend Developer..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            disabled={isSyncing}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">Название поиска</Label>
                        <Input
                            id="name"
                            placeholder="Например: Поиск дизайнера в Product Team"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={isSyncing}
                        />
                        <p className="text-muted-foreground text-xs">
                            Опционально — для удобной навигации между поисками
                        </p>
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
                            <Label htmlFor="salaryMin">Бюджет от (₽)</Label>
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
                            <Label htmlFor="salaryMax">Бюджет до (₽)</Label>
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
                                onClick={() => handleOpenChange(false)}
                                disabled={isSyncing}
                            >
                                Отмена
                            </Button>
                        )}
                        <Button
                            type="button"
                            onClick={handleSave}
                            disabled={isSyncing}
                        >
                            {isSyncing ? (
                                <>
                                    <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                                    {isEditMode ? "Сохранение..." : "Создание..."}
                                </>
                            ) : (
                                "Сохранить"
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
