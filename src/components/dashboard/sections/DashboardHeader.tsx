import { useTranslation } from "react-i18next";

interface DashboardHeaderProps {
  userName: string;
}

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  const { t } = useTranslation();
  
  return (
    <header className="bg-white rounded-lg shadow-sm p-4">
      <h1 className="text-2xl font-semibold text-gray-900">
        {t('dashboard.title')}
      </h1>
      <p className="mt-1 text-dashboard-text">
        {t('dashboard.welcome')}, {userName}! {t('dashboard.overview')}
      </p>
    </header>
  );
}