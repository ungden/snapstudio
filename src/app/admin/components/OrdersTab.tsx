import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Order } from '../types';

const supabase = createSupabaseBrowserClient();

interface OrdersTabProps {
  orders: Order[];
  onDataChange: () => void;
}

export function OrdersTab({ orders, onDataChange }: OrdersTabProps) {
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatus, setOrderStatus] = useState('all');

  const confirmOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to confirm this order?')) return;

    try {
      const { error } = await supabase.functions.invoke('confirm-payment', {
        body: { order_id: orderId },
      });

      if (error) throw error;
      toast.success('Order confirmed successfully!');
      onDataChange();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Error confirming order: ${errorMessage}`);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = orderStatus === 'all' || order.status === orderStatus;
    const searchLower = orderSearch.toLowerCase();
    const matchesSearch = !orderSearch ||
      order.id.toLowerCase().includes(searchLower) ||
      (order.profiles?.email && order.profiles.email.toLowerCase().includes(searchLower));
    return matchesStatus && matchesSearch;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Management ({filteredOrders.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-6">
          <Input 
            placeholder="Search by order ID or email..."
            value={orderSearch}
            onChange={(e) => setOrderSearch(e.target.value)}
            className="flex-1"
          />
          <Select value={orderStatus} onValueChange={setOrderStatus}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">
                    {order.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>{order.profiles?.email || 'N/A'}</TableCell>
                  <TableCell>{order.metadata?.plan_name || order.item_id}</TableCell>
                  <TableCell>{order.amount.toLocaleString()} VND</TableCell>
                  <TableCell>
                    <Badge variant={
                      order.status === 'completed' ? 'default' :
                      order.status === 'pending' ? 'secondary' : 'destructive'
                    }>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(order.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {order.status === 'pending' && (
                      <Button 
                        size="sm" 
                        onClick={() => confirmOrder(order.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Confirm
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}