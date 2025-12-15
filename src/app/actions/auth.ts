"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export async function signInWithGoogle() {
  const supabase = await createClient();
  const headersList = await headers();
  const origin = headersList.get("origin") || "http://localhost:3000";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }

  return { error: "Не удалось получить URL для авторизации" };
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Убедимся что пользователь есть в нашей БД
  if (data.user) {
    await ensureUserInDatabase(data.user.id, data.user.email!);
  }

  return { success: true };
}

export async function signUpWithEmail(email: string, password: string) {
  const supabase = await createClient();
  const headersList = await headers();
  const origin = headersList.get("origin") || "http://localhost:3000";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Если пользователь сразу подтвержден (например, в dev режиме)
  if (data.user && !data.user.identities?.length) {
    return { error: "Пользователь с таким email уже существует" };
  }

  if (data.user) {
    await ensureUserInDatabase(data.user.id, data.user.email!);
  }

  return { 
    success: true, 
    message: "Проверьте email для подтверждения регистрации" 
  };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Вспомогательная функция для создания пользователя в нашей БД
async function ensureUserInDatabase(supabaseUserId: string, email: string) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: supabaseUserId },
    });

    if (!existingUser) {
      await prisma.user.create({
        data: {
          id: supabaseUserId,
          email,
        },
      });
    }
  } catch (error) {
    console.error("Error ensuring user in database:", error);
  }
}

