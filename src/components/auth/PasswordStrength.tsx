import { Progress } from "@/components/ui/progress";

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
    <div className="space-y-2">
      <Progress value={strength} className={strengthColor} />
      <ul className="text-sm space-y-1 text-gray-500">
        <li className={password.length >= 8 ? "text-green-600" : ""}>
          ✓ 8+ characters
        </li>
        <li className={/[A-Z]/.test(password) ? "text-green-600" : ""}>
          ✓ 1 uppercase letter
        </li>
        <li className={/[0-9]/.test(password) ? "text-green-600" : ""}>
          ✓ 1 number
        </li>
        <li className={/[^A-Za-z0-9]/.test(password) ? "text-green-600" : ""}>
          ✓ 1 special character
        </li>
      </ul>
    </div>
  );
}