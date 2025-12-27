import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(
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
        const body = await request.json();
        const { query, name, grade, salaryMin, salaryMax } = body;

        const search = await prisma.researcherSearch.update({
            where: { id, userId: user.id },
            data: {
                ...(query !== undefined && { query }),
                ...(name !== undefined && { name }),
                ...(grade !== undefined && { grade }),
                ...(salaryMin !== undefined && { salaryMin }),
                ...(salaryMax !== undefined && { salaryMax }),
            },
        });

        return NextResponse.json({ search });
    } catch (error) {
        console.error('Failed to update researcher search:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(
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

        await prisma.researcherSearch.delete({
            where: { id, userId: user.id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete researcher search:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
