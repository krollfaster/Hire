import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

const BUCKET_NAME = "avatars";

// POST - загрузить аватар
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "Файл не найден" }, { status: 400 });
        }

        // Проверка типа файла
        if (!file.type.startsWith("image/")) {
            return NextResponse.json({ error: "Файл должен быть изображением" }, { status: 400 });
        }

        // Проверка размера (макс 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: "Размер файла не должен превышать 5MB" }, { status: 400 });
        }

        // Генерируем уникальное имя файла
        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        // Удаляем старый аватар если есть
        const { data: existingFiles } = await supabase.storage
            .from(BUCKET_NAME)
            .list(user.id);

        if (existingFiles && existingFiles.length > 0) {
            const filesToRemove = existingFiles.map(f => `${user.id}/${f.name}`);
            await supabase.storage.from(BUCKET_NAME).remove(filesToRemove);
        }

        // Загружаем новый файл
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { error: uploadError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(fileName, buffer, {
                contentType: file.type,
                upsert: true,
            });

        if (uploadError) {
            console.error("Upload error details:", {
                message: uploadError.message,
                name: uploadError.name,
                cause: uploadError.cause,
                fullError: JSON.stringify(uploadError, null, 2)
            });
            return NextResponse.json({
                error: `Ошибка загрузки файла: ${uploadError.message}`
            }, { status: 500 });
        }

        // Получаем публичный URL
        const { data: urlData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(fileName);

        const avatarUrl = urlData.publicUrl;

        // Обновляем профиль в БД
        await prisma.user.update({
            where: { id: user.id },
            data: { avatarUrl },
        });

        return NextResponse.json({ url: avatarUrl });
    } catch (error) {
        console.error("Error uploading avatar - full error:", error);
        const errorMessage = error instanceof Error ? error.message : "Неизвестная ошибка";
        return NextResponse.json(
            { error: `Ошибка загрузки аватара: ${errorMessage}` },
            { status: 500 }
        );
    }
}

// DELETE - удалить аватар
export async function DELETE() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Удаляем файлы из Storage
        const { data: existingFiles } = await supabase.storage
            .from(BUCKET_NAME)
            .list(user.id);

        if (existingFiles && existingFiles.length > 0) {
            const filesToRemove = existingFiles.map(f => `${user.id}/${f.name}`);
            await supabase.storage.from(BUCKET_NAME).remove(filesToRemove);
        }

        // Обнуляем avatarUrl в User
        await prisma.user.update({
            where: { id: user.id },
            data: { avatarUrl: null },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting avatar:", error);
        return NextResponse.json(
            { error: "Ошибка удаления аватара" },
            { status: 500 }
        );
    }
}
