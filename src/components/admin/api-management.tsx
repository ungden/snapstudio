"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { createSupabaseBrowserClient } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Key, 
  Plus, 
  Trash2, 
  Copy, 
  Eye, 
  EyeOff,
  RefreshCw
} from 'lucide-react';

const supabase = createSupabaseBrowserClient();

interface ApiKey {
  id: string;
  user_id: string;
  key_name: string;
  key_prefix: string;
  last_used_at: string | null;
  is_active: boolean;
  created_at: string;
  profiles: {
    email: string | null;
  } | null;
}

export function ApiManagement() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyUserId, setNewKeyUserId] = useState('');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});

  const loadApiKeys = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('api_keys')
        .select('*, profiles(email)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApiKeys((data as ApiKey[]) || []);
    } catch (error) {
      toast.error('Error loading API keys');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApiKeys();
  }, []);

  const createApiKey = async () => {
    if (!newKeyName.trim() || !newKeyUserId.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('admin-create-api-key', {
        body: { user_id: newKeyUserId, key_name: newKeyName },
      });

      if (error) throw error;
      
      setGeneratedKey(data.api_key);
      setNewKeyName('');
      setNewKeyUserId('');
      loadApiKeys();
    } catch (error: any) {
      toast.error(error.message || 'Error creating API key');
    }
  };

  const deleteApiKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key?')) return;

    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', keyId);

      if (error) throw error;
      toast.success('API key deleted');
      loadApiKeys();
    } catch (error) {
      toast.error('Error deleting API key');
    }
  };

  const toggleApiKeyStatus = async (key: ApiKey) => {
    try {
      const { error } = await supabase
        .from('api_keys')
        .update({ is_active: !key.is_active })
        .eq('id', key.id);

      if (error) throw error;
      toast.success(`API key ${!key.is_active ? 'activated' : 'deactivated'}`);
      loadApiKeys();
    } catch (error) {
      toast.error('Error updating status');
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>API Key Management</CardTitle>
        <div className="flex gap-2">
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create New Key
          </Button>
          <Button onClick={loadApiKeys} variant="outline">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Key Name</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Prefix</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell className="font-medium">{key.key_name}</TableCell>
                  <TableCell>{key.profiles?.email || key.user_id.slice(0, 8)}</TableCell>
                  <TableCell className="font-mono text-xs">{key.key_prefix}...</TableCell>
                  <TableCell>
                    {key.last_used_at ? new Date(key.last_used_at).toLocaleString() : 'Never used'}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={key.is_active}
                      onCheckedChange={() => toggleApiKeyStatus(key)}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteApiKey(key.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) setGeneratedKey(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{generatedKey ? 'API Key Created' : 'Create New API Key'}</DialogTitle>
          </DialogHeader>
          {generatedKey ? (
            <div className="space-y-4">
              <p className="text-sm text-red-600">This is the only time you will see this key. Please copy and store it securely.</p>
              <div className="relative bg-gray-100 p-3 rounded-md">
                <pre className="text-sm font-mono break-all pr-10">{generatedKey}</pre>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-2 right-2 h-7 w-7"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedKey);
                    toast.success('Key copied!');
                  }}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <Button onClick={() => {
                setGeneratedKey(null);
                setIsDialogOpen(false);
              }}>Got it</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Key Name</label>
                <Input
                  placeholder="e.g., Partner ABC"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">User ID</label>
                <Input
                  placeholder="Paste the user's User ID"
                  value={newKeyUserId}
                  onChange={(e) => setNewKeyUserId(e.target.value)}
                />
              </div>
              <Button onClick={createApiKey} className="w-full">Create Key</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}