import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function NotificationSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="email-notifications">Email Notifications</Label>
          <Switch id="email-notifications" />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="maintenance-updates">Maintenance Updates</Label>
          <Switch id="maintenance-updates" />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="payment-reminders">Payment Reminders</Label>
          <Switch id="payment-reminders" />
        </div>
      </CardContent>
    </Card>
  );
}