"use client";

import { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  Settings, 
  Save, 
  Database, 
  Zap, 
  CreditCard, 
  Mail,
  Shield,
  Globe,
  Palette,
  Bell
} from 'lucide-react';

interface SystemSettings {
  // AI Configuration
  aiModel: string;
  batchCostPoints: number;
  soloCostPoints: number;
  
  // Payment Configuration
  usdVndRate: number;
  processingFeePercent: number;
  
  // System Configuration
  maxImagesPerUser: number;
  maxProjectsPerUser: number;
  enableCommunity: boolean;
  enableNotifications: boolean;
  
  // Email Configuration
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  
  // Security
  enableRateLimit: boolean;
  maxRequestsPerMinute: number;
  enableImageModeration: boolean;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<SystemSettings>({
    aiModel: 'gemini-2.5-flash',
    batchCostPoints: 120,
    soloCostPoints: 30,
    usdVndRate: 26400,
    processingFeePercent: 3,
    maxImagesPerUser: 1000,
    maxProjectsPerUser: 100,
    enableCommunity: true,
    enableNotifications: true,
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    enableRateLimit: true,
    maxRequestsPerMinute: 60,
    enableImageModeration: false
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      // In a real app, you would save these to a settings table
      // For now, just show success message
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Error saving settings');
    } finally {
      setLoading(false);
    }
  };

  const resetToDefaults = () => {
    if (!confirm('Are you sure you want to restore default settings?')) return;
    
    setSettings({
      aiModel: 'gemini-2.5-flash',
      batchCostPoints: 120,
      soloCostPoints: 30,
      usdVndRate: 26400,
      processingFeePercent: 3,
      maxImagesPerUser: 1000,
      maxProjectsPerUser: 100,
      enableCommunity: true,
      enableNotifications: true,
      smtpHost: '',
      smtpPort: 587,
      smtpUser: '',
      enableRateLimit: true,
      maxRequestsPerMinute: 60,
      enableImageModeration: false
    });
    
    toast.success('Default settings restored');
  };

  return (
      <div className="min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">System Settings</h1>
            <p className="text-gray-600">Configure system parameters and options.</p>
          </div>

          <div className="space-y-8">
            {/* AI Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Zap className="w-5 h-5" />
                  AI Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Model AI</label>
                    <Select 
                      value={settings.aiModel} 
                      onValueChange={(value) => setSettings({...settings, aiModel: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
                        <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                        <SelectItem value="gemini-ultra">Gemini Ultra</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Batch Cost (points)</label>
                    <Input
                      type="number"
                      value={settings.batchCostPoints}
                      onChange={(e) => setSettings({...settings, batchCostPoints: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Solo Cost (points)</label>
                    <Input
                      type="number"
                      value={settings.soloCostPoints}
                      onChange={(e) => setSettings({...settings, soloCostPoints: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5" />
                  Payment Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">USD/VND Exchange Rate</label>
                    <Input
                      type="number"
                      value={settings.usdVndRate}
                      onChange={(e) => setSettings({...settings, usdVndRate: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Processing Fee (%)</label>
                    <Input
                      type="number"
                      value={settings.processingFeePercent}
                      onChange={(e) => setSettings({...settings, processingFeePercent: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Limits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Database className="w-5 h-5" />
                  System Limits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Max Images/User</label>
                    <Input
                      type="number"
                      value={settings.maxImagesPerUser}
                      onChange={(e) => setSettings({...settings, maxImagesPerUser: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Max Projects/User</label>
                    <Input
                      type="number"
                      value={settings.maxProjectsPerUser}
                      onChange={(e) => setSettings({...settings, maxProjectsPerUser: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature Toggles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Settings className="w-5 h-5" />
                  Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Community</h4>
                      <p className="text-sm text-gray-600">Allow users to share and view public images</p>
                    </div>
                    <Switch
                      checked={settings.enableCommunity}
                      onCheckedChange={(checked) => setSettings({...settings, enableCommunity: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Notifications</h4>
                      <p className="text-sm text-gray-600">Send email notifications to users</p>
                    </div>
                    <Switch
                      checked={settings.enableNotifications}
                      onCheckedChange={(checked) => setSettings({...settings, enableNotifications: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Rate Limiting</h4>
                      <p className="text-sm text-gray-600">Limit requests to protect the system</p>
                    </div>
                    <Switch
                      checked={settings.enableRateLimit}
                      onCheckedChange={(checked) => setSettings({...settings, enableRateLimit: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Image Moderation</h4>
                      <p className="text-sm text-gray-600">Automatically check image content</p>
                    </div>
                    <Switch
                      checked={settings.enableImageModeration}
                      onCheckedChange={(checked) => setSettings({...settings, enableImageModeration: checked})}
                    />
                  </div>
                </div>

                {settings.enableRateLimit && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Max Requests/Minute</label>
                    <Input
                      type="number"
                      value={settings.maxRequestsPerMinute}
                      onChange={(e) => setSettings({...settings, maxRequestsPerMinute: parseInt(e.target.value) || 0})}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Email Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Mail className="w-5 h-5" />
                  Email Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">SMTP Host</label>
                    <Input
                      value={settings.smtpHost}
                      onChange={(e) => setSettings({...settings, smtpHost: e.target.value})}
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">SMTP Port</label>
                    <Input
                      type="number"
                      value={settings.smtpPort}
                      onChange={(e) => setSettings({...settings, smtpPort: parseInt(e.target.value) || 587})}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">SMTP User</label>
                    <Input
                      value={settings.smtpUser}
                      onChange={(e) => setSettings({...settings, smtpUser: e.target.value})}
                      placeholder="noreply@snapstudio.app"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Actions */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Save Settings</h3>
                    <p className="text-sm text-gray-600">Changes will take effect immediately</p>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={resetToDefaults}>
                      Restore Defaults
                    </Button>
                    <Button onClick={handleSave} disabled={loading}>
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? 'Saving...' : 'Save Settings'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  );
}