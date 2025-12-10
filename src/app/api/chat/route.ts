import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { messages, model } = await req.json();
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: "GEMINI_API_KEY is not set" },
                { status: 500 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const generativeModel = genAI.getGenerativeModel({ model: model || "gemini-1.5-flash" });

        // Преобразуем историю сообщений в формат Gemini
        const history = messages.slice(0, -1).map((msg: any) => ({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }],
        }));

        const lastMessage = messages[messages.length - 1].content;

        const chat = generativeModel.startChat({
            history: history,
        });

        const result = await chat.sendMessage(lastMessage);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ content: text });
    } catch (error) {
        console.error("Error communicating with Gemini API:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
