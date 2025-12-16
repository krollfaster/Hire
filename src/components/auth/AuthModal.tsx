"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInWithEmail, signUpWithEmail, signInWithGoogle } from "@/app/actions/auth";
import { Loader2 } from "lucide-react";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "signin" | "signup";
  closable?: boolean;
}

export function AuthModal({
  open,
  onOpenChange,
  defaultTab = "signin",
  closable = true
}: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError(null);
    try {
      const result = await signInWithGoogle();
      if (result?.error) {
        setError(result.error);
        setIsGoogleLoading(false);
      }
      // Redirect happens automatically if successful
    } catch {
      setError("Произошла ошибка при входе через Google");
      setIsGoogleLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signInWithEmail(email, password);
      if (result.error) {
        setError(result.error);
      } else {
        onOpenChange(false);
        window.location.reload();
      }
    } catch {
      setError("Произошла ошибка при входе");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Пароль должен быть не менее 6 символов");
      setIsLoading(false);
      return;
    }

    try {
      const result = await signUpWithEmail(email, password);
      if (result.error) {
        setError(result.error);
      } else if (result.message) {
        setMessage(result.message);
      }
    } catch {
      setError("Произошла ошибка при регистрации");
    } finally {
      setIsLoading(false);
    }
  };

  const GoogleButton = () => (
    <Button
      variant="outline"
      type="button"
      className="w-full"
      onClick={handleGoogleSignIn}
      disabled={isLoading || isGoogleLoading}
    >
      {isGoogleLoading ? (
        <Loader2 className="mr-2 w-4 h-4 animate-spin" />
      ) : (
        <svg className="mr-2 w-4 h-4" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
      )}
      Войти через Google
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[425px]"
        showCloseButton={closable}
        onPointerDownOutside={(e) => !closable && e.preventDefault()}
        onEscapeKeyDown={(e) => !closable && e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Вход в аккаунт</DialogTitle>
          <DialogDescription>
            Войдите, чтобы сохранять резюме и историю чатов
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="signin">Вход</TabsTrigger>
            <TabsTrigger value="signup">Регистрация</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-4 mt-4">
            <GoogleButton />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="border-t w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Или через email
                </span>
              </div>
            </div>

            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  required
                  disabled={isLoading || isGoogleLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signin-password">Пароль</Label>
                <Input
                  id="signin-password"
                  name="password"
                  type="password"
                  required
                  disabled={isLoading || isGoogleLoading}
                />
              </div>

              {error && (
                <p className="text-destructive text-sm">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
                {isLoading && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
                Войти
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4 mt-4">
            <GoogleButton />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="border-t w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Или через email
                </span>
              </div>
            </div>

            <form onSubmit={handleEmailSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  required
                  disabled={isLoading || isGoogleLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Пароль</Label>
                <Input
                  id="signup-password"
                  name="password"
                  type="password"
                  required
                  disabled={isLoading || isGoogleLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-confirm">Подтвердите пароль</Label>
                <Input
                  id="signup-confirm"
                  name="confirmPassword"
                  type="password"
                  required
                  disabled={isLoading || isGoogleLoading}
                />
              </div>

              {error && (
                <p className="text-destructive text-sm">{error}</p>
              )}
              {message && (
                <p className="text-green-600 text-sm">{message}</p>
              )}

              <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
                {isLoading && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
                Зарегистрироваться
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
