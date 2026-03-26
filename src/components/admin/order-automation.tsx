"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { createSupabaseBrowserClient } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Bot, 
  Plus, 
  Edit, 
  Trash2,
  Play,
  History,
  Zap
} from 'lucide-react';

const supabase = createSupabaseBrowserClient();

interface AutomationRule {
  id: string;
  name: string;
  trigger: 'order_completed' | 'user_signup' | 'image_generated';
  action: 'grant_points' | 'send_email' | 'change_plan';
  config: any;
  is_active: boolean;
  run_count: number;
  last_run_at: string | null;
}

export function OrderAutomation() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);

  useEffect(() => {
    // Mock loading rules. In a real app, this would fetch from a DB.
    const mockRules: AutomationRule[] = [
      { id: '1', name: 'Grant points on Pro plan purchase', trigger: 'order_completed', action: 'grant_points', config: { plan_id: 'pro', points: 1000 }, is_active: true, run_count: 152, last_run_at: new Date().toISOString() },
      { id: '2', name: 'Welcome email for new users', trigger: 'user_signup', action: 'send_email', config: { template_id: 'welcome_email' }, is_active: true, run_count: 1230, last_run_at: new Date().toISOString() },
      { id: '3', name: 'Upgrade plan on Enterprise purchase', trigger: 'order_completed', action: 'change_plan', config: { plan_id: 'enterprise', new_plan: 'enterprise' }, is_active: false, run_count: 12, last_run_at: null },
    ];
    setRules(mockRules);
    setLoading(false);
  }, []);

  const handleSaveRule = () => {
    // In a real app, this would save to the database
    if (editingRule) {
      setRules(rules.map(r => r.id === editingRule.id ? editingRule : r));
      toast.success('Rule updated');
    } else {
      // Create new rule logic
      toast.success('New rule created');
    }
    setIsDialogOpen(false);
    setEditingRule(null);
  };

  const openEditDialog = (rule: AutomationRule) => {
    setEditingRule(rule);
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingRule(null); // Create a blank form
    setIsDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Automation</CardTitle>
        <Button onClick={openNewDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Create New Rule
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="space-y-4">
            {rules.map(rule => (
              <div key={rule.id} className="border p-4 rounded-lg flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{rule.name}</h4>
                    <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                      {rule.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Trigger: <span className="font-mono text-xs bg-gray-100 p-1 rounded">{rule.trigger}</span> → 
                    Action: <span className="font-mono text-xs bg-gray-100 p-1 rounded">{rule.action}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Runs: {rule.run_count}. Last run: {rule.last_run_at ? new Date(rule.last_run_at).toLocaleString() : 'Never'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(rule)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRule ? 'Edit Rule' : 'Create New Rule'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-1">Rule Name</label>
              <Input placeholder="e.g., Grant points for new users" defaultValue={editingRule?.name} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Trigger (When)</label>
                <Select defaultValue={editingRule?.trigger}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="order_completed">Order completed</SelectItem>
                    <SelectItem value="user_signup">User signup</SelectItem>
                    <SelectItem value="image_generated">Image generated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Action (Then)</label>
                <Select defaultValue={editingRule?.action}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grant_points">Grant points</SelectItem>
                    <SelectItem value="send_email">Send email</SelectItem>
                    <SelectItem value="change_plan">Change plan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Configuration (JSON)</label>
              <Textarea 
                placeholder='{ "plan_id": "pro", "points": 1000 }' 
                defaultValue={JSON.stringify(editingRule?.config, null, 2)}
                rows={4}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="is-active" defaultChecked={editingRule?.is_active ?? true} />
              <label htmlFor="is-active">Activate</label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveRule}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}