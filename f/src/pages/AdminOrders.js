import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Package, Calendar, User, FileText, Wallet, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { PaymentSlipModal } from '../components/PaymentSlipModal';

export const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slipOrderId, setSlipOrderId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      const orderData = Array.isArray(response.data) ? response.data : [];
      setOrders(orderData);
    } catch (error) {
      toast.error('Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      toast.success('Order status updated');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'pending': return 'outline';
      case 'confirmed': return 'default';
      case 'processing': return 'secondary';
      case 'dispatched': return 'default';
      case 'delivered': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" data-testid="admin-orders-loading">
        <div className="text-center">
          <div className="animate-pulse flex items-center justify-center mb-4">
            <div className="h-12 w-12 bg-accent/20 rounded-lg"></div>
          </div>
          <p className="text-muted-foreground font-medium">Loading orders...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-indigo-100 text-indigo-800';
      case 'dispatched': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background py-10" data-testid="admin-orders-page">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="font-manrope font-bold text-4xl text-foreground mb-3" data-testid="admin-orders-title">
            Order Management
          </h1>
          <p className="text-muted-foreground text-lg">
            View and manage all customer orders
          </p>
        </div>

        {orders.length === 0 ? (
          <Card className="border-border shadow-md" data-testid="admin-orders-empty">
            <CardContent className="py-16 text-center">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="font-manrope font-semibold text-2xl text-foreground mb-2">No orders yet</h3>
              <p className="text-muted-foreground">Orders will appear here when customers place them</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4" data-testid="admin-orders-list">
            {orders.map((order) => (
              <Card key={order.order_id} className="relative overflow-hidden border-border shadow-md hover:shadow-lg hover:border-accent/30 transition-all duration-200" data-testid={`admin-order-${order.order_id}`}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Order Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-manrope font-semibold text-lg text-foreground mb-1 line-clamp-1" data-testid={`admin-order-title-${order.order_id}`}>
                            {order.tender_title}
                          </h3>
                          <p className="text-xs font-mono text-muted-foreground">{order.order_id}</p>
                        </div>
                        <Badge className={`${getStatusColor(order.status)} font-semibold text-xs flex-shrink-0`} data-testid={`admin-order-status-${order.order_id}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </div>

                      {/* Premium Hand-Marked Diagonal Status Stamp */}
                      {(order.status === 'delivered' || order.status === 'cancelled') && (
                        <div className="absolute inset-0 pointer-events-none z-0 select-none overflow-hidden flex items-center justify-center">
                          <div className={`
                            text-[8rem] lg:text-[14rem] font-black uppercase tracking-tighter opacity-[0.08] -rotate-[12deg] select-none
                            ${order.status === 'delivered' ? 'text-green-600' : 'text-red-600'}
                          `} style={{
                              fontFamily: "'Inter', sans-serif",
                              textShadow: order.status === 'delivered'
                                ? '0 0 20px rgba(22, 163, 74, 0.2)'
                                : '0 0 20px rgba(220, 38, 38, 0.2)'
                            }}>
                            {order.status === 'delivered' ? 'DELIVERED' : 'CANCELLED'}
                          </div>

                          {/* Stylized Stamp Border Box */}
                          <div className={`
                            absolute inset-0 m-6 border-[16px] rounded-[3rem] -rotate-[10deg] opacity-[0.05] pointer-events-none
                            ${order.status === 'delivered' ? 'border-green-600' : 'border-red-600'}
                          `}></div>
                        </div>
                      )}


                      <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4 py-2 border-y border-border">
                        <User className="h-4 w-4 flex-shrink-0" />
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <p className="font-semibold text-foreground">{order.user_name}</p>
                          <p className="truncate">{order.user_email}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Quantity</p>
                          <p className="font-semibold text-foreground">{order.quantity} unit{order.quantity !== 1 ? 's' : ''}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Unit Price</p>
                          <p className="font-semibold text-foreground">₹{parseFloat(order.unit_price || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Tax (GST)</p>
                          <p className="font-semibold text-foreground">₹{parseFloat(order.total_tax || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Grand Total</p>
                          <p className="font-manrope font-bold text-accent">₹{parseFloat(order.total_price || 0).toLocaleString()}</p>
                        </div>
                      </div>
                      {/* Payment info */}
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          {order.payment_method === 'online' ? <Wallet className="h-3.5 w-3.5" /> : <CreditCard className="h-3.5 w-3.5" />}
                          <span className="font-medium">{order.payment_method === 'online' ? 'Online (Wallet)' : 'Bank Transfer'}</span>
                        </div>
                        <Badge className={`${order.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                          order.payment_status === 'refunded' ? 'bg-blue-100 text-blue-700' :
                            'bg-amber-100 text-amber-700'
                          } text-xs border-0`}>
                          {(order.payment_status || 'pending').charAt(0).toUpperCase() + (order.payment_status || 'pending').slice(1)}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-accent/40 text-accent hover:bg-accent/10 text-xs ml-auto"
                          onClick={() => setSlipOrderId(order.order_id)}
                        >
                          <FileText className="h-3.5 w-3.5 mr-1" />
                          View Slip
                        </Button>
                      </div>

                      {order.notes && (
                        <div className="bg-secondary/50 border border-secondary p-3 rounded-lg">
                          <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Customer Notes</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">{order.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Status Update Panel */}
                    <div className="lg:border-l lg:pl-6 lg:min-w-48">
                      <p className="text-sm font-semibold text-foreground mb-3">Update Status</p>
                      <Select
                        value={order.status}
                        onValueChange={(value) => handleStatusUpdate(order.order_id, value)}
                      >
                        <SelectTrigger data-testid={`admin-order-status-select-${order.order_id}`} className="text-base font-medium">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">⏳ Pending</SelectItem>
                          <SelectItem value="confirmed">✓ Confirmed</SelectItem>
                          <SelectItem value="processing">⚙️ Processing</SelectItem>
                          <SelectItem value="dispatched">🚚 Dispatched</SelectItem>
                          <SelectItem value="delivered">✅ Delivered</SelectItem>
                          <SelectItem value="cancelled">❌ Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-4">
                        <Calendar className="h-4 w-4 flex-shrink-0" />
                        <span>{new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Payment Slip Modal */}
      {slipOrderId && (
        <PaymentSlipModal
          orderId={slipOrderId}
          onClose={() => setSlipOrderId(null)}
        />
      )}
    </div>
  );
};
