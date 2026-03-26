"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createSupabaseBrowserClient } from '@/integrations/supabase/client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Loader2, Image, Heart, MessageSquare, Download, TrendingUp, Star } from 'lucide-react';

const supabase = createSupabaseBrowserClient();

interface ImageRecord {
  id: string;
  image_type: string;
  created_at: string;
  download_count: number;
  title: string;
  image_url: string;
}

interface PointsRecord {
  delta: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function UserAnalyticsCard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    if (!user) return;

    const loadAnalytics = async () => {
      try {
        // Load all user images
        const { data: images, error: imagesError } = await supabase
          .from('generated_images')
          .select('id, image_type, created_at, download_count, title, image_url')
          .eq('user_id', user.id);
        if (imagesError) throw imagesError;

        // Load community stats for user's images
        const imageIds = (images || []).map((img: ImageRecord) => img.id);
        let likesData: any[] = [];
        let commentsData: any[] = [];

        if (imageIds.length > 0) {
          const { data: likes } = await supabase
            .from('community_likes')
            .select('image_id')
            .in('image_id', imageIds);
          likesData = likes || [];

          const { data: comments } = await supabase
            .from('community_comments')
            .select('image_id')
            .in('image_id', imageIds);
          commentsData = comments || [];
        }

        // Load points history
        const { data: pointsData, error: pointsError } = await supabase
          .from('points_ledger')
          .select('delta')
          .eq('user_id', user.id)
          .lt('delta', 0);
        if (pointsError) throw pointsError;

        // Process data
        const totalImages = images?.length || 0;
        const totalLikes = likesData.length;
        const totalComments = commentsData.length;
        const totalDownloads = (images || []).reduce((sum: number, img: ImageRecord) => sum + img.download_count, 0);

        const typeCount = {
          display: (images || []).filter((img: ImageRecord) => img.image_type === 'display').length,
          model: (images || []).filter((img: ImageRecord) => img.image_type === 'model').length,
          social: (images || []).filter((img: ImageRecord) => img.image_type === 'social').length,
          seeding: (images || []).filter((img: ImageRecord) => img.image_type === 'seeding').length,
        };
        const typeChartData = Object.entries(typeCount).map(([name, value]) => ({ name, value }));

        const activityByDay: { [key: string]: number } = {};
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const key = d.toISOString().split('T')[0];
          activityByDay[key] = 0;
        }
        (images || []).forEach((img: ImageRecord) => {
          const dateKey = img.created_at.split('T')[0];
          if (activityByDay[dateKey] !== undefined) {
            activityByDay[dateKey]++;
          }
        });
        const activityChartData = Object.entries(activityByDay).map(([date, count]) => ({
          date: new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
          count,
        }));

        const topPerformingImages = (images || [])
          .map((img: ImageRecord) => {
            const likes = likesData.filter(like => like.image_id === img.id).length;
            const comments = commentsData.filter(comment => comment.image_id === img.id).length;
            return {
              ...img,
              likes,
              comments,
              score: img.download_count + likes * 2 + comments * 3,
            };
          })
          .sort((a: any, b: any) => b.score - a.score)
          .slice(0, 5);

        const pointsSpent = Math.abs((pointsData || []).reduce((sum: number, entry: PointsRecord) => sum + entry.delta, 0));
        const averageCostPerImage = totalImages > 0 ? pointsSpent / totalImages : 0;

        setAnalytics({
          totalImages,
          totalLikes,
          totalComments,
          totalDownloads,
          typeChartData,
          activityChartData,
          topPerformingImages,
          pointsSpent,
          averageCostPerImage,
        });

      } catch (error) {
        console.error("Error loading analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [user]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-gray-600">Loading analytics...</p>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Image, label: 'Total Images', value: analytics.totalImages },
          { icon: Heart, label: 'Total Likes', value: analytics.totalLikes },
          { icon: MessageSquare, label: 'Total Comments', value: analytics.totalComments },
          { icon: Download, label: 'Total Downloads', value: analytics.totalDownloads },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <Icon className="w-6 h-6 text-gray-500 mb-2" />
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Activity - Last 7 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.activityChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" name="Images Created" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Image Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={analytics.typeChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {analytics.typeChartData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Images */}
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Best Performing Images</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.topPerformingImages.map((image: any) => (
              <div key={image.id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-50">
                <img src={image.image_url} alt={image.title} className="w-16 h-16 rounded-md object-cover" />
                <div className="flex-1">
                  <p className="font-semibold">{image.title}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                    <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {image.likes}</span>
                    <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {image.comments}</span>
                    <span className="flex items-center gap-1"><Download className="w-3 h-3" /> {image.downloads}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-blue-600">{image.score}</p>
                  <p className="text-xs text-gray-500">Performance score</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}