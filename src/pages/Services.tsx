import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ServiceForm } from "@/components/service-provider/ServiceForm";
import { ServiceList } from "@/components/service-provider/ServiceList";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUserRole } from "@/hooks/use-user-role";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Wrench } from "lucide-react";

const Services = () => {
  const [showServiceForm, setShowServiceForm] = useState(false);
  const { userRole } = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (userRole && userRole !== "service_provider") {
      console.log("Redirecting non-service provider user. Role:", userRole);
      navigate("/dashboard");
    }
  }, [userRole, navigate]);

  if (!userRole || userRole !== "service_provider") {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Services</h1>
            <p className="text-muted-foreground mt-1">
              Manage your service offerings and pricing
            </p>
          </div>
          <Button 
            onClick={() => setShowServiceForm(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Wrench className="h-4 w-4 mr-2" />
            Add New Service
          </Button>
        </div>

        <ServiceList onEdit={() => setShowServiceForm(true)} />

        <Dialog open={showServiceForm} onOpenChange={setShowServiceForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Service</DialogTitle>
            </DialogHeader>
            <ServiceForm onSuccess={() => setShowServiceForm(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Services;