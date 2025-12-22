import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Ищем дублирующиеся чаты...');

    // Находим все уникальные пары участников с количеством чатов
    const duplicates = await prisma.$queryRaw<
        Array<{ candidateUserId: string; researcherUserId: string; count: bigint }>
    >`
    SELECT "candidateUserId", "researcherUserId", COUNT(*) as count
    FROM "Chat"
    GROUP BY "candidateUserId", "researcherUserId"
    HAVING COUNT(*) > 1
  `;

    if (duplicates.length === 0) {
        console.log('✅ Дублирующихся чатов не найдено');
        return;
    }

    console.log(`📋 Найдено ${duplicates.length} пар с дубликатами`);

    for (const dup of duplicates) {
        console.log(`\n👥 Пара: ${dup.candidateUserId} <-> ${dup.researcherUserId} (${dup.count} чатов)`);

        // Получаем все чаты для этой пары, сортируем по обновлению (оставим самый свежий)
        const chats = await prisma.chat.findMany({
            where: {
                candidateUserId: dup.candidateUserId,
                researcherUserId: dup.researcherUserId,
            },
            orderBy: { updatedAt: 'desc' },
            include: {
                _count: { select: { messages: true } },
            },
        });

        // Оставляем чат с наибольшим количеством сообщений, или самый свежий
        const chatsWithInfo = chats.map((c) => ({
            id: c.id,
            messageCount: c._count.messages,
            updatedAt: c.updatedAt,
        }));

        // Сортируем по количеству сообщений (desc), потом по дате обновления (desc)
        chatsWithInfo.sort((a, b) => {
            if (b.messageCount !== a.messageCount) {
                return b.messageCount - a.messageCount;
            }
            return b.updatedAt.getTime() - a.updatedAt.getTime();
        });

        const chatToKeep = chatsWithInfo[0];
        const chatsToDelete = chatsWithInfo.slice(1);

        console.log(`  ✅ Оставляем: ${chatToKeep.id} (${chatToKeep.messageCount} сообщений)`);

        for (const chatToDelete of chatsToDelete) {
            console.log(`  🗑️  Удаляем: ${chatToDelete.id} (${chatToDelete.messageCount} сообщений)`);

            // Переносим сообщения из удаляемого чата в основной
            if (chatToDelete.messageCount > 0) {
                await prisma.chatMessage.updateMany({
                    where: { chatId: chatToDelete.id },
                    data: { chatId: chatToKeep.id },
                });
                console.log(`     ↪️  Перенесено ${chatToDelete.messageCount} сообщений`);
            }

            // Удаляем дублирующийся чат
            await prisma.chat.delete({
                where: { id: chatToDelete.id },
            });
        }
    }

    console.log('\n✨ Очистка дубликатов завершена!');
}

main()
    .catch((e) => {
        console.error('❌ Ошибка:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
