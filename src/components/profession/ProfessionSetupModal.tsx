"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useProfessionStore, Profession, ProfessionStatus } from "@/stores/useProfessionStore";
import { Loader2, Briefcase, ArrowLeft, ArrowRight, Zap, Eye, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const grades = [
    { value: "Junior", label: "Junior" },
    { value: "Middle", label: "Middle" },
    { value: "Senior", label: "Senior" },
    { value: "Lead", label: "Lead" },
    { value: "Manager", label: "Manager" },
];

const professionStatuses = [
    { value: "active_search", label: "Активный поиск", icon: Zap },
    { value: "considering", label: "Рассматриваю предложения", icon: Eye },
    { value: "not_searching", label: "Не ищу работу", icon: Moon },
] as const;

function getStatusIcon(statusValue: string) {
    return professionStatuses.find(s => s.value === statusValue)?.icon || Zap;
}

const employmentTypes = [
    { value: "full-time", label: "Полная занятость" },
    { value: "part-time", label: "Частичная занятость" },
    { value: "project", label: "Проектная работа" },
];

const workFormats = [
    { value: "office", label: "Офис" },
    { value: "remote", label: "Удалёнка" },
    { value: "hybrid", label: "Гибрид" },
];

const travelTimes = [
    { value: "15", label: "До 15 минут" },
    { value: "30", label: "До 30 минут" },
    { value: "45", label: "До 45 минут" },
    { value: "60", label: "До 1 часа" },
    { value: "90", label: "До 1.5 часов" },
    { value: "any", label: "Не важно" },
];

const stepVariants = {
    initial: (direction: number) => ({
        opacity: 0,
        x: direction > 0 ? 30 : -30,
    }),
    animate: {
        opacity: 1,
        x: 0,
    },
    exit: (direction: number) => ({
        opacity: 0,
        x: direction > 0 ? -30 : 30,
    }),
};

interface ProfessionSetupModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
    required?: boolean;
    professionToEdit?: Profession | null;
}

export function ProfessionSetupModal({
    open,
    onOpenChange,
    onSuccess,
    required = false,
    professionToEdit = null
}: ProfessionSetupModalProps) {
    const { createProfession, editProfession, isSyncing } = useProfessionStore();

    const [step, setStep] = useState<1 | 2>(1);
    const [direction, setDirection] = useState(1);

    // Поля шага 1
    const [name, setName] = useState("");
    const [status, setStatus] = useState<ProfessionStatus | "">("active_search");
    const [grade, setGrade] = useState("");
    const [salaryMin, setSalaryMin] = useState("");
    const [salaryMax, setSalaryMax] = useState("");

    // Поля шага 2
    const [employmentType, setEmploymentType] = useState("");
    const [workFormat, setWorkFormat] = useState("");
    const [travelTime, setTravelTime] = useState("");
    const [businessTrips, setBusinessTrips] = useState(false);

    const [error, setError] = useState<string | null>(null);

    const isEditMode = !!professionToEdit;

    useEffect(() => {
        if (professionToEdit) {
            setName(professionToEdit.name || "");
            setStatus(professionToEdit.status || "active_search");
            setGrade(professionToEdit.grade || "");
            setSalaryMin(professionToEdit.salaryMin?.toString() || "");
            setSalaryMax(professionToEdit.salaryMax?.toString() || "");
            setEmploymentType(professionToEdit.employmentType || "");
            setWorkFormat(professionToEdit.workFormat || "");
            setTravelTime(professionToEdit.travelTime || "");
            setBusinessTrips(professionToEdit.businessTrips || false);
        } else {
            resetForm();
        }
        setStep(1);
        setDirection(1);
    }, [professionToEdit, open]);

    const resetForm = () => {
        setName("");
        setStatus("active_search");
        setGrade("");
        setSalaryMin("");
        setSalaryMax("");
        setEmploymentType("");
        setWorkFormat("");
        setTravelTime("");
        setBusinessTrips(false);
        setError(null);
        setStep(1);
        setDirection(1);
    };

    const validateStep1 = (): boolean => {
        if (!name.trim()) {
            setError("Укажите название профессии");
            return false;
        }
        if (!grade) {
            setError("Выберите грейд");
            return false;
        }
        setError(null);
        return true;
    };

    const handleNextStep = () => {
        if (validateStep1()) {
            setDirection(1);
            setStep(2);
        }
    };

    const handlePrevStep = () => {
        setError(null);
        setDirection(-1);
        setStep(1);
    };

    const handleSave = async () => {
        setError(null);

        const data = {
            name: name.trim(),
            grade,
            salaryMin: salaryMin ? parseInt(salaryMin, 10) : null,
            salaryMax: salaryMax ? parseInt(salaryMax, 10) : null,
            status: status || null,
            employmentType: employmentType || null,
            workFormat: workFormat || null,
            travelTime: travelTime || null,
            businessTrips: businessTrips,
        };

        let result;

        if (isEditMode && professionToEdit) {
            result = await editProfession(professionToEdit.id, data);
        } else {
            result = await createProfession(data);
        }

        if (result) {
            resetForm();
            onOpenChange(false);
            onSuccess?.();
        } else {
            setError(isEditMode
                ? "Не удалось сохранить изменения. Попробуйте ещё раз."
                : "Не удалось создать профессию. Попробуйте ещё раз."
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
                            <Briefcase className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <DialogTitle>
                                {isEditMode ? "Редактировать профессию" : "Добавить профессию"}
                            </DialogTitle>
                            <DialogDescription className="text-sm">
                                {step === 1
                                    ? "Шаг 1: Укажите какую должность вы ищете"
                                    : "Шаг 2: Настройте условия работы"
                                }
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="mt-4 min-h-[300px]">
                    <AnimatePresence mode="wait" custom={direction}>
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                custom={direction}
                                variants={stepVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={{ duration: 0.25, ease: "easeInOut" }}
                                className="space-y-4"
                            >
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
                                    <Label htmlFor="status">Статус</Label>
                                    <Select value={status} onValueChange={(val) => setStatus(val as ProfessionStatus)} disabled={isSyncing}>
                                        <SelectTrigger id="status">
                                            <div className="flex items-center gap-2">
                                                {(() => {
                                                    const Icon = getStatusIcon(status);
                                                    return <Icon className="size-4" />;
                                                })()}
                                                <SelectValue placeholder="Выберите статус" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {professionStatuses.map((s) => (
                                                <SelectItem key={s.value} value={s.value}>
                                                    {s.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
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

                                <div className="flex justify-between gap-2 pt-2">
                                    {!required && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => handleOpenChange(false)}
                                            disabled={isSyncing}
                                        >
                                            Закрыть
                                        </Button>
                                    )}
                                    <Button
                                        type="button"
                                        onClick={handleNextStep}
                                        disabled={isSyncing}
                                        className="ml-auto"
                                    >
                                        Далее
                                        <ArrowRight className="ml-2 w-4 h-4" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                custom={direction}
                                variants={stepVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={{ duration: 0.25, ease: "easeInOut" }}
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <Label htmlFor="employmentType">Тип занятости</Label>
                                    <Select value={employmentType} onValueChange={setEmploymentType} disabled={isSyncing}>
                                        <SelectTrigger id="employmentType">
                                            <SelectValue placeholder="Выберите тип занятости" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {employmentTypes.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="workFormat">Формат работы</Label>
                                    <Select value={workFormat} onValueChange={setWorkFormat} disabled={isSyncing}>
                                        <SelectTrigger id="workFormat">
                                            <SelectValue placeholder="Выберите формат работы" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {workFormats.map((format) => (
                                                <SelectItem key={format.value} value={format.value}>
                                                    {format.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="travelTime">Время до работы</Label>
                                    <Select value={travelTime} onValueChange={setTravelTime} disabled={isSyncing}>
                                        <SelectTrigger id="travelTime">
                                            <SelectValue placeholder="Выберите время до работы" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {travelTimes.map((time) => (
                                                <SelectItem key={time.value} value={time.value}>
                                                    {time.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex justify-between items-center p-3 border rounded-lg">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="businessTrips" className="cursor-pointer">
                                            Готовность к командировкам
                                        </Label>
                                        <p className="text-muted-foreground text-xs">
                                            Готовы ли вы к рабочим поездкам
                                        </p>
                                    </div>
                                    <Switch
                                        id="businessTrips"
                                        checked={businessTrips}
                                        onCheckedChange={setBusinessTrips}
                                        disabled={isSyncing}
                                    />
                                </div>

                                {error && (
                                    <p className="text-destructive text-sm">{error}</p>
                                )}

                                <div className="flex justify-between gap-2 pt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handlePrevStep}
                                        disabled={isSyncing}
                                    >
                                        <ArrowLeft className="mr-2 w-4 h-4" />
                                        Назад
                                    </Button>
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
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </DialogContent>
        </Dialog>
    );
}
