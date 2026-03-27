import { Card, CardContent } from '@/components/ui/card';
import { 
  Users, 
  Image, 
  Settings, 
  DollarSign,
  AlertCircle,
  ShoppingCart
} from 'lucide-react';
import type { Stats } from '../types';

interface AdminStatsProps {
  stats: Stats;
}

export function AdminStats({ stats }: AdminStatsProps) {
  const statItems = [
    {
      label: 'Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-600'
    },
    {
      label: 'Images Created',
      value: stats.totalImages,
      icon: Image,
      color: 'text-green-600'
    },
    {
      label: 'Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'text-orange-600'
    },
    {
      label: 'Pending',
      value: stats.pendingOrders,
      icon: AlertCircle,
      color: 'text-yellow-600'
    },
    {
      label: 'Templates',
      value: stats.activeTemplates,
      icon: Settings,
      color: 'text-purple-600'
    },
    {
      label: 'Revenue',
      value: `${(stats.revenue / 1000000).toFixed(1)}M`,
      icon: DollarSign,
      color: 'text-green-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{item.label}</p>
                  <p className="text-2xl font-bold">{item.value}</p>
                </div>
                <Icon className={`w-8 h-8 ${item.color}`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}