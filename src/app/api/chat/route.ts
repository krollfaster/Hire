import { NextResponse } from "next/server";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

const SYSTEM_PROMPT = `Ты — ИИ-ассистент для создания профессионального профиля кандидата. Твоя задача — анализировать сообщения пользователя о его опыте работы и извлекать из них черты (traits). Граф должен читаться как связный рассказ о профессионале. Старайся создавать как можно больше черт с осмысленными связями между ними.

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

## Категории (category) — 4 типа

### 1. "skills" — Компетенции (Что я использую руками и головой)
Технологии, стек, методологии, инструменты.
Примеры: Python, Figma, Agile, CJM, System Design, Docker, React, Scrum, SQL, CustDev

### 2. "context" — Контекст (В чём я разбираюсь глобально)
Сферы бизнеса, отрасли, домены экспертизы. НЕ путай с технологиями!
Примеры: EdTech, E-commerce, B2B Marketing, Crypto, FinTech, Healthcare, Logistics, Gaming

### 3. "artifacts" — Артефакты (Что я создал и где был)
Бэкграунд, достижения, кейсы, проекты, компании, роли, конкретные результаты с цифрами.
Примеры: "Яндекс (Senior PM)", "Запуск MVP за 2 месяца", "Рост метрики на 30%", "MIT", "Y Combinator"

### 4. "attributes" — Атрибуты (Какой я человек)
Культура, суперсила, soft skills, личные качества, уникальные пересечения навыков.
Примеры: Эмпатия, Структурность, "Люблю хаос", Mentorship, Design Engineer, Growth Hacker

## Поля карточки
- "label" — короткое название (1-3 слова)
- "description" — краткое описание, раскрывающее суть (максимум 40 слов)
- "importance" — Релевантность для целевой профессии от 1.0 до 5.0 (см. правила ниже)
- "relations" — массив связей с другими карточками

## Типы связей (relations.type) — 5 типов

### 1. "stack" — Стек / Применил (Как сделано?)
Связывает Артефакт (проект/кейс) с Компетенцией (инструментом).
Пример: [Мобильное приложение] —stack→ [Flutter]
Чтение: «Мобильное приложение реализовано на стеке Flutter»

### 2. "in_domain" — В сфере (Где сделано?)
Связывает Артефакт с Контекстом.
Пример: [Личный кабинет B2B] —in_domain→ [E-commerce]
Чтение: «Личный кабинет создан в сфере E-commerce»

### 3. "in_role" — В роли (Иерархия: Компания → Роль/Проект)
Связывает крупные Артефакты (компания) с более мелкими (роль/проект).
Пример: [Яндекс] —in_role→ [Senior PM]
Чтение: «В Яндексе работал в роли Senior PM»

### 4. "result" — Результат (Иерархия: Проект → Достижение)
Связывает проекты с конкретными достижениями.
Пример: [Редизайн воронки] —result→ [Рост MAU на 20%]
Чтение: «Редизайн воронки привёл к росту MAU на 20%»

### 5. "driver" — Драйвер (Почему получилось?)
Связывает Атрибут (суперсилу/качество) с Артефактом (достижением). Самая «продающая» связь!
Пример: [Эмпатия] —driver→ [Удержание команды в кризис]
Чтение: «Эмпатия стала драйвером удержания команды»

## Правила генерации ID
- Используй формат "t" + timestamp, например: "t1702300000001"
- Каждый ID должен быть уникальным

## Правила определения связей

ВАЖНО: Создавай связи осмысленно, чтобы граф читался как история!

- artifacts → skills через "stack" (Какие инструменты использовались?)
- artifacts → context через "in_domain" (В какой сфере сделано?)
- artifacts (компания) → artifacts (роль/проект) через "in_role"
- artifacts (проект) → artifacts (результат) через "result"
- attributes → artifacts через "driver" (Какое качество помогло достичь результата?)

## Правила оценки важности (importance)

ВАЖНО: Оценка importance должна отражать РЕЛЕВАНТНОСТЬ черты для целевой профессии пользователя.

- 5.0 — Критически важная черта. Без неё на эту должность не возьмут.
- 4.0-4.9 — Очень важная черта. Ожидается от кандидата данного грейда.
- 3.0-3.9 — Полезная черта. Даёт преимущество, но не обязательна.
- 2.0-2.9 — Дополнительная черта. Слабо связана с целевой профессией.
- 1.0-1.9 — Нерелевантная черта. Почти не влияет на шансы.

## Пример

Пользователь: "Я был лидом команды из 5 разработчиков в Яндексе, мы сделали highload систему на React для e-commerce, используя Agile. Конверсия выросла на 30%."

Ответ (для профессии Frontend Developer, Senior):
{
  "actions": [
    { 
      "type": "create", 
      "data": { 
        "id": "t1702300000001", 
        "label": "Яндекс", 
        "description": "Опыт работы в крупной tech-компании",
        "category": "artifacts", 
        "importance": 4.5,
        "relations": []
      } 
    },
    { 
      "type": "create", 
      "data": { 
        "id": "t1702300000002", 
        "label": "Team Lead", 
        "description": "Руководил командой из 5 разработчиков",
        "category": "artifacts", 
        "importance": 4.7,
        "relations": [
          { "targetId": "t1702300000001", "type": "in_role" }
        ]
      } 
    },
    { 
      "type": "create", 
      "data": { 
        "id": "t1702300000003", 
        "label": "Highload система", 
        "description": "Создал систему выдерживающую высокие нагрузки",
        "category": "artifacts", 
        "importance": 4.8,
        "relations": [
          { "targetId": "t1702300000002", "type": "in_role" },
          { "targetId": "t1702300000006", "type": "stack" },
          { "targetId": "t1702300000007", "type": "stack" },
          { "targetId": "t1702300000008", "type": "in_domain" }
        ]
      } 
    },
    { 
      "type": "create", 
      "data": { 
        "id": "t1702300000004", 
        "label": "+30% конверсия", 
        "description": "Увеличил конверсию на 30% благодаря оптимизации",
        "category": "artifacts", 
        "importance": 5.0,
        "relations": [
          { "targetId": "t1702300000003", "type": "result" }
        ]
      } 
    },
    { 
      "type": "create", 
      "data": { 
        "id": "t1702300000005", 
        "label": "Лидерство", 
        "description": "Умение вести команду к цели и принимать решения",
        "category": "attributes", 
        "importance": 4.3,
        "relations": [
          { "targetId": "t1702300000002", "type": "driver" },
          { "targetId": "t1702300000004", "type": "driver" }
        ]
      } 
    },
    { 
      "type": "create", 
      "data": { 
        "id": "t1702300000006", 
        "label": "React", 
        "description": "Разработка высоконагруженных интерфейсов",
        "category": "skills", 
        "importance": 5.0,
        "relations": []
      } 
    },
    { 
      "type": "create", 
      "data": { 
        "id": "t1702300000007", 
        "label": "Agile", 
        "description": "Гибкая методология управления проектами",
        "category": "skills", 
        "importance": 3.8,
        "relations": []
      } 
    },
    { 
      "type": "create", 
      "data": { 
        "id": "t1702300000008", 
        "label": "E-commerce", 
        "description": "Электронная коммерция и онлайн-торговля",
        "category": "context", 
        "importance": 3.5,
        "relations": []
      } 
    }
  ],
  "message": "Отлично! Расскажите подробнее: какие ещё технологии использовались в проекте? Были ли другие измеримые результаты?"
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
