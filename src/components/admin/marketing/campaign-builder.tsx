"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { createSupabaseBrowserClient } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Mail, 
  Plus, 
  Send, 
  BarChart2,
  Users
} from 'lucide-react';

const supabase = createSupabaseBrowserClient();

interface Campaign {
  id: string;
  name: string;
  status: 'draft' | 'sent' | 'scheduled';
  target_segment: string;
  email_subject: string;
  email_body: string;
  sent_at: string | null;
  open_rate: number;
  click_rate: number;
}

export function CampaignBuilder() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  useEffect(() => {
    // Mock loading campaigns
    const mockCampaigns: Campaign[] = [
      { id: '1', name: 'Welcome New Users', status: 'sent', target_segment: 'New Users (Last 7 days)', email_subject: 'Welcome to SnapStudio!', email_body: '...', sent_at: new Date().toISOString(), open_rate: 0.45, click_rate: 0.12 },
      { id: '2', name: 'Offer for Power Users', status: 'draft', target_segment: 'Power Users (>100 images)', email_subject: 'A special gift for you', email_body: '', sent_at: null, open_rate: 0, click_rate: 0 },
    ];
    setCampaigns(mockCampaigns);
    setLoading(false);
  }, []);

  const handleSendCampaign = (campaign: Campaign) => {
    // Mock sending
    toast.info(`Sending campaign "${campaign.name}"...`);
    setTimeout(() => {
      toast.success('Campaign sent successfully!');
      setCampaigns(campaigns.map(c => c.id === campaign.id ? { ...c, status: 'sent', sent_at: new Date().toISOString() } : c));
    }, 2000);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Campaign Builder</CardTitle>
        <Button onClick={() => setSelectedCampaign({ id: 'new', name: 'New Campaign', status: 'draft', target_segment: '', email_subject: '', email_body: '', sent_at: null, open_rate: 0, click_rate: 0 })}>
          <Plus className="w-4 h-4 mr-2" />
          Create New Campaign
        </Button>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Campaign List */}
        <div className="md:col-span-1 space-y-3">
          {campaigns.map(campaign => (
            <div 
              key={campaign.id}
              className={`p-3 rounded-lg cursor-pointer border ${selectedCampaign?.id === campaign.id ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'}`}
              onClick={() => setSelectedCampaign(campaign)}
            >
              <div className="flex justify-between items-center">
                <h4 className="font-semibold">{campaign.name}</h4>
                <Badge variant={campaign.status === 'sent' ? 'default' : 'secondary'}>{campaign.status}</Badge>
              </div>
              <p className="text-xs text-gray-500">Segment: {campaign.target_segment}</p>
            </div>
          ))}
        </div>

        {/* Campaign Editor */}
        <div className="md:col-span-2">
          {selectedCampaign ? (
            <div className="space-y-4">
              <Input className="text-lg font-semibold" defaultValue={selectedCampaign.name} />
              <div>
                <label className="block text-sm font-medium mb-1">Target Segment</label>
                <Select defaultValue={selectedCampaign.target_segment}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New Users (Last 7 days)">New Users (Last 7 days)</SelectItem>
                    <SelectItem value="Power Users (>100 images)">Power Users (&gt;100 images)</SelectItem>
                    <SelectItem value="Pro Plan Users">Pro Plan Users</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email Subject</label>
                <Input placeholder="Email subject" defaultValue={selectedCampaign.email_subject} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email Body (HTML/Markdown)</label>
                <Textarea placeholder="Email content..." rows={8} defaultValue={selectedCampaign.email_body} />
              </div>
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button>Save</Button>
                  <Button variant="outline">Send Test</Button>
                </div>
                <Button onClick={() => handleSendCampaign(selectedCampaign)} disabled={selectedCampaign.status === 'sent'}>
                  <Send className="w-4 h-4 mr-2" />
                  Send Campaign
                </Button>
              </div>
              {selectedCampaign.status === 'sent' && (
                <div className="flex gap-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{(selectedCampaign.open_rate * 100).toFixed(1)}%</p>
                    <p className="text-sm text-gray-600">Open Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{(selectedCampaign.click_rate * 100).toFixed(1)}%</p>
                    <p className="text-sm text-gray-600">Click Rate</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
              <p className="text-gray-500">Select a campaign to edit</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}