"use client";

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useSearchParams, useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/integrations/supabase/client';
import { PaymentClient } from '@/lib/payment-client';
import { PaymentSuccessAnimation } from '@/components/payment-success-animation';
import { toast } from 'sonner';
import { 
  CreditCard, 
  Sparkles, 
  Clock, 
  CheckCircle,
  Copy,
  QrCode,
  Loader2,
  Star,
  Crown,
  Zap,
  Calendar,
  DollarSign,
  History
} from 'lucide-react';
import { cn } from '@/lib/utils';

const supabase = createSupabaseBrowserClient();

export const dynamic = "force-dynamic";

interface Plan {
  id: string;
  name: string;
  points: number;
  priceUsd: number;
  priceVnd: number;
  popular?: boolean;
  features: string[];
  billingPeriod: 'monthly' | 'yearly';
  savings?: string;
}

interface Order {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  metadata: {
    plan_name?: string;
    billing_period?: string;
  } | null;
}

interface PaymentOrder {
  orderId: string;
  amount: number;
  description: string;
  qrUrl: string;
  beneficiary: string;
  bankName: string;
  accountName: string;
  planName?: string;
  billingPeriod?: 'monthly' | 'yearly';
  points?: number;
}

const plans: Plan[] = [
  {
    id: 'starter_monthly',
    name: 'Starter',
    points: 1200,
    priceUsd: 5,
    priceVnd: 132000,
    billingPeriod: 'monthly',
    features: ['1,200 points/month', '~10 image sets', 'All templates', 'HD downloads']
  },
  {
    id: 'pro_monthly',
    name: 'Pro',
    points: 5000,
    priceUsd: 20,
    priceVnd: 528000,
    popular: true,
    billingPeriod: 'monthly',
    features: ['5,000 points/month', '~41 image sets', 'Priority support', 'Advanced features']
  },
  {
    id: 'business_monthly',
    name: 'Business',
    points: 15000,
    priceUsd: 60,
    priceVnd: 1584000,
    billingPeriod: 'monthly',
    features: ['15,000 points/month', '~125 image sets', 'Team features', 'API access']
  },
  {
    id: 'pro_yearly',
    name: 'Pro Yearly',
    points: 5000,
    priceUsd: 200,
    priceVnd: 5280000,
    popular: true,
    billingPeriod: 'yearly',
    savings: 'Save 17%',
    features: ['5,000 points/month', 'Billed annually', 'Save $40/year', 'All Pro features']
  }
];

function BillingPageContent() {
  const { user, profile, refreshProfile } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedPlanId = searchParams.get('plan');
  
  const [currentOrder, setCurrentOrder] = useState<PaymentOrder | null>(null);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    loadOrderHistory();
    checkPendingOrder();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // Listen for order status changes
    const channel = supabase
      .channel('user-orders')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`
        },
        (payload: any) => {
          const newStatus = payload.new?.status;
          if (newStatus === 'completed') {
            const order = payload.new;
            setSuccessData({
              planName: order.metadata?.plan_name || 'Unknown',
              pointsReceived: order.metadata?.points || 0,
              amountPaid: order.amount,
              billingPeriod: order.metadata?.billing_period || 'monthly'
            });
            setShowSuccess(true);
            setCurrentOrder(null);
            refreshProfile();
            loadOrderHistory();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refreshProfile]);

  const loadOrderHistory = async () => {
    if (!user) return;
    
    try {
      setHistoryLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('id, amount, status, created_at, metadata')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setOrderHistory(data || []);
    } catch (error) {
      console.error('Error loading order history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const checkPendingOrder = async () => {
    try {
      const pendingOrder = await PaymentClient.getPendingOrder();
      setCurrentOrder(pendingOrder);
    } catch (error) {
      console.error('Error checking pending order:', error);
    }
  };

  const handleSelectPlan = async (planId: string) => {
    if (!user) {
      toast.error('Please log in to purchase a plan');
      return;
    }

    setLoading(true);
    try {
      const result = await PaymentClient.createOrder(planId);
      
      if (result.success && result.order) {
        setCurrentOrder(result.order);
        toast.success('Order created! Please complete the payment.');
      } else {
        toast.error(result.error || 'Unable to create order');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error creating order');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
      toast.success(`Copied ${type}!`);
    } catch (error) {
      toast.error('Unable to copy');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Awaiting Payment</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'rejected':
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPlanIcon = (planName: string) => {
    if (planName.toLowerCase().includes('enterprise')) return Crown;
    if (planName.toLowerCase().includes('business')) return Crown;
    if (planName.toLowerCase().includes('pro')) return Zap;
    return Star;
  };

  if (showSuccess && successData) {
    return (
      <PaymentSuccessAnimation
        planName={successData.planName}
        pointsReceived={successData.pointsReceived}
        amountPaid={successData.amountPaid}
        billingPeriod={successData.billingPeriod}
        onContinue={() => {
          setShowSuccess(false);
          router.push('/dashboard');
        }}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Billing & Plans</h1>
        <p className="text-gray-600">Manage your plans and payment history</p>
      </div>

      {/* Current Subscription */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Plan Info</h3>
              <div className="space-y-1 text-sm">
                <div><strong>Plan:</strong> {profile?.subscription_plan || 'Free'}</div>
                <div><strong>Balance:</strong> {(profile?.points_balance || 0).toLocaleString()} points</div>
                <div><strong>Images Generated:</strong> {profile?.images_generated || 0}</div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Duration</h3>
              <div className="space-y-1 text-sm">
                {profile?.subscription_expires_at ? (
                  <>
                    <div><strong>Expires:</strong> {new Date(profile.subscription_expires_at).toLocaleDateString('en-US')}</div>
                    <div><strong>Remaining:</strong> {Math.max(0, Math.ceil((new Date(profile.subscription_expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days</div>
                  </>
                ) : (
                  <div className="text-gray-500">Free plan</div>
                )}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Usage</h3>
              <div className="space-y-2">
                <div className="text-sm">
                  <div className="flex justify-between mb-1">
                    <span>Points used this month</span>
                    <span>~{Math.floor((profile?.images_generated || 0) * 10)} pts</span>
                  </div>
                  <Progress value={Math.min(100, ((profile?.images_generated || 0) * 10) / (profile?.points_balance || 1) * 100)} className="h-2" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Payment */}
      {currentOrder && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              Order Awaiting Payment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Payment Information</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>Plan:</span>
                      <span className="font-semibold">{currentOrder.planName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Amount:</span>
                      <span className="font-bold text-lg text-blue-600">{currentOrder.amount.toLocaleString()} VND</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Transfer Code:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono">{currentOrder.description}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="p-1 h-6 w-6"
                          onClick={() => copyToClipboard(currentOrder.description, 'transfer code')}
                        >
                          {copied === 'transfer code' ? <CheckCircle className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Bank Information</h3>
                  <div className="space-y-2 text-sm bg-white p-4 rounded-lg border">
                    <div className="flex justify-between">
                      <span>Bank:</span>
                      <span>{currentOrder.bankName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Account Number:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono">{currentOrder.beneficiary}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="p-1 h-6 w-6"
                          onClick={() => copyToClipboard(currentOrder.beneficiary, 'account number')}
                        >
                          {copied === 'account number' ? <CheckCircle className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span>Account Holder:</span>
                      <span>{currentOrder.accountName}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <h3 className="font-semibold text-gray-900 mb-3">Scan QR Code to Pay</h3>
                <div className="bg-white p-4 rounded-xl border-2 border-gray-200 inline-block">
                  <img 
                    src={currentOrder.qrUrl} 
                    alt="Payment QR Code"
                    className="w-64 h-64 mx-auto"
                  />
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  Scan the QR code with your banking app for automatic payment
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Plans */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Choose the Right Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const Icon = getPlanIcon(plan.name);
            const isSelected = selectedPlanId === plan.id;
            
            return (
              <Card
                key={plan.id}
                className={cn(
                  "relative overflow-hidden transition-all hover:scale-105",
                  plan.popular ? "ring-2 ring-blue-500 shadow-xl" : "shadow-lg",
                  isSelected && "ring-2 ring-green-500"
                )}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-blue-600 text-white text-center py-2 text-sm font-bold">
                    POPULAR
                  </div>
                )}

                <CardHeader className={cn("text-center", plan.popular ? "pt-12" : "pt-6")}>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl mx-auto mb-4 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  {plan.savings && (
                    <Badge className="bg-green-100 text-green-700">{plan.savings}</Badge>
                  )}
                  
                  {/* USD Price First (prominent) */}
                  <div className="text-4xl font-bold text-gray-900">
                    ${plan.priceUsd}
                  </div>
                  <div className="text-sm text-gray-500 mb-2">
                    {plan.billingPeriod === 'yearly' ? '/year' : '/month'}
                  </div>
                  
                  {/* VND Price Below (smaller) */}
                  <div className="text-lg font-semibold text-blue-600">
                    {plan.priceVnd.toLocaleString()}₫
                  </div>
                  
                  <Badge className="bg-blue-50 text-blue-700 mt-2">
                    {plan.points.toLocaleString()} points/month
                  </Badge>
                </CardHeader>

                <CardContent className="px-6 pb-6">
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    className="w-full"
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={loading || !!currentOrder}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CreditCard className="w-4 h-4 mr-2" />
                    )}
                    Select Plan
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {/* Pricing Note */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            💡 <strong>Tip:</strong> USD pricing is shown for international comparison.
            Payment is made in VND via Vietnamese bank transfer.
          </p>
        </div>
      </div>

      {/* Order History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Order History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="text-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
              <p className="text-gray-600 mt-2">Loading history...</p>
            </div>
          ) : orderHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No orders yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orderHistory.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-semibold">{order.metadata?.plan_name || 'Unknown Plan'}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleDateString('en-US')} •
                      {order.amount.toLocaleString()} VND
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(order.status)}
                    {order.metadata?.billing_period && (
                      <div className="text-xs text-gray-500 mt-1">
                        {order.metadata.billing_period === 'yearly' ? 'Annual billing' : 'Monthly billing'}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          <p className="text-gray-600 mt-2">Loading...</p>
        </div>
      </div>
    }>
      <BillingPageContent />
    </Suspense>
  );
}