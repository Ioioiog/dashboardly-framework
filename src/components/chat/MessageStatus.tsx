import React from "react";
import { Check, CheckCheck } from "lucide-react";

interface MessageStatusProps {
  status: 'sent' | 'delivered' | 'read';
}

export function MessageStatus({ status }: MessageStatusProps) {
  switch (status) {
    case 'delivered':
      return <Check className="h-4 w-4 text-blue-500" />;
    case 'read':
      return <CheckCheck className="h-4 w-4 text-blue-500" />;
    default:
      return <Check className="h-4 w-4 text-gray-400" />;
  }
}