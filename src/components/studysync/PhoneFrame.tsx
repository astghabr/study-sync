import { ReactNode } from "react";

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full gradient-warm">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background shadow-elevated md:my-6 md:min-h-[calc(100vh-3rem)] md:overflow-hidden md:rounded-[2.5rem] md:border md:border-border/60">
        {children}
      </div>
    </div>
  );
}
