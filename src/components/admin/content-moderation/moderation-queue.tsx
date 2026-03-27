"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Eye, 
  Ban, 
  CheckCircle, 
  Search,
  Clock,
  Brain,
  Flag
} from 'lucide-react';

interface ModerationItem {
  id: string;
  type: 'image' | 'comment' | 'user_report';
  content_id: string;
  user_id: string;
  content_preview: string;
  image_url?: string;
  ai_score: number;
  ai_flags: string[];
  human_reports: number;
  status: 'pending' | 'approved' | 'rejected' | 'auto_approved';
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  notes?: string;
}

interface ModerationQueueProps {
  queue: ModerationItem[];
  loading: boolean;
  selectedItems: Set<string>;
  onToggleSelection: (itemId: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBulkModerate: (action: 'approve' | 'reject') => void;
  onReviewItem: (item: ModerationItem) => void;
}

export function ModerationQueue({
  queue,
  loading,
  selectedItems,
  onToggleSelection,
  onSelectAll,
  onClearSelection,
  onBulkModerate,
  onReviewItem
}: ModerationQueueProps) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredQueue = queue.filter(item => {
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesSearch = !searchTerm || 
      item.content_preview.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesType && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'auto_approved':
        return <Badge className="bg-blue-100 text-blue-800">Auto-approved</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getAIScoreBadge = (score: number) => {
    if (score > 80) return <Badge className="bg-red-100 text-red-800">High Risk ({score.toFixed(0)}%)</Badge>;
    if (score > 60) return <Badge className="bg-orange-100 text-orange-800">Medium Risk ({score.toFixed(0)}%)</Badge>;
    return <Badge className="bg-green-100 text-green-800">Low Risk ({score.toFixed(0)}%)</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {queue.filter(i => i.status === 'pending').length}
                </p>
              </div>
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Auto-approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {queue.filter(i => i.status === 'auto_approved').length}
                </p>
              </div>
              <Brain className="w-6 h-6 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Flagged Content</p>
                <p className="text-2xl font-bold text-red-600">
                  {queue.filter(i => i.ai_flags.length > 0).length}
                </p>
              </div>
              <Flag className="w-6 h-6 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-blue-600">
                  {queue.length}
                </p>
              </div>
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="auto_approved">Auto-approved</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="comment">Comments</SelectItem>
                <SelectItem value="user_report">User Reports</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedItems.size > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-medium text-blue-900">
                  {selectedItems.size} items selected
                </span>
                <Button size="sm" variant="ghost" onClick={onClearSelection}>
                  Clear
                </Button>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => onBulkModerate('approve')} className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Bulk Approve
                </Button>
                <Button size="sm" onClick={() => onBulkModerate('reject')} variant="destructive">
                  <Ban className="w-4 h-4 mr-1" />
                  Bulk Reject
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Queue Table */}
      <Card>
        <CardHeader>
          <CardTitle>Moderation Queue ({filteredQueue.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading moderation queue...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedItems.size === filteredQueue.length && filteredQueue.length > 0}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            onSelectAll();
                          } else {
                            onClearSelection();
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>AI Analysis</TableHead>
                    <TableHead>Reports</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQueue.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedItems.has(item.id)}
                          onCheckedChange={() => onToggleSelection(item.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {item.image_url && (
                            <img 
                              src={item.image_url} 
                              alt="Content preview"
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div className="max-w-xs">
                            <div className="font-medium text-sm truncate">
                              {item.content_preview}
                            </div>
                            <div className="text-xs text-gray-500">
                              User: {item.user_id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {item.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {getAIScoreBadge(item.ai_score)}
                          {item.ai_flags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {item.ai_flags.map((flag: string, index: number) => (
                                <Badge key={index} className="bg-red-100 text-red-800 text-xs">
                                  {flag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {item.human_reports > 0 ? (
                          <Badge className="bg-orange-100 text-orange-800">
                            {item.human_reports} reports
                          </Badge>
                        ) : (
                          <span className="text-gray-400">0</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(item.status)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(item.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {item.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onReviewItem(item)}
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}