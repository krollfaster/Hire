import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

// GET - получить профессию по ID
export async function GET(
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

        const profession = await prisma.profession.findFirst({
            where: {
                id,
                userId: user.id,
            },
            include: {
                graph: true,
            },
        });

        if (!profession) {
            return NextResponse.json({ error: "Profession not found" }, { status: 404 });
        }

        return NextResponse.json({ profession });
    } catch (error) {
        console.error("Error loading profession:", error);
        return NextResponse.json(
            { error: "Failed to load profession" },
            { status: 500 }
        );
    }
}

// PATCH - обновить профессию
export async function PATCH(
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

        const {
            name,
            grade,
            salaryMin,
            salaryMax,
            status,
            employmentType,
            workFormat,
            travelTime,
            businessTrips
        } = await request.json();

        const profession = await prisma.profession.updateMany({
            where: {
                id,
                userId: user.id,
            },
            data: {
                ...(name !== undefined && { name }),
                ...(grade !== undefined && { grade }),
                ...(salaryMin !== undefined && { salaryMin }),
                ...(salaryMax !== undefined && { salaryMax }),
                ...(status !== undefined && { status }),
                ...(employmentType !== undefined && { employmentType }),
                ...(workFormat !== undefined && { workFormat }),
                ...(travelTime !== undefined && { travelTime }),
                ...(businessTrips !== undefined && { businessTrips }),
            },
        });

        if (profession.count === 0) {
            return NextResponse.json({ error: "Profession not found" }, { status: 404 });
        }

        const updated = await prisma.profession.findUnique({
            where: { id },
            include: { graph: true },
        });

        return NextResponse.json({ profession: updated });
    } catch (error) {
        console.error("Error updating profession:", error);
        return NextResponse.json(
            { error: "Failed to update profession" },
            { status: 500 }
        );
    }
}

// DELETE - удалить профессию
export async function DELETE(
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

        // Удаляем профессию (граф удалится каскадно)
        await prisma.profession.delete({
            where: { id },
        });

        // Если удалённая профессия была активной - активируем другую
        if (profession.isActive) {
            const remaining = await prisma.profession.findFirst({
                where: { userId: user.id },
                orderBy: { createdAt: "desc" },
            });

            if (remaining) {
                await prisma.profession.update({
                    where: { id: remaining.id },
                    data: { isActive: true },
                });
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting profession:", error);
        return NextResponse.json(
            { error: "Failed to delete profession" },
            { status: 500 }
        );
    }
}

