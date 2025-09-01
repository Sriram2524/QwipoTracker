import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Settings, Bell, Shield, Palette } from "lucide-react";
import { Link } from "wouter";

export default function SettingsPage() {
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
                <Input id="page-size" type="number" defaultValue="10" min="5" max="50" />
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
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Success messages</Label>
                <p className="text-sm text-muted-foreground">Show success toasts for actions</p>
              </div>
              <Switch defaultChecked />
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
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Delete confirmation</Label>
                <p className="text-sm text-muted-foreground">Require confirmation before deleting records</p>
              </div>
              <Switch defaultChecked />
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
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Compact view</Label>
                <p className="text-sm text-muted-foreground">Use smaller spacing for better information density</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="mt-8 flex justify-end">
        <Button>Save Settings</Button>
      </div>
    </div>
  );
}