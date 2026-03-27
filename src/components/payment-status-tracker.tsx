"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { createSupabaseBrowserClient } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PaymentClient, PaymentOrder } from '@/lib/payment-client';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Loader2,
  Banknote,
  QrCode
} from 'lucide-react';

const supabase = createSupabaseBrowserClient();

interface PaymentStatusTrackerProps {
  onPaymentSuccess: () => void;
}

export function PaymentStatusTracker({ onPaymentSuccess }: PaymentStatusTrackerProps) {
  const { user } = useAuth();
  const [order, setOrder] = useState<PaymentOrder | null>(null);
  const [status, setStatus] = useState<'pending' | 'completed' | 'failed' | 'rejected' | 'unknown'>('unknown');
  const [loading, setLoading] = useState(true);

  const loadPendingOrder = useCallback(async () => {
    try {
      setLoading(true);
      const pendingOrder = await PaymentClient.getPendingOrder();
      setOrder(pendingOrder);
      if (pendingOrder) {
        setStatus('pending');
      }
    } catch (error) {
      console.error('Error loading pending order:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadPendingOrder();
    }
  }, [user, loadPendingOrder]);

  useEffect(() => {
    if (!order || !user) return;

    const channel = supabase
      .channel(`order-status-${order.orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${order.orderId}`
        },
        (payload: any) => {
          const newStatus = payload.new?.status;
          if (newStatus) {
            setStatus(newStatus);
            if (newStatus === 'completed') {
              toast.success('Payment successful!');
              onPaymentSuccess();
              setTimeout(() => setOrder(null), 5000);
            } else if (newStatus === 'failed' || newStatus === 'rejected') {
              toast.error('Payment failed or was cancelled.');
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [order, user, onPaymentSuccess]);

  const handleCancelOrder = async () => {
    if (!order) return;
    const result = await PaymentClient.cancelOrder(order.orderId);
    if (result.success) {
      toast.info('Order cancelled.');
      setOrder(null);
    } else {
      toast.error(result.error || 'Error cancelling order.');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-sm text-gray-600">Checking payment status...</p>
        </CardContent>
      </Card>
    );
  }

  if (!order) {
    return null; // Don't show anything if there's no pending order
  }

  const statusInfo = {
    pending: { icon: Clock, color: 'text-yellow-600', text: 'Awaiting payment' },
    completed: { icon: CheckCircle, color: 'text-green-600', text: 'Payment successful' },
    failed: { icon: XCircle, color: 'text-red-600', text: 'Payment failed' },
    rejected: { icon: XCircle, color: 'text-red-600', text: 'Order cancelled' },
    unknown: { icon: Loader2, color: 'text-gray-600', text: 'Checking...' },
  };
  const currentStatus = statusInfo[status];
  const Icon = currentStatus.icon;

  return (
    <Card className="shadow-lg border-blue-500">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Banknote className="w-5 h-5 text-blue-600" />
            Pending Order
          </div>
          <Badge variant={status === 'completed' ? 'default' : 'secondary'}>
            {status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <QrCode className="w-16 h-16 text-gray-800" />
          <div>
            <p className="font-semibold">{order.description}</p>
            <p className="text-lg font-bold text-blue-600">{order.amount.toLocaleString()} VND</p>
          </div>
        </div>
        
        <div className={`flex items-center gap-2 p-3 rounded-lg ${currentStatus.color.replace('text-', 'bg-').replace('-600', '-50')}`}>
          <Icon className={`w-5 h-5 ${currentStatus.color}`} />
          <p className={`font-medium text-sm ${currentStatus.color}`}>{currentStatus.text}</p>
        </div>

        {status === 'pending' && (
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Please scan the QR code in your banking app to complete the payment.</p>
            <Button variant="ghost" size="sm" onClick={handleCancelOrder}>Cancel Order</Button>
          </div>
        )}
        {status === 'completed' && (
          <p className="text-sm text-green-600 text-center">Points have been added to your account.</p>
        )}
      </CardContent>
    </Card>
  );
}