"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { createSupabaseBrowserClient } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Users, 
  Filter, 
  Plus, 
  Save,
  Mail
} from 'lucide-react';

const supabase = createSupabaseBrowserClient();

interface Segment {
  id: string;
  name: string;
  filters: FilterRule[];
  user_count: number;
  created_at: string;
}

interface FilterRule {
  field: 'subscription_plan' | 'images_generated' | 'created_at';
  operator: 'eq' | 'neq' | 'gt' | 'lt';
  value: string | number;
}

export function UserSegmentation() {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);
  const [segmentUsers, setSegmentUsers] = useState<any[]>([]);

  useEffect(() => {
    // Mock loading segments. In a real app, this would fetch from a DB.
    const mockSegments: Segment[] = [
      { id: '1', name: 'Power Users (>100 images)', filters: [{ field: 'images_generated', operator: 'gt', value: 100 }], user_count: 42, created_at: new Date().toISOString() },
      { id: '2', name: 'New Users (Last 7 days)', filters: [{ field: 'created_at', operator: 'gt', value: '7_days_ago' }], user_count: 256, created_at: new Date().toISOString() },
      { id: '3', name: 'Pro Plan Users', filters: [{ field: 'subscription_plan', operator: 'eq', value: 'pro' }], user_count: 112, created_at: new Date().toISOString() },
    ];
    setSegments(mockSegments);
    setLoading(false);
  }, []);

  const calculateSegment = async (segment: Segment) => {
    // In a real app, this would be a backend function for security and performance
    let query = supabase.from('profiles').select('id, email, full_name', { count: 'exact' });

    segment.filters.forEach(filter => {
      if (filter.field === 'created_at') {
        const d = new Date();
        d.setDate(d.getDate() - 7); // Simple '7_days_ago' logic
        query = query.gt('created_at', d.toISOString());
      } else {
        switch (filter.operator) {
          case 'eq':
            query = query.eq(filter.field, filter.value);
            break;
          case 'neq':
            query = query.neq(filter.field, filter.value);
            break;
          case 'gt':
            query = query.gt(filter.field, filter.value);
            break;
          case 'lt':
            query = query.lt(filter.field, filter.value);
            break;
        }
      }
    });

    const { data, error, count } = await query;
    if (error) {
      toast.error('Error calculating segment');
      return;
    }
    
    setSegmentUsers(data || []);
    // Update count in mock data
    setSegments(segments.map(s => s.id === segment.id ? { ...s, user_count: count || 0 } : s));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Segmentation</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Segments List */}
        <div className="md:col-span-1 space-y-3">
          <Button className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Create New Segment
          </Button>
          {segments.map(segment => (
            <div 
              key={segment.id}
              className={`p-3 rounded-lg cursor-pointer border ${selectedSegment?.id === segment.id ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'}`}
              onClick={() => {
                setSelectedSegment(segment);
                calculateSegment(segment);
              }}
            >
              <div className="flex justify-between items-center">
                <h4 className="font-semibold">{segment.name}</h4>
                <Badge>{segment.user_count}</Badge>
              </div>
              <p className="text-xs text-gray-500">
                {segment.filters.map(f => `${f.field} ${f.operator} ${f.value}`).join(', ')}
              </p>
            </div>
          ))}
        </div>

        {/* Segment Details */}
        <div className="md:col-span-2">
          {selectedSegment ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">{selectedSegment.name}</h3>
                <Button size="sm" variant="outline">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email Campaign
                </Button>
              </div>
              <div className="border rounded-lg max-h-96 overflow-y-auto">
                {segmentUsers.map(user => (
                  <div key={user.id} className="flex items-center p-3 border-b">
                    <div className="flex-1">
                      <p className="font-medium">{user.full_name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
              <p className="text-gray-500">Select a segment to view details</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}