"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { createSupabaseBrowserClient } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Activity, 
  Search, 
  RefreshCw,
  User,
  Image,
  CreditCard,
  Folder,
  Clock,
  Filter
} from 'lucide-react';

const supabase = createSupabaseBrowserClient();

interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  project_id: string | null;
  metadata: any;
  created_at: string;
}

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
}

export default function ActivityPage() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const PAGE_SIZE = 50;

  useEffect(() => {
    loadLogs();
  }, [page, actionFilter, dateFilter]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from('usage_logs')
        .select('*', { count: 'exact' })
        .range(from, to)
        .order('created_at', { ascending: false });

      if (actionFilter !== 'all') {
        query = query.eq('action', actionFilter);
      }

      if (dateFilter !== 'all') {
        const now = new Date();
        const filterDate = new Date();
        
        switch (dateFilter) {
          case 'today':
            filterDate.setHours(0, 0, 0, 0);
            break;
          case 'week':
            filterDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            filterDate.setMonth(now.getMonth() - 1);
            break;
        }
        
        query = query.gte('created_at', filterDate.toISOString());
      }

      const { data, error, count } = await query;
      
      if (error) {
        console.error('Error loading logs:', error);
        toast.error('Error loading logs: ' + error.message);
        return;
      }

      setLogs(data || []);
      setTotalCount(count || 0);

      // Load profiles
      if (data && data.length > 0) {
        const userIds = Array.from(new Set(data.map((log: ActivityLog) => log.user_id)));
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .in('id', userIds);

        const profilesMap: Record<string, Profile> = {};
        (profilesData || []).forEach((profile: Profile) => {
          profilesMap[profile.id] = profile;
        });
        setProfiles(profilesMap);
      }

    } catch (error) {
      console.error('Error in loadLogs:', error);
      toast.error('Error loading activity logs');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'image_generated': return Image;
      case 'project_created': return Folder;
      case 'image_downloaded': return CreditCard;
      default: return Activity;
    }
  };

  const getActivityColor = (action: string) => {
    switch (action) {
      case 'image_generated': return 'bg-green-100 text-green-800';
      case 'project_created': return 'bg-blue-100 text-blue-800';
      case 'image_downloaded': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityText = (action: string) => {
    switch (action) {
      case 'image_generated': return 'Image generated';
      case 'project_created': return 'Project created';
      case 'image_downloaded': return 'Image downloaded';
      default: return action;
    }
  };

  const filteredLogs = logs.filter(log => {
    if (!searchTerm.trim()) return true;
    
    const search = searchTerm.toLowerCase();
    const profile = profiles[log.user_id];
    
    return (
      log.action.toLowerCase().includes(search) ||
      profile?.email?.toLowerCase().includes(search) ||
      profile?.full_name?.toLowerCase().includes(search) ||
      JSON.stringify(log.metadata).toLowerCase().includes(search)
    );
  });

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Activity Logs</h1>
            <p className="text-gray-600">Track all user activity in the system.</p>
          </div>
          <Button onClick={loadLogs} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by action, email, metadata..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Activity type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activities</SelectItem>
                <SelectItem value="image_generated">Image Generated</SelectItem>
                <SelectItem value="project_created">Project Created</SelectItem>
                <SelectItem value="image_downloaded">Image Downloaded</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 days</SelectItem>
                <SelectItem value="month">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Activity Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Activity Logs ({filteredLogs.length.toLocaleString()})
            <div className="text-sm text-gray-500">
              Page {page + 1} / {totalPages}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading logs...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Activity</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Project ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => {
                      const profile = profiles[log.user_id];
                      const ActionIcon = getActivityIcon(log.action);
                      
                      return (
                        <TableRow key={log.id}>
                          <TableCell className="text-sm">
                            {new Date(log.created_at).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{profile?.full_name || 'N/A'}</div>
                              <div className="text-sm text-gray-500">{profile?.email || 'N/A'}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getActivityColor(log.action)}>
                              <ActionIcon className="w-3 h-3 mr-1" />
                              {getActivityText(log.action)}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="text-sm text-gray-600 truncate">
                              {JSON.stringify(log.metadata)}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {log.project_id ? log.project_id.slice(0, 8) + '...' : 'N/A'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {page + 1} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}