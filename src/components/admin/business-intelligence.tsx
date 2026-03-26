"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { createSupabaseBrowserClient } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  BrainCircuit, 
  TrendingUp, 
  Users, 
  DollarSign,
  RefreshCw
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const supabase = createSupabaseBrowserClient();

interface Report {
  id: string;
  name: string;
  description: string;
  query: string;
  last_run_at: string | null;
}

interface ReportResult {
  columns: string[];
  rows: any[];
}

export function BusinessIntelligence() {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reportResult, setReportResult] = useState<ReportResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Mock loading reports. In a real app, this would fetch from a DB.
    const mockReports: Report[] = [
      { id: '1', name: 'Top 10 Users by Images Generated', description: 'Find the most active users.', query: `SELECT p.email, COUNT(gi.id) as image_count FROM profiles p JOIN generated_images gi ON p.id = gi.user_id GROUP BY p.email ORDER BY image_count DESC LIMIT 10;`, last_run_at: null },
      { id: '2', name: 'Daily Revenue Last 7 Days', description: 'Track daily revenue from completed orders.', query: `SELECT DATE(created_at) as date, SUM(amount) as revenue FROM orders WHERE status = 'completed' AND created_at >= NOW() - INTERVAL '7 days' GROUP BY DATE(created_at) ORDER BY date;`, last_run_at: null },
      { id: '3', name: 'User Subscription Plan Distribution', description: 'See how many users are on each plan.', query: `SELECT subscription_plan, COUNT(id) as user_count FROM profiles GROUP BY subscription_plan;`, last_run_at: null },
    ];
    setReports(mockReports);
  }, []);

  const runReport = async () => {
    if (!selectedReport) return;

    setLoading(true);
    setReportResult(null);
    try {
      // This is a simplified example. In a real-world scenario,
      // you would have a secure backend endpoint to execute these queries.
      // Directly running SQL from the client is NOT secure.
      const { data, error } = await supabase.functions.invoke('admin-run-query', {
        body: { query: selectedReport.query }
      });

      if (error) throw error;

      if (data.error) {
        toast.error(`Query Error: ${data.error}`);
        return;
      }

      setReportResult({
        columns: data.length > 0 ? Object.keys(data[0]) : [],
        rows: data,
      });
      toast.success(`Report "${selectedReport.name}" ran successfully.`);
    } catch (error: any) {
      toast.error(error.message || 'Error running report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Intelligence (BI)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-4">
          <Select onValueChange={(value) => setSelectedReport(reports.find(r => r.id === value) || null)}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select a report to run" />
            </SelectTrigger>
            <SelectContent>
              {reports.map(report => (
                <SelectItem key={report.id} value={report.id}>{report.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={runReport} disabled={!selectedReport || loading}>
            {loading ? 'Running...' : 'Run Report'}
          </Button>
        </div>

        {selectedReport && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold">Report Description</h4>
            <p className="text-sm text-gray-600">{selectedReport.description}</p>
            <h4 className="font-semibold mt-2">SQL Query</h4>
            <pre className="text-xs bg-gray-200 p-2 rounded mt-1 font-mono overflow-x-auto">
              <code>{selectedReport.query}</code>
            </pre>
          </div>
        )}

        {loading && <p>Loading results...</p>}

        {reportResult && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Report Results</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {reportResult.columns.map(col => <TableHead key={col}>{col}</TableHead>)}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportResult.rows.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {reportResult.columns.map(col => (
                        <TableCell key={col}>{String(row[col])}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}