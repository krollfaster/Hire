import { NextResponse } from "next/server";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

const SYSTEM_PROMPT = `Ты — карьерный консультант. На основе карточек (traits) и истории чата составь краткое, структурированное резюме на русском. Важно чтоб резюме было удобным для чтения HR и было адаптировано под своременые ATS системы

Требования к стилю:
- Формат — обычный текст с заголовками и списками, без лишнего Markdown разметки (допускаются заголовки с префиксом #/## и маркеры "-").
- Пиши лаконично, по делу. Используй 1-2 предложения в Summary, буллеты в разделах.
- Не выдумывай факты, используй только данные из карточек и сообщений.
- Если данных для раздела нет — пропусти раздел.

Сохраняй читабельность в стиле текстовых документов Notion (чистый текст, аккуратные заголовки и списки)`;

export async function POST(req: Request) {
    try {
        const { traits, chatContext, model } = await req.json();
        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!apiKey) {
            console.error("❌ OPENROUTER_API_KEY is missing in environment variables!");
            return NextResponse.json(
                { error: "API ключ не настроен. Добавьте OPENROUTER_API_KEY в .env.local" },
                { status: 500 }
            );
        }

        const traitsSummary = Array.isArray(traits)
            ? traits.map((t: any) => ({
                  id: t.id,
                  label: t.label,
                  description: t.description,
                  category: t.category,
                  importance: t.importance,
                  relations: t.relations,
              }))
            : [];

        const chatMessages = chatContext?.messages || [];

        const userContent = [
            "Карточки (traits):",
            JSON.stringify(traitsSummary, null, 2),
            "",
            "История чата (role: text):",
            chatMessages
                .map((m: { role: string; content: string }) => `${m.role}: ${m.content}`)
                .join("\n"),
        ].join("\n");

        const formattedMessages = [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userContent },
        ];

        const response = await fetch(OPENROUTER_API_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
                "X-Title": "Semantic Talent",
            },
            body: JSON.stringify({
                model: model || "nex-agi/deepseek-v3.1-nex-n1:free",
                messages: formattedMessages,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("❌ OpenRouter resume error:", errorData);
            return NextResponse.json(
                { error: errorData.error || "Не удалось сгенерировать резюме" },
                { status: response.status }
            );
        }

        const data = await response.json();
        const resume =
            data?.choices?.[0]?.message?.content ||
            data?.choices?.[0]?.message?.content?.[0]?.text ||
            "";

        return NextResponse.json({ resume });
    } catch (error) {
        if ((error as Error).name === "AbortError") {
            return NextResponse.json({ error: "Запрос отменен" }, { status: 499 });
        }
        console.error("❌ Resume generation error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Неизвестная ошибка" },
            { status: 500 }
        );
    }
}

