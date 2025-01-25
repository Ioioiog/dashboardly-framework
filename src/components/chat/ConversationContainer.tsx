import React from "react";
import { cn } from "@/lib/utils";

interface ConversationContainerProps {
  children: React.ReactNode;
}

export function ConversationContainer({ children }: ConversationContainerProps) {
  return (
    <div className={cn(
      "flex-1 p-4 md:p-6 lg:p-8",
      "animate-fade-in",
      "bg-gradient-to-br from-slate-50 to-slate-100",
      "dark:from-slate-900 dark:to-slate-800"
    )}>
      <div className={cn(
        "max-w-5xl mx-auto",
        "bg-white dark:bg-slate-900",
        "rounded-xl shadow-lg",
        "border border-slate-200 dark:border-slate-700",
        "backdrop-blur-sm h-[calc(100vh-6rem)]",
        "transition-all duration-300",
        "hover:shadow-xl",
        "relative overflow-hidden"
      )}>
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br",
          "from-blue-50/5 to-indigo-50/5",
          "dark:from-blue-900/5 dark:to-indigo-900/5",
          "pointer-events-none"
        )} />
        <div className="flex flex-col h-full relative">
          {children}
        </div>
      </div>
    </div>
  );
}