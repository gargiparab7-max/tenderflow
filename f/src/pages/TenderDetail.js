import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { getAuthData } from '../utils/auth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Package, Calendar, Tag, ArrowLeft, Wallet, CreditCard, Receipt, Info, ShieldAlert, Building } from 'lucide-react';
import { toast } from 'sonner';
import { SafeImage } from '../components/SafeImage';

const GST_RATE = 18; // 18% total (SGST 9% + CGST 9%)
const MAX_TRANSFER_AMOUNT = 5000000; // Limit for standard transfers


function calculateTax(subtotal) {
  const sgst = subtotal * 0.09;
  const cgst = subtotal * 0.09;
  const totalTax = sgst + cgst;
  const grandTotal = subtotal + totalTax;
  return { subtotal, sgst, cgst, totalTax, grandTotal };
}

export const TenderDetail = () => {
  const { tenderId } = useParams();
  const navigate = useNavigate();
  const { user } = getAuthData();
  const [tender, setTender] = useState(null);
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState(null);
  const [orderData, setOrderData] = useState({
    quantity: 1,
    notes: '',
    payment_method: 'cod',
    delivery_address: '',
    delivery_city: '',
    delivery_state: '',
    delivery_pincode: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTenderDetail();
    if (user && user.role === 'customer') {
      fetchWalletBalance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenderId]);

  const fetchTenderDetail = async () => {
    try {
      const response = await api.get(`/tenders/${tenderId}`);
      setTender(response.data);
    } catch (error) {
      toast.error('Failed to load tender details');
      navigate('/marketplace');
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const res = await api.get('/wallet');
      setWalletBalance(res.data.balance);
    } catch {
      setWalletBalance(0);
    }
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to place an order');
      navigate('/login');
      return;
    }
    if (user.role === 'admin') {
      toast.error('Admin accounts cannot place orders');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/orders', {
        tender_id: tenderId,
        quantity: parseInt(orderData.quantity),
        notes: orderData.notes,
        payment_method: orderData.payment_method,
        delivery_address: orderData.delivery_address,
        delivery_city: orderData.delivery_city,
        delivery_state: orderData.delivery_state,
        delivery_pincode: orderData.delivery_pincode,
      });
      toast.success('Order placed successfully!');
      navigate('/orders');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  const qty = parseInt(orderData.quantity) || 1;
  const subtotal = tender ? tender.price * qty : 0;

  let bulkDiscountPct = 0;
  if (tender && tender.bulk_discount_tiers && tender.bulk_discount_tiers.length > 0) {
    const sortedTiers = [...tender.bulk_discount_tiers].sort((a, b) => b.min_qty - a.min_qty);
    for (const tier of sortedTiers) {
      if (qty >= (tier.min_qty || 0)) {
        bulkDiscountPct = tier.discount_pct;
        break;
      }
    }
  }

  const discountAmount = subtotal * (bulkDiscountPct / 100);
  const subtotalAfterDiscount = subtotal - discountAmount;
  const tax = tender ? calculateTax(subtotalAfterDiscount) : { grandTotal: 0, subtotal: 0, cgst: 0, sgst: 0, totalTax: 0 };

  const hasEnoughBalance = walletBalance !== null && walletBalance >= tax.grandTotal;
  const isTransferDisabled = tax.grandTotal > MAX_TRANSFER_AMOUNT;

  // Auto-switch to online if transfer becomes disabled due to volume
  useEffect(() => {
    if (isTransferDisabled && orderData.payment_method === 'transfer') {
      setOrderData(prev => ({ ...prev, payment_method: 'online' }));
    }
  }, [isTransferDisabled, orderData.payment_method]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" data-testid="tender-detail-loading">
        <p className="text-muted-foreground">Loading tender details...</p>
      </div>
    );
  }

  if (!tender) return null;

  return (
    <div className="min-h-screen bg-background py-8" data-testid="tender-detail-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          className="mb-6 hover:text-accent"
          onClick={() => navigate(-1)}
          data-testid="tender-detail-back-btn"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column - Images and Description */}
          <div className="lg:col-span-7">
            <SafeImage
              src={tender.image_url}
              alt={tender.title}
              className="w-full h-96 object-cover rounded-lg border border-border shadow-sm mb-6"
              fallbackSize={24}
              data-testid="tender-detail-image"
            />

            <Card className="border-border shadow-sm">
              <CardHeader>
                <CardTitle className="font-manrope text-2xl">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed" data-testid="tender-detail-description">
                  {tender.description}
                </p>
              </CardContent>
            </Card>

            {/* Order Form or Verification Prompt */}
            <div className="mt-8">
              {user && user.role === 'customer' ? (
                user.account_type === 'business' ? (
                  user.is_approved ? (
                    <Card className="border-accent/20 shadow-sm bg-accent/5" data-testid="tender-detail-order-form">
                      <CardHeader>
                        <CardTitle className="font-manrope text-xl">Delivery Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <Label className="text-sm font-semibold text-muted-foreground">Delivery Address (Optional)</Label>
                          <p className="text-xs text-muted-foreground -mt-1.5 mb-2">If left blank, your registered company address will be used.</p>
                          <Input form="tender-order-form" placeholder="House/Building, Street Area" value={orderData.delivery_address} onChange={e => setOrderData({ ...orderData, delivery_address: e.target.value })} className="text-base" />
                          <div className="grid grid-cols-2 gap-3">
                            <Input form="tender-order-form" placeholder="City" value={orderData.delivery_city} onChange={e => setOrderData({ ...orderData, delivery_city: e.target.value })} className="text-base" />
                            <Input form="tender-order-form" placeholder="State" value={orderData.delivery_state} onChange={e => setOrderData({ ...orderData, delivery_state: e.target.value })} className="text-base" />
                          </div>
                          <Input form="tender-order-form" placeholder="PIN Code" value={orderData.delivery_pincode} onChange={e => setOrderData({ ...orderData, delivery_pincode: e.target.value })} className="text-base" />
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="border-amber-200 bg-amber-50 shadow-sm p-8 text-center">
                      <ShieldAlert className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                      <h3 className="font-manrope font-bold text-xl text-amber-900 mb-2">Pending Verification</h3>
                      <p className="text-amber-700 text-sm mb-6">
                        Your business account is currently under review. Bidding and procurement features will be enabled once our team verifies your credentials.
                      </p>
                      <Button variant="outline" className="border-amber-300 text-amber-800" onClick={() => navigate('/profile')}>
                        Check Status
                      </Button>
                    </Card>
                  )
                ) : (
                  <Card className="border-border bg-secondary/10 shadow-sm p-8 text-center">
                    <Building className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="font-manrope font-bold text-xl text-foreground mb-2">Business Account Required</h3>
                    <p className="text-muted-foreground text-sm mb-6">
                      Only verified Business accounts can place orders for tenders. Please update your account type in settings if you represent an organization.
                    </p>
                    <Button className="bg-primary text-primary-foreground" onClick={() => navigate('/profile')}>
                      Go to Profile
                    </Button>
                  </Card>
                )
              ) : !user ? (
                <Card className="border-border shadow-sm">
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground mb-4">
                      Please login to place an order
                    </p>
                    <Button
                      onClick={() => navigate('/login')}
                      className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                    >
                      Login to Order
                    </Button>
                  </CardContent>
                </Card>
              ) : null}
            </div>
          </div>

          {/* Right Column - Details and Order Form */}
          <div className="lg:col-span-5 space-y-6">
            {/* Tender Info */}
            <Card className="border-border shadow-sm">
              <CardHeader>
                <div className="space-y-2">
                  {tender.category && (
                    <span className="inline-block px-3 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded">
                      {tender.category}
                    </span>
                  )}
                  <CardTitle className="font-manrope text-3xl" data-testid="tender-detail-title">
                    {tender.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-baseline gap-2">
                  <span className="font-manrope font-bold text-4xl text-primary" data-testid="tender-detail-price">
                    ₹{tender.price.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground">per unit</span>
                </div>

                {tender.weight && (
                  <div className="flex items-center gap-2 text-foreground">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm"><strong>Weight:</strong> {tender.weight}</span>
                  </div>
                )}

                {tender.deadline && (
                  <div className="flex items-center gap-2 text-foreground">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm"><strong>Deadline:</strong> {tender.deadline}</span>
                  </div>
                )}

                <div className="pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium text-green-600">Active Tender</span>
                  </div>
                </div>

                {tender.bulk_discount_tiers && tender.bulk_discount_tiers.length > 0 && (
                  <div className="pt-4 border-t border-border">
                    <h4 className="font-semibold text-sm mb-2 text-foreground">Bulk Pricing Tiers:</h4>
                    <div className="space-y-1">
                      {tender.bulk_discount_tiers.map((t, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm p-2 rounded bg-secondary/30 border border-secondary">
                          <span className="text-muted-foreground">{t.min_qty}+ units</span>
                          <span className="font-medium text-accent font-mono">{t.discount_pct}% OFF</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Billing and Checkout Summary */}
            {user && user.role === 'customer' && user.account_type === 'business' && user.is_approved && (
              <Card className="border-accent/20 shadow-md bg-accent/5 overflow-hidden">
                <CardHeader className="bg-accent/10 border-b border-accent/10">
                  <CardTitle className="font-manrope text-xl flex items-center gap-2 text-accent">
                    <Receipt className="h-5 w-5" />
                    Checkout Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <form id="tender-order-form" onSubmit={handleOrderSubmit} className="space-y-6">
                    {/* Quantity and Notes */}
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="quantity" className="text-sm font-semibold">Quantity</Label>
                        <Input
                          id="quantity"
                          type="number"
                          min="1"
                          value={orderData.quantity}
                          onChange={(e) => setOrderData({ ...orderData, quantity: e.target.value })}
                          required
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="notes" className="text-sm font-semibold">Notes (Optional)</Label>
                        <Textarea
                          id="notes"
                          placeholder="Special instructions..."
                          value={orderData.notes}
                          onChange={(e) => setOrderData({ ...orderData, notes: e.target.value })}
                          rows={2}
                          className="resize-none"
                        />
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold">Payment Method</Label>
                      <div className="grid grid-cols-1 gap-3">
                        <button
                          type="button"
                          disabled={isTransferDisabled}
                          onClick={() => setOrderData({ ...orderData, payment_method: 'transfer' })}
                          className={`flex items-center gap-3 p-3 rounded-lg border-2 text-sm font-medium transition-all ${isTransferDisabled ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200 text-gray-400' :
                            orderData.payment_method === 'transfer'
                              ? 'border-accent bg-accent/10 text-accent'
                              : 'border-border bg-background text-foreground hover:border-accent/40'
                            }`}
                        >
                          <CreditCard className="h-5 w-5 flex-shrink-0" />
                          <div className="text-left">
                            <p className="font-bold">Bank Transfer</p>
                            <p className="text-[10px] opacity-70">RTGS / NEFT / IMPS</p>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setOrderData({ ...orderData, payment_method: 'online' })}
                          className={`flex items-center gap-3 p-3 rounded-lg border-2 text-sm font-medium transition-all ${orderData.payment_method === 'online'
                            ? 'border-accent bg-accent/10 text-accent'
                            : 'border-border bg-background text-foreground hover:border-accent/40'
                            }`}
                        >
                          <Wallet className="h-5 w-5 flex-shrink-0" />
                          <div className="text-left">
                            <p className="font-bold">Wallet Pay</p>
                            <p className="text-[10px] opacity-70">Instant Settlement</p>
                          </div>
                        </button>
                      </div>

                      {isTransferDisabled && (
                        <div className="flex items-start gap-2 text-[11px] p-2.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-100">
                          <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                          <span>Transfers limited to ₹50L per transaction.</span>
                        </div>
                      )}

                      {orderData.payment_method === 'online' && (
                        <div className={`flex items-center gap-1.5 text-xs p-2 rounded-lg ${hasEnoughBalance ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                          <Info className="h-3.5 w-3.5 flex-shrink-0" />
                          {walletBalance !== null ? (
                            hasEnoughBalance
                              ? `Available: ₹${walletBalance.toLocaleString('en-IN')}`
                              : `Insufficient: ₹${walletBalance.toLocaleString('en-IN')}`
                          ) : 'Checking balance...'}
                        </div>
                      )}
                    </div>

                    {/* Tax Breakdown */}
                    <div className="bg-white/50 rounded-xl p-4 border border-accent/10 space-y-3">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Items Total</span>
                        <span className="font-medium text-foreground">₹{subtotal.toLocaleString('en-IN')}</span>
                      </div>
                      {bulkDiscountPct > 0 && (
                        <div className="flex justify-between text-sm text-green-600 font-semibold italic">
                          <span>Bulk Saver ({bulkDiscountPct}%)</span>
                          <span>- ₹{discountAmount.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>GST (18%)</span>
                        <span className="font-medium text-foreground">₹{tax.totalTax.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="pt-3 border-t border-accent/10 flex justify-between items-end">
                        <span className="text-sm font-bold text-muted-foreground">Payable Amount</span>
                        <div className="text-right">
                          <p className="font-manrope font-extrabold text-2xl text-primary leading-none">
                            ₹{tax.grandTotal.toLocaleString('en-IN')}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-1">all taxes included</p>
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 bg-accent hover:bg-accent/90 text-white font-bold text-lg shadow-lg shadow-accent/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                      disabled={submitting || (orderData.payment_method === 'online' && !hasEnoughBalance)}
                    >
                      {submitting ? 'Processing...' : 'Place Secure Order'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div >
  );
};
