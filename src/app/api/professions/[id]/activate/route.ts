import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

// POST - активировать профессию
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Проверяем что профессия принадлежит пользователю
        const profession = await prisma.profession.findFirst({
            where: { 
                id,
                userId: user.id,
            },
        });

        if (!profession) {
            return NextResponse.json({ error: "Profession not found" }, { status: 404 });
        }

        // Деактивируем все профессии пользователя
        await prisma.profession.updateMany({
            where: { userId: user.id },
            data: { isActive: false },
        });

        // Активируем выбранную профессию
        const updated = await prisma.profession.update({
            where: { id },
            data: { isActive: true },
            include: { graph: true },
        });

        return NextResponse.json({ profession: updated });
    } catch (error) {
        console.error("Error activating profession:", error);
        return NextResponse.json(
            { error: "Failed to activate profession" },
            { status: 500 }
        );
    }
}

