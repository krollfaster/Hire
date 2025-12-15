"use client";

import { useDataSync } from "@/hooks/useDataSync";

export function DataSyncProvider({ children }: { children: React.ReactNode }) {
  // Используем хук для синхронизации данных
  useDataSync();

  return <>{children}</>;
}

