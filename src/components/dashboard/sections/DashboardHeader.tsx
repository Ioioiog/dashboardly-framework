import { useTranslation } from "react-i18next";

interface DashboardHeaderProps {
  userName: string;
}

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  const { t } = useTranslation('dashboard');
  
  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">
        {t('title')}
      </h1>
      <p className="text-muted-foreground">
        {t('welcome')} <span className="font-medium text-primary">{userName}</span>! {t('overview')}
      </p>
    </div>
  );
}