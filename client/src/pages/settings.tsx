import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Settings, Shield, Palette } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/contexts/settings-context";

export default function SettingsPage() {
  const { toast } = useToast();
  const { settings, updateSettings, resetSettings } = useSettings();

  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your preferences have been successfully updated.",
    });
  };

  const handleResetSettings = () => {
    resetSettings();
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to default values.",
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
                  value={settings.pageSize} 
                  onChange={(e) => updateSettings({ pageSize: parseInt(e.target.value) || 10 })} 
                  min="1" 
                  max="100" 
                />
              </div>
              <div>
                <Label htmlFor="default-sort">Default sort order</Label>
                <Select 
                  value={`${settings.defaultSortBy}-${settings.defaultSortOrder}`} 
                  onValueChange={(value) => {
                    const [sortBy, sortOrder] = value.split('-');
                    updateSettings({ 
                      defaultSortBy: sortBy, 
                      defaultSortOrder: sortOrder as 'asc' | 'desc' 
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="firstName-asc">First Name (A-Z)</SelectItem>
                    <SelectItem value="firstName-desc">First Name (Z-A)</SelectItem>
                    <SelectItem value="lastName-asc">Last Name (A-Z)</SelectItem>
                    <SelectItem value="lastName-desc">Last Name (Z-A)</SelectItem>
                    <SelectItem value="phoneNumber-asc">Phone Number (A-Z)</SelectItem>
                    <SelectItem value="phoneNumber-desc">Phone Number (Z-A)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                <Label>Delete confirmation</Label>
                <p className="text-sm text-muted-foreground">Require confirmation before deleting records</p>
              </div>
              <Switch checked={settings.deleteConfirmation} onCheckedChange={(checked) => updateSettings({ deleteConfirmation: checked })} />
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
              <Switch checked={settings.darkMode} onCheckedChange={(checked) => updateSettings({ darkMode: checked })} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Compact view</Label>
                <p className="text-sm text-muted-foreground">Use smaller spacing for better information density</p>
              </div>
              <Switch checked={settings.compactView} onCheckedChange={(checked) => updateSettings({ compactView: checked })} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex justify-between">
        <Button variant="outline" onClick={handleResetSettings}>Reset to Defaults</Button>
        <Button onClick={handleSaveSettings}>Save Settings</Button>
      </div>
    </div>
  );
}