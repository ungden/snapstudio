import { useState, useEffect } from 'react';
import { createSupabaseBrowserClient } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { User, Template, Order, Stats } from '../types';

const supabase = createSupabaseBrowserClient();

export function useAdminData() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalImages: 0,
    totalOrders: 0,
    pendingOrders: 0,
    revenue: 0,
    activeTemplates: 0
  });

  const loadData = async () => {
    try {
      setLoading(true);
      
      const { data: usersData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: templatesData } = await supabase
        .from('prompt_templates')
        .select('*')
        .order('category', { ascending: true });

      const { data: ordersData } = await supabase
        .from('orders')
        .select('*, profiles(email)')
        .order('created_at', { ascending: false });

      const { count: imagesCount } = await supabase
        .from('generated_images')
        .select('id', { count: 'exact', head: true });

      setUsers((usersData as User[]) || []);
      setTemplates((templatesData as Template[]) || []);
      setOrders((ordersData as Order[]) || []);

      const pendingCount = (ordersData || []).filter((o: Order) => o.status === 'pending').length;
      const revenue = (ordersData || []).filter((o: Order) => o.status === 'completed').reduce((sum: number, o: Order) => sum + o.amount, 0);
      const activeTemplatesCount = (templatesData || []).filter((t: Template) => t.is_active).length;

      setStats({
        totalUsers: (usersData || []).length,
        totalImages: imagesCount || 0,
        totalOrders: (ordersData || []).length,
        pendingOrders: pendingCount,
        revenue,
        activeTemplates: activeTemplatesCount
      });

    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    loading,
    users,
    templates,
    orders,
    stats,
    setUsers,
    setTemplates,
    setOrders,
    loadData
  };
}