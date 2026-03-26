"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Brain,
  Target,
  Activity,
  User
} from 'lucide-react';

interface ModerationAnalyticsProps {
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
}

interface AnalyticsData {
  efficiency: {
    autoApprovalRate: number;
    avgReviewTime: number;
    falsePositiveRate: number;
    contentFlaggedRate: number;
  };
  trends: {
    date: string;
    pending: number;
    approved: number;
    rejected: number;
    auto_approved: number;
  }[];
  violationCategories: {
    category: string;
    count: number;
    color: string;
  }[];
  moderatorPerformance: {
    moderator: string;
    reviews: number;
    avgTime: number;
    accuracy: number;
  }[];
}

export function ModerationAnalytics({ timeRange, onTimeRangeChange }: ModerationAnalyticsProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Mock analytics data - in real implementation, calculate from database
      const mockData: AnalyticsData = {
        efficiency: {
          autoApprovalRate: 87.3,
          avgReviewTime: 4.2,
          falsePositiveRate: 2.1,
          contentFlaggedRate: 5.8
        },
        trends: generateTrendData(parseInt(timeRange)),
        violationCategories: [
          { category: 'Inappropriate Content', count: 23, color: '#EF4444' },
          { category: 'Spam Comments', count: 18, color: '#F97316' },
          { category: 'Copyright Issues', count: 12, color: '#EAB308' },
          { category: 'Low Quality', count: 8, color: '#3B82F6' },
          { category: 'Harassment', count: 5, color: '#8B5CF6' }
        ],
        moderatorPerformance: [
          { moderator: 'AI System', reviews: 1247, avgTime: 0.1, accuracy: 94.2 },
          { moderator: 'Admin User', reviews: 156, avgTime: 3.8, accuracy: 98.7 },
          { moderator: 'Moderator 1', reviews: 89, avgTime: 5.2, accuracy: 96.1 },
          { moderator: 'Moderator 2', reviews: 67, avgTime: 4.9, accuracy: 97.3 }
        ]
      };
      
      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Error loading moderation analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateTrendData = (days: number) => {
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit' }),
        pending: Math.floor(Math.random() * 20) + 5,
        approved: Math.floor(Math.random() * 50) + 20,
        rejected: Math.floor(Math.random() * 10) + 2,
        auto_approved: Math.floor(Math.random() * 200) + 100
      });
    }
    return data;
  };

  if (loading || !analyticsData) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Moderation Analytics</h3>
          <p className="text-gray-600">Performance metrics and insights</p>
        </div>
        <Select value={timeRange} onValueChange={onTimeRangeChange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Efficiency Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Auto-approval Rate</p>
                <p className="text-2xl font-bold text-green-600">
                  {analyticsData.efficiency.autoApprovalRate}%
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
                <p className="text-sm text-gray-600">Avg Review Time</p>
                <p className="text-2xl font-bold text-blue-600">
                  {analyticsData.efficiency.avgReviewTime} min
                </p>
              </div>
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">False Positive Rate</p>
                <p className="text-2xl font-bold text-orange-600">
                  {analyticsData.efficiency.falsePositiveRate}%
                </p>
              </div>
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Content Flagged</p>
                <p className="text-2xl font-bold text-red-600">
                  {analyticsData.efficiency.contentFlaggedRate}%
                </p>
              </div>
              <Target className="w-6 h-6 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Moderation Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Moderation Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="pending" stroke="#EAB308" name="Pending" />
                <Line type="monotone" dataKey="approved" stroke="#22C55E" name="Approved" />
                <Line type="monotone" dataKey="rejected" stroke="#EF4444" name="Rejected" />
                <Line type="monotone" dataKey="auto_approved" stroke="#3B82F6" name="Auto-approved" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Violation Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Violation Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.violationCategories}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, count }) => `${category}: ${count}`}
                  outerRadius={100}
                  dataKey="count"
                >
                  {analyticsData.violationCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Moderator Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Moderator Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Moderator</th>
                  <th className="text-left p-3">Reviews</th>
                  <th className="text-left p-3">Avg Time</th>
                  <th className="text-left p-3">Accuracy</th>
                  <th className="text-left p-3">Performance</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.moderatorPerformance.map((mod, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {mod.moderator === 'AI System' ? (
                          <Brain className="w-4 h-4 text-purple-600" />
                        ) : (
                          <User className="w-4 h-4 text-blue-600" />
                        )}
                        <span className="font-medium">{mod.moderator}</span>
                      </div>
                    </td>
                    <td className="p-3">{mod.reviews.toLocaleString()}</td>
                    <td className="p-3">{mod.avgTime} min</td>
                    <td className="p-3">
                      <Badge className={
                        mod.accuracy > 95 ? 'bg-green-100 text-green-800' :
                        mod.accuracy > 90 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {mod.accuracy}%
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${mod.accuracy}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{mod.accuracy}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-blue-900 mb-3">Performance Highlights</h4>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  AI system handles 87% of content automatically
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Average review time decreased by 23% this month
                </li>
                <li className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-purple-600" />
                  False positive rate is within acceptable range (2.1%)
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-blue-900 mb-3">Recommendations</h4>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-600" />
                  Consider raising AI threshold to 85% for auto-approval
                </li>
                <li className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  Review spam detection rules - 18 false positives this week
                </li>
                <li className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-green-600" />
                  Add new rule for copyright detection
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}