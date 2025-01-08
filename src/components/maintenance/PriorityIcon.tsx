import { AlertTriangle, Clock, Wrench } from "lucide-react";

interface PriorityIconProps {
  priority?: string;
}

export function PriorityIcon({ priority }: PriorityIconProps) {
  switch (priority) {
    case "High":
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    case "Medium":
      return <Clock className="w-4 h-4 text-yellow-500" />;
    case "Low":
      return <Wrench className="w-4 h-4 text-blue-500" />;
    default:
      return null;
  }
}