"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Flag, 
  Eye, 
  Ban, 
  CheckCircle,
  Search,
  Clock,
  AlertTriangle
} from 'lucide-react';

interface ContentReport {
  id: string;
  reported_content_id: string;
  reported_by: string;
  reason: string;
  description: string;
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
  resolution_notes?: string;
}

interface ContentReportsProps {
  reports: ContentReport[];
  onResolveReport: (reportId: string, action: 'resolve' | 'dismiss', notes?: string) => void;
  onInvestigateReport: (reportId: string) => void;
}

export function ContentReports({
  reports,
  onResolveReport,
  onInvestigateReport
}: ContentReportsProps) {
  const [selectedReport, setSelectedReport] = useState<ContentReport | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [resolutionNotes, setResolutionNotes] = useState('');

  const filteredReports = reports.filter(report => {
    const matchesSearch = !searchTerm || 
      report.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-red-100 text-red-800">Open</Badge>;
      case 'investigating':
        return <Badge className="bg-yellow-100 text-yellow-800">Investigating</Badge>;
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>;
      case 'dismissed':
        return <Badge className="bg-gray-100 text-gray-800">Dismissed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getReasonBadge = (reason: string) => {
    const colors = {
      'inappropriate_content': 'bg-red-100 text-red-800',
      'spam': 'bg-orange-100 text-orange-800',
      'copyright': 'bg-purple-100 text-purple-800',
      'harassment': 'bg-red-100 text-red-800',
      'misinformation': 'bg-yellow-100 text-yellow-800'
    };
    
    return (
      <Badge className={colors[reason as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {reason.replace('_', ' ')}
      </Badge>
    );
  };

  const handleResolve = (action: 'resolve' | 'dismiss') => {
    if (!selectedReport) return;
    
    onResolveReport(selectedReport.id, action, resolutionNotes);
    setSelectedReport(null);
    setResolutionNotes('');
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">User Reports</h3>
            <p className="text-gray-600">Manage community-reported content violations</p>
          </div>
          <Badge className="bg-red-100 text-red-800">
            {reports.filter(r => r.status === 'open').length} open reports
          </Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Open Reports</p>
                  <p className="text-2xl font-bold text-red-600">
                    {reports.filter(r => r.status === 'open').length}
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
                  <p className="text-sm text-gray-600">Investigating</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {reports.filter(r => r.status === 'investigating').length}
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
                  <p className="text-sm text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold text-green-600">
                    {reports.filter(r => r.status === 'resolved').length}
                  </p>
                </div>
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Reports</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {reports.length}
                  </p>
                </div>
                <AlertTriangle className="w-6 h-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search reports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="dismissed">Dismissed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Reports List */}
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Flag className="w-4 h-4 text-red-600" />
                      <span className="font-medium">Report #{report.id}</span>
                      {getStatusBadge(report.status)}
                      {getReasonBadge(report.reason)}
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600 mb-3">
                      <div><strong>Content ID:</strong> {report.reported_content_id}</div>
                      <div><strong>Reported by:</strong> {report.reported_by}</div>
                      <div><strong>Description:</strong> {report.description}</div>
                    </div>
                    
                    <p className="text-xs text-gray-500">
                      {new Date(report.created_at).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedReport(report)}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Review
                    </Button>
                    
                    {report.status === 'open' && (
                      <Button
                        size="sm"
                        onClick={() => onInvestigateReport(report.id)}
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        Investigate
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Report Review Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
        <DialogContent className="max-w-2xl">
          {selectedReport && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Flag className="w-5 h-5 text-red-600" />
                  Review Report #{selectedReport.id}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Report Details</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Reason:</strong> {getReasonBadge(selectedReport.reason)}</div>
                      <div><strong>Status:</strong> {getStatusBadge(selectedReport.status)}</div>
                      <div><strong>Reported by:</strong> {selectedReport.reported_by}</div>
                      <div><strong>Content ID:</strong> {selectedReport.reported_content_id}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Timeline</h4>
                    <div className="text-sm space-y-1">
                      <div><strong>Reported:</strong> {new Date(selectedReport.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                  <Card className="bg-gray-50">
                    <CardContent className="p-3">
                      <p className="text-sm text-gray-700">{selectedReport.description}</p>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Label htmlFor="resolution-notes">Resolution Notes</Label>
                  <Textarea
                    id="resolution-notes"
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Add notes about your decision..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleResolve('dismiss')}
                    className="flex-1"
                  >
                    <Ban className="w-4 h-4 mr-2" />
                    Dismiss Report
                  </Button>
                  <Button
                    onClick={() => handleResolve('resolve')}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Resolve Report
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}