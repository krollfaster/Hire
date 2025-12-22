import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

// POST - ресерчер создаёт чат с кандидатом
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { professionId, researcherSearchId, initialMessage } = await request.json();

        if (!professionId) {
            return NextResponse.json({ error: 'professionId is required' }, { status: 400 });
        }

        // Находим профессию кандидата
        const profession = await prisma.profession.findFirst({
            where: { id: professionId },
            include: { user: true },
        });

        if (!profession) {
            return NextResponse.json({ error: 'Profession not found' }, { status: 404 });
        }

        // Нельзя писать самому себе
        if (profession.userId === user.id) {
            return NextResponse.json({ error: 'Cannot start chat with yourself' }, { status: 400 });
        }

        // Проверяем, существует ли уже чат между этими пользователями (независимо от профессии)
        const existingChat = await prisma.chat.findFirst({
            where: {
                researcherUserId: user.id,
                candidateUserId: profession.userId,
            },
            include: {
                candidateUser: {
                    select: { id: true, fullName: true, avatarUrl: true },
                },
                researcherUser: {
                    select: { id: true, fullName: true, avatarUrl: true },
                },
                profession: {
                    select: { id: true, name: true, grade: true },
                },
            },
        });

        if (existingChat) {
            // Обновляем контекст чата на новую профессию/поисковый запрос
            const updatedChat = await prisma.chat.update({
                where: { id: existingChat.id },
                data: {
                    professionId,
                    researcherSearchId: researcherSearchId || null,
                    updatedAt: new Date(),
                },
                include: {
                    candidateUser: {
                        select: { id: true, fullName: true, avatarUrl: true },
                    },
                    researcherUser: {
                        select: { id: true, fullName: true, avatarUrl: true },
                    },
                    profession: {
                        select: { id: true, name: true, grade: true },
                    },
                },
            });
            return NextResponse.json({ chat: updatedChat, existing: true });
        }

        // Создаём чат
        const chat = await prisma.chat.create({
            data: {
                professionId,
                researcherSearchId: researcherSearchId || null,
                candidateUserId: profession.userId,
                researcherUserId: user.id,
            },
            include: {
                candidateUser: {
                    select: { id: true, fullName: true, avatarUrl: true },
                },
                researcherUser: {
                    select: { id: true, fullName: true, avatarUrl: true },
                },
                profession: {
                    select: { id: true, name: true, grade: true },
                },
            },
        });

        // Если есть начальное сообщение, создаём его
        if (initialMessage && typeof initialMessage === 'string' && initialMessage.trim()) {
            await prisma.chatMessage.create({
                data: {
                    chatId: chat.id,
                    senderId: user.id,
                    content: initialMessage.trim(),
                },
            });
        }

        return NextResponse.json({ chat, existing: false });
    } catch (error) {
        console.error('Failed to start chat:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
