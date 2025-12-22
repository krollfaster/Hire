import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

// GET - загрузить карточки активной профессии пользователя
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const professionId = searchParams.get("professionId");

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Если professionId не передан - берём первую профессию пользователя
        const whereClause = professionId
            ? { id: professionId, userId: user.id }
            : { userId: user.id };

        // Получаем профессию с графом
        const profession = await prisma.profession.findFirst({
            where: whereClause,
            orderBy: { createdAt: "desc" },
            include: {
                graph: true,
            },
        });

        return NextResponse.json({
            traits: profession?.graph?.content || [],
            professionId: profession?.id || null,
        });
    } catch (error) {
        console.error("Error loading graph:", error);
        return NextResponse.json(
            { error: "Failed to load graph" },
            { status: 500 }
        );
    }
}

// POST - сохранить карточки для профессии
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { traits, professionId } = await request.json();

        // Убедимся что пользователь существует в БД
        await prisma.user.upsert({
            where: { id: user.id },
            update: {},
            create: {
                id: user.id,
                email: user.email!,
            },
        });

        // Если professionId не передан - берём первую профессию пользователя
        let targetProfessionId = professionId;

        if (!targetProfessionId) {
            const firstProfession = await prisma.profession.findFirst({
                where: {
                    userId: user.id,
                },
                orderBy: { createdAt: "desc" },
            });
            targetProfessionId = firstProfession?.id;
        }

        if (!targetProfessionId) {
            return NextResponse.json(
                { error: "No active profession found" },
                { status: 400 }
            );
        }

        // Проверяем что профессия принадлежит пользователю
        const profession = await prisma.profession.findFirst({
            where: {
                id: targetProfessionId,
                userId: user.id,
            },
            include: { graph: true },
        });

        if (!profession) {
            return NextResponse.json(
                { error: "Profession not found" },
                { status: 404 }
            );
        }

        // Обновляем или создаём граф
        if (profession.graph) {
            await prisma.graph.update({
                where: { id: profession.graph.id },
                data: { content: traits },
            });
        } else {
            await prisma.graph.create({
                data: {
                    professionId: targetProfessionId,
                    content: traits,
                },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error saving graph:", error);
        return NextResponse.json(
            { error: "Failed to save graph" },
            { status: 500 }
        );
    }
}
