import { NextResponse } from "next/server";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

const SYSTEM_PROMPT = `Ты — ИИ-система поиска талантов. Твоя задача — генерировать релевантных кандидатов на основе поискового запроса рекрутера.

ВАЖНО: Ты ДОЛЖЕН отвечать ТОЛЬКО валидным JSON объектом. Никакого текста до или после JSON.

## Формат ответа

{
  "candidates": [
    {
      "id": "уникальный_id",
      "name": "Имя Фамилия",
      "role": "Должность",
      "avatar": "номер_аватара",
      "bio": "Краткое описание кандидата (1-2 предложения)",
      "matchScore": число от 65 до 98,
      "matchExplanation": "Почему этот кандидат подходит под запрос",
      "skills": ["Навык 1", "Навык 2", "Навык 3"],
      "experience": "X лет опыта",
      "location": "Город, Страна"
    }
  ]
}

## Правила генерации

1. Генерируй от 4 до 8 кандидатов в зависимости от специфичности запроса
2. Имена должны быть русскими и реалистичными
3. matchScore должен быть выше для более релевантных кандидатов
4. Первые кандидаты должны быть наиболее релевантными (сортировка по matchScore)
5. avatar — число от 1 до 8 (разные для разных кандидатов)
6. Навыки должны быть релевантны роли и запросу
7. matchExplanation должен объяснять, почему кандидат подходит под конкретный запрос
8. Добавляй разнообразие: разный опыт, разные специализации внутри запрошенной области

## Примеры запросов и ответов

Запрос: "Senior React разработчик с опытом в финтехе"

{
  "candidates": [
    {
      "id": "c1",
      "name": "Алексей Морозов",
      "role": "Senior Frontend Developer",
      "avatar": "1",
      "bio": "Ведущий разработчик с 7-летним опытом в React. Строил платёжные системы в Тинькофф.",
      "matchScore": 96,
      "matchExplanation": "Глубокий опыт React и прямой опыт в финтехе — идеальное совпадение",
      "skills": ["React", "TypeScript", "Redux", "Node.js", "Финтех"],
      "experience": "7 лет",
      "location": "Москва, Россия"
    }
  ]
}

Помни: отвечай ТОЛЬКО JSON. Генерируй реалистичных и разнообразных кандидатов.`;

// Avatar URLs for generated candidates
const AVATAR_URLS: Record<string, string> = {
    "1": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    "2": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    "3": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    "4": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face",
    "5": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
    "6": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    "7": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    "8": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
};

export interface GeneratedCandidate {
    id: string;
    name: string;
    role: string;
    avatar: string;
    bio: string;
    matchScore: number;
    matchExplanation: string;
    skills: string[];
    experience: string;
    location: string;
}

export async function POST(req: Request) {
    try {
        const { query } = await req.json();
        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!apiKey) {
            console.error("❌ OPENROUTER_API_KEY is missing in environment variables!");
            return NextResponse.json(
                { error: "API ключ не настроен. Пожалуйста, добавьте OPENROUTER_API_KEY в файл .env.local" },
                { status: 500 }
            );
        }

        if (!query || query.trim().length === 0) {
            return NextResponse.json(
                { error: "Поисковый запрос не может быть пустым" },
                { status: 400 }
            );
        }

        const response = await fetch(OPENROUTER_API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
                "X-Title": "Semantic Talent - Recruiter Search",
            },
            body: JSON.stringify({
                model: "google/gemini-2.0-flash-001",
                messages: [
                    {
                        role: "system",
                        content: SYSTEM_PROMPT
                    },
                    {
                        role: "user",
                        content: `Найди кандидатов по запросу: "${query}"`
                    }
                ],
                response_format: { type: "json_object" },
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("OpenRouter API error:", errorData);
            throw new Error(errorData.error?.message || `API error: ${response.status}`);
        }

        const data = await response.json();
        const rawContent = data.choices?.[0]?.message?.content || "{}";

        // Parse and validate JSON response
        let parsedResponse;
        try {
            parsedResponse = JSON.parse(rawContent);
        } catch {
            console.error("Failed to parse AI response as JSON:", rawContent);
            return NextResponse.json({
                candidates: [],
                error: "Не удалось обработать ответ ИИ. Попробуйте переформулировать запрос."
            });
        }

        // Process candidates and replace avatar numbers with actual URLs
        const candidates: GeneratedCandidate[] = (parsedResponse.candidates || []).map(
            (candidate: GeneratedCandidate & { avatar: string }, index: number) => ({
                ...candidate,
                id: candidate.id || `gen-${Date.now()}-${index}`,
                avatar: AVATAR_URLS[candidate.avatar] || AVATAR_URLS[String((index % 8) + 1)],
            })
        );

        return NextResponse.json({ candidates });
    } catch (error) {
        console.error("Error communicating with OpenRouter API:", error);

        let errorMessage = "Произошла ошибка при поиске кандидатов.";

        if (error instanceof Error) {
            const errorMsg = error.message.toLowerCase();

            if (errorMsg.includes("api key") || errorMsg.includes("authentication") || errorMsg.includes("unauthorized")) {
                errorMessage = "Неверный API ключ. Проверьте настройки в файле .env.local";
            } else if (errorMsg.includes("quota") || errorMsg.includes("rate limit") || errorMsg.includes("credits")) {
                errorMessage = "Превышен лимит запросов. Попробуйте позже.";
            } else {
                errorMessage = `Ошибка: ${error.message}`;
            }
        }

        return NextResponse.json(
            { error: errorMessage, candidates: [] },
            { status: 500 }
        );
    }
}

