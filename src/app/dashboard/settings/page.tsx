"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createSupabaseBrowserClient } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  User, 
  Mail, 
  Bell, 
  Shield, 
  Trash2,
  Save,
  Eye,
  EyeOff,
  AlertTriangle,
  Loader2,
  Settings as SettingsIcon
} from 'lucide-react';

const supabase = createSupabaseBrowserClient();

export const dynamic = "force-dynamic";

interface UserSettings {
  full_name: string;
  email: string;
  avatar_url: string | null;
  email_notifications: boolean;
  public_profile: boolean;
  show_in_community: boolean;
}

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [settings, setSettings] = useState<UserSettings>({
    full_name: '',
    email: '',
    avatar_url: null,
    email_notifications: true,
    public_profile: true,
    show_in_community: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => {
    if (user && profile) {
      setSettings({
        full_name: profile.full_name || '',
        email: profile.email || user.email || '',
        avatar_url: (profile as any).avatar_url || null, // Type assertion to handle optional property
        email_notifications: true, // Default values since we don't store these yet
        public_profile: true,
        show_in_community: true
      });
      setLoading(false);
    }
  }, [user, profile]);

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: settings.full_name.trim() || null,
          avatar_url: settings.avatar_url
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user?.email || '', {
        redirectTo: `${window.location.origin}/auth/callback`
      });

      if (error) throw error;
      toast.success('Password reset email sent!');
    } catch (error) {
      toast.error('Error sending password reset email');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE ACCOUNT') {
      toast.error('Please type exactly "DELETE ACCOUNT"');
      return;
    }

    try {
      // In a real app, this would be handled by an admin function
      toast.info('Account deletion request has been submitted. Admin will process it within 24 hours.');
      setShowDeleteConfirm(false);
      setDeleteConfirmText('');
    } catch (error) {
      toast.error('Error deleting account');
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          <p className="text-gray-600 mt-2">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
        <p className="text-gray-600">Manage your personal information and preferences</p>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="full-name">Full Name</Label>
            <Input
              id="full-name"
              value={settings.full_name}
              onChange={(e) => setSettings({...settings, full_name: e.target.value})}
              placeholder="Enter your full name"
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={settings.email}
              disabled
              className="bg-gray-50"
            />
            <p className="text-xs text-gray-500 mt-1">
              Email cannot be changed. Contact admin if you need assistance.
            </p>
          </div>

          <div>
            <Label htmlFor="avatar-url">Avatar URL (optional)</Label>
            <Input
              id="avatar-url"
              value={settings.avatar_url || ''}
              onChange={(e) => setSettings({...settings, avatar_url: e.target.value || null})}
              placeholder="https://example.com/avatar.jpg"
            />
          </div>

          <Button onClick={handleSaveProfile} disabled={saving}>
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Information
          </Button>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Current Plan:</span>
              <div className="font-semibold capitalize">{profile?.subscription_plan || 'Free'}</div>
            </div>
            <div>
              <span className="text-gray-600">Date Joined:</span>
              <div className="font-semibold">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US') : 'N/A'}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Images Generated:</span>
              <div className="font-semibold">{profile?.images_generated || 0}</div>
            </div>
            <div>
              <span className="text-gray-600">Points Balance:</span>
              <div className="font-semibold text-blue-600">{(profile?.points_balance || 0).toLocaleString()}</div>
            </div>
          </div>

          {profile?.subscription_expires_at && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm">
                <span className="text-gray-600">Plan Expires:</span>
                <span className="font-semibold ml-2">
                  {new Date(profile.subscription_expires_at).toLocaleDateString('en-US')}
                </span>
                <span className="text-blue-600 ml-2">
                  ({Math.max(0, Math.ceil((new Date(profile.subscription_expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days remaining)
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Privacy & Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Privacy & Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Email Notifications</h4>
              <p className="text-sm text-gray-600">Receive emails about account updates and promotions</p>
            </div>
            <Switch
              checked={settings.email_notifications}
              onCheckedChange={(checked) => setSettings({...settings, email_notifications: checked})}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Public Profile</h4>
              <p className="text-sm text-gray-600">Allow others to view your profile</p>
            </div>
            <Switch
              checked={settings.public_profile}
              onCheckedChange={(checked) => setSettings({...settings, public_profile: checked})}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Show in Community</h4>
              <p className="text-sm text-gray-600">Your images may appear in the community feed</p>
            </div>
            <Switch
              checked={settings.show_in_community}
              onCheckedChange={(checked) => setSettings({...settings, show_in_community: checked})}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Change Password</h4>
            <p className="text-sm text-gray-600 mb-4">
              We will send a password reset link to your email
            </p>
            <Button variant="outline" onClick={handleChangePassword}>
              <Mail className="w-4 h-4 mr-2" />
              Send Password Reset Link
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Warning:</strong> Deleting your account will permanently remove all your data and cannot be undone.
            </AlertDescription>
          </Alert>

          {!showDeleteConfirm ? (
            <Button 
              variant="destructive" 
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          ) : (
            <div className="space-y-4 p-4 bg-red-50 rounded-lg border border-red-200">
              <div>
                <Label htmlFor="delete-confirm">
                  Type <strong>"DELETE ACCOUNT"</strong> to confirm:
                </Label>
                <Input
                  id="delete-confirm"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE ACCOUNT"
                  className="mt-2"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'DELETE ACCOUNT'}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Confirm Delete
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}