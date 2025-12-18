import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { traitsToText, simpleTextMatch, Trait } from "@/lib/embeddings";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Системный промпт для ИИ-ранжирования кандидатов
const RANKING_SYSTEM_PROMPT = `Ты — ИИ-система оценки соответствия кандидатов. Твоя задача — оценить насколько каждый кандидат подходит под поисковый запрос рекрутера.

ВАЖНО: Ты ДОЛЖЕН отвечать ТОЛЬКО валидным JSON объектом. Никакого текста до или после JSON.

## Формат ответа

{
  "rankings": [
    {
      "candidateId": "id кандидата из входных данных",
      "matchScore": число от 0 до 100,
      "matchExplanation": "Краткое объяснение (1-2 предложения) почему этот кандидат подходит или не подходит"
    }
  ]
}

## Правила оценки

1. matchScore от 0 до 100:
   - 90-100: Идеальное совпадение — все ключевые требования выполнены
   - 70-89: Хорошее совпадение — большинство требований выполнено
   - 50-69: Частичное совпадение — некоторые требования выполнены
   - 30-49: Слабое совпадение — мало релевантного опыта
   - 0-29: Не подходит — нет релевантного опыта

2. Учитывай:
   - Прямое совпадение навыков с требованиями
   - Релевантность опыта работы
   - Уровень (Junior/Middle/Senior/Lead) если указан
   - Смежные навыки и технологии

3. matchExplanation должен быть конкретным и указывать на конкретные навыки/опыт кандидата

Помни: отвечай ТОЛЬКО JSON. Оценивай объективно на основе предоставленных данных.`;

// Avatar URLs для кандидатов
const AVATAR_URLS = [
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
];

export interface SearchCandidate {
    id: string;
    name: string;
    email: string;
    avatar: string;
    professionName: string;
    grade: string;
    matchScore: number;
    matchExplanation: string;
    profileContent: string;
}

export interface GeneratedCandidate {
    id: string;
    name: string;
    role: string;
    bio: string;
    avatar: string;
    matchScore: number;
    matchExplanation: string;
    experience: string;
    location: string;
    skills: string[];
}

interface RankingResult {
    candidateId: string;
    matchScore: number;
    matchExplanation: string;
}

export async function POST(req: Request) {
    try {
        const { query } = await req.json();

        if (!query || query.trim().length === 0) {
            return NextResponse.json(
                { error: "Поисковый запрос не может быть пустым" },
                { status: 400 }
            );
        }

        // 1. Загружаем все активные профессии с графами
        const professions = await prisma.profession.findMany({
            where: {
                isActive: true,
                graph: {
                    isNot: null,
                },
            },
            include: {
                user: true,
                graph: true,
            },
        });

        if (professions.length === 0) {
            return NextResponse.json({
                candidates: [],
                message: "Нет кандидатов с заполненными профилями."
            });
        }

        // 2. Формируем текстовое представление каждого профиля
        const candidatesWithContent = professions.map((profession, index) => {
            const traits: Trait[] = Array.isArray(profession.graph?.content)
                ? (profession.graph.content as unknown as Trait[])
                : [];
            const profileText = traitsToText(traits, profession.name, profession.grade);
            const textMatchScore = simpleTextMatch(query, profileText);

            return {
                id: profession.id,
                userId: profession.userId,
                name: profession.user?.name || "Пользователь",
                email: profession.user?.email || "",
                avatar: profession.user?.avatar || AVATAR_URLS[index % AVATAR_URLS.length],
                professionName: profession.name,
                grade: profession.grade,
                profileContent: profileText,
                textMatchScore,
            };
        });

        // 3. Фильтруем по минимальному текстовому совпадению (если есть много кандидатов)
        let filteredCandidates = candidatesWithContent;
        if (candidatesWithContent.length > 20) {
            // Берём топ-20 по текстовому совпадению
            filteredCandidates = candidatesWithContent
                .sort((a, b) => b.textMatchScore - a.textMatchScore)
                .slice(0, 20);
        }

        if (filteredCandidates.length === 0) {
            return NextResponse.json({
                candidates: [],
                message: "Кандидаты не найдены. Попробуйте изменить запрос."
            });
        }

        // 4. Отправляем в ИИ для ранжирования
        const rankings = await rankCandidatesWithAI(query, filteredCandidates);

        // 5. Формируем финальный результат
        const candidates: SearchCandidate[] = filteredCandidates
            .map((candidate) => {
                const ranking = rankings.find(r => r.candidateId === candidate.id);

                return {
                    id: candidate.id,
                    name: candidate.name,
                    email: candidate.email,
                    avatar: candidate.avatar,
                    professionName: candidate.professionName,
                    grade: candidate.grade,
                    matchScore: ranking?.matchScore ?? Math.round(candidate.textMatchScore * 50),
                    matchExplanation: ranking?.matchExplanation || "Найден по ключевым словам",
                    profileContent: candidate.profileContent,
                };
            })
            .filter(c => c.matchScore > 20) // Убираем совсем нерелевантных
            .sort((a, b) => b.matchScore - a.matchScore);

        return NextResponse.json({ candidates });

    } catch (error) {
        console.error("Search error:", error);
        return NextResponse.json(
            { error: "Произошла ошибка при поиске кандидатов" },
            { status: 500 }
        );
    }
}

/**
 * Ранжирует кандидатов с помощью ИИ
 */
async function rankCandidatesWithAI(
    query: string,
    candidates: Array<{
        id: string;
        name: string;
        professionName: string;
        grade: string;
        profileContent: string;
        textMatchScore: number;
    }>
): Promise<RankingResult[]> {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
        console.warn("OPENROUTER_API_KEY not set, using text match only");
        return candidates.map(c => ({
            candidateId: c.id,
            matchScore: Math.round(c.textMatchScore * 70) + 20,
            matchExplanation: "Оценка на основе ключевых слов",
        }));
    }

    try {
        // Формируем контекст для ИИ (ограничиваем размер)
        const candidatesContext = candidates.map(c => ({
            id: c.id,
            name: c.name,
            profession: `${c.professionName}${c.grade ? ` (${c.grade})` : ""}`,
            profile: c.profileContent.slice(0, 500), // Ограничиваем размер
        }));

        const userMessage = `## Поисковый запрос рекрутера
"${query}"

## Найденные кандидаты
${JSON.stringify(candidatesContext, null, 2)}

Оцени каждого кандидата по шкале 0-100 и объясни почему.`;

        const response = await fetch(OPENROUTER_API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
                "X-Title": "Semantic Talent - Candidate Ranking",
            },
            body: JSON.stringify({
                model: "google/gemini-2.0-flash-001",
                messages: [
                    { role: "system", content: RANKING_SYSTEM_PROMPT },
                    { role: "user", content: userMessage }
                ],
                response_format: { type: "json_object" },
            }),
        });

        if (!response.ok) {
            console.error("AI ranking failed:", await response.text());
            throw new Error("AI ranking failed");
        }

        const data = await response.json();
        const rawContent = data.choices?.[0]?.message?.content || "{}";

        const parsed = JSON.parse(rawContent);
        return parsed.rankings || [];

    } catch (error) {
        console.error("AI ranking error:", error);
        // Fallback: используем только текстовое совпадение
        return candidates.map(c => ({
            candidateId: c.id,
            matchScore: Math.round(c.textMatchScore * 70) + 20,
            matchExplanation: "Оценка на основе ключевых слов",
        }));
    }
}
