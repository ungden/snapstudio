"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Shield, 
  Ban, 
  CheckCircle,
  AlertTriangle,
  User,
  Calendar,
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

interface ContentReviewDialogProps {
  item: ModerationItem | null;
  open: boolean;
  onClose: () => void;
  onModerate: (itemId: string, action: 'approve' | 'reject', notes?: string) => void;
}

export function ContentReviewDialog({
  item,
  open,
  onClose,
  onModerate
}: ContentReviewDialogProps) {
  const [reviewNotes, setReviewNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleModerate = async (action: 'approve' | 'reject') => {
    if (!item) return;
    
    setProcessing(true);
    try {
      await onModerate(item.id, action, reviewNotes);
      setReviewNotes('');
      onClose();
    } catch (error) {
      console.error('Error moderating content:', error);
    } finally {
      setProcessing(false);
    }
  };

  const getAIScoreBadge = (score: number) => {
    if (score > 80) return <Badge className="bg-red-100 text-red-800">High Risk ({score.toFixed(0)}%)</Badge>;
    if (score > 60) return <Badge className="bg-orange-100 text-orange-800">Medium Risk ({score.toFixed(0)}%)</Badge>;
    return <Badge className="bg-green-100 text-green-800">Low Risk ({score.toFixed(0)}%)</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      'image': 'bg-blue-100 text-blue-800',
      'comment': 'bg-green-100 text-green-800',
      'user_report': 'bg-purple-100 text-purple-800'
    };
    
    return (
      <Badge className={colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {type}
      </Badge>
    );
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-blue-600" />
            Content Review
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Content Preview */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-gray-900">Content Preview</h4>
              {getTypeBadge(item.type)}
            </div>
            
            {item.image_url ? (
              <div className="border rounded-lg overflow-hidden">
                <img 
                  src={item.image_url} 
                  alt="Content under review"
                  className="w-full h-auto"
                />
              </div>
            ) : (
              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <h5 className="font-medium mb-2">Text Content:</h5>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {item.content_preview}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Content Metadata */}
            <Card>
              <CardContent className="p-4">
                <h5 className="font-medium text-gray-900 mb-3">Content Information</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span>User ID: {item.user_id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>Created: {new Date(item.created_at).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Flag className="w-4 h-4 text-gray-500" />
                    <span>Content ID: {item.content_id}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Analysis & Actions */}
          <div className="space-y-4">
            {/* AI Analysis */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold text-gray-900 mb-3">AI Analysis</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-600">Risk Score:</span>
                    <div className="mt-1">
                      {getAIScoreBadge(item.ai_score)}
                    </div>
                  </div>
                  
                  {item.ai_flags.length > 0 && (
                    <div>
                      <span className="text-sm text-gray-600">Detected Issues:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.ai_flags.map((flag: string, index: number) => (
                          <Badge key={index} className="bg-red-100 text-red-800 text-xs">
                            {flag.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* User Reports */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Community Reports</h4>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  <span className="text-sm text-gray-600">
                    {item.human_reports} user(s) reported this content
                  </span>
                </div>
                {item.human_reports > 0 && (
                  <Badge className="bg-orange-100 text-orange-800 mt-2">
                    Community flagged
                  </Badge>
                )}
              </CardContent>
            </Card>

            {/* Review Notes */}
            <Card>
              <CardContent className="p-4">
                <Label htmlFor="review-notes" className="text-sm font-medium mb-2 block">
                  Review Notes
                </Label>
                <Textarea
                  id="review-notes"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add your review notes and reasoning..."
                  rows={4}
                />
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="destructive"
                onClick={() => handleModerate('reject')}
                disabled={processing}
                className="flex-1"
              >
                <Ban className="w-4 h-4 mr-2" />
                {processing ? 'Processing...' : 'Reject Content'}
              </Button>
              <Button
                onClick={() => handleModerate('approve')}
                disabled={processing}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {processing ? 'Processing...' : 'Approve Content'}
              </Button>
            </div>

            {/* Quick Actions */}
            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <h5 className="font-medium text-gray-900 mb-2">Quick Actions</h5>
                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" variant="outline" className="text-xs">
                    View User Profile
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs">
                    View Content History
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs">
                    Check Similar Content
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs">
                    Add to Watchlist
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}