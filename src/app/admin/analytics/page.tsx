"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createSupabaseBrowserClient } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, Users, Image, RefreshCw } from 'lucide-react';

const supabase = createSupabaseBrowserClient();

interface AnalyticsData {
  dailyUsers: { date: string; users: number }[];
  dailyImages: { date: string; images: number }[];
  dailyCost: { date: string; cost_vnd: number }[];
  totalCostVnd: number;
  imagesByType: { name: string; value: number; color: string }[];
  usersByPlan: { name: string; value: number; color: string }[];
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData>({
    dailyUsers: [],
    dailyImages: [],
    dailyCost: [],
    totalCostVnd: 0,
    imagesByType: [],
    usersByPlan: []
  });
  const [dateRange, setDateRange] = useState('30');

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const { data: resp, error } = await supabase.functions.invoke('admin-analytics', {
        body: { days: parseInt(dateRange) }
      });
      if (error) throw error;
      setData(resp as AnalyticsData);
    } catch (error: any) {
      console.error('Error loading analytics:', error);
      toast.error(error.message || 'Error loading analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  const totalImages = useMemo(
    () => data.dailyImages.reduce((sum, d) => sum + (d.images || 0), 0),
    [data.dailyImages]
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics & Reports</h1>
            <p className="text-gray-600">User statistics, image generation, and daily costs.</p>
          </div>
          <div className="flex gap-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={loadAnalytics} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-gray-600 mb-1">Total Images (range)</div>
                <div className="text-2xl font-bold">{totalImages.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-gray-600 mb-1">Total Cost (VND)</div>
                <div className="text-2xl font-bold text-red-600">{(data.totalCostVnd || 0).toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-gray-600 mb-1">Cost/Image (VND)</div>
                <div className="text-2xl font-bold text-blue-600">
                  {totalImages > 0 ? Math.round((data.totalCostVnd || 0) / totalImages).toLocaleString() : 0}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Daily Users Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                New Users by Day
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.dailyUsers}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Daily Images Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="w-5 h-5 text-green-600" />
                Images Generated by Day
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.dailyImages}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="images" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Daily Cost Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-red-600" />
                Daily Cost (VND)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.dailyCost}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(v: number) => `${(v / 1000).toFixed(0)}k VND`} />
                  <Legend />
                  <Line type="monotone" dataKey="cost_vnd" name="Cost (VND)" stroke="#EF4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Images by Type */}
            <Card>
              <CardHeader>
                <CardTitle>Distribution by Image Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.imagesByType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {data.imagesByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Users by Plan */}
            <Card>
              <CardHeader>
                <CardTitle>Distribution by Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.usersByPlan}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {data.usersByPlan.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}