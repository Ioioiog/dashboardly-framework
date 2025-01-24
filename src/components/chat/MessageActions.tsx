import React from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { MessageStatus } from "./MessageStatus";

interface MessageActionsProps {
  status: 'sent' | 'delivered' | 'read';
  onEdit: () => void;
  onDelete: () => void;
}

export function MessageActions({ status, onEdit, onDelete }: MessageActionsProps) {
  return (
    <div className="flex justify-end mt-1 space-x-1 items-center opacity-0 group-hover:opacity-100 transition-opacity">
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0"
        onClick={onEdit}
      >
        <Pencil className="h-3 w-3" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0"
        onClick={onDelete}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
      <div className="flex items-center ml-1">
        <MessageStatus status={status} />
      </div>
    </div>
  );
}