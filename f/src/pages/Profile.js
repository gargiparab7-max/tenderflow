import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { User, Mail, Shield, Calendar, Copy, Check, Building, RefreshCw } from 'lucide-react';

export const Profile = () => {
  const { user, refreshProfile } = useAuth();
  const [copiedId, setCopiedId] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await refreshProfile();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(user?.user_id || '');
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'customer':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background py-10" data-testid="profile-page">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="font-manrope font-bold text-4xl text-foreground mb-3" data-testid="profile-title">
              Profile
            </h1>
            <p className="text-muted-foreground text-lg">
              Your account information and preferences
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 border-accent text-accent hover:bg-accent hover:text-white transition-all font-bold"
            onClick={handleManualRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        {/* Profile Header Card with Avatar */}
        <Card className="border-border shadow-md mb-6">
          <CardContent className="p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="h-24 w-24 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center flex-shrink-0">
                <User className="h-12 w-12 text-accent" />
              </div>
              <div className="flex-1">
                <h2 className="font-manrope font-bold text-3xl text-foreground mb-2" data-testid="profile-name">
                  {user?.full_name}
                </h2>
                <div className="flex items-center gap-3">
                  <Badge className={`${getRoleBadgeColor(user?.role)} font-semibold text-sm`}>
                    {user?.role === 'admin' ? '⭐ Admin' : '👤 Customer'}
                  </Badge>
                  <p className="text-muted-foreground text-sm">Member since {user?.created_at ? formatDate(user.created_at) : 'N/A'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Information Card */}
        <Card className="border-border shadow-md mb-6">
          <CardHeader>
            <CardTitle className="font-manrope text-2xl flex items-center gap-2">
              <Mail className="h-5 w-5 text-accent" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="pb-5 border-b border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Email Address</p>
              <p className="font-mono text-lg text-foreground" data-testid="profile-email">{user?.email}</p>
            </div>

            <div className="pb-5 border-b border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Account Type</p>
              <div className="flex items-center gap-2">
                <p className="font-medium text-lg text-foreground capitalize" data-testid="profile-account-type">
                  {user?.account_type || 'Individual'}
                </p>
                <Badge variant={user?.account_type === 'business' ? 'default' : 'secondary'} className="text-[10px] uppercase font-bold">
                  {user?.account_type === 'business' ? 'B2B' : 'Standard'}
                </Badge>
              </div>
              {user?.account_type !== 'business' && (
                <p className="text-xs text-amber-600 mt-2 font-medium">
                  Note: Only approved Business accounts can place orders in the marketplace.
                </p>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Member Since</p>
              <p className="font-medium text-lg text-foreground" data-testid="profile-created-at">
                {user?.created_at ? formatDate(user.created_at) : 'N/A'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Approval Status Card */}
        <Card className="border-border shadow-md mb-6">
          <CardHeader>
            <CardTitle className="font-manrope text-2xl flex items-center gap-2">
              <Shield className="h-5 w-5 text-accent" />
              Account Verification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-secondary">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Approval Status</p>
                <div className="flex items-center gap-2">
                  {user?.is_approved ? (
                    <span className="flex items-center gap-1.5 text-green-600 font-bold">
                      <Shield className="h-4 w-4" /> Verified & Approved
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-amber-600 font-bold">
                      <Shield className="h-4 w-4" /> Pending Admin Approval
                    </span>
                  )}
                </div>
              </div>
              {!user?.is_approved && user?.account_type === 'business' && (
                <Badge className="bg-amber-100 text-amber-800 border-amber-200">Processing</Badge>
              )}
            </div>
            {!user?.is_approved && user?.account_type === 'business' && (
              <p className="text-xs text-muted-foreground mt-3 italic">
                Our team is currently reviewing your business credentials. This usually takes 24-48 hours.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Business Information Card */}
        {user?.company_name && (
          <Card className="border-border shadow-md mb-6">
            <CardHeader>
              <CardTitle className="font-manrope text-2xl flex items-center gap-2">
                <Building className="h-5 w-5 text-accent" />
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="pb-5 border-b border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Company Name</p>
                <p className="font-medium text-lg text-foreground truncate">{user.company_name}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pb-5 border-b border-border">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">GSTIN</p>
                  <p className="font-mono text-base text-foreground uppercase">{user.company_gstin || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">PAN</p>
                  <p className="font-mono text-base text-foreground uppercase">{user.company_pan || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Business Phone</p>
                  <p className="font-medium text-base text-foreground">{user.company_phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Registered Address</p>
                  <p className="font-medium text-base text-foreground truncate">{user.company_address || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* User ID Card with Copy */}
        <Card className="border-border shadow-md mb-6 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="font-manrope text-2xl flex items-center gap-2">
              <Shield className="h-5 w-5 text-accent" />
              User Identification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-secondary">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">User ID</p>
                <p className="font-mono text-sm text-foreground break-all" data-testid="profile-user-id">
                  {user?.user_id}
                </p>
              </div>
              <Button
                onClick={copyToClipboard}
                variant="ghost"
                size="sm"
                className="flex-shrink-0 ml-4"
                title="Copy User ID"
              >
                {copiedId ? (
                  <Check className="h-5 w-5 text-green-600" />
                ) : (
                  <Copy className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Card className="border-border shadow-md">
            <CardHeader>
              <CardTitle className="font-manrope text-lg">Account Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className="bg-green-100 text-green-800 font-semibold">✓ Active</Badge>
              <p className="text-sm text-muted-foreground mt-3">Your account is in good standing and fully functional</p>
            </CardContent>
          </Card>

          <Card className="border-border shadow-md">
            <CardHeader>
              <CardTitle className="font-manrope text-lg">Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Password Protection</p>
                <Badge className="bg-green-100 text-green-800 font-semibold">✓ Enabled</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
