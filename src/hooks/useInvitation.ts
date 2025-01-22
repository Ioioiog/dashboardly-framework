import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { tenantInvitationService } from "@/services/tenantInvitationService";

interface InvitationData {
  email: string;
  firstName: string;
  lastName: string;
  propertyIds: string[];
  startDate: string;
  endDate?: string;
}

export function useInvitation() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResendConfirm, setShowResendConfirm] = useState(false);
  const [resendData, setResendData] = useState<any>(null);
  const { toast } = useToast();

  const handleSubmit = async (data: InvitationData) => {
    setIsSubmitting(true);
    try {
      console.log("Creating tenant with data:", data);
      
      // Check for existing invitation
      const existingInvite = await tenantInvitationService.checkExistingInvitation(data.email);
      if (existingInvite) {
        setResendData({ ...existingInvite, resend: true });
        setShowResendConfirm(true);
        return;
      }

      // Create new invitation
      const { invitation, token } = await tenantInvitationService.createInvitation(data);

      // Send invitation email
      await tenantInvitationService.sendInvitationEmail({
        ...data,
        token,
      });

      toast({
        title: "Success",
        description: "Tenant invitation sent successfully.",
      });

      return true;
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast({
        title: "Error",
        description: error instanceof Error 
          ? error.message 
          : "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendConfirm = async () => {
    setShowResendConfirm(false);
    setIsSubmitting(true);
    
    try {
      console.log("Resending invitation for:", resendData.email);
      
      const token = await tenantInvitationService.resendInvitation(resendData.id);
      
      await tenantInvitationService.sendInvitationEmail({
        email: resendData.email,
        firstName: resendData.first_name,
        lastName: resendData.last_name,
        propertyIds: resendData.propertyIds,
        token,
        startDate: resendData.start_date,
        endDate: resendData.end_date,
      });

      toast({
        title: "Success",
        description: "Invitation resent successfully.",
      });

      return true;
    } catch (error) {
      console.error("Error in handleResendConfirm:", error);
      toast({
        title: "Error",
        description: error instanceof Error 
          ? error.message 
          : "Failed to resend invitation. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    showResendConfirm,
    setShowResendConfirm,
    handleSubmit,
    handleResendConfirm,
  };
}