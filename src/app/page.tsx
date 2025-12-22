"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, Brain, Search, Users, Zap, CheckCircle, MessageSquare, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRoleStore } from "@/stores/useRoleStore";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "@/components/auth/AuthModal";

export default function LandingPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { setRole } = useRoleStore();
  const { isAuthenticated, isLoading } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'candidate' | 'recruiter' | null>(null);

  const { scrollYProgress } = useScroll({
    target: pageRef,
    offset: ["start start", "end start"],
  });

  const bgParallax = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const gridParallax = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const glowParallax = useTransform(scrollYProgress, [0, 1], [0, -200]);

  const handleRecruiterDemo = () => {
    if (isAuthenticated) {
      setRole('recruiter');
      router.push('/search');
    } else {
      setPendingAction('recruiter');
      setAuthModalOpen(true);
    }
  };

  const handleCandidateJoin = () => {
    if (isAuthenticated) {
      setRole('candidate');
      router.push('/builder');
    } else {
      setPendingAction('candidate');
      setAuthModalOpen(true);
    }
  };

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
        className="top-20 -left-24 absolute bg-primary/20 blur-3xl rounded-full w-72 h-72 pointer-events-none"
      />
      <motion.div
        style={{ y: glowParallax }}
        className="top-64 right-0 absolute bg-sky-400/20 blur-3xl rounded-full w-72 h-72 pointer-events-none"
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
          <Button size="lg" className="gap-2 px-8 glow-primary" onClick={handleCandidateJoin}>
            Присоединиться
            <ArrowRight size={18} />
          </Button>
          <Button size="lg" variant="outline" className="gap-2 px-8" onClick={handleRecruiterDemo}>
            Демо для рекрутеров
          </Button>
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

      {/* Auth Modal */}
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />

      {/* Bottom gradient */}
      <div className="right-0 bottom-0 left-0 absolute bg-linear-to-t from-background to-transparent h-32" />

      {/* Features Section */}
      <section className="relative bg-background py-24">
        <div className="mx-auto px-6 container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 font-bold text-4xl md:text-5xl">
              Почему выбирают <span className="text-gradient">HireTalant</span>?
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground text-lg">
              Революционный подход к поиску талантов, который понимает не только слова, но и смысл
            </p>
          </motion.div>

          <div className="gap-8 grid md:grid-cols-3">
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
                className="group bg-card/50 backdrop-blur-sm p-8 border border-border hover:border-primary/50 rounded-xl transition-colors"
              >
                <div className="flex justify-center items-center bg-primary/10 group-hover:bg-primary/20 mb-6 rounded-lg w-12 h-12 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="mb-3 font-semibold text-xl">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative bg-card/30 py-24">
        <div className="mx-auto px-6 container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 font-bold text-4xl md:text-5xl">
              Как это работает?
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground text-lg">
              Простой процесс от рассказа истории до нахождения идеальной работы
            </p>
          </motion.div>

          <div className="gap-8 grid md:grid-cols-3 mx-auto max-w-4xl">
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
                  <div className="flex justify-center items-center bg-primary mx-auto mb-4 rounded-full w-16 h-16">
                    <step.icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div className="-top-2 -right-2 absolute flex justify-center items-center bg-primary/20 rounded-full w-8 h-8">
                    <span className="font-bold text-primary text-sm">{step.step}</span>
                  </div>
                </div>
                <h3 className="mb-3 font-semibold text-xl">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative bg-background py-24">
        <div className="mx-auto px-6 container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 font-bold text-4xl md:text-5xl">
              Что говорят о нас
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground text-lg">
              Компании уже используют HireTalant для поиска лучших талантов
            </p>
          </motion.div>

          <div className="gap-8 grid md:grid-cols-2 lg:grid-cols-3">
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
                className="bg-card/50 backdrop-blur-sm p-8 border border-border rounded-xl"
              >
                <div className="flex mb-4">
                  {[...Array(5)].map((_, j) => (
                    <CheckCircle key={j} className="fill-primary w-5 h-5 text-primary" />
                  ))}
                </div>
                <blockquote className="mb-6 text-foreground italic">
                  &quot;{testimonial.quote}&quot;
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
        <div className="mx-auto px-6 container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 font-bold text-4xl md:text-5xl">
              Часто задаваемые вопросы
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground text-lg">
              Ответы на самые популярные вопросы о платформе
            </p>
          </motion.div>

          <div className="space-y-6 mx-auto max-w-3xl">
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
                className="bg-card/50 backdrop-blur-sm p-8 border border-border rounded-xl"
              >
                <h3 className="mb-3 font-semibold text-lg">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-linear-to-br from-primary/10 via-background to-primary/5 py-24">
        <div className="mx-auto px-6 text-center container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mx-auto max-w-3xl"
          >
            <h2 className="mb-6 font-bold text-4xl md:text-5xl">
              Готовы найти свою идеальную команду?
            </h2>
            <p className="mb-10 text-muted-foreground text-lg">
              Присоединяйтесь к тысячам профессионалов, которые уже нашли работу мечты с помощью ИИ
            </p>

            <div className="flex sm:flex-row flex-col justify-center gap-4">
              <Button size="lg" className="gap-2 px-8 glow-primary" onClick={handleCandidateJoin}>
                Создать профиль
                <ArrowRight size={18} />
              </Button>
              <Button size="lg" variant="outline" className="gap-2 px-8" onClick={handleRecruiterDemo}>
                Для рекрутеров
                <Users size={18} />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-card/50 py-12 border-border border-t">
        <div className="mx-auto px-6 container">
          <div className="gap-8 grid md:grid-cols-4 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
                <span className="font-bold text-xl">HireTalant</span>
              </div>
              <p className="mb-4 max-w-md text-muted-foreground">
                Революционная платформа поиска талантов на основе искусственного интеллекта.
                Поиск по смыслу, а не по ключевым словам.
              </p>
              <div className="flex gap-4">
                <button onClick={handleCandidateJoin} className="text-muted-foreground hover:text-primary transition-colors">
                  Создать профиль
                </button>
                <button onClick={handleRecruiterDemo} className="text-muted-foreground hover:text-primary transition-colors">
                  Для компаний
                </button>
              </div>
            </div>

            <div>
              <h4 className="mb-4 font-semibold">Продукт</h4>
              <div className="space-y-2">
                <Link href="#" className="block text-muted-foreground hover:text-primary transition-colors">Как это работает</Link>
                <Link href="#" className="block text-muted-foreground hover:text-primary transition-colors">Для кандидатов</Link>
                <Link href="#" className="block text-muted-foreground hover:text-primary transition-colors">Для рекрутеров</Link>
              </div>
            </div>

            <div>
              <h4 className="mb-4 font-semibold">Поддержка</h4>
              <div className="space-y-2">
                <Link href="#" className="block text-muted-foreground hover:text-primary transition-colors">FAQ</Link>
                <Link href="#" className="block text-muted-foreground hover:text-primary transition-colors">Контакты</Link>
                <Link href="#" className="block text-muted-foreground hover:text-primary transition-colors">Политика конфиденциальности</Link>
              </div>
            </div>
          </div>

          <div className="flex sm:flex-row flex-col justify-between items-center pt-8 border-border border-t">
            <p className="text-muted-foreground text-sm">
              © 2025 HireTalant. Все права защищены.
            </p>
            <p className="mt-2 sm:mt-0 text-muted-foreground text-sm">
              Создано с ❤️ для лучших талантов мира
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
