import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Settings, Bell, Shield, Palette } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { toast } = useToast();
  const [pageSize, setPageSize] = useState(10);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [successMessages, setSuccessMessages] = useState(true);
  const [autoLogout, setAutoLogout] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [compactView, setCompactView] = useState(false);

  const handleSaveSettings = () => {
    // Here you would normally save to a backend or localStorage
    localStorage.setItem('appSettings', JSON.stringify({
      pageSize,
      emailNotifications,
      successMessages,
      autoLogout,
      deleteConfirmation,
      darkMode,
      compactView
    }));
    
    toast({
      title: "Settings Saved",
      description: "Your preferences have been successfully updated.",
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link href="/customers">
          <Button variant="ghost" data-testid="button-back">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Customers
          </Button>
        </Link>
      </div>

      {/* Page Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold leading-7 text-foreground sm:text-3xl">
          Application Settings
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure your customer management preferences
        </p>
      </div>

      {/* Settings Cards */}
      <div className="space-y-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="page-size">Items per page</Label>
                <Input 
                  id="page-size" 
                  type="number" 
                  value={pageSize} 
                  onChange={(e) => setPageSize(parseInt(e.target.value))} 
                  min="5" 
                  max="50" 
                />
              </div>
              <div>
                <Label htmlFor="default-sort">Default sort order</Label>
                <Input id="default-sort" defaultValue="First Name (A-Z)" readOnly />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Email notifications</Label>
                <p className="text-sm text-muted-foreground">Receive email updates when customers are added</p>
              </div>
              <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Success messages</Label>
                <p className="text-sm text-muted-foreground">Show success toasts for actions</p>
              </div>
              <Switch checked={successMessages} onCheckedChange={setSuccessMessages} />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Security & Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-logout</Label>
                <p className="text-sm text-muted-foreground">Automatically log out after inactivity</p>
              </div>
              <Switch checked={autoLogout} onCheckedChange={setAutoLogout} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Delete confirmation</Label>
                <p className="text-sm text-muted-foreground">Require confirmation before deleting records</p>
              </div>
              <Switch checked={deleteConfirmation} onCheckedChange={setDeleteConfirmation} />
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="mr-2 h-5 w-5" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Dark mode</Label>
                <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
              </div>
              <Switch checked={darkMode} onCheckedChange={setDarkMode} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Compact view</Label>
                <p className="text-sm text-muted-foreground">Use smaller spacing for better information density</p>
              </div>
              <Switch checked={compactView} onCheckedChange={setCompactView} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="mt-8 flex justify-end">
        <Button onClick={handleSaveSettings}>Save Settings</Button>
      </div>
    </div>
  );
}