import { Progress } from "@/components/ui/progress";
import { Check } from "lucide-react";

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const calculateStrength = (password: string): number => {
    let strength = 0;
    
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    
    return strength;
  };

  const getStrengthColor = (strength: number): string => {
    if (strength < 50) return "bg-red-500";
    if (strength < 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const strength = calculateStrength(password);
  const strengthColor = getStrengthColor(strength);

  return (
    <div className="space-y-3 animate-fade-in">
      <Progress value={strength} className={`h-2 ${strengthColor}`} />
      <ul className="grid grid-cols-2 gap-2 text-sm text-gray-500">
        <li className={`flex items-center gap-1.5 ${password.length >= 8 ? "text-green-600" : ""}`}>
          <Check className={`h-4 w-4 ${password.length >= 8 ? "opacity-100" : "opacity-40"}`} />
          8+ characters
        </li>
        <li className={`flex items-center gap-1.5 ${/[A-Z]/.test(password) ? "text-green-600" : ""}`}>
          <Check className={`h-4 w-4 ${/[A-Z]/.test(password) ? "opacity-100" : "opacity-40"}`} />
          Uppercase letter
        </li>
        <li className={`flex items-center gap-1.5 ${/[0-9]/.test(password) ? "text-green-600" : ""}`}>
          <Check className={`h-4 w-4 ${/[0-9]/.test(password) ? "opacity-100" : "opacity-40"}`} />
          Number
        </li>
        <li className={`flex items-center gap-1.5 ${/[^A-Za-z0-9]/.test(password) ? "text-green-600" : ""}`}>
          <Check className={`h-4 w-4 ${/[^A-Za-z0-9]/.test(password) ? "opacity-100" : "opacity-40"}`} />
          Special character
        </li>
      </ul>
    </div>
  );
}