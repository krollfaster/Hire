"use client";

import { useState } from "react";
import { useUserStore } from "@/stores/useUserStore";
import { WorkExperience, Education, User } from "@/data/mock";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
    Pencil,
    Plus,
    Trash2,
    MapPin,
    Mail,
    Phone,
    Linkedin,
    Send,
    Briefcase,
    GraduationCap,
    Plane,
    User as UserIcon,
} from "lucide-react";

// Types for dialogs
type DialogType = "profile" | "contacts" | "location" | "work" | "education" | null;

interface WorkFormData {
    id?: string;
    company: string;
    position: string;
    startDate: string;
    endDate: string | null;
}

interface EducationFormData {
    id?: string;
    institution: string;
    degree: string;
    field: string;
    year: string;
}

// Format date helper
const formatDate = (date: string | null) => {
    if (!date) return "настоящее время";
    const [year, month] = date.split("-");
    const months = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
    return `${months[parseInt(month) - 1]} ${year}`;
};

// Profile Edit Dialog
function ProfileEditDialog({
    open,
    onOpenChange,
    user,
    onSave,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: User;
    onSave: (data: { name: string; role: string; bio: string }) => void;
}) {
    const [formData, setFormData] = useState({
        name: user.name,
        role: user.role,
        bio: user.bio,
    });

    const handleSave = () => {
        onSave(formData);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Редактировать профиль</DialogTitle>
                    <DialogDescription>
                        Измените информацию о себе
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Имя</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ваше имя"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="role">Должность</Label>
                        <Input
                            id="role"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            placeholder="Ваша должность"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="bio">О себе</Label>
                        <Textarea
                            id="bio"
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            placeholder="Расскажите о себе..."
                            className="min-h-[100px]"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Отмена
                    </Button>
                    <Button onClick={handleSave}>Сохранить</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Contacts Edit Dialog
function ContactsEditDialog({
    open,
    onOpenChange,
    contacts,
    onSave,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    contacts: User["contacts"];
    onSave: (data: User["contacts"]) => void;
}) {
    const [formData, setFormData] = useState(contacts);

    const handleSave = () => {
        onSave(formData);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Редактировать контакты</DialogTitle>
                    <DialogDescription>
                        Укажите ваши контактные данные
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-2">
                            <Mail size={14} /> Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="your@email.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone" className="flex items-center gap-2">
                            <Phone size={14} /> Телефон
                        </Label>
                        <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+7 (999) 123-45-67"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="linkedin" className="flex items-center gap-2">
                            <Linkedin size={14} /> LinkedIn
                        </Label>
                        <Input
                            id="linkedin"
                            value={formData.linkedin}
                            onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                            placeholder="linkedin.com/in/username"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="telegram" className="flex items-center gap-2">
                            <Send size={14} /> Telegram
                        </Label>
                        <Input
                            id="telegram"
                            value={formData.telegram}
                            onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
                            placeholder="@username"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Отмена
                    </Button>
                    <Button onClick={handleSave}>Сохранить</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Location Edit Dialog
function LocationEditDialog({
    open,
    onOpenChange,
    location,
    relocatable,
    onSave,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    location: string;
    relocatable: boolean;
    onSave: (data: { location: string; relocatable: boolean }) => void;
}) {
    const [formData, setFormData] = useState({ location, relocatable });

    const handleSave = () => {
        onSave(formData);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Редактировать локацию</DialogTitle>
                    <DialogDescription>
                        Укажите ваше местоположение
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="location" className="flex items-center gap-2">
                            <MapPin size={14} /> Город, страна
                        </Label>
                        <Input
                            id="location"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            placeholder="Москва, Россия"
                        />
                    </div>
                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="relocatable"
                            checked={formData.relocatable}
                            onCheckedChange={(checked) =>
                                setFormData({ ...formData, relocatable: checked === true })
                            }
                        />
                        <Label htmlFor="relocatable" className="flex items-center gap-2 cursor-pointer">
                            <Plane size={14} /> Готов к релокации
                        </Label>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Отмена
                    </Button>
                    <Button onClick={handleSave}>Сохранить</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Work Experience Edit Dialog
function WorkExperienceDialog({
    open,
    onOpenChange,
    experience,
    onSave,
    onDelete,
    isNew,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    experience: WorkFormData;
    onSave: (data: WorkFormData) => void;
    onDelete?: () => void;
    isNew: boolean;
}) {
    const [formData, setFormData] = useState(experience);

    const handleSave = () => {
        if (formData.company && formData.position) {
            onSave(formData);
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {isNew ? "Добавить опыт работы" : "Редактировать опыт работы"}
                    </DialogTitle>
                    <DialogDescription>
                        Укажите информацию о месте работы
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="company">Компания</Label>
                        <Input
                            id="company"
                            value={formData.company}
                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            placeholder="Название компании"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="position">Должность</Label>
                        <Input
                            id="position"
                            value={formData.position}
                            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                            placeholder="Ваша должность"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Начало</Label>
                            <Input
                                id="startDate"
                                type="month"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endDate">Окончание</Label>
                            <Input
                                id="endDate"
                                type="month"
                                value={formData.endDate || ""}
                                onChange={(e) =>
                                    setFormData({ ...formData, endDate: e.target.value || null })
                                }
                                placeholder="По настоящее время"
                            />
                        </div>
                    </div>
                </div>
                <DialogFooter className="flex-row justify-between sm:justify-between">
                    {!isNew && onDelete && (
                        <Button variant="destructive" onClick={onDelete}>
                            <Trash2 size={14} className="mr-2" />
                            Удалить
                        </Button>
                    )}
                    <div className="flex gap-2 ml-auto">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Отмена
                        </Button>
                        <Button onClick={handleSave}>
                            {isNew ? "Добавить" : "Сохранить"}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Education Edit Dialog
function EducationDialog({
    open,
    onOpenChange,
    education,
    onSave,
    onDelete,
    isNew,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    education: EducationFormData;
    onSave: (data: EducationFormData) => void;
    onDelete?: () => void;
    isNew: boolean;
}) {
    const [formData, setFormData] = useState(education);

    const handleSave = () => {
        if (formData.institution && formData.degree) {
            onSave(formData);
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {isNew ? "Добавить образование" : "Редактировать образование"}
                    </DialogTitle>
                    <DialogDescription>
                        Укажите информацию об учебном заведении
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="institution">Учебное заведение</Label>
                        <Input
                            id="institution"
                            value={formData.institution}
                            onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                            placeholder="Название ВУЗа или курса"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="degree">Степень</Label>
                            <Input
                                id="degree"
                                value={formData.degree}
                                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                                placeholder="Бакалавр, Магистр..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="year">Год окончания</Label>
                            <Input
                                id="year"
                                value={formData.year}
                                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                placeholder="2020"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="field">Специальность</Label>
                        <Input
                            id="field"
                            value={formData.field}
                            onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                            placeholder="Направление обучения"
                        />
                    </div>
                </div>
                <DialogFooter className="flex-row justify-between sm:justify-between">
                    {!isNew && onDelete && (
                        <Button variant="destructive" onClick={onDelete}>
                            <Trash2 size={14} className="mr-2" />
                            Удалить
                        </Button>
                    )}
                    <div className="flex gap-2 ml-auto">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Отмена
                        </Button>
                        <Button onClick={handleSave}>
                            {isNew ? "Добавить" : "Сохранить"}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Work Experience Card
function WorkExperienceCard({
    experience,
    onClick,
}: {
    experience: WorkExperience;
    onClick: () => void;
}) {
    return (
        <div
            onClick={onClick}
            className="group p-3 pl-0 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-foreground truncate">
                        {experience.company}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                        {experience.position}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                        {formatDate(experience.startDate)} — {formatDate(experience.endDate)}
                    </div>
                </div>
                <Pencil
                    size={12}
                    className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1"
                />
            </div>
        </div>
    );
}

// Education Card
function EducationCard({
    education,
    onClick,
}: {
    education: Education;
    onClick: () => void;
}) {
    return (
        <div
            onClick={onClick}
            className="group p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-foreground truncate">
                        {education.institution}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                        {education.degree} • {education.field}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{education.year}</div>
                </div>
                <Pencil
                    size={12}
                    className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1"
                />
            </div>
        </div>
    );
}

export function PersonalInfoPanel() {
    const {
        user,
        updateProfile,
        updateContacts,
        addWorkExperience,
        updateWorkExperience,
        removeWorkExperience,
        addEducation,
        updateEducation,
        removeEducation,
    } = useUserStore();

    // Dialog states
    const [profileDialogOpen, setProfileDialogOpen] = useState(false);
    const [contactsDialogOpen, setContactsDialogOpen] = useState(false);
    const [locationDialogOpen, setLocationDialogOpen] = useState(false);
    const [workDialogOpen, setWorkDialogOpen] = useState(false);
    const [educationDialogOpen, setEducationDialogOpen] = useState(false);

    // Selected items for editing
    const [selectedWork, setSelectedWork] = useState<WorkFormData | null>(null);
    const [selectedEducation, setSelectedEducation] = useState<EducationFormData | null>(null);
    const [isNewWork, setIsNewWork] = useState(false);
    const [isNewEducation, setIsNewEducation] = useState(false);

    const getInitials = (name: string) => {
        if (!name) return "?";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    // Work handlers
    const handleOpenWorkDialog = (work?: WorkExperience) => {
        if (work) {
            setSelectedWork(work);
            setIsNewWork(false);
        } else {
            setSelectedWork({
                company: "",
                position: "",
                startDate: "",
                endDate: null,
            });
            setIsNewWork(true);
        }
        setWorkDialogOpen(true);
    };

    const handleSaveWork = (data: WorkFormData) => {
        if (isNewWork) {
            addWorkExperience({ ...data, id: "" });
        } else if (data.id) {
            updateWorkExperience(data.id, data);
        }
    };

    const handleDeleteWork = () => {
        if (selectedWork?.id) {
            removeWorkExperience(selectedWork.id);
            setWorkDialogOpen(false);
        }
    };

    // Education handlers
    const handleOpenEducationDialog = (edu?: Education) => {
        if (edu) {
            setSelectedEducation(edu);
            setIsNewEducation(false);
        } else {
            setSelectedEducation({
                institution: "",
                degree: "",
                field: "",
                year: "",
            });
            setIsNewEducation(true);
        }
        setEducationDialogOpen(true);
    };

    const handleSaveEducation = (data: EducationFormData) => {
        if (isNewEducation) {
            addEducation({ ...data, id: "" });
        } else if (data.id) {
            updateEducation(data.id, data);
        }
    };

    const handleDeleteEducation = () => {
        if (selectedEducation?.id) {
            removeEducation(selectedEducation.id);
            setEducationDialogOpen(false);
        }
    };

    return (
        <>
            <ScrollArea className="h-full pr-4">
                <div className="space-y-6 pb-4">
                    {/* Header: Avatar + Name + Role */}
                    <div
                        className="group w-full flex items-start gap-4 p-3 -m-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => setProfileDialogOpen(true)}
                    >
                        <Avatar className="w-16 h-16">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback className="text-lg bg-muted">
                                {user.name ? getInitials(user.name) : <UserIcon size={24} className="text-muted-foreground" />}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className={cn(
                                        "font-semibold text-lg",
                                        user.name ? "text-foreground" : "text-muted-foreground italic"
                                    )}>
                                        {user.name || "Добавьте имя"}
                                    </h2>
                                    <p className={cn(
                                        "text-sm",
                                        user.role ? "text-muted-foreground" : "text-muted-foreground/60 italic"
                                    )}>
                                        {user.role || "Укажите должность"}
                                    </p>
                                </div>
                                <Pencil
                                    size={14}
                                    className="text-muted-foreground mt-5 mr-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                />
                            </div>
                            <p className={cn(
                                "text-sm mt-2 line-clamp-2",
                                user.bio ? "text-muted-foreground" : "text-muted-foreground/60 italic"
                            )}>
                                {user.bio || "Расскажите о себе..."}
                            </p>
                        </div>
                    </div>

                    <Separator className="mt-8 mr-4"/>

                    {/* Location */}
                    <div className="w-full">
                        <div className="flex w-full items-center justify-between">
                            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Локация
                            </h4>
                            <Button
                                size="icon-sm"
                                variant="ghost"
                                onClick={() => setLocationDialogOpen(true)}
                            >
                                {user.location ? <Pencil size={12} /> : <Plus size={12} />}
                            </Button>
                        </div>
                        {user.location && (
                            <div
                                className="p-3 -mx-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                                onClick={() => setLocationDialogOpen(true)}
                            >
                                <div className="flex items-center gap-3 text-sm">
                                    <MapPin size={14} className="text-muted-foreground shrink-0" />
                                    <span>{user.location}</span>
                                    {user.relocatable && (
                                        <Badge variant="default" className="text-xs">
                                            Готов к релокации
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* Contacts */}
                    {(() => {
                        const hasAnyContact = user.contacts.email || user.contacts.phone || user.contacts.linkedin || user.contacts.telegram;
                        return (
                            <div>
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Контакты
                                    </h4>
                                    <Button
                                        size="icon-sm"
                                        variant="ghost"
                                        onClick={() => setContactsDialogOpen(true)}
                                    >
                                        {hasAnyContact ? <Pencil size={12} /> : <Plus size={12} />}
                                    </Button>
                                </div>
                                {hasAnyContact && (
                                    <div
                                        className="space-y-2 p-3 -mx-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                                        onClick={() => setContactsDialogOpen(true)}
                                    >
                                        {user.contacts.email && (
                                            <div className="flex items-center gap-3 text-sm">
                                                <Mail size={14} className="text-muted-foreground shrink-0" />
                                                <span>{user.contacts.email}</span>
                                            </div>
                                        )}
                                        {user.contacts.phone && (
                                            <div className="flex items-center gap-3 text-sm">
                                                <Phone size={14} className="text-muted-foreground shrink-0" />
                                                <span>{user.contacts.phone}</span>
                                            </div>
                                        )}
                                        {user.contacts.linkedin && (
                                            <div className="flex items-center gap-3 text-sm">
                                                <Linkedin size={14} className="text-muted-foreground shrink-0" />
                                                <span>{user.contacts.linkedin}</span>
                                            </div>
                                        )}
                                        {user.contacts.telegram && (
                                            <div className="flex items-center gap-3 text-sm">
                                                <Send size={14} className="text-muted-foreground shrink-0" />
                                                <span>{user.contacts.telegram}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })()}

                    <Separator />

                    {/* Work History */}
                    <div>
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                Опыт работы
                            </h4>
                            <Button
                                size="icon-sm"
                                variant="ghost"
                                onClick={() => handleOpenWorkDialog()}
                            >
                                <Plus size={12} />
                            </Button>
                        </div>

                        {user.workHistory.length > 0 && (
                            <div className="space-y-1">
                                {user.workHistory.map((exp) => (
                                    <WorkExperienceCard
                                        key={exp.id}
                                        experience={exp}
                                        onClick={() => handleOpenWorkDialog(exp)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* Education */}
                    <div>
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                Образование
                            </h4>
                            <Button
                                size="icon-sm"
                                variant="ghost"
                                onClick={() => handleOpenEducationDialog()}
                            >
                                <Plus size={12} />
                            </Button>
                        </div>

                        {user.education.length > 0 && (
                            <div className="space-y-1 -mx-3">
                                {user.education.map((edu) => (
                                    <EducationCard
                                        key={edu.id}
                                        education={edu}
                                        onClick={() => handleOpenEducationDialog(edu)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </ScrollArea>

            {/* Dialogs */}
            <ProfileEditDialog
                open={profileDialogOpen}
                onOpenChange={setProfileDialogOpen}
                user={user}
                onSave={(data) => updateProfile(data)}
            />

            <ContactsEditDialog
                open={contactsDialogOpen}
                onOpenChange={setContactsDialogOpen}
                contacts={user.contacts}
                onSave={(data) => {
                    updateContacts(data);
                }}
            />

            <LocationEditDialog
                open={locationDialogOpen}
                onOpenChange={setLocationDialogOpen}
                location={user.location}
                relocatable={user.relocatable}
                onSave={(data) => updateProfile(data)}
            />

            {selectedWork && (
                <WorkExperienceDialog
                    open={workDialogOpen}
                    onOpenChange={setWorkDialogOpen}
                    experience={selectedWork}
                    onSave={handleSaveWork}
                    onDelete={handleDeleteWork}
                    isNew={isNewWork}
                />
            )}

            {selectedEducation && (
                <EducationDialog
                    open={educationDialogOpen}
                    onOpenChange={setEducationDialogOpen}
                    education={selectedEducation}
                    onSave={handleSaveEducation}
                    onDelete={handleDeleteEducation}
                    isNew={isNewEducation}
                />
            )}
        </>
    );
}
