import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { TrendingUp, Package, Users, ShoppingCart, Calendar, IndianRupee, Tag, AlertTriangle, Building, BarChart2, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

export const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/admin/analytics');
      setAnalytics(response.data);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" data-testid="admin-dashboard-loading">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-10" data-testid="admin-dashboard-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-manrope font-bold text-4xl text-foreground mb-3" data-testid="admin-dashboard-title">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            Overview of your tender management system
          </p>
        </div>

        {/* Stats Grid - Improved hierarchy */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Card className="border-border shadow-md hover:shadow-lg hover:border-accent/30 transition-all duration-200 group cursor-pointer" data-testid="stat-total-orders">
            <CardContent className="p-6">
              <div className="flex flex-col items-start justify-between h-full">
                <div className="h-14 w-14 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200 mb-4 flex-shrink-0">
                  <ShoppingCart className="h-7 w-7 text-blue-600" />
                </div>
                <div className="w-full">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Total Orders</p>
                  <p className="font-manrope font-bold text-3xl text-foreground mb-1">{analytics?.total_orders || 0}</p>
                  <p className="text-sm text-muted-foreground/60">All time</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-md hover:shadow-lg hover:border-accent/30 transition-all duration-200 group cursor-pointer" data-testid="stat-total-revenue">
            <CardContent className="p-6">
              <div className="flex flex-col items-start justify-between h-full">
                <div className="h-14 w-14 bg-green-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200 mb-4 flex-shrink-0">
                  <TrendingUp className="h-7 w-7 text-green-600" />
                </div>
                <div className="w-full">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Gross Sales</p>
                  <p className="font-manrope font-bold text-3xl text-foreground mb-1">₹{analytics?.total_revenue?.toLocaleString('en-IN') || 0}</p>
                  <p className="text-sm text-green-600 font-medium">Earned overall</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-md hover:shadow-lg hover:border-accent/30 transition-all duration-200 group cursor-pointer">
            <CardContent className="p-6">
              <div className="flex flex-col items-start justify-between h-full">
                <div className="h-14 w-14 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200 mb-4 flex-shrink-0">
                  <IndianRupee className="h-7 w-7 text-indigo-600" />
                </div>
                <div className="w-full">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Tax Collected</p>
                  <p className="font-manrope font-bold text-3xl text-foreground mb-1">₹{Math.floor(analytics?.total_tax || 0).toLocaleString('en-IN')}</p>
                  <p className="text-sm text-muted-foreground/60">Total GST levied</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-md hover:shadow-lg hover:border-accent/30 transition-all duration-200 group cursor-pointer">
            <CardContent className="p-6">
              <div className="flex flex-col items-start justify-between h-full">
                <div className="h-14 w-14 bg-amber-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200 mb-4 flex-shrink-0">
                  <Tag className="h-7 w-7 text-amber-600" />
                </div>
                <div className="w-full">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Bulk Discounts</p>
                  <p className="font-manrope font-bold text-3xl text-foreground mb-1">₹{Math.floor(analytics?.total_discount || 0).toLocaleString('en-IN')}</p>
                  <p className="text-sm text-muted-foreground/60">Given to B2B clients</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-md hover:shadow-lg hover:border-accent/30 transition-all duration-200 group cursor-pointer" data-testid="stat-active-tenders">
            <CardContent className="p-6">
              <div className="flex flex-col items-start justify-between h-full">
                <div className="h-14 w-14 bg-orange-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200 mb-4 flex-shrink-0">
                  <Package className="h-7 w-7 text-orange-600" />
                </div>
                <div className="w-full">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Active Tenders</p>
                  <p className="font-manrope font-bold text-3xl text-foreground mb-1">{analytics?.active_tenders || 0}</p>
                  <p className="text-sm text-muted-foreground/60">Live listings</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="border-border shadow-md hover:shadow-lg hover:border-accent/30 transition-all duration-200 group cursor-pointer"
            data-testid="stat-total-customers"
            onClick={() => navigate('/admin/users')}
          >
            <CardContent className="p-6">
              <div className="flex flex-col items-start justify-between h-full">
                <div className="h-14 w-14 bg-purple-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200 mb-4 flex-shrink-0">
                  <Users className="h-7 w-7 text-purple-600" />
                </div>
                <div className="w-full">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Total Customers</p>
                  <p className="font-manrope font-bold text-3xl text-foreground mb-1">{analytics?.total_customers || 0}</p>
                  <p className="text-sm text-muted-foreground/60">Registered B2B buyers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="border-border shadow-md hover:shadow-lg hover:border-accent/30 transition-all duration-200 group cursor-pointer border-amber-100"
            onClick={() => navigate('/admin/approvals')}
          >
            <CardContent className="p-6">
              <div className="flex flex-col items-start justify-between h-full">
                <div className="h-14 w-14 bg-amber-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200 mb-4 flex-shrink-0">
                  <ShieldAlert className="h-7 w-7 text-amber-600" />
                </div>
                <div className="w-full">
                  <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-2">Pending Approvals</p>
                  <p className="font-manrope font-bold text-3xl text-foreground mb-1">{analytics?.pending_approvals || 0}</p>
                  <p className="text-sm text-amber-600/80 font-medium">KYC verification queue</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-md hover:shadow-lg hover:border-accent/30 transition-all duration-200 group cursor-pointer border-red-100">
            <CardContent className="p-6">
              <div className="flex flex-col items-start justify-between h-full">
                <div className="h-14 w-14 bg-red-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200 mb-4 flex-shrink-0">
                  <AlertTriangle className="h-7 w-7 text-red-600" />
                </div>
                <div className="w-full">
                  <p className="text-xs font-semibold text-red-800 uppercase tracking-wide mb-2">Cancelled Orders</p>
                  <p className="font-manrope font-bold text-3xl text-foreground mb-1">{analytics?.cancelled_orders || 0}</p>
                  <p className="text-sm text-red-600/80 font-medium">Refunded & closed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Orders Alert - with left accent bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {analytics?.pending_orders > 0 && (
            <Card className="border-l-4 border-l-accent shadow-md hover:shadow-lg transition-shadow" data-testid="pending-orders-alert">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ShoppingCart className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="font-manrope font-semibold text-lg text-foreground">Pending Orders Await</p>
                    <p className="text-sm text-muted-foreground mt-1">You have <strong>{analytics.pending_orders}</strong> pending {analytics.pending_orders === 1 ? 'order' : 'orders'} that need your attention</p>
                  </div>
                  <Badge className="bg-accent text-accent-foreground font-semibold">{analytics.pending_orders}</Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {analytics?.pending_approvals > 0 && (
            <Card
              className="border-l-4 border-l-amber-500 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate('/admin/approvals')}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ShieldAlert className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-manrope font-semibold text-lg text-foreground">Pending Approvals</p>
                    <p className="text-sm text-muted-foreground mt-1">There are <strong>{analytics.pending_approvals}</strong> businesses waiting for KYC verification</p>
                  </div>
                  <Badge className="bg-amber-500 text-white font-semibold">{analytics.pending_approvals}</Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* B2B Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <Card className="border-border shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="font-manrope text-2xl flex items-center gap-2">
                <Building className="h-5 w-5 text-accent" />
                Top B2B Clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics?.top_customers && analytics.top_customers.length > 0 ? (
                <div className="space-y-4">
                  {analytics.top_customers.map((c, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 border border-secondary/50">
                      <div>
                        <p className="font-semibold text-foreground text-sm flex items-center gap-2">
                          <span className="flex items-center justify-center h-5 w-5 rounded-full bg-accent/20 text-accent text-xs font-bold">
                            {i + 1}
                          </span>
                          {c.company || c.name}
                        </p>
                        <p className="text-xs text-muted-foreground ml-7">{c.order_count} total order{c.order_count !== 1 ? 's' : ''}</p>
                      </div>
                      <p className="font-bold text-accent">₹{Math.floor(c.total_spent).toLocaleString('en-IN')}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No customer data</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-border shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="font-manrope text-2xl flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-accent" />
                Pipeline Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics?.status_distribution && analytics.status_distribution.length > 0 ? (
                <div className="space-y-4">
                  {analytics.status_distribution.map((s, i) => {
                    const total = analytics.total_orders || 1;
                    const pct = Math.round((s.count / total) * 100) || 0;
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-foreground capitalize">{s.status === 'pending' ? 'Order Placed (Pending)' : s.status}</span>
                          <span className="text-muted-foreground font-mono">{s.count} orders ({pct}%)</span>
                        </div>
                        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className={`h-full ${s.status === 'cancelled' ? 'bg-red-500' : s.status === 'delivered' ? 'bg-green-500' : 'bg-accent'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No pipeline data</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card className="border-border shadow-md mb-10">
          <CardHeader className="pb-4">
            <CardTitle className="font-manrope text-2xl">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.recent_orders && analytics.recent_orders.length > 0 ? (
              <div className="space-y-3" data-testid="recent-orders-list">
                {analytics.recent_orders.map((order) => (
                  <div
                    key={order.order_id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-secondary/30 hover:border-accent/30 transition-all duration-200 group"
                    data-testid={`recent-order-${order.order_id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-manrope font-semibold text-foreground mb-2">{order.tender_title}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                        <span className="font-medium">{order.user_name}</span>
                        <span className="text-border">•</span>
                        <span>{order.quantity} unit{order.quantity !== 1 ? 's' : ''}</span>
                        <span className="text-border">•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(order.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                      <p className="font-manrope font-bold text-lg text-accent">₹{order.total_price.toLocaleString()}</p>
                      <Badge className={order.status === 'pending' ? 'bg-amber-100 text-amber-800 font-semibold' : 'bg-green-100 text-green-800 font-semibold'}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground font-medium" data-testid="no-recent-orders">No recent orders</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
