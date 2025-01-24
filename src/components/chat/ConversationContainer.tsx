import React from "react";
import { cn } from "@/lib/utils";

interface ConversationContainerProps {
  children: React.ReactNode;
}

export function ConversationContainer({ children }: ConversationContainerProps) {
  return (
    <div className="flex-1 p-8 animate-fade-in">
      <div className={cn(
        "max-w-4xl mx-auto",
        "bg-white dark:bg-slate-900",
        "rounded-2xl shadow-lg",
        "border border-slate-200 dark:border-slate-700",
        "backdrop-blur-sm h-[calc(100vh-8rem)]",
        "transition-all duration-200 hover:shadow-xl"
      )}>
        <div className="flex flex-col h-full">
          {children}
        </div>
      </div>
    </div>
  );
}