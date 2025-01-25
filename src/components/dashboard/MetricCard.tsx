import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  className?: string;
  route?: string;
  onClick?: () => void;
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  description,
  className,
  route,
  onClick,
}: MetricCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (route) {
      navigate(route);
    }
  };

  const isPropertiesCard = title === 'dashboard.metrics.totalProperties';

  return (
    <Card 
      className={cn(
        "overflow-hidden relative", 
        className,
        (route || onClick) && "cursor-pointer hover:scale-105 transform transition-all duration-300"
      )}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isPropertiesCard && isHovered ? (
        <div className="absolute inset-0 flex items-center justify-center bg-white transition-all duration-500">
          <Icon 
            className={cn(
              "h-20 w-20 text-primary transition-all duration-500",
              "animate-[spin_3s_linear_infinite]",
              isHovered && "scale-110 animate-[bounce_1s_ease-in-out_infinite]"
            )}
          />
        </div>
      ) : (
        <>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t(title)}
            </CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">
                {t(description)}
              </p>
            )}
          </CardContent>
        </>
      )}
    </Card>
  );
}