import React from "react";
import { cn } from "@/lib/utils";

interface ConversationContainerProps {
  children: React.ReactNode;
}

export function ConversationContainer({ children }: ConversationContainerProps) {
  return (
    <div className={cn(
      "flex-1 p-4 md:p-8",
      "animate-fade-in",
      "bg-gradient-to-br from-slate-50/50 to-slate-100/50",
      "dark:from-slate-900/50 dark:to-slate-800/50"
    )}>
      <div className={cn(
        "max-w-5xl mx-auto",
        "bg-white/80 dark:bg-slate-900/80",
        "rounded-2xl shadow-lg",
        "border border-slate-200/50 dark:border-slate-700/50",
        "backdrop-blur-sm h-[calc(100vh-6rem)]",
        "transition-all duration-300",
        "hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-600",
        "relative overflow-hidden"
      )}>
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br",
          "from-blue-50/10 to-indigo-50/10",
          "dark:from-blue-900/10 dark:to-indigo-900/10",
          "pointer-events-none"
        )} />
        <div className="flex flex-col h-full relative">
          {children}
        </div>
      </div>
    </div>
  );
}