import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/builder";
  
  // Используем NEXT_PUBLIC_SITE_URL для production, иначе origin из запроса
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || requestUrl.origin;

  console.log("[Auth Callback] code:", code ? "present" : "missing");
  console.log("[Auth Callback] siteUrl:", siteUrl);
  console.log("[Auth Callback] next:", next);

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    console.log("[Auth Callback] exchangeCodeForSession error:", error?.message);
    console.log("[Auth Callback] user:", data?.user?.id);
    
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
      } catch (dbError) {
        console.error("[Auth Callback] Error syncing user to database:", dbError);
      }

      const redirectUrl = `${siteUrl}${next}`;
      console.log("[Auth Callback] Redirecting to:", redirectUrl);
      return NextResponse.redirect(redirectUrl);
    }
    
    // Если была ошибка при обмене кода
    if (error) {
      console.error("[Auth Callback] Auth error:", error.message);
      return NextResponse.redirect(`${siteUrl}/?error=${encodeURIComponent(error.message)}`);
    }
  }

  // Нет кода - редирект на главную с ошибкой
  console.log("[Auth Callback] No code provided, redirecting to home");
  return NextResponse.redirect(`${siteUrl}/?error=no_code`);
}

