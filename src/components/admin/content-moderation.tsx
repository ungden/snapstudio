"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Eye, Shield, Flag, BarChart3 } from 'lucide-react';
import { ModerationQueue } from './content-moderation/moderation-queue';
import { ModerationRules } from './content-moderation/moderation-rules';
import { ContentReports } from './content-moderation/content-reports';
import { ModerationAnalytics } from './content-moderation/moderation-analytics';
import { ContentReviewDialog } from './content-moderation/content-review-dialog';
import { useContentModeration } from '@/hooks/use-content-moderation';

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

export function ContentModeration() {
  const [activeTab, setActiveTab] = useState<'queue' | 'rules' | 'reports' | 'analytics'>('queue');
  const [selectedItem, setSelectedItem] = useState<ModerationItem | null>(null);
  const [timeRange, setTimeRange] = useState('30');

  const {
    moderationQueue,
    moderationRules,
    contentReports,
    loading,
    selectedItems,
    loadModerationData,
    moderateContent,
    bulkModerate,
    toggleRule,
    createRule,
    updateRule,
    deleteRule,
    resolveReport,
    investigateReport,
    toggleSelection,
    selectAll,
    clearSelection
  } = useContentModeration();

  const handleReviewItem = (item: ModerationItem) => {
    setSelectedItem(item);
  };

  const handleModerateContent = async (itemId: string, action: 'approve' | 'reject', notes?: string) => {
    await moderateContent(itemId, action, notes);
    setSelectedItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Content Moderation</h2>
          <p className="text-gray-600">AI-powered content screening and community management</p>
        </div>
        <Button onClick={loadModerationData} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === 'queue' ? 'default' : 'outline'}
          onClick={() => setActiveTab('queue')}
        >
          <Eye className="w-4 h-4 mr-2" />
          Moderation Queue ({moderationQueue.filter(i => i.status === 'pending').length})
        </Button>
        <Button
          variant={activeTab === 'rules' ? 'default' : 'outline'}
          onClick={() => setActiveTab('rules')}
        >
          <Shield className="w-4 h-4 mr-2" />
          Rules ({moderationRules.length})
        </Button>
        <Button
          variant={activeTab === 'reports' ? 'default' : 'outline'}
          onClick={() => setActiveTab('reports')}
        >
          <Flag className="w-4 h-4 mr-2" />
          Reports ({contentReports.filter(r => r.status === 'open').length})
        </Button>
        <Button
          variant={activeTab === 'analytics' ? 'default' : 'outline'}
          onClick={() => setActiveTab('analytics')}
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Analytics
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === 'queue' && (
        <ModerationQueue
          queue={moderationQueue}
          loading={loading}
          selectedItems={selectedItems}
          onToggleSelection={toggleSelection}
          onSelectAll={selectAll}
          onClearSelection={clearSelection}
          onBulkModerate={bulkModerate}
          onReviewItem={handleReviewItem}
        />
      )}

      {activeTab === 'rules' && (
        <ModerationRules
          rules={moderationRules}
          onToggleRule={toggleRule}
          onCreateRule={createRule}
          onUpdateRule={updateRule}
          onDeleteRule={deleteRule}
        />
      )}

      {activeTab === 'reports' && (
        <ContentReports
          reports={contentReports}
          onResolveReport={resolveReport}
          onInvestigateReport={investigateReport}
        />
      )}

      {activeTab === 'analytics' && (
        <ModerationAnalytics
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
        />
      )}

      {/* Content Review Dialog */}
      <ContentReviewDialog
        item={selectedItem}
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        onModerate={handleModerateContent}
      />
    </div>
  );
}