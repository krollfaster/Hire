"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";
import { ArrowRight, Sparkles, Brain, Search, Users, Zap, CheckCircle, MessageSquare, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: pageRef,
    offset: ["start start", "end start"],
  });

  const bgParallax = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const gridParallax = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const glowParallax = useTransform(scrollYProgress, [0, 1], [0, -200]);

  return (
    <div ref={pageRef} className="relative bg-background min-h-screen overflow-hidden">
      {/* Background gradient */}
      <motion.div
        style={{ y: bgParallax }}
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/20 via-background to-background"
      />

      {/* Grid pattern */}
      <motion.div
        style={{
          y: gridParallax,
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
        className="absolute inset-0 opacity-[0.02]"
      />

      {/* Floating glows */}
      <motion.div
        style={{ y: glowParallax }}
        className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl"
      />
      <motion.div
        style={{ y: glowParallax }}
        className="pointer-events-none absolute right-0 top-64 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl"
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
          <span className="text-foreground">. </span>
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
          <Link href="/builder">
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

      {/* Features Section */}
      <section className="relative bg-background py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-bold text-4xl md:text-5xl mb-4">
              Почему выбирают <span className="text-gradient">HireTalant</span>?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Революционный подход к поиску талантов, который понимает не только слова, но и смысл
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "Семантический анализ",
                description: "ИИ понимает контекст и смысл опыта кандидата, а не просто ключевые слова"
              },
              {
                icon: Search,
                title: "Точный поиск",
                description: "Рекрутеры находят идеальных кандидатов по смыслу, а не по шаблонам"
              },
              {
                icon: Zap,
                title: "Быстрый результат",
                description: "В 2.3 раза быстрее традиционного подбора с точностью 94%"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group p-8 bg-card/50 backdrop-blur-sm border border-border rounded-xl hover:border-primary/50 transition-colors"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-xl mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative bg-card/30 py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-bold text-4xl md:text-5xl mb-4">
              Как это работает?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Простой процесс от рассказа истории до нахождения идеальной работы
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "1",
                icon: MessageSquare,
                title: "Расскажите свою историю",
                description: "Ответьте на вопросы ИИ о вашем опыте, навыках и достижениях"
              },
              {
                step: "2",
                icon: Brain,
                title: "ИИ создаст профиль",
                description: "Алгоритм построит семантический профиль на основе вашего контекста"
              },
              {
                step: "3",
                icon: Target,
                title: "Рекрутеры найдут вас",
                description: "Компании смогут найти вас по смыслу, а не по ключевым словам"
              }
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="relative mb-8">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold text-sm">{step.step}</span>
                  </div>
                </div>
                <h3 className="font-semibold text-xl mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative bg-background py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-bold text-4xl md:text-5xl mb-4">
              Что говорят о нас
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Компании уже используют HireTalant для поиска лучших талантов
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                quote: "HireTalant революционизировал наш процесс найма. Мы нашли идеального CTO за неделю вместо месяцев поиска.",
                author: "Анна Петрова",
                role: "HR Director, TechCorp",
                company: "TechCorp"
              },
              {
                quote: "Точность подбора впечатляет. ИИ понимает кандидатов лучше, чем традиционные методы.",
                author: "Михаил Сидоров",
                role: "CEO, StartupXYZ",
                company: "StartupXYZ"
              },
              {
                quote: "Наши рекрутеры в восторге. Они могут сосредоточиться на кандидатах, а не на фильтрации резюме.",
                author: "Елена Козлова",
                role: "Talent Manager, BigTech",
                company: "BigTech"
              }
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="p-8 bg-card/50 backdrop-blur-sm border border-border rounded-xl"
              >
                <div className="flex mb-4">
                  {[...Array(5)].map((_, j) => (
                    <CheckCircle key={j} className="w-5 h-5 text-primary fill-primary" />
                  ))}
                </div>
                <blockquote className="text-foreground mb-6 italic">
                  "{testimonial.quote}"
                </blockquote>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.author}</p>
                  <p className="text-muted-foreground text-sm">{testimonial.role}</p>
                  <p className="text-primary text-sm">{testimonial.company}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative bg-card/30 py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-bold text-4xl md:text-5xl mb-4">
              Часто задаваемые вопросы
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Ответы на самые популярные вопросы о платформе
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                question: "Как HireTalant отличается от традиционных сайтов поиска работы?",
                answer: "В отличие от традиционных платформ, которые ищут по ключевым словам, наша ИИ-система понимает смысл и контекст вашего опыта. Это позволяет находить более релевантные вакансии и кандидатов."
              },
              {
                question: "Безопасны ли мои данные?",
                answer: "Да, мы используем современные методы шифрования и следуем стандартам GDPR. Ваши данные защищены, и мы никогда не передаем их третьим сторонам без вашего согласия."
              },
              {
                question: "Сколько времени занимает создание профиля?",
                answer: "Создание семантического профиля занимает около 15-20 минут. ИИ задаст вам несколько вопросов о вашем опыте, и на основе ответов построит подробный профиль."
              },
              {
                question: "Доступно ли это для всех профессий?",
                answer: "Да, наша платформа подходит для специалистов из любой сферы - от IT и маркетинга до финансов и творческих профессий. ИИ адаптируется к любому типу опыта."
              }
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="p-8 bg-card/50 backdrop-blur-sm border border-border rounded-xl"
              >
                <h3 className="font-semibold text-lg mb-3">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-primary/5 py-24">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="font-bold text-4xl md:text-5xl mb-6">
              Готовы найти свою идеальную команду?
            </h2>
            <p className="text-muted-foreground text-lg mb-10">
              Присоединяйтесь к тысячам профессионалов, которые уже нашли работу мечты с помощью ИИ
            </p>

            <div className="flex sm:flex-row flex-col gap-4 justify-center">
              <Link href="/builder">
                <Button size="lg" className="gap-2 px-8 glow-primary">
                  Создать профиль
                  <ArrowRight size={18} />
                </Button>
              </Link>
              <Link href="/search">
                <Button size="lg" variant="outline" className="gap-2 px-8">
                  Для рекрутеров
                  <Users size={18} />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-card/50 border-t border-border py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
                <span className="font-bold text-xl">HireTalant</span>
              </div>
              <p className="text-muted-foreground mb-4 max-w-md">
                Революционная платформа поиска талантов на основе искусственного интеллекта.
                Поиск по смыслу, а не по ключевым словам.
              </p>
              <div className="flex gap-4">
                <Link href="/builder" className="text-muted-foreground hover:text-primary transition-colors">
                  Создать профиль
                </Link>
                <Link href="/search" className="text-muted-foreground hover:text-primary transition-colors">
                  Для компаний
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Продукт</h4>
              <div className="space-y-2">
                <Link href="#" className="block text-muted-foreground hover:text-primary transition-colors">Как это работает</Link>
                <Link href="#" className="block text-muted-foreground hover:text-primary transition-colors">Для кандидатов</Link>
                <Link href="#" className="block text-muted-foreground hover:text-primary transition-colors">Для рекрутеров</Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Поддержка</h4>
              <div className="space-y-2">
                <Link href="#" className="block text-muted-foreground hover:text-primary transition-colors">FAQ</Link>
                <Link href="#" className="block text-muted-foreground hover:text-primary transition-colors">Контакты</Link>
                <Link href="#" className="block text-muted-foreground hover:text-primary transition-colors">Политика конфиденциальности</Link>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">
              © 2025 HireTalant. Все права защищены.
            </p>
            <p className="text-muted-foreground text-sm mt-2 sm:mt-0">
              Создано с ❤️ для лучших талантов мира
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
