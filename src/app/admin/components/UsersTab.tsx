import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { createSupabaseBrowserClient } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { User } from '../types';

const supabase = createSupabaseBrowserClient();

interface UsersTabProps {
  users: User[];
  onDataChange: () => void;
}

export function UsersTab({ users, onDataChange }: UsersTabProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const updateUserPlan = async (userId: string, newPlan: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ subscription_plan: newPlan })
        .eq('id', userId);

      if (error) throw error;
      toast.success('Plan updated successfully');
      onDataChange();
    } catch (error) {
      toast.error('Error updating plan');
    }
  };

  const updateUserPoints = async (userId: string, newPoints: string) => {
    const points = parseInt(newPoints, 10);
    if (isNaN(points)) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ points_balance: points })
        .eq('id', userId);

      if (error) throw error;
      toast.success('Points updated successfully');
      onDataChange();
    } catch (error) {
      toast.error('Error updating points');
    }
  };

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>User List ({filteredUsers.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Input 
          placeholder="Search by email or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-6"
        />
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Images Created</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>{user.full_name || 'N/A'}</TableCell>
                  <TableCell>
                    <Select
                      value={user.subscription_plan}
                      onValueChange={(value) => updateUserPlan(user.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="starter">Starter</SelectItem>
                        <SelectItem value="pro">Pro</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      defaultValue={user.points_balance}
                      onBlur={(e) => updateUserPoints(user.id, e.target.value)}
                      className="w-24"
                    />
                  </TableCell>
                  <TableCell>{user.images_generated}</TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}