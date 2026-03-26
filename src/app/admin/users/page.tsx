"use client";

import { useState, useEffect } from 'react';
import { UsersTab } from '@/app/admin/components/UsersTab';
import { createSupabaseBrowserClient } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const supabase = createSupabaseBrowserClient();

export default function UsersPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      toast.error('Error loading users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
        <p className="text-gray-600">Manage accounts, roles, and user access.</p>
      </div>
      
      {loading ? (
        <p>Loading user list...</p>
      ) : (
        <UsersTab users={users} onDataChange={loadUsers} />
      )}
    </div>
  );
}
