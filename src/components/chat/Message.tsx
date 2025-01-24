import React from "react";
import { format } from "date-fns";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { MessageActions } from "./MessageActions";

interface MessageProps {
  id: string;
  content: string;
  senderName: string;
  createdAt: string;
  isCurrentUser: boolean;
  status: 'sent' | 'delivered' | 'read';
  isEditing: boolean;
  editedContent: string;
  onEditStart: (messageId: string, content: string) => void;
  onEditSave: (messageId: string) => void;
  onEditCancel: () => void;
  onEditChange: (content: string) => void;
  onDelete: (messageId: string) => void;
}

export function Message({
  id,
  content,
  senderName,
  createdAt,
  isCurrentUser,
  status,
  isEditing,
  editedContent,
  onEditStart,
  onEditSave,
  onEditCancel,
  onEditChange,
  onDelete,
}: MessageProps) {
  const messageTime = format(new Date(createdAt), 'HH:mm');

  return (
    <div className={cn("flex mb-4", isCurrentUser ? "justify-end" : "justify-start")}>
      <div className={cn(
        "max-w-[70%] group",
        isCurrentUser ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "rounded-2xl p-4",
          isCurrentUser
            ? "bg-blue-500 text-white"
            : "bg-slate-100 dark:bg-slate-800"
        )}>
          <div className="flex justify-between items-center mb-1">
            <p className="text-sm font-semibold">{senderName}</p>
            <span className="text-xs opacity-70">{messageTime}</span>
          </div>
          {isEditing ? (
            <div className="flex gap-2">
              <Input
                value={editedContent}
                onChange={(e) => onEditChange(e.target.value)}
                className="flex-1 bg-white dark:bg-gray-700"
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onEditSave(id)}
                className="h-8 w-8 p-0"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onEditCancel}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <p className="break-words whitespace-pre-wrap">{content}</p>
          )}
        </div>
        {isCurrentUser && !isEditing && (
          <MessageActions
            status={status}
            onEdit={() => onEditStart(id, content)}
            onDelete={() => onDelete(id)}
          />
        )}
      </div>
    </div>
  );
}