import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

// GET - получить профиль текущего пользователя
export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const profile = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
                id: true,
                fullName: true,
                avatarUrl: true,
            },
        });

        return NextResponse.json({ profile });
    } catch (error) {
        console.error("Error fetching profile:", error);
        return NextResponse.json(
            { error: "Ошибка получения профиля" },
            { status: 500 }
        );
    }
}

// PUT - обновить профиль
export async function PUT(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { fullName, avatarUrl } = body;

        const updatedProfile = await prisma.user.update({
            where: { id: user.id },
            data: {
                ...(fullName !== undefined && { fullName }),
                ...(avatarUrl !== undefined && { avatarUrl }),
            },
            select: {
                id: true,
                fullName: true,
                avatarUrl: true,
            },
        });

        return NextResponse.json({ profile: updatedProfile });
    } catch (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json(
            { error: "Ошибка обновления профиля" },
            { status: 500 }
        );
    }
}
