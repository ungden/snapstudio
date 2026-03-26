"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createSupabaseBrowserClient } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Sparkles, 
  Search, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Calendar,
  CreditCard,
  Gift,
  Minus,
  Plus,
  Loader2,
  History
} from 'lucide-react';
import { cn } from '@/lib/utils';

const supabase = createSupabaseBrowserClient();

export const dynamic = "force-dynamic";

interface PointsTransaction {
  id: string;
  delta: number;
  reason: string;
  related_id: string | null;
  metadata: any;
  created_at: string;
}

export default function PointsHistoryPage() {
  const { user, profile } = useAuth();
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const PAGE_SIZE = 20;

  useEffect(() => {
    if (user) {
      loadTransactions(true);
    }
  }, [user, typeFilter]);

  const loadTransactions = async (reset = false) => {
    if (!user) return;
    
    try {
      if (reset) {
        setLoading(true);
        setPage(0);
      }

      const currentPage = reset ? 0 : page;
      const from = currentPage * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from('points_ledger')
        .select('*')
        .eq('user_id', user.id)
        .range(from, to)
        .order('created_at', { ascending: false });

      if (typeFilter !== 'all') {
        if (typeFilter === 'earned') {
          query = query.gt('delta', 0);
        } else if (typeFilter === 'spent') {
          query = query.lt('delta', 0);
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      if (reset) {
        setTransactions(data || []);
      } else {
        setTransactions(prev => [...prev, ...(data || [])]);
      }

      setHasMore((data || []).length === PAGE_SIZE);
      if (!reset) {
        setPage(prev => prev + 1);
      }

    } catch (error) {
      console.error('Error loading transactions:', error);
      toast.error('Error loading points history');
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (reason: string, delta: number) => {
    if (delta > 0) {
      if (reason.includes('subscription') || reason.includes('purchase')) return CreditCard;
      if (reason.includes('allocation') || reason.includes('bonus')) return Gift;
      return Plus;
    } else {
      return Minus;
    }
  };

  const getTransactionColor = (delta: number) => {
    return delta > 0 ? 'text-green-600' : 'text-red-600';
  };

  const getTransactionBg = (delta: number) => {
    return delta > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
  };

  const getReasonText = (reason: string) => {
    const reasonMap: Record<string, string> = {
      'monthly_subscription': 'Monthly subscription',
      'yearly_subscription': 'Yearly subscription',
      'yearly_subscription_first_month': 'Yearly subscription (first month)',
      'monthly_allocation': 'Monthly point allocation',
      'spend_generation': 'Image generation',
      'bonus_points': 'Bonus points',
      'refund': 'Points refund',
      'admin_adjustment': 'Admin adjustment'
    };
    
    return reasonMap[reason] || reason;
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (!searchTerm.trim()) return true;
    
    const search = searchTerm.toLowerCase();
    return (
      getReasonText(transaction.reason).toLowerCase().includes(search) ||
      transaction.reason.toLowerCase().includes(search) ||
      JSON.stringify(transaction.metadata).toLowerCase().includes(search)
    );
  });

  const totalEarned = transactions.filter(t => t.delta > 0).reduce((sum, t) => sum + t.delta, 0);
  const totalSpent = Math.abs(transactions.filter(t => t.delta < 0).reduce((sum, t) => sum + t.delta, 0));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Points History</h1>
        <p className="text-gray-600">Track all your point transactions</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Balance</p>
                <p className="text-2xl font-bold text-blue-600">
                  {(profile?.points_balance || 0).toLocaleString()}
                </p>
              </div>
              <Sparkles className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Earned</p>
                <p className="text-2xl font-bold text-green-600">
                  +{totalEarned.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-red-600">
                  -{totalSpent.toLocaleString()}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Transactions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {transactions.length}
                </p>
              </div>
              <History className="w-8 h-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Transaction type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="earned">Earned (+)</SelectItem>
                <SelectItem value="spent">Spent (-)</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={() => loadTransactions(true)} variant="outline">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History ({filteredTransactions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && page === 0 ? (
            <div className="text-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
              <p className="text-gray-600 mt-2">Loading history...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((transaction) => {
                const Icon = getTransactionIcon(transaction.reason, transaction.delta);
                const isPositive = transaction.delta > 0;
                
                return (
                  <div
                    key={transaction.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-lg border",
                      getTransactionBg(transaction.delta)
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        isPositive ? "bg-green-100" : "bg-red-100"
                      )}>
                        <Icon className={cn("w-5 h-5", getTransactionColor(transaction.delta))} />
                      </div>
                      
                      <div>
                        <div className="font-semibold text-gray-900">
                          {getReasonText(transaction.reason)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(transaction.created_at).toLocaleString('en-US')}
                        </div>
                        {transaction.metadata && Object.keys(transaction.metadata).length > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            {transaction.metadata.plan_name && `Plan: ${transaction.metadata.plan_name}`}
                            {transaction.metadata.billing_period && ` (${transaction.metadata.billing_period})`}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={cn("text-lg font-bold", getTransactionColor(transaction.delta))}>
                        {transaction.delta > 0 ? '+' : ''}{transaction.delta.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">points</div>
                    </div>
                  </div>
                );
              })}
              
              {hasMore && (
                <div className="text-center pt-4">
                  <Button 
                    onClick={() => loadTransactions(false)} 
                    variant="outline"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      'Load More'
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}