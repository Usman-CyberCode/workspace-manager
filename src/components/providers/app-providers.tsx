"use client";

import { Toaster } from "sonner";
import type { ReactNode } from "react";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        theme="dark"
        richColors
        closeButton
        position="top-right"
        toastOptions={{
          classNames: {
            toast:
              "border border-border/80 bg-card/95 backdrop-blur-md shadow-lg",
          },
        }}
      />
    </>
  );
}
