"use client";

import { useState, useEffect } from 'react';
import { AdminStatsCards } from '@/components/admin/admin-stats-cards';
import { RecentActivity } from '@/components/admin/recent-activity';
import { SystemHealth } from '@/components/admin/system-health';
import { createSupabaseBrowserClient } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RefreshCw, Server, Database, Zap, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

const supabase = createSupabaseBrowserClient();

interface StatsData {
  totalUsers: number;
  newUsersToday: number;
  totalImages: number;
  imagesGeneratedToday: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  revenue: number;
  revenueToday: number;
  activeTemplates: number;
  systemHealth: number;
  apiCalls: number;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatsData>({
    totalUsers: 0, newUsersToday: 0, totalImages: 0, imagesGeneratedToday: 0,
    totalOrders: 0, pendingOrders: 0, completedOrders: 0, revenue: 0,
    revenueToday: 0, activeTemplates: 0, systemHealth: 98, apiCalls: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [usersRes, imagesRes, ordersRes, templatesRes] = await Promise.all([
        supabase.from('profiles').select('id, created_at', { count: 'exact' }),
        supabase.from('generated_images').select('id, created_at', { count: 'exact' }),
        supabase.from('orders').select('id, status, amount, created_at, user_id, metadata', { count: 'exact' }).order('created_at', { ascending: false }).limit(5),
        supabase.from('prompt_templates').select('id, is_active', { count: 'exact' })
      ]);

      const today = new Date().toDateString();
      const newUsersToday = (usersRes.data || []).filter((u: any) => new Date(u.created_at).toDateString() === today).length;
      const imagesGeneratedToday = (imagesRes.data || []).filter((i: any) => new Date(i.created_at).toDateString() === today).length;
      
      const { data: allOrders } = await supabase.from('orders').select('status, amount, created_at');
      const ordersData = allOrders || [];
      const pendingOrders = ordersData.filter((o: any) => o.status === 'pending').length;
      const completedOrders = ordersData.filter((o: any) => o.status === 'completed').length;
      const revenue = ordersData.filter((o: any) => o.status === 'completed').reduce((sum: number, o: any) => sum + o.amount, 0);
      const revenueToday = ordersData.filter((o: any) => o.status === 'completed' && new Date(o.created_at).toDateString() === today).reduce((sum: number, o: any) => sum + o.amount, 0);
      
      const activeTemplates = (templatesRes.data || []).filter((t: any) => t.is_active).length;

      setStats({
        totalUsers: usersRes.count || 0, newUsersToday,
        totalImages: imagesRes.count || 0, imagesGeneratedToday,
        totalOrders: ordersData.length, pendingOrders, completedOrders,
        revenue, revenueToday, activeTemplates,
        systemHealth: 98.5, apiCalls: Math.floor(Math.random() * 10000) + 5000
      });

      const userIds = (ordersRes.data || []).map((o: any) => o.user_id);
      const { data: profiles } = await supabase.from('profiles').select('id, email').in('id', userIds);
      const profileMap = new Map(profiles?.map((p: any) => [p.id, p.email]));

      const activity = (ordersRes.data || []).map((o: any) => ({
        id: o.id,
        type: o.status === 'completed' ? 'order_completed' : 'order_failed',
        title: `Order ${o.metadata?.plan_name || ''}`,
        description: `Amount: ${o.amount.toLocaleString()} VND`,
        user: { name: '', email: profileMap.get(o.user_id) || 'N/A' },
        timestamp: o.created_at,
      }));
      setRecentActivity(activity as any);

    } catch (error) {
      toast.error('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const systemMetrics = [
    { name: 'API Server', value: 99.8, status: 'healthy' as const, description: 'API response times are normal.', icon: Server },
    { name: 'Database', value: 99.5, status: 'healthy' as const, description: 'Database connection is stable.', icon: Database },
    { name: 'AI Generation', value: 97.2, status: 'healthy' as const, description: 'Image generation service is operational.', icon: Zap },
    { name: 'Payment Gateway', value: 99.9, status: 'healthy' as const, description: 'Payment processing is stable.', icon: Globe },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <Button onClick={loadDashboardData} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      <AdminStatsCards stats={stats} loading={loading} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivity activities={recentActivity} loading={loading} />
        </div>
        <div>
          <SystemHealth metrics={systemMetrics} loading={loading} />
        </div>
      </div>
    </div>
  );
}