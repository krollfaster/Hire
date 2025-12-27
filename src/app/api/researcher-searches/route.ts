import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searches = await prisma.researcherSearch.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ searches });
    } catch (error) {
        console.error('Failed to fetch researcher searches:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { query, name } = body;

        if (!query) {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 });
        }

        // Деактивируем все предыдущие поиски
        await prisma.researcherSearch.updateMany({
            where: { userId: user.id },
            data: { isActive: false },
        });

        // Создаём новый активный поиск
        const search = await prisma.researcherSearch.create({
            data: {
                userId: user.id,
                query,
                name: name || null,
                isActive: true,
            },
        });

        return NextResponse.json({ search });
    } catch (error) {
        console.error('Failed to create researcher search:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
