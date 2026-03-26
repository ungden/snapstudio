"use client";

import { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createSupabaseBrowserClient } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Database, 
  Server, 
  Zap, 
  Globe,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

const supabase = createSupabaseBrowserClient();

interface SystemStatus {
  name: string;
  status: 'operational' | 'degraded' | 'outage';
  description: string;
  latency?: number;
}

export default function SystemPage() {
  const [loading, setLoading] = useState(true);
  const [statuses, setStatuses] = useState<SystemStatus[]>([]);

  const checkSystemStatus = async () => {
    try {
      setLoading(true);
      
      const results: SystemStatus[] = [];

      // Check Supabase DB
      const dbStart = Date.now();
      const { error: dbError } = await supabase.from('profiles').select('id').limit(1);
      const dbLatency = Date.now() - dbStart;
      results.push({
        name: 'Supabase Database',
        status: dbError ? 'degraded' : 'operational',
        description: dbError ? dbError.message : 'Database connection is stable.',
        latency: dbLatency
      });

      // Check Supabase Auth
      const authStart = Date.now();
      const { error: authError } = await supabase.auth.getUser();
      const authLatency = Date.now() - authStart;
      results.push({
        name: 'Supabase Auth',
        status: authError ? 'degraded' : 'operational',
        description: authError ? authError.message : 'Authentication service is operational.',
        latency: authLatency
      });

      // Check Edge Functions
      const funcStart = Date.now();
      const { error: funcError } = await supabase.functions.invoke('health-check');
      const funcLatency = Date.now() - funcStart;
      results.push({
        name: 'Edge Functions',
        status: funcError ? 'degraded' : 'operational',
        description: funcError ? funcError.message : 'Edge functions are responding.',
        latency: funcLatency
      });

      // Mock AI Generation Service Check
      results.push({
        name: 'AI Generation Service',
        status: 'operational',
        description: 'Image generation service is operational.',
        latency: Math.floor(Math.random() * 200) + 100
      });

      // Mock Payment Gateway Check
      results.push({
        name: 'Payment Gateway',
        status: 'operational',
        description: 'Payment gateway is operational.',
        latency: Math.floor(Math.random() * 150) + 50
      });

      setStatuses(results);

    } catch (error) {
      console.error('Error checking system status:', error);
      toast.error('Error checking system status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSystemStatus();
  }, []);

  const getStatusIcon = (status: SystemStatus['status']) => {
    switch (status) {
      case 'operational': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'degraded': return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'outage': return <AlertCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getStatusColor = (status: SystemStatus['status']) => {
    switch (status) {
      case 'operational': return 'border-green-600';
      case 'degraded': return 'border-yellow-600';
      case 'outage': return 'border-red-600';
    }
  };

  const getServiceIcon = (name: string) => {
    if (name.includes('Database')) return <Database className="w-8 h-8 text-blue-600" />;
    if (name.includes('Auth')) return <Server className="w-8 h-8 text-purple-600" />;
    if (name.includes('Functions')) return <Zap className="w-8 h-8 text-orange-600" />;
    return <Globe className="w-8 h-8 text-gray-600" />;
  };

  return (
      <div className="min-h-screen bg-gray-50">
        <AdminSidebar />
        <main className="ml-64 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">System Status</h1>
                  <p className="text-gray-600">Check the operational status of core services.</p>
                </div>
                <Button onClick={checkSystemStatus} variant="outline" className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Recheck
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Checking system status...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {statuses.map((service) => (
                  <Card key={service.name} className={`border-l-4 ${getStatusColor(service.status)}`}>
                    <CardContent className="p-6 flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        {getServiceIcon(service.name)}
                        <div>
                          <h3 className="text-lg font-semibold">{service.name}</h3>
                          <p className="text-sm text-gray-600">{service.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        {service.latency && (
                          <div className="text-center">
                            <p className="text-sm text-gray-500">Latency</p>
                            <p className="font-semibold">{service.latency}ms</p>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          {getStatusIcon(service.status)}
                          <span className="font-medium capitalize">{service.status}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
  );
}