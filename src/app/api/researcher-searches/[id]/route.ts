import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

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
