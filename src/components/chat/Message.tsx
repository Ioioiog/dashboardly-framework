import React from "react";
import { format } from "date-fns";
import { Check, CheckCheck, Trash2, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
      <div className="max-w-[70%]">
        <div
          className={`rounded-lg p-3 ${
            isCurrentUser
              ? "bg-blue-500 text-white"
              : "bg-gray-100 dark:bg-gray-800"
          }`}
        >
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
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onEditCancel}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <p className="break-words">{content}</p>
          )}
        </div>
        <div className="flex justify-end mt-1 space-x-2">
          {isCurrentUser && !isEditing && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => onEditStart(id, content)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => onDelete(id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              {renderMessageStatus(status)}
            </>
          )}
        </div>
      </div>
    </div>
  );
}