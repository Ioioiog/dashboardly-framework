import { DashboardHeader } from "./sections/DashboardHeader";
import { DashboardMetrics } from "./DashboardMetrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Calendar, DollarSign, FileText } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface TenantDashboardProps {
  userId: string;
  userName: string;
  tenantInfo: {
    tenancy_id: string;
    status: string;
    start_date: string;
    end_date?: string;
    property_id: string;
    property_name: string;
    property_address: string;
  };
}

export function TenantDashboard({ userId, userName, tenantInfo }: TenantDashboardProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  console.log("TenantDashboard - tenantInfo:", tenantInfo);

  if (!tenantInfo) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <p className="text-muted-foreground">Loading tenant information...</p>
      </div>
    );
  }

  const quickActions = [
    {
      title: t('dashboard.quickActions.maintenance'),
      description: t('dashboard.quickActions.maintenanceDesc'),
      icon: Home,
      action: () => navigate('/maintenance'),
    },
    {
      title: t('dashboard.quickActions.documents'),
      description: t('dashboard.quickActions.documentsDesc'),
      icon: FileText,
      action: () => navigate('/documents'),
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <section className="bg-white rounded-xl shadow-sm p-6">
        <DashboardHeader userName={userName} />
      </section>

      {/* Property Information */}
      <section className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">{t('dashboard.propertyInfo')}</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.property')}
              </CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tenantInfo.property_name}</div>
              <p className="text-sm text-muted-foreground mt-1">{tenantInfo.property_address}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.leaseDetails')}
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {format(new Date(tenantInfo.start_date), 'MMM d, yyyy')}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {tenantInfo.end_date 
                  ? t('dashboard.leaseEnd', { date: format(new Date(tenantInfo.end_date), 'MMM d, yyyy') })
                  : t('dashboard.ongoingLease')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.status')}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">
                {tenantInfo.status}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {t('dashboard.tenancyStatus')}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">{t('dashboard.metrics.title')}</h2>
        <DashboardMetrics userId={userId} userRole="tenant" />
      </section>

      {/* Quick Actions */}
      <section className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">{t('dashboard.quickActions.title')}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {quickActions.map((action, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <action.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{action.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{action.description}</p>
                    <Button onClick={action.action} variant="outline" className="w-full">
                      {t('dashboard.quickActions.viewMore')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}