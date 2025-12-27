"use client"

import { AppShell } from "@/components/layout/AppShell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { Check, Sparkles, Zap, Star, Shield, X, Info } from "lucide-react"
import { useState } from "react"
import { motion } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Статические данные — вынесены за пределы компонента
const PLANS = [
    {
        name: "Free",
        description: "Для знакомства с платформой",
        price: "0 ₽",
        yearlyPrice: "0 ₽",
        duration: "навсегда",
        features: [
            "Базовый семантический профиль",
            "Стандартные AI модели (GPT-3.5)",
            "1 активное резюме",
            "Поиск вакансий",
            "Базовая аналитика просмотров"
        ],
        cta: "Ваш текущий план",
        variant: "outline" as const,
        highlight: false
    },
    {
        name: "PRO",
        description: "Для активного поиска работы",
        price: "990 ₽",
        yearlyPrice: "790 ₽",
        duration: "в месяц",
        features: [
            "Всё, что в Free",
            "Топовые AI модели (GPT-4o, Claude 3.5)",
            "Умное построение графа навыков",
            "Генерация сопроводительных писем",
            "Приоритетная поддержка",
            "Безлимитное количество резюме"
        ],
        cta: "Попробовать PRO",
        variant: "default" as const,
        highlight: true,
        popular: true
    },
    {
        name: "PRO+",
        description: "Для максимального результата",
        price: "2490 ₽",
        yearlyPrice: "1990 ₽",
        duration: "в месяц",
        features: [
            "Всё, что в PRO",
            "Персональный AI-агент рекрутер",
            "Авто-отклики на вакансии",
            "Анализ рынка зарплат",
            "Консультация карьерного ментора",
            "Ранний доступ к новым функциям"
        ],
        cta: "Выбрать PRO+",
        variant: "outline" as const,
        highlight: false
    }
];

const COMPARISON_FEATURES: {
    category: string;
    items: Array<{
        name: string;
        free: boolean | string;
        pro: boolean | string;
        proPlus: boolean | string;
        help?: string;
    }>;
}[] = [
        {
            category: "Основные возможности",
            items: [
                { name: "Количество резюме", free: "1", pro: "Безлимитно", proPlus: "Безлимитно" },
                { name: "Поиск вакансий", free: true, pro: true, proPlus: true },
                { name: "Хранилище файлов", free: "100 МБ", pro: "1 ГБ", proPlus: "10 ГБ" },
            ]
        },
        {
            category: "AI возможности",
            items: [
                { name: "AI Модель", free: "GPT-3.5", pro: "GPT-4o / Claude 3.5", proPlus: "GPT-4o / Claude 3.5" },
                { name: "Генерация сопроводительных писем", free: false, pro: true, proPlus: true },
                { name: "AI-рекрутер (Авто-отклики)", free: false, pro: false, proPlus: "Безлимитно", help: "Персональный агент, который сам ищет вакансии и отправляет отклики." },
                { name: "Анализ соответствия вакансии", free: "Базовый", pro: "Продвинутый", proPlus: "Продвинутый" },
            ]
        },
        {
            category: "Аналитика и Граф",
            items: [
                { name: "Семантический граф навыков", free: "Базовый", pro: "Полный", proPlus: "Полный" },
                { name: "Аналитика просмотров", free: "Базовая", pro: "Полная", proPlus: "Полная" },
                { name: "Анализ рынка зарплат", free: false, pro: false, proPlus: true },
            ]
        },
        {
            category: "Поддержка",
            items: [
                { name: "Уровень поддержки", free: "Email", pro: "Приоритетная", proPlus: "Персональный менеджер" },
                { name: "Карьерная консультация", free: false, pro: false, proPlus: "1 в месяц" },
            ]
        }
    ];

export default function ProPage() {
    const [isAnnual, setIsAnnual] = useState(false)

    const renderValue = (value: boolean | string) => {
        if (typeof value === "boolean") {
            return value ? (
                <div className="flex justify-center"><Check className="size-5 text-violet-500" strokeWidth={3} /></div>
            ) : (
                <div className="flex justify-center"><X className="size-5 text-muted-foreground/30" /></div>
            )
        }
        return <span className="font-medium text-sm">{value}</span>
    }

    return (
        <AppShell>
            <div className="relative flex flex-col flex-1 pb-12 overflow-y-auto scroll-smooth">
                {/* Background Decoration */}
                <div className="z-0 absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="top-0 left-1/2 absolute bg-violet-500/10 blur-[100px] rounded-full w-[800px] h-[500px] -translate-x-1/2" />
                    <div className="right-0 bottom-0 absolute bg-indigo-500/10 blur-[100px] rounded-full w-[600px] h-[400px]" />
                </div>

                <div className="z-10 flex flex-col items-center mx-auto px-4 py-16 max-w-6xl container">

                    {/* Header */}
                    <div className="mb-12 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h2 className="flex justify-center items-center gap-2 mb-4 font-bold text-gradient text-4xl tracking-tight">
                                <Sparkles className="size-8 text-violet-500" />
                                Раскройте свой потенциал
                            </h2>
                            <p className="mx-auto max-w-2xl text-muted-foreground text-xl">
                                Используйте лучшие AI модели для создания идеального профиля и поиска работы мечты.
                            </p>
                        </motion.div>

                        {/* Billing Toggle */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="flex justify-center items-center gap-4 mt-8"
                        >
                            <span className={cn("text-sm transition-colors", !isAnnual ? "text-foreground font-medium" : "text-muted-foreground")}>
                                Ежемесячно
                            </span>
                            <Switch
                                checked={isAnnual}
                                onCheckedChange={setIsAnnual}
                                className="data-[state=checked]:bg-violet-600"
                            />
                            <span className={cn("flex items-center gap-2 text-sm transition-colors", isAnnual ? "text-foreground font-medium" : "text-muted-foreground")}>
                                Ежегодно
                                <Badge variant="secondary" className="bg-violet-100 dark:bg-violet-900/30 border-0 text-violet-600 dark:text-violet-300">
                                    -20%
                                </Badge>
                            </span>
                        </motion.div>
                    </div>

                    {/* Plans Grid */}
                    <div className="gap-8 grid md:grid-cols-3 w-full">
                        {PLANS.map((plan, index) => (
                            <motion.div
                                key={plan.name}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                                className="flex"
                            >
                                <Card className={cn(
                                    "relative flex flex-col hover:shadow-xl py-6 w-full h-full transition-all duration-300",
                                    plan.highlight
                                        ? "border-violet-500/50 shadow-violet-500/10 dark:bg-violet-950/10 bg-white"
                                        : "hover:border-violet-500/30 bg-background/60 backdrop-blur-sm"
                                )}>
                                    {plan.popular && (
                                        <div className="top-0 left-1/2 absolute bg-linear-to-r from-violet-600 to-indigo-600 px-3 py-1 rounded-b-lg font-medium text-white text-xs -translate-x-1/2">
                                            Самый популярный
                                        </div>
                                    )}

                                    <CardHeader className={cn("pb-8", plan.popular && "pt-10")}>
                                        <CardTitle className="flex justify-between items-center text-2xl">
                                            {plan.name}
                                            {plan.name === "PRO+" && <Zap className="fill-amber-500 size-6 text-amber-500" />}
                                            {plan.name === "PRO" && <Star className="fill-violet-500 size-6 text-violet-500" />}
                                        </CardTitle>
                                        <CardDescription className="text-base">
                                            {plan.description}
                                        </CardDescription>
                                        <div className="flex items-baseline gap-1 mt-6">
                                            <span className="font-bold text-4xl">
                                                {isAnnual ? plan.yearlyPrice : plan.price}
                                            </span>
                                            {plan.price !== "0 ₽" && (
                                                <span className="text-muted-foreground text-sm">
                                                    / {plan.duration}
                                                </span>
                                            )}
                                        </div>
                                        {isAnnual && plan.price !== "0 ₽" && (
                                            <div className="mt-1 text-green-500 text-xs">
                                                Экономия {(parseInt(plan.price.replace(/\D/g, '')) - parseInt(plan.yearlyPrice.replace(/\D/g, ''))) * 12} ₽ в год
                                            </div>
                                        )}
                                    </CardHeader>

                                    <CardContent className="flex-1">
                                        <Separator className="mb-6" />
                                        <ul className="space-y-4">
                                            {plan.features.map((feature, i) => (
                                                <li key={i} className="flex items-start gap-3">
                                                    <div className={cn(
                                                        "mt-0.5 p-1 rounded-full",
                                                        plan.highlight ? "bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-300" : "bg-muted text-muted-foreground"
                                                    )}>
                                                        <Check className="size-3" strokeWidth={3} />
                                                    </div>
                                                    <span className="text-sm leading-tight">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>

                                    <CardFooter>
                                        <Button
                                            className={cn(
                                                "w-full h-12 font-semibold text-base transition-all duration-300",
                                                plan.highlight
                                                    ? "bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 text-white"
                                                    : ""
                                            )}
                                            variant={plan.variant}
                                            size="lg"
                                        >
                                            {plan.cta}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {/* Guarantee */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="flex flex-col justify-center items-center gap-2 mt-16 text-muted-foreground text-sm text-center"
                    >
                        <div className="flex items-center gap-2">
                            <Shield className="size-4" />
                            <span>Безопасная оплата. Отмена в любое время.</span>
                        </div>
                        <p>30-дневная гарантия возврата денег, если вам не понравится результат.</p>
                    </motion.div>

                    {/* Comparison Table */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1, duration: 0.6 }}
                        className="mt-32 w-full"
                    >
                        <h3 className="mb-12 font-bold text-3xl text-center">Сравнение планов</h3>

                        <div className="bg-card/30 backdrop-blur-xl border border-border/50 rounded-2xl overflow-hidden">
                            <div className="grid grid-cols-4 bg-muted/20 p-6 border-border/50 border-b">
                                <div className="font-semibold text-lg">Возможности</div>
                                <div className="font-semibold text-lg text-center">Free</div>
                                <div className="font-semibold text-violet-500 text-lg text-center">PRO</div>
                                <div className="font-semibold text-amber-500 text-lg text-center">PRO+</div>
                            </div>


                            {COMPARISON_FEATURES.map((category) => (
                                <div key={category.category}>
                                    <div className="bg-muted/30 px-6 py-3 font-semibold text-muted-foreground text-sm uppercase tracking-wider">
                                        {category.category}
                                    </div>
                                    {category.items.map((item) => (
                                        <div
                                            key={item.name}
                                            className="items-center grid grid-cols-4 hover:bg-white/5 px-6 py-4 border-border/30 last:border-0 border-b transition-colors"
                                        >
                                            <div className="flex items-center gap-2 font-medium">
                                                {item.name}
                                                {item.help && (
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger>
                                                                <Info className="size-4 text-muted-foreground/50 hover:text-muted-foreground transition-colors" />
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                {item.help}
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                )}
                                            </div>
                                            <div className="text-muted-foreground text-center">{renderValue(item.free)}</div>
                                            <div className="font-medium text-center">{renderValue(item.pro)}</div>
                                            <div className="font-semibold text-center">{renderValue(item.proPlus)}</div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </motion.div>

                </div>
            </div>
        </AppShell>
    )
}
