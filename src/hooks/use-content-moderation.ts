"use client";

import { useState, useEffect, useCallback } from 'react';
import { createSupabaseBrowserClient } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const supabase = createSupabaseBrowserClient();

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

interface ModerationRule {
  id: string;
  name: string;
  type: 'ai_threshold' | 'keyword_filter' | 'user_behavior';
  criteria: any;
  action: 'auto_approve' | 'auto_reject' | 'flag_for_review';
  is_active: boolean;
  triggered_count: number;
  created_at?: string;
  updated_at?: string;
}

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

export function useContentModeration() {
  const [moderationQueue, setModerationQueue] = useState<ModerationItem[]>([]);
  const [moderationRules, setModerationRules] = useState<ModerationRule[]>([]);
  const [contentReports, setContentReports] = useState<ContentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const loadModerationData = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadModerationQueue(),
        loadModerationRules(),
        loadContentReports()
      ]);
    } catch (error) {
      console.error('Error loading moderation data:', error);
      toast.error('Failed to load moderation data');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadModerationQueue = async () => {
    try {
      // Load images that need moderation
      const { data: images } = await supabase
        .from('generated_images')
        .select('id, title, image_url, user_id, created_at, is_public')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(50);

      // Load comments that need moderation
      const { data: comments } = await supabase
        .from('community_comments')
        .select('id, content, user_id, created_at, image_id')
        .order('created_at', { ascending: false })
        .limit(50);

      // Mock AI moderation scores and flags
      const mockModerationItems: ModerationItem[] = [
        ...(images || []).map((img: any) => ({
          id: `img-${img.id}`,
          type: 'image' as const,
          content_id: img.id,
          user_id: img.user_id,
          content_preview: img.title,
          image_url: img.image_url,
          ai_score: Math.random() * 100,
          ai_flags: Math.random() > 0.7 ? ['inappropriate_content'] : [],
          human_reports: Math.floor(Math.random() * 3),
          status: (Math.random() > 0.8 ? 'pending' : 'auto_approved') as 'pending' | 'approved' | 'rejected' | 'auto_approved',
          created_at: img.created_at
        })),
        ...(comments || []).map((comment: any) => ({
          id: `comment-${comment.id}`,
          type: 'comment' as const,
          content_id: comment.id,
          user_id: comment.user_id,
          content_preview: comment.content.substring(0, 100),
          ai_score: Math.random() * 100,
          ai_flags: Math.random() > 0.8 ? ['spam', 'inappropriate_language'] : [],
          human_reports: Math.floor(Math.random() * 2),
          status: (Math.random() > 0.9 ? 'pending' : 'auto_approved') as 'pending' | 'approved' | 'rejected' | 'auto_approved',
          created_at: comment.created_at
        }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setModerationQueue(mockModerationItems);
    } catch (error) {
      console.error('Error loading moderation queue:', error);
    }
  };

  const loadModerationRules = async () => {
    // Mock moderation rules - in real implementation, load from database
    const mockRules: ModerationRule[] = [
      {
        id: '1',
        name: 'AI Content Filter',
        type: 'ai_threshold',
        criteria: { ai_score: { gte: 80 } },
        action: 'flag_for_review',
        is_active: true,
        triggered_count: 156
      },
      {
        id: '2',
        name: 'Spam Comment Filter',
        type: 'keyword_filter',
        criteria: { keywords: ['spam', 'fake', 'scam'] },
        action: 'auto_reject',
        is_active: true,
        triggered_count: 89
      },
      {
        id: '3',
        name: 'New User Content Review',
        type: 'user_behavior',
        criteria: { user_age: { lt: '7_days' } },
        action: 'flag_for_review',
        is_active: false,
        triggered_count: 234
      }
    ];
    setModerationRules(mockRules);
  };

  const loadContentReports = async () => {
    // Mock content reports - in real implementation, load from database
    const mockReports: ContentReport[] = [
      {
        id: '1',
        reported_content_id: 'img-123',
        reported_by: 'user-456',
        reason: 'inappropriate_content',
        description: 'This image contains inappropriate content',
        status: 'open',
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        reported_content_id: 'comment-789',
        reported_by: 'user-101',
        reason: 'spam',
        description: 'Spam comment with promotional links',
        status: 'investigating',
        created_at: new Date(Date.now() - 3600000).toISOString()
      }
    ];
    setContentReports(mockReports);
  };

  const moderateContent = useCallback(async (itemId: string, action: 'approve' | 'reject', notes?: string) => {
    try {
      const item = moderationQueue.find(i => i.id === itemId);
      if (!item) return;

      if (item.type === 'image') {
        // Update image status
        const { error } = await supabase
          .from('generated_images')
          .update({ 
            is_public: action === 'approve',
          })
          .eq('id', item.content_id);
        
        if (error) throw error;
      } else if (item.type === 'comment') {
        // For comments, delete if rejected
        if (action === 'reject') {
          const { error } = await supabase
            .from('community_comments')
            .delete()
            .eq('id', item.content_id);
          
          if (error) throw error;
        }
      }

      // Update local state
      setModerationQueue(prev => 
        prev.map(i => 
          i.id === itemId 
            ? { 
                ...i, 
                status: action === 'approve' ? 'approved' : 'rejected',
                reviewed_at: new Date().toISOString(),
                reviewed_by: 'current_admin',
                notes 
              }
            : i
        )
      );

      toast.success(`Content ${action}d successfully`);
      
    } catch (error) {
      console.error('Error moderating content:', error);
      toast.error('Failed to moderate content');
      throw error;
    }
  }, [moderationQueue]);

  const bulkModerate = useCallback(async (action: 'approve' | 'reject') => {
    if (selectedItems.size === 0) return;
    
    try {
      const promises = Array.from(selectedItems).map(itemId => 
        moderateContent(itemId, action, `Bulk ${action} by admin`)
      );
      
      await Promise.all(promises);
      setSelectedItems(new Set());
      toast.success(`Bulk ${action}d ${selectedItems.size} items`);
    } catch (error) {
      console.error('Error in bulk moderation:', error);
      toast.error('Failed to perform bulk moderation');
    }
  }, [selectedItems, moderateContent]);

  const toggleRule = useCallback(async (ruleId: string, isActive: boolean) => {
    try {
      // In real implementation, update database
      setModerationRules(prev => 
        prev.map(rule => 
          rule.id === ruleId ? { ...rule, is_active: !isActive } : rule
        )
      );
      toast.success(`Rule ${!isActive ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error('Error toggling rule:', error);
      toast.error('Failed to toggle rule');
    }
  }, []);

  const createRule = useCallback(async (ruleData: Partial<ModerationRule>) => {
    try {
      const newRule: ModerationRule = {
        id: Date.now().toString(),
        name: ruleData.name || '',
        type: ruleData.type || 'ai_threshold',
        criteria: ruleData.criteria || {},
        action: ruleData.action || 'flag_for_review',
        is_active: ruleData.is_active ?? true,
        triggered_count: 0
      };
      
      setModerationRules(prev => [newRule, ...prev]);
      toast.success('Rule created successfully');
    } catch (error) {
      console.error('Error creating rule:', error);
      toast.error('Failed to create rule');
    }
  }, []);

  const updateRule = useCallback(async (ruleId: string, updates: Partial<ModerationRule>) => {
    try {
      setModerationRules(prev => 
        prev.map(rule => 
          rule.id === ruleId ? { ...rule, ...updates } : rule
        )
      );
      toast.success('Rule updated successfully');
    } catch (error) {
      console.error('Error updating rule:', error);
      toast.error('Failed to update rule');
    }
  }, []);

  const deleteRule = useCallback(async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;
    
    try {
      setModerationRules(prev => prev.filter(rule => rule.id !== ruleId));
      toast.success('Rule deleted successfully');
    } catch (error) {
      console.error('Error deleting rule:', error);
      toast.error('Failed to delete rule');
    }
  }, []);

  const resolveReport = useCallback(async (reportId: string, action: 'resolve' | 'dismiss', notes?: string) => {
    try {
      setContentReports(prev => 
        prev.map(report => 
          report.id === reportId 
            ? { 
                ...report, 
                status: action === 'resolve' ? 'resolved' : 'dismissed',
                resolved_at: new Date().toISOString(),
                resolved_by: 'current_admin',
                resolution_notes: notes 
              }
            : report
        )
      );
      toast.success(`Report ${action}d successfully`);
    } catch (error) {
      console.error('Error resolving report:', error);
      toast.error('Failed to process report');
    }
  }, []);

  const investigateReport = useCallback(async (reportId: string) => {
    try {
      setContentReports(prev => 
        prev.map(report => 
          report.id === reportId 
            ? { ...report, status: 'investigating' }
            : report
        )
      );
      toast.success('Report marked as investigating');
    } catch (error) {
      console.error('Error investigating report:', error);
      toast.error('Failed to investigate report');
    }
  }, []);

  const toggleSelection = useCallback((itemId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedItems(new Set(moderationQueue.map(item => item.id)));
  }, [moderationQueue]);

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  useEffect(() => {
    loadModerationData();
  }, [loadModerationData]);

  return {
    // State
    moderationQueue,
    moderationRules,
    contentReports,
    loading,
    selectedItems,
    
    // Actions
    loadModerationData,
    moderateContent,
    bulkModerate,
    toggleRule,
    createRule,
    updateRule,
    deleteRule,
    resolveReport,
    investigateReport,
    
    // Selection
    toggleSelection,
    selectAll,
    clearSelection
  };
}