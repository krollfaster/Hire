import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Деактивируем все поиски
        await prisma.researcherSearch.updateMany({
            where: { userId: user.id },
            data: { isActive: false },
        });

        // Активируем выбранный
        await prisma.researcherSearch.update({
            where: { id, userId: user.id },
            data: { isActive: true },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to activate researcher search:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
