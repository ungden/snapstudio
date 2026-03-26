import { getSupabaseClient } from '@/integrations/supabase/client';
import { EdgeFunctionClient } from '@/lib/edge-function-client';

export interface PaymentOrder {
  orderId: string;
  amount: number;
  description: string;
  qrUrl: string;
  beneficiary: string;
  bankBin: string;
  bankName: string;
  accountName: string;
  planName?: string;
  billingPeriod?: 'monthly' | 'yearly';
  points?: number;
  priceUsd?: number;
}

export interface PaymentResult {
  success: boolean;
  order?: PaymentOrder;
  error?: string;
}

export class PaymentClient {
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY = 1000; // 1 second

  static async createOrder(planId: string): Promise<PaymentResult> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        const isAuth = await EdgeFunctionClient.isAuthenticated();
        if (!isAuth) {
          return {
            success: false,
            error: 'Your session has expired. Please log in again.'
          };
        }

        if (!planId || typeof planId !== 'string') {
          return {
            success: false,
            error: 'Invalid Plan ID'
          };
        }

        const { data, error } = await EdgeFunctionClient.invoke('create-order', {
          body: { planId }
        });

        if (error) {
          lastError = error;
          if (error.message.includes('Unauthorized') || error.message.includes('not authenticated')) {
            return { success: false, error: 'Your session has expired. Please log in again.' };
          }
          if (error.message.includes('Invalid planId') || error.message.includes('Bad Request')) {
            return { success: false, error: error.message };
          }
          if (attempt < this.MAX_RETRIES) {
            await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY * attempt));
            continue;
          }
          throw error;
        }

        if (!data) {
          lastError = new Error('No response data received');
          if (attempt < this.MAX_RETRIES) {
            await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY * attempt));
            continue;
          }
          throw lastError;
        }

        if (!data.orderId || !data.qrUrl || !data.amount) {
          lastError = new Error('Invalid response data structure');
          if (attempt < this.MAX_RETRIES) {
            await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY * attempt));
            continue;
          }
          throw lastError;
        }

        return {
          success: true,
          order: {
            orderId: data.orderId,
            amount: data.amount,
            description: data.description,
            qrUrl: data.qrUrl,
            beneficiary: data.beneficiary,
            bankBin: data.bankBin,
            bankName: data.bankName,
            accountName: data.accountName,
            planName: data.planName,
            billingPeriod: data.billingPeriod,
            points: data.points,
            priceUsd: data.priceUsd
          }
        };

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        if (attempt < this.MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY * attempt));
        }
      }
    }

    return {
      success: false,
      error: lastError?.message || 'Unable to create order after multiple attempts'
    };
  }

  static async checkOrderStatus(orderId: string): Promise<{ status: string; error?: string }> {
    const supabase = getSupabaseClient();
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .single();

      if (error) {
        return { status: 'unknown', error: error.message };
      }

      return { status: data?.status || 'unknown' };
    } catch (error) {
      return { 
        status: 'unknown', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  static async cancelOrder(orderId: string): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseClient();
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'rejected' })
        .eq('id', orderId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  static async getPendingOrder(): Promise<PaymentOrder | null> {
    try {
      const { data, error } = await EdgeFunctionClient.invoke('get-order-payment-info', {
        body: {}
      });

      if (error) {
        console.error('Error getting pending order:', error);
        return null;
      }

      if (!data?.pending) {
        return null;
      }

      return {
        orderId: data.orderId,
        amount: data.amount,
        description: data.description,
        qrUrl: data.qrUrl,
        beneficiary: data.beneficiary,
        bankBin: data.bankBin,
        bankName: data.bankName,
        accountName: data.accountName,
        planName: data.planName,
        billingPeriod: data.billingPeriod,
        points: data.points
      };
    } catch (error) {
      console.error('Error in getPendingOrder:', error);
      return null;
    }
  }
}