import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

// GET - получить сообщения чата
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ chatId: string }> }
) {
    try {
        const { chatId } = await params;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Проверяем что пользователь участник чата
        const chat = await prisma.chat.findFirst({
            where: {
                id: chatId,
                OR: [
                    { candidateUserId: user.id },
                    { researcherUserId: user.id },
                ],
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
                researcherSearch: {
                    select: { id: true, query: true, name: true, grade: true },
                },
            },
        });

        if (!chat) {
            return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
        }

        // Получаем сообщения
        const messages = await prisma.chatMessage.findMany({
            where: { chatId },
            orderBy: { createdAt: 'asc' },
            include: {
                sender: {
                    select: { id: true, fullName: true, avatarUrl: true },
                },
            },
        });

        // Помечаем сообщения как прочитанные (те, что не от текущего пользователя)
        await prisma.chatMessage.updateMany({
            where: {
                chatId,
                senderId: { not: user.id },
                isRead: false,
            },
            data: { isRead: true },
        });

        const isCandidate = chat.candidateUserId === user.id;

        return NextResponse.json({
            chat: {
                id: chat.id,
                companion: isCandidate ? chat.researcherUser : chat.candidateUser,
                context: isCandidate
                    ? { type: 'profession', data: chat.profession }
                    : { type: 'search', data: chat.researcherSearch },
            },
            messages,
        });
    } catch (error) {
        console.error('Failed to fetch chat messages:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST - отправить сообщение в чат
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ chatId: string }> }
) {
    try {
        const { chatId } = await params;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { content } = await request.json();

        if (!content || typeof content !== 'string' || content.trim() === '') {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        // Проверяем что пользователь участник чата
        const chat = await prisma.chat.findFirst({
            where: {
                id: chatId,
                OR: [
                    { candidateUserId: user.id },
                    { researcherUserId: user.id },
                ],
            },
        });

        if (!chat) {
            return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
        }

        // Создаём сообщение
        const message = await prisma.chatMessage.create({
            data: {
                chatId,
                senderId: user.id,
                content: content.trim(),
            },
            include: {
                sender: {
                    select: { id: true, fullName: true, avatarUrl: true },
                },
            },
        });

        // Обновляем updatedAt чата
        await prisma.chat.update({
            where: { id: chatId },
            data: { updatedAt: new Date() },
        });

        return NextResponse.json({ message });
    } catch (error) {
        console.error('Failed to send message:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
