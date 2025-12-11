import { NextResponse } from "next/server";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

const SYSTEM_PROMPT = `Ты — ИИ-ассистент для создания профессионального профиля кандидата. Твоя задача — анализировать сообщения пользователя о его опыте работы и извлекать из них черты (traits): навыки, достижения, сферы экспертизы и суперсилы.

ВАЖНО: Ты ДОЛЖЕН отвечать ТОЛЬКО валидным JSON объектом. Никакого текста до или после JSON.

## Формат ответа

{
  "actions": [
    { 
      "type": "create", 
      "data": { 
        "id": "уникальный_id", 
        "label": "Название", 
        "description": "Краткое описание (максимум 15 слов)",
        "category": "категория", 
        "importance": 4.5,
        "relations": [
          { "targetId": "id_другой_карточки", "type": "тип_связи" }
        ]
      } 
    },
    { "type": "update", "id": "существующий_id", "updates": { "importance": 5.0 } },
    { "type": "delete", "id": "id_для_удаления" }
  ],
  "message": "Краткий ответ пользователю о том, что было добавлено/изменено"
}

## Категории (category)
- "hard_skills" — технические навыки (React, Python, SQL, etc.)
- "impact" — измеримые достижения и результаты (Увеличил конверсию на 30%, Запустил продукт с 1M пользователей)
- "domain" — сферы и индустрии (FinTech, E-commerce, Healthcare)
- "superpower" — уникальные качества (Лидерство, Системное мышление, Быстрое обучение)

## Поля карточки
- "label" — короткое название (1-3 слова)
- "description" — краткое описание, раскрывающее суть (максимум 15 слов)
- "importance" — важность от 1.0 до 5.0 (дробное значение, например 4.3). Чем важнее для карьеры — тем выше.
- "relations" — массив связей с другими карточками

## Типы связей (relations.type)
- "uses" — использует (навык использует другой навык)
- "enables" — позволяет достичь (навык привёл к результату)
- "part_of" — часть чего-то (навык относится к домену)
- "related" — связано (общая связь)

## Правила генерации ID
- Используй формат "t" + timestamp, например: "t1702300000001"
- Каждый ID должен быть уникальным

## Правила определения связей
- Связывай навыки с достижениями через "enables" (React enables "Запуск приложения")
- Связывай навыки с доменами через "part_of" (React part_of Frontend)
- Связывай суперсилы с навыками через "uses" (Лидерство uses Коммуникация)

## Правила важности (importance)
- 5.0 — ключевое, выдающееся достижение или навык
- 4.0-4.9 — очень важное
- 3.0-3.9 — значимое
- 2.0-2.9 — полезное
- 1.0-1.9 — вспомогательное

## Примеры

Пользователь: "Я был лидом команды из 5 разработчиков, мы сделали highload систему на React"

Ответ:
{
  "actions": [
    { 
      "type": "create", 
      "data": { 
        "id": "t1702300000001", 
        "label": "Team Lead", 
        "description": "Руководил командой из 5 разработчиков",
        "category": "superpower", 
        "importance": 4.8,
        "relations": []
      } 
    },
    { 
      "type": "create", 
      "data": { 
        "id": "t1702300000002", 
        "label": "React", 
        "description": "Разработка высоконагруженных интерфейсов",
        "category": "hard_skills", 
        "importance": 4.5,
        "relations": [
          { "targetId": "t1702300000004", "type": "enables" }
        ]
      } 
    },
    { 
      "type": "create", 
      "data": { 
        "id": "t1702300000004", 
        "label": "Highload система", 
        "description": "Создал систему выдерживающую высокие нагрузки",
        "category": "impact", 
        "importance": 5.0,
        "relations": [
          { "targetId": "t1702300000001", "type": "related" }
        ]
      } 
    }
  ],
  "message": "Отлично! Добавил ваш опыт Team Lead с важностью 4.8, навык React и достижение по highload системе с максимальной важностью."
}

Помни: отвечай ТОЛЬКО JSON. Если не можешь извлечь traits из сообщения, верни пустой массив actions и объясни в message.`;

export async function POST(req: Request) {
    try {
        const { messages, model, traitsContext } = await req.json();
        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!apiKey) {
            console.error("❌ OPENROUTER_API_KEY is missing in environment variables!");
            return NextResponse.json(
                { error: "API ключ не настроен. Пожалуйста, добавьте OPENROUTER_API_KEY в файл .env.local" },
                { status: 500 }
            );
        }

        // Build context about existing traits
        let contextMessage = "";
        if (traitsContext && traitsContext.length > 0) {
            contextMessage = `\n\nТекущие черты в профиле пользователя:\n${JSON.stringify(traitsContext, null, 2)}\n\nУчитывай существующие черты при создании связей (relations) и избегай дубликатов.`;
        }

        // Формируем сообщения в формате OpenAI/OpenRouter
        const formattedMessages = [
            {
                role: "system",
                content: SYSTEM_PROMPT + contextMessage
            },
            ...messages.map((msg: { role: string; content: string }) => ({
                role: msg.role,
                content: msg.content,
            }))
        ];

        const response = await fetch(OPENROUTER_API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
                "X-Title": "Semantic Talent",
            },
            body: JSON.stringify({
                model: model || "google/gemini-2.0-flash-001",
                messages: formattedMessages,
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
            // If parsing fails, return error
            console.error("Failed to parse AI response as JSON:", rawContent);
            return NextResponse.json({
                actions: [],
                message: "Не удалось обработать ответ ИИ. Попробуйте переформулировать запрос."
            });
        }

        // Ensure response has required fields
        const actions = Array.isArray(parsedResponse.actions) ? parsedResponse.actions : [];
        const message = parsedResponse.message || "Профиль обновлен.";

        return NextResponse.json({ actions, message });
    } catch (error) {
        console.error("Error communicating with OpenRouter API:", error);
        
        let errorMessage = "Произошла ошибка при обращении к ИИ.";
        
        if (error instanceof Error) {
            const errorMsg = error.message.toLowerCase();
            
            if (errorMsg.includes("api key") || errorMsg.includes("authentication") || errorMsg.includes("unauthorized")) {
                errorMessage = "Неверный API ключ. Проверьте настройки в файле .env.local";
            } else if (errorMsg.includes("quota") || errorMsg.includes("rate limit") || errorMsg.includes("credits")) {
                errorMessage = "Превышен лимит запросов или недостаточно кредитов. Попробуйте позже.";
            } else if (errorMsg.includes("model")) {
                errorMessage = "Выбранная модель недоступна. Попробуйте другую модель.";
            } else {
                errorMessage = `Ошибка: ${error.message}`;
            }
        }
        
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
