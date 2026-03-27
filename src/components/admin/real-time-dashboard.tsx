"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createSupabaseBrowserClient } from '@/integrations/supabase/client';
import { 
  Users, 
  Image, 
  CreditCard, 
  Activity,
  Bell
} from 'lucide-react';

const supabase = createSupabaseBrowserClient();

interface RealTimeEvent {
  id: string;
  type: 'new_user' | 'new_image' | 'new_order';
  message: string;
  timestamp: string;
}

export function RealTimeDashboard() {
  const [events, setEvents] = useState<RealTimeEvent[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [imageCount, setImageCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => {
    const fetchInitialCounts = async () => {
      const { count: users } = await supabase.from('profiles').select('id', { count: 'exact', head: true });
      const { count: images } = await supabase.from('generated_images').select('id', { count: 'exact', head: true });
      const { count: orders } = await supabase.from('orders').select('id', { count: 'exact', head: true });
      setUserCount(users || 0);
      setImageCount(images || 0);
      setOrderCount(orders || 0);
    };
    fetchInitialCounts();

    const profilesChannel = supabase
      .channel('realtime-profiles')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, (payload: any) => {
        const newEvent: RealTimeEvent = {
          id: `user-${payload.new.id}`,
          type: 'new_user',
          message: `New user: ${payload.new.email}`,
          timestamp: payload.commit_timestamp,
        };
        setEvents(prev => [newEvent, ...prev.slice(0, 9)]);
        setUserCount(prev => prev + 1);
      })
      .subscribe();

    const imagesChannel = supabase
      .channel('realtime-images')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'generated_images' }, (payload: any) => {
        const newEvent: RealTimeEvent = {
          id: `image-${payload.new.id}`,
          type: 'new_image',
          message: `New image created: ${payload.new.title}`,
          timestamp: payload.commit_timestamp,
        };
        setEvents(prev => [newEvent, ...prev.slice(0, 9)]);
        setImageCount(prev => prev + 1);
      })
      .subscribe();

    const ordersChannel = supabase
      .channel('realtime-orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload: any) => {
        const newEvent: RealTimeEvent = {
          id: `order-${payload.new.id}`,
          type: 'new_order',
          message: `New order: ${payload.new.amount.toLocaleString()} VND`,
          timestamp: payload.commit_timestamp,
        };
        setEvents(prev => [newEvent, ...prev.slice(0, 9)]);
        setOrderCount(prev => prev + 1);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(imagesChannel);
      supabase.removeChannel(ordersChannel);
    };
  }, []);

  const getEventIcon = (type: RealTimeEvent['type']) => {
    switch (type) {
      case 'new_user': return <Users className="h-4 w-4" />;
      case 'new_image': return <Image className="h-4 w-4" />;
      case 'new_order': return <CreditCard className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Real-time Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Users</p>
              <p className="text-2xl font-bold">{userCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Images</p>
              <p className="text-2xl font-bold">{imageCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Orders</p>
              <p className="text-2xl font-bold">{orderCount}</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {events.length === 0 && (
            <Alert>
              <Bell className="h-4 w-4" />
              <AlertDescription>
                Waiting for new activity...
              </AlertDescription>
            </Alert>
          )}
          {events.map(event => (
            <div key={event.id} className="flex items-start gap-3 text-sm p-2 bg-gray-50 rounded-lg">
              <div className="mt-1">{getEventIcon(event.type)}</div>
              <div className="flex-1">
                <p>{event.message}</p>
                <p className="text-xs text-gray-500">{new Date(event.timestamp).toLocaleTimeString()}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}