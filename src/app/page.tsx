"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="relative bg-background min-h-screen overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/20 via-background to-background" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
        }}
      />

      {/* Content */}
      <div className="z-10 relative flex flex-col justify-center items-center px-6 min-h-screen">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 bg-card/50 backdrop-blur-sm mb-8 px-4 py-2 border border-border rounded-full"
        >
          <Sparkles size={16} className="text-primary" />
          <span className="text-muted-foreground text-sm">
            Поиск талантов на основе ИИ
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6 font-bold text-5xl md:text-7xl text-center tracking-tight"
        >
          <span className="text-foreground">Резюме </span>
          <span className="text-muted-foreground/50 line-through">мертво</span>
          <span className="text-foreground">.</span>
          <br />
          <span className="text-gradient">Контекст — король.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-10 max-w-xl text-muted-foreground text-lg text-center"
        >
          Расскажите свою историю. ИИ построит семантический профиль.
          Рекрутеры найдут вас по смыслу, а не по ключевым словам.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex sm:flex-row flex-col gap-4"
        >
          <Link href="/dashboard">
            <Button size="lg" className="gap-2 px-8 glow-primary">
              Присоединиться
              <ArrowRight size={18} />
            </Button>
          </Link>
          <Link href="/search">
            <Button size="lg" variant="outline" className="gap-2 px-8">
              Демо для рекрутеров
            </Button>
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex gap-12 mt-20 text-center"
        >
          {[
            { value: "12K+", label: "Талантов" },
            { value: "94%", label: "Точность подбора" },
            { value: "2.3x", label: "Быстрее найм" },
          ].map((stat, i) => (
            <div key={i}>
              <p className="font-bold text-foreground text-3xl">{stat.value}</p>
              <p className="text-muted-foreground text-sm">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom gradient */}
      <div className="right-0 bottom-0 left-0 absolute bg-linear-to-t from-background to-transparent h-32" />
    </div>
  );
}
