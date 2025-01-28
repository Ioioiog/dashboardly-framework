import { useTranslation } from "react-i18next";

interface EmptyStateProps {
  userRole: string;
}

export function EmptyState({ userRole }: EmptyStateProps) {
  const { t } = useTranslation();
  
  return (
    <div className="text-center py-8 bg-gray-50 rounded-lg">
      <p className="text-gray-600">{t('maintenance.noRequests')}</p>
      {userRole === 'tenant' && (
        <p className="text-sm text-gray-500 mt-2">
          {t('maintenance.createRequestPrompt')}
        </p>
      )}
    </div>
  );
}