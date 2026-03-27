"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  User, 
  CreditCard, 
  Image, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Trash2,
  Edit
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityItem {
  id: string;
  type: 'user_signup' | 'order_completed' | 'image_generated' | 'template_created' | 'user_reported' | 'order_failed';
  title: string;
  description: string;
  user?: {
    name: string;
    email: string;
  };
  timestamp: string;
  metadata?: Record<string, any>;
}

interface RecentActivityProps {
  activities: ActivityItem[];
  loading?: boolean;
}

export function RecentActivity({ activities, loading = false }: RecentActivityProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_signup': return User;
      case 'order_completed': return CheckCircle;
      case 'order_failed': return AlertTriangle;
      case 'image_generated': return Image;
      case 'template_created': return Edit;
      case 'user_reported': return AlertTriangle;
      default: return Clock;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user_signup': return 'text-blue-600 bg-blue-50';
      case 'order_completed': return 'text-green-600 bg-green-50';
      case 'order_failed': return 'text-red-600 bg-red-50';
      case 'image_generated': return 'text-purple-600 bg-purple-50';
      case 'template_created': return 'text-indigo-600 bg-indigo-50';
      case 'user_reported': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getActivityBadge = (type: string) => {
    switch (type) {
      case 'user_signup': return { text: 'Signup', variant: 'secondary' as const };
      case 'order_completed': return { text: 'Payment', variant: 'default' as const };
      case 'order_failed': return { text: 'Error', variant: 'destructive' as const };
      case 'image_generated': return { text: 'Image', variant: 'secondary' as const };
      case 'template_created': return { text: 'Template', variant: 'outline' as const };
      case 'user_reported': return { text: 'Report', variant: 'destructive' as const };
      default: return { text: 'Other', variant: 'outline' as const };
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-4 animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
                  <div className="w-1/2 h-3 bg-gray-200 rounded"></div>
                </div>
                <div className="w-16 h-6 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Recent Activity
          <Badge variant="outline" className="text-xs">
            {activities.length} activities
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No activity yet</p>
            </div>
          ) : (
            activities.map((activity) => {
              const Icon = getActivityIcon(activity.type);
              const badge = getActivityBadge(activity.type);
              
              return (
                <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", getActivityColor(activity.type))}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900 truncate">{activity.title}</h4>
                      <Badge variant={badge.variant} className="text-xs">
                        {badge.text}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                    
                    {activity.user && (
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="w-5 h-5">
                          <AvatarFallback className="text-xs">
                            {(activity.user.name?.charAt(0) || activity.user.email.charAt(0) || 'U').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-gray-500 truncate">
                          {activity.user.name || activity.user.email}
                        </span>
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-400">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}