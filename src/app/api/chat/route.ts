import { NextResponse } from "next/server";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

const SYSTEM_PROMPT = `Ты — ИИ-ассистент для создания профессионального профиля кандидата. Твоя задача — анализировать сообщения пользователя о его опыте работы и извлекать из них черты (traits): навыки, достижения, сферы экспертизы и суперсилы. Старайся как можно больше создать черт (traits). Ты можешь додумывать навыки исходя из контекста если можно создать карточки которые будут иметь много связей.

ВАЖНО: Ты ДОЛЖЕН отвечать ТОЛЬКО валидным JSON объектом. Никакого текста до или после JSON.

## Формат ответа

{
  "actions": [
    { 
      "type": "create", 
      "data": { 
        "id": "уникальный_id", 
        "label": "Название", 
        "description": "Краткое описание (максимум 40 слов)",
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
  "message": "Наводящий вопрос который помогает пользователю написать следующее сообщение"
}

## Категории (category)
- "hard_skills" — Названия технологий, программ, инструментов (Figma, React, SQL, Python, Docker)
- "domain" — Сферы бизнеса, в которых разбирается. Не путать с технологиями! (E-commerce, EdTech, Accounting, Booking, FinTech, Healthcare, B2B SaaS)
- "process" — Как он работает? Методологии и подходы к управлению (Agile, Scrum, Mentoring, CJM, CustDev, Hiring, Code Review)
- "impact" — Только факты с цифрами или завершённые проекты (Launched MVP, +$1M revenue, Увеличил конверсию на 30%, Запустил продукт с 1M пользователей)
- "background" — Названия компаний, ВУЗов, курсов, хакатонов, наград (Google, MIT, Y Combinator, победитель хакатона)
- "culture" — Личные качества и принципы работы, софт-скиллы (Curiosity, Empathy, Async communication, Командная работа)
- "superpower" — Редкие пересечения навыков или главная роль человека (Growth Hacker, Design Engineer, Technical PM)

## Поля карточки
- "label" — короткое название (1-3 слова)
- "description" — краткое описание, раскрывающее суть (максимум 40 слов)
- "importance" — Релевантность для целевой профессии от 1.0 до 5.0 (см. правила ниже)
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
- Связывай hard_skills с impact через "enables" (React enables "Запуск приложения")
- Связывай hard_skills с domain через "part_of" (React part_of Frontend)
- Связывай superpower с culture через "uses" (Design Engineer uses Внимание к деталям)
- Связывай process с impact через "enables" (Agile enables "Быстрый релиз")
- Связывай background с domain через "related" (Google related B2B SaaS)
- Связывай culture с process через "uses" (Эмпатия uses CustDev)

## Правила оценки важности (importance)

ВАЖНО: Оценка importance должна отражать РЕЛЕВАНТНОСТЬ черты для целевой профессии пользователя. 
Чем выше оценка — тем более важна эта черта для получения работы по указанной должности и грейду.

- 5.0 — Критически важная черта для целевой профессии. Без неё на эту должность не возьмут. Ключевой навык для данного грейда.
- 4.0-4.9 — Очень важная черта. Сильно повышает шансы на получение должности. Ожидается от кандидата данного грейда.
- 3.0-3.9 — Полезная черта. Даёт преимущество, но не является обязательной для должности.
- 2.0-2.9 — Дополнительная черта. Слабо связана с целевой профессией, но может быть полезна.
- 1.0-1.9 — Нерелевантная черта. Почти не влияет на шансы получить должность по целевой профессии.

Примеры для профессии "Frontend Developer, Senior":
- React → 5.0 (ключевой навык)
- TypeScript → 4.8 (очень важен для Senior)
- Лидерство → 4.2 (важно для Senior, но не критично)
- Python → 2.5 (полезен, но не основной инструмент)
- Figma → 3.5 (понимание дизайна полезно, но не критично)

Примеры для профессии "Product Manager, Middle":
- Agile/Scrum → 5.0 (ключевой навык)
- SQL → 3.8 (полезен для аналитики)
- React → 2.0 (понимание технологий полезно, но не основной навык)
- CustDev → 4.5 (очень важен для PM)
- Figma → 3.5 (полезен для прототипирования)

## Примеры

Пользователь: "Я был лидом команды из 5 разработчиков в Яндексе, мы сделали highload систему на React используя Agile"

Ответ (для профессии Frontend Developer, Senior):
{
  "actions": [
    { 
      "type": "create", 
      "data": { 
        "id": "t1702300000001", 
        "label": "Team Lead", 
        "description": "Руководил командой из 5 разработчиков",
        "category": "superpower", 
        "importance": 4.5,
        "relations": [
          { "targetId": "t1702300000005", "type": "uses" }
        ]
      } 
    },
    { 
      "type": "create", 
      "data": { 
        "id": "t1702300000002", 
        "label": "React", 
        "description": "Разработка высоконагруженных интерфейсов",
        "category": "hard_skills", 
        "importance": 5.0,
        "relations": [
          { "targetId": "t1702300000004", "type": "enables" }
        ]
      } 
    },
    { 
      "type": "create", 
      "data": { 
        "id": "t1702300000003", 
        "label": "Яндекс", 
        "description": "Опыт работы в крупной tech-компании",
        "category": "background", 
        "importance": 4.2,
        "relations": []
      } 
    },
    { 
      "type": "create", 
      "data": { 
        "id": "t1702300000004", 
        "label": "Highload система", 
        "description": "Создал систему выдерживающую высокие нагрузки",
        "category": "impact", 
        "importance": 4.8,
        "relations": [
          { "targetId": "t1702300000001", "type": "related" }
        ]
      } 
    },
    { 
      "type": "create", 
      "data": { 
        "id": "t1702300000005", 
        "label": "Agile", 
        "description": "Гибкая методология управления проектами",
        "category": "process", 
        "importance": 3.8,
        "relations": [
          { "targetId": "t1702300000004", "type": "enables" }
        ]
      } 
    },
    { 
      "type": "create", 
      "data": { 
        "id": "t1702300000006", 
        "label": "Лидерство", 
        "description": "Умение вести команду к цели",
        "category": "culture", 
        "importance": 4.3,
        "relations": [
          { "targetId": "t1702300000001", "type": "related" }
        ]
      } 
    }
  ],
  "message": "Отлично! В какой сфере бизнеса работала ваша система? Может расскажете подробнее о результатах?"
}

Помни: отвечай ТОЛЬКО JSON. Если не можешь извлечь traits из сообщения, верни пустой массив actions и объясни в message.`;

export async function POST(req: Request) {
    try {
        const { messages, model, traitsContext, professionContext } = await req.json();
        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!apiKey) {
            console.error("❌ OPENROUTER_API_KEY is missing in environment variables!");
            return NextResponse.json(
                { error: "API ключ не настроен. Пожалуйста, добавьте OPENROUTER_API_KEY в файл .env.local" },
                { status: 500 }
            );
        }

        // Build context about target profession
        let professionMessage = "";
        if (professionContext && professionContext.name) {
            professionMessage = `\n\n## ЦЕЛЕВАЯ ПРОФЕССИЯ ПОЛЬЗОВАТЕЛЯ\n\nПользователь ищет работу на должность: "${professionContext.name}" уровня "${professionContext.grade}".\n\nОЧЕНЬ ВАЖНО: При оценке importance каждой черты учитывай, насколько эта черта важна именно для этой должности и грейда. Черты, критически важные для "${professionContext.name}", должны получать высокие оценки (4.5-5.0), а нерелевантные — низкие (1.0-2.5).`;
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
                content: SYSTEM_PROMPT + professionMessage + contextMessage
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
