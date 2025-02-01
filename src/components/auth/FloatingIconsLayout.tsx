import React from "react";
import { 
  Home, Building2, Wrench, MessageSquare, FileText, Settings, 
  Receipt, Bell, Calendar, CreditCard, User, Lock, Key, 
  Shield, Globe, Mail, Wallet, Users, HomeIcon
} from "lucide-react";

interface FloatingIconProps {
  icon: React.ElementType;
  className: string;
}

const FloatingIcon = ({ icon: Icon, className }: FloatingIconProps) => (
  <div className={`absolute opacity-[0.08] dark:opacity-[0.12] ${className}`}>
    <Icon size={48} />
  </div>
);

interface FloatingIconsLayoutProps {
  variant: "role-form" | "auth-form";
}

export function FloatingIconsLayout({ variant }: FloatingIconsLayoutProps) {
  const icons = variant === "role-form" 
    ? {
        left: [
          { icon: Home, position: "top-[10%] left-[15%]", animation: "animate-float-1" },
          { icon: Wrench, position: "top-[30%] left-[25%]", animation: "animate-float-3" },
          { icon: FileText, position: "top-[50%] left-[15%]", animation: "animate-float-5" },
          { icon: Receipt, position: "bottom-[30%] left-[25%]", animation: "animate-float-7" },
          { icon: Calendar, position: "bottom-[10%] left-[15%]", animation: "animate-float-9" }
        ],
        right: [
          { icon: Building2, position: "top-[15%] right-[20%]", animation: "animate-float-2" },
          { icon: MessageSquare, position: "top-[35%] right-[15%]", animation: "animate-float-4" },
          { icon: Settings, position: "top-[55%] right-[20%]", animation: "animate-float-6" },
          { icon: Bell, position: "bottom-[35%] right-[15%]", animation: "animate-float-8" }
        ]
      }
    : {
        left: [
          { icon: User, position: "top-[10%] left-[15%]", animation: "animate-float-1" },
          { icon: Key, position: "top-[30%] left-[25%]", animation: "animate-float-3" },
          { icon: Globe, position: "top-[50%] left-[15%]", animation: "animate-float-5" },
          { icon: Wallet, position: "bottom-[30%] left-[25%]", animation: "animate-float-7" },
          { icon: HomeIcon, position: "bottom-[10%] left-[15%]", animation: "animate-float-9" }
        ],
        right: [
          { icon: Lock, position: "top-[15%] right-[20%]", animation: "animate-float-2" },
          { icon: Shield, position: "top-[35%] right-[15%]", animation: "animate-float-4" },
          { icon: Mail, position: "top-[55%] right-[20%]", animation: "animate-float-6" },
          { icon: Users, position: "bottom-[35%] right-[15%]", animation: "animate-float-8" },
          { icon: CreditCard, position: "bottom-[15%] right-[20%]", animation: "animate-float-10" }
        ]
      };

  return (
    <>
      <div className="absolute left-0 inset-y-0 w-1/4">
        {icons.left.map((iconData, index) => (
          <FloatingIcon
            key={`left-${index}`}
            icon={iconData.icon}
            className={`${iconData.position} ${iconData.animation}`}
          />
        ))}
      </div>
      <div className="absolute right-0 inset-y-0 w-1/4">
        {icons.right.map((iconData, index) => (
          <FloatingIcon
            key={`right-${index}`}
            icon={iconData.icon}
            className={`${iconData.position} ${iconData.animation}`}
          />
        ))}
      </div>
    </>
  );
}