import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Package, Calendar, ShoppingBag, FileText, X, Wallet, CreditCard, ChevronRight, CheckCircle2, Truck, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { PaymentSlipModal } from '../components/PaymentSlipModal';

export const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slipOrderId, setSlipOrderId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

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

  const handleCancel = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancellingId(orderId);
    try {
      const res = await api.post(`/orders/${orderId}/cancel`);
      toast.success(res.data.detail);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to cancel order');
    } finally {
      setCancellingId(null);
    }
  };

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

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700';
      case 'refunded': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const ORDER_STEPS = ['pending', 'confirmed', 'processing', 'dispatched', 'delivered'];

  const getStepIcon = (step) => {
    switch (step) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle2 className="h-4 w-4" />;
      case 'processing': return <Package className="h-4 w-4" />;
      case 'dispatched': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle2 className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" data-testid="orders-loading">
        <div className="text-center">
          <div className="animate-pulse flex items-center justify-center mb-4">
            <div className="h-12 w-12 bg-accent/20 rounded-lg"></div>
          </div>
          <p className="text-muted-foreground font-medium">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-10" data-testid="my-orders-page">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="font-manrope font-bold text-4xl text-foreground mb-3" data-testid="orders-title">
            My Orders
          </h1>
          <p className="text-muted-foreground text-lg">
            Track, manage, and download payment slips for your orders
          </p>
        </div>

        {orders.length === 0 ? (
          <Card className="border-border shadow-md" data-testid="orders-empty">
            <CardContent className="py-16 text-center">
              <div className="inline-block p-4 bg-secondary/50 rounded-xl mb-6">
                <ShoppingBag className="h-12 w-12 text-muted-foreground/50 mx-auto" />
              </div>
              <h3 className="font-manrope font-semibold text-2xl text-foreground mb-2">No orders yet</h3>
              <p className="text-muted-foreground mb-8 max-w-sm mx-auto">Start browsing available tenders in the marketplace to place your first order</p>
              <Link to="/marketplace">
                <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold shadow-md" data-testid="orders-browse-link">
                  Browse Marketplace
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4" data-testid="orders-list">
            {orders.map((order) => (
              <Card
                key={order.order_id}
                className="relative overflow-hidden border-border shadow-md hover:shadow-lg hover:border-accent/30 transition-all duration-200"
                data-testid={`order-card-${order.order_id}`}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 w-full">
                      {/* Title + Status row */}
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="min-w-0">
                          <h3 className="font-manrope font-semibold text-lg text-foreground mb-1 line-clamp-1" data-testid={`order-title-${order.order_id}`}>
                            {order.tender_title}
                          </h3>
                          <p className="text-xs font-mono text-muted-foreground">{order.slip_no || order.order_id}</p>
                        </div>
                        <Badge className={`${getStatusColor(order.status)} font-semibold text-xs flex-shrink-0`} data-testid={`order-status-${order.order_id}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </div>

                      {/* Premium Hand-Marked Diagonal Status Stamp */}
                      {(order.status === 'delivered' || order.status === 'cancelled') && (
                        <div className="absolute inset-0 pointer-events-none z-0 select-none overflow-hidden flex items-center justify-center">
                          <div className={`
                            text-[8rem] sm:text-[12rem] font-black uppercase tracking-tighter opacity-[0.08] -rotate-[12deg] select-none
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
                            absolute inset-0 m-4 border-[12px] rounded-[2rem] -rotate-[8deg] opacity-[0.05] pointer-events-none
                            ${order.status === 'delivered' ? 'border-green-600' : 'border-red-600'}
                          `}></div>
                        </div>
                      )}


                      {/* Details grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-3 border-y border-border">
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
                          <p className="font-semibold text-foreground text-sm">₹{parseFloat(order.total_tax || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Date</p>
                          <p className="font-semibold text-foreground text-sm">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {/* Payment method + status */}
                      <div className="flex flex-wrap items-center gap-3 mt-3">
                        <div className="flex items-center gap-1.5 text-sm">
                          {order.payment_method === 'online' ? (
                            <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
                          ) : (
                            <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                          <span className="text-muted-foreground font-medium">
                            {order.payment_method === 'online' ? 'Online (Wallet)' : 'Bank Transfer (RTGS/NEFT)'}
                          </span>
                        </div>
                        <Badge className={`${getPaymentStatusColor(order.payment_status)} text-xs border-0`}>
                          {(order.payment_status || 'pending').charAt(0).toUpperCase() + (order.payment_status || 'pending').slice(1)}
                        </Badge>
                      </div>

                      {order.notes && (
                        <div className="mt-3">
                          <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Notes</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">{order.notes}</p>
                        </div>
                      )}

                      {/* Order Timeline */}
                      {order.timeline && order.status !== 'cancelled' && (
                        <div className="mt-5 pt-4 border-t border-border w-full">
                          <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Order Tracking</p>
                          <div className="flex items-center gap-1 w-full overflow-x-auto pb-2 scrollbar-hide">
                            {ORDER_STEPS.map((step, idx) => {
                              // Find if step exists in timeline
                              const timelineEntry = order.timeline.find(t => t.status === step);
                              const isCompleted = !!timelineEntry;

                              // Check if this is the current active step
                              // It's the current step if it's completed, AND the next step is NOT completed.
                              // OR if we are at the end ('delivered') and it is completed.
                              const isCurrent = isCompleted && (
                                step === 'delivered' ||
                                !order.timeline.find(t => t.status === ORDER_STEPS[idx + 1])
                              );

                              return (
                                <div key={step} className="flex items-center flex-shrink-0">
                                  <div className={`flex flex-col items-center min-w-[80px] ${!isCompleted ? 'opacity-60' : ''}`}>
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center mb-1 text-white shadow-sm ${isCurrent ? 'bg-accent ring-4 ring-accent/20' :
                                      isCompleted ? 'bg-green-500' : 'bg-secondary text-secondary-foreground border border-border'
                                      }`}>
                                      {getStepIcon(step)}
                                    </div>
                                    <span className={`text-[10px] font-semibold uppercase ${isCurrent ? 'text-accent' : 'text-foreground/70'}`}>
                                      {step}
                                    </span>
                                    {timelineEntry && (
                                      <span className="text-[9px] text-muted-foreground mt-0.5">
                                        {new Date(timelineEntry.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                      </span>
                                    )}
                                  </div>

                                  {idx < ORDER_STEPS.length - 1 && (
                                    <div className={`h-1 w-6 sm:w-10 mx-1 rounded-full ${order.timeline.find(t => t.status === ORDER_STEPS[idx + 1])
                                      ? 'bg-green-500'
                                      : 'bg-border'
                                      }`} />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right side: total + actions */}
                    <div className="flex-shrink-0 flex flex-col items-end gap-3">
                      <div className="text-right">
                        <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Grand Total</p>
                        <p className="font-manrope font-bold text-2xl text-accent" data-testid={`order-total-${order.order_id}`}>
                          ₹{parseFloat(order.total_price || 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">incl. GST</p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-accent/40 text-accent hover:bg-accent/10 text-xs"
                          onClick={() => setSlipOrderId(order.order_id)}
                          data-testid={`slip-btn-${order.order_id}`}
                        >
                          <FileText className="h-3.5 w-3.5 mr-1" />
                          Slip
                        </Button>
                        {order.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-300 text-red-600 hover:bg-red-50 text-xs"
                            onClick={() => handleCancel(order.order_id)}
                            disabled={cancellingId === order.order_id}
                            data-testid={`cancel-btn-${order.order_id}`}
                          >
                            {cancellingId === order.order_id ? (
                              <span className="flex items-center gap-1">
                                <span className="animate-spin h-3 w-3 border-2 border-red-600 border-t-transparent rounded-full" />
                                ...
                              </span>
                            ) : (
                              <>
                                <X className="h-3.5 w-3.5 mr-1" />
                                Cancel
                              </>
                            )}
                          </Button>
                        )}
                      </div>

                      {/* Refund info */}
                      {order.payment_status === 'refunded' && (
                        <div className="flex items-center gap-1 text-xs text-blue-600 font-medium">
                          <Wallet className="h-3 w-3" />
                          Refunded to wallet
                        </div>
                      )}
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
