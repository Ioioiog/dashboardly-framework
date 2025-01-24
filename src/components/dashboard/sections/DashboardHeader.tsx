import { useTranslation } from "react-i18next";

interface DashboardHeaderProps {
  userName: string;
}

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  const { t } = useTranslation();
  
  return (
    <header className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-6 transition-all duration-200 hover:shadow-xl animate-fade-in">
      <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
        {t('dashboard.title')}
      </h1>
      <p className="mt-2 text-dashboard-text text-sm md:text-base leading-relaxed">
        {t('dashboard.welcome')}, <span className="font-semibold text-gray-800">{userName}</span>! {t('dashboard.overview')}
      </p>
    </header>
  );
}