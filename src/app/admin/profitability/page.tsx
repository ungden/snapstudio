"use client";

import { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { createSupabaseBrowserClient } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  Calendar
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const supabase = createSupabaseBrowserClient();

interface ProfitabilityData {
  daily_revenue: { date: string; revenue: number }[];
  daily_cost: { date: string; cost: number }[];
  daily_profit: { date: string; profit: number }[];
  total_revenue: number;
  total_cost: number;
  total_profit: number;
  profit_margin: number;
}

export default function ProfitabilityPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ProfitabilityData | null>(null);
  const [dateRange, setDateRange] = useState('30');

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: resp, error } = await supabase.functions.invoke('admin-profitability', {
        body: { days: parseInt(dateRange) }
      });
      if (error) throw error;
      setData(resp as ProfitabilityData);
    } catch (error: any) {
      console.error('Error loading profitability data:', error);
      toast.error(error.message || 'Error loading profitability data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  const chartData = data?.daily_profit.map((p, index) => ({
    date: p.date,
    profit: p.profit,
    revenue: data.daily_revenue[index]?.revenue || 0,
    cost: data.daily_cost[index]?.cost || 0,
  }));

  return (
      <div className="min-h-screen bg-gray-50">
        <AdminSidebar />
        <main className="ml-64 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Profitability Analysis</h1>
                  <p className="text-gray-600">Track revenue, costs, and system profitability.</p>
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
                  <Button onClick={loadData} variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading data...</p>
              </div>
            ) : data ? (
              <div className="space-y-8">
                {/* Summary cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">{data.total_revenue.toLocaleString()} VND</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                      <TrendingDown className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">{data.total_cost.toLocaleString()} VND</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Profit</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold ${data.total_profit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                        {data.total_profit.toLocaleString()} VND
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold ${data.profit_margin >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                        {(data.profit_margin * 100).toFixed(2)}%
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Profitability Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue, Cost & Profit Chart</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                        <Tooltip formatter={(v: number) => `${v.toLocaleString()} VND`} />
                        <Legend />
                        <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#10B981" strokeWidth={2} />
                        <Line type="monotone" dataKey="cost" name="Cost" stroke="#EF4444" strokeWidth={2} />
                        <Line type="monotone" dataKey="profit" name="Profit" stroke="#3B82F6" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <p>No data available.</p>
            )}
          </div>
        </main>
      </div>
  );
}