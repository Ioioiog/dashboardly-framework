import React from "react";
import { format } from "date-fns";
import { Check, CheckCheck, Trash2, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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

  const renderMessageStatus = (status: 'sent' | 'delivered' | 'read') => {
    switch (status) {
      case 'delivered':
        return <Check className="h-4 w-4 text-blue-500" />;
      case 'read':
        return <CheckCheck className="h-4 w-4 text-blue-500" />;
      default:
        return <Check className="h-4 w-4 text-gray-400" />;
    }
  };

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
        {isCurrentUser && (
          <div className={cn(
            "flex justify-end mt-1 space-x-1 items-center opacity-0 group-hover:opacity-100 transition-opacity",
            isEditing && "opacity-100"
          )}>
            {!isEditing && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => onEditStart(id, content)}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => onDelete(id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
                <div className="flex items-center ml-1">
                  {renderMessageStatus(status)}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}