import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

// GET - получить все профессии пользователя
export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const professions = await prisma.profession.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
            include: {
                graph: true,
            },
        });

        return NextResponse.json({ professions });
    } catch (error) {
        console.error("Error loading professions:", error);
        return NextResponse.json(
            { error: "Failed to load professions" },
            { status: 500 }
        );
    }
}

// POST - создать новую профессию
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name, grade, salaryMin, salaryMax } = await request.json();

        if (!name || !grade) {
            return NextResponse.json(
                { error: "Name and grade are required" },
                { status: 400 }
            );
        }

        // Убедимся что пользователь существует в БД
        await prisma.user.upsert({
            where: { id: user.id },
            update: {},
            create: {
                id: user.id,
                email: user.email!,
            },
        });

        // Проверяем есть ли у пользователя другие профессии
        const existingCount = await prisma.profession.count({
            where: { userId: user.id },
        });

        // Если это первая профессия - делаем её активной
        const isActive = existingCount === 0;

        // Если новая профессия активна - деактивируем остальные
        if (isActive) {
            await prisma.profession.updateMany({
                where: { userId: user.id },
                data: { isActive: false },
            });
        }

        // Создаем профессию с пустым графом
        const profession = await prisma.profession.create({
            data: {
                userId: user.id,
                name,
                grade,
                salaryMin: salaryMin || null,
                salaryMax: salaryMax || null,
                isActive,
                graph: {
                    create: {
                        content: [],
                    },
                },
            },
            include: {
                graph: true,
            },
        });

        return NextResponse.json({ profession });
    } catch (error) {
        console.error("Error creating profession:", error);
        return NextResponse.json(
            { error: "Failed to create profession" },
            { status: 500 }
        );
    }
}

