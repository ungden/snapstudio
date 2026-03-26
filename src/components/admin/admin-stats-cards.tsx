"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Image, 
  CreditCard, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Activity,
  Database
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

interface AdminStatsCardsProps {
  stats: StatsData;
  loading?: boolean;
}

export function AdminStatsCards({ stats, loading = false }: AdminStatsCardsProps) {
  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      change: `+${stats.newUsersToday}`,
      changeType: 'increase' as const,
      icon: Users,
      color: 'blue',
      description: 'today'
    },
    {
      title: 'Images Created',
      value: stats.totalImages.toLocaleString(),
      change: `+${stats.imagesGeneratedToday}`,
      changeType: 'increase' as const,
      icon: Image,
      color: 'green',
      description: 'today'
    },
    {
      title: 'Orders',
      value: stats.totalOrders.toLocaleString(),
      change: `${stats.pendingOrders} pending`,
      changeType: stats.pendingOrders > 0 ? 'warning' as const : 'neutral' as const,
      icon: CreditCard,
      color: 'orange',
      description: 'processing'
    },
    {
      title: 'Revenue',
      value: `${(stats.revenue / 1000000).toFixed(1)}M`,
      change: `+${(stats.revenueToday / 1000).toFixed(0)}k`,
      changeType: 'increase' as const,
      icon: DollarSign,
      color: 'emerald',
      description: 'today'
    },
    {
      title: 'Templates',
      value: stats.activeTemplates.toString(),
      change: 'Active',
      changeType: 'neutral' as const,
      icon: Zap,
      color: 'purple',
      description: 'templates'
    },
    {
      title: 'System Health',
      value: `${stats.systemHealth}%`,
      change: stats.systemHealth >= 95 ? 'Excellent' : stats.systemHealth >= 85 ? 'Good' : 'Warning',
      changeType: stats.systemHealth >= 95 ? 'increase' as const : stats.systemHealth >= 85 ? 'neutral' as const : 'decrease' as const,
      icon: Activity,
      color: 'indigo',
      description: 'uptime'
    },
    {
      title: 'API Calls',
      value: stats.apiCalls.toLocaleString(),
      change: 'Today',
      changeType: 'neutral' as const,
      icon: Database,
      color: 'pink',
      description: 'requests'
    },
    {
      title: 'Completed Orders',
      value: stats.completedOrders.toLocaleString(),
      change: `${stats.totalOrders > 0 ? ((stats.completedOrders / stats.totalOrders) * 100).toFixed(1) : 0}%`,
      changeType: 'increase' as const,
      icon: CheckCircle,
      color: 'teal',
      description: 'rate'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-500 text-white',
      green: 'bg-green-500 text-white',
      orange: 'bg-orange-500 text-white',
      emerald: 'bg-emerald-500 text-white',
      purple: 'bg-purple-500 text-white',
      indigo: 'bg-indigo-500 text-white',
      pink: 'bg-pink-500 text-white',
      teal: 'bg-teal-500 text-white',
    };
    return colors[color as keyof typeof colors] || 'bg-gray-500 text-white';
  };

  const getChangeIcon = (type: 'increase' | 'decrease' | 'warning' | 'neutral') => {
    switch (type) {
      case 'increase': return <TrendingUp className="w-3 h-3" />;
      case 'decrease': return <TrendingDown className="w-3 h-3" />;
      case 'warning': return <AlertCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const getChangeColor = (type: 'increase' | 'decrease' | 'warning' | 'neutral') => {
    switch (type) {
      case 'increase': return 'text-green-600 bg-green-50';
      case 'decrease': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                <div className="w-16 h-6 bg-gray-200 rounded"></div>
              </div>
              <div className="w-20 h-8 bg-gray-200 rounded mb-2"></div>
              <div className="w-24 h-4 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", getColorClasses(card.color))}>
                  <Icon className="w-6 h-6" />
                </div>
                <Badge className={cn("text-xs px-2 py-1 flex items-center gap-1", getChangeColor(card.changeType))}>
                  {getChangeIcon(card.changeType)}
                  {card.change}
                </Badge>
              </div>
              
              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-xs text-gray-500">{card.description}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}