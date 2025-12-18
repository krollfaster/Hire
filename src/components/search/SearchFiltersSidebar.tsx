"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { X, SlidersHorizontal, MapPin, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface SearchFilters {
    matchScore: number[];
    experience: string[];
    location: string[];
}

interface SearchFiltersSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    filters: SearchFilters;
    onFiltersChange: (filters: SearchFilters) => void;
}

const experienceOptions = [
    "Junior (1-3 года)",
    "Middle (3-5 лет)",
    "Senior (5-8 лет)",
    "Lead (8+ лет)"
];

const locationOptions = [
    "Москва",
    "Санкт-Петербург",
    "Екатеринбург",
    "Новосибирск",
    "Казань",
    "Удаленно"
];



export const SearchFiltersSidebar = ({
    isOpen,
    onClose,
    filters,
    onFiltersChange
}: SearchFiltersSidebarProps) => {
    const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);

    // Синхронизировать локальное состояние с пропсом filters
    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    const handleFilterChange = (key: keyof SearchFilters, value: any) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
        onFiltersChange(newFilters);
    };



    const clearAllFilters = () => {
        const emptyFilters: SearchFilters = {
            matchScore: [70],
            experience: [],
            location: [],
        };
        setLocalFilters(emptyFilters);
        onFiltersChange(emptyFilters);
    };

    return (
        <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{
                width: isOpen ? "300px" : "0px",
                opacity: isOpen ? 1 : 0
            }}
            transition={{
                duration: 0.3,
                ease: [0.25, 0.46, 0.45, 0.94]
            }}
            className="bg-card/95 shadow-2xl backdrop-blur-xl border-border border-l w-80 h-full overflow-hidden"
        >
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex justify-between items-center px-2 pt-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="hover:bg-muted/50"
                    >
                        <X className="w-4 h-4" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                        className="font-normal text-muted-foreground hover:text-foreground text-xs"
                    >
                        Сбросить фильтры
                    </Button>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-4 px-3 py-6 overflow-y-auto">
                    {/* Match Score */}
                    <div className="space-y-5 px-4 py-3 border-1 border-border rounded-lg">
                        <Label className="flex items-center gap-2 font-medium text-sm">
                            Процент совпадения
                        </Label>
                        <div className="space-y-3">
                            <Slider
                                value={localFilters.matchScore}
                                onValueChange={(value) => handleFilterChange('matchScore', value)}
                                max={100}
                                min={40}
                                step={5}
                                className="w-full"
                            />
                            <div className="flex justify-between mt-1 text-muted-foreground text-xs">
                                <span>40%</span>
                                <span className="font-medium text-primary">{localFilters.matchScore[0]}%</span>
                                <span>100%</span>
                            </div>
                        </div>
                    </div>

                    {/* Experience */}
                    <div className="space-y-3 px-4 py-3 pb-4 border-1 border-border rounded-lg">
                        <Label className="flex items-center gap-2 font-medium text-sm">
                            Опыт работы
                        </Label>
                        <div className="space-y-2">
                            {experienceOptions.map((exp) => (
                                <div key={exp} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`exp-${exp}`}
                                        checked={localFilters.experience.includes(exp)}
                                        onCheckedChange={(checked) => {
                                            const current = localFilters.experience;
                                            const newExp = checked
                                                ? [...current, exp]
                                                : current.filter(e => e !== exp);
                                            handleFilterChange('experience', newExp);
                                        }}
                                    />
                                    <Label
                                        htmlFor={`exp-${exp}`}
                                        className="text-sm cursor-pointer"
                                    >
                                        {exp}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-3 px-4 py-3 border-1 border-border rounded-lg">
                        <Label className="flex items-center gap-2 font-medium text-sm">
                            Локация
                        </Label>
                        <div className="space-y-2">
                            {locationOptions.map((location) => (
                                <div key={location} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`loc-${location}`}
                                        checked={localFilters.location.includes(location)}
                                        onCheckedChange={(checked) => {
                                            const current = localFilters.location;
                                            const newLoc = checked
                                                ? [...current, location]
                                                : current.filter(l => l !== location);
                                            handleFilterChange('location', newLoc);
                                        }}
                                    />
                                    <Label
                                        htmlFor={`loc-${location}`}
                                        className="text-sm cursor-pointer"
                                    >
                                        {location}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
