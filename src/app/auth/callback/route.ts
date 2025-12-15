import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/builder";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.user) {
      // Создаем или обновляем пользователя в нашей БД
      try {
        const existingUser = await prisma.user.findUnique({
          where: { id: data.user.id },
        });

        if (!existingUser) {
          await prisma.user.create({
            data: {
              id: data.user.id,
              email: data.user.email!,
              name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || null,
              avatar: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture || null,
            },
          });
        } else {
          // Обновляем данные профиля при каждом входе
          await prisma.user.update({
            where: { id: data.user.id },
            data: {
              name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || existingUser.name,
              avatar: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture || existingUser.avatar,
            },
          });
        }
      } catch (error) {
        console.error("Error syncing user to database:", error);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}

