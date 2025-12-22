import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

// GET - получить чаты текущего пользователя (фильтруем по режиму)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const mode = searchParams.get('mode') || 'candidate';

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Фильтруем чаты по режиму:
        // - candidate: показываем чаты где пользователь — кандидат
        // - recruiter: показываем чаты где пользователь — ресерчер
        const whereClause = mode === 'recruiter'
            ? { researcherUserId: user.id }
            : { candidateUserId: user.id };

        const chats = await prisma.chat.findMany({
            where: whereClause,
            include: {
                profession: {
                    select: { id: true, name: true, grade: true },
                },
                researcherSearch: {
                    select: { id: true, query: true, name: true, grade: true },
                },
                candidateUser: {
                    select: { id: true, fullName: true, avatarUrl: true },
                },
                researcherUser: {
                    select: { id: true, fullName: true, avatarUrl: true },
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    select: {
                        id: true,
                        content: true,
                        senderId: true,
                        isRead: true,
                        createdAt: true,
                    },
                },
            },
            orderBy: { updatedAt: 'desc' },
        });

        // Подсчитываем непрочитанные сообщения для каждого чата
        const chatsWithUnread = await Promise.all(
            chats.map(async (chat) => {
                const unreadCount = await prisma.chatMessage.count({
                    where: {
                        chatId: chat.id,
                        isRead: false,
                        senderId: { not: user.id }, // Не считаем свои сообщения
                    },
                });

                const lastMessage = chat.messages[0] || null;
                const isCandidate = chat.candidateUserId === user.id;

                return {
                    id: chat.id,
                    // Для кандидата показываем ресерчера, для ресерчера — кандидата
                    companion: isCandidate ? chat.researcherUser : chat.candidateUser,
                    // Контекст чата (профессия или поисковый запрос)
                    context: isCandidate
                        ? { type: 'profession' as const, data: chat.profession }
                        : { type: 'search' as const, data: chat.researcherSearch },
                    lastMessage,
                    unreadCount,
                    updatedAt: chat.updatedAt,
                };
            })
        );

        return NextResponse.json({ chats: chatsWithUnread });
    } catch (error) {
        console.error('Failed to fetch chats:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
