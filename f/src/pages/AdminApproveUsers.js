import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { UserCheck, UserX, Building, Mail, Phone, MapPin, ShieldAlert, Loader2, CheckCircle2, Users } from 'lucide-react';

export const AdminApproveUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        fetchPendingUsers();
    }, []);

    const fetchPendingUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/users/pending');
            setUsers(response.data);
        } catch (error) {
            toast.error('Failed to load pending users');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (userId) => {
        setProcessingId(userId);
        try {
            await api.post(`/admin/users/${userId}/approve`);
            toast.success('Account approved successfully');
            setUsers(users.filter(u => u.user_id !== userId));
        } catch (error) {
            toast.error('Approval failed');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (userId) => {
        if (!window.confirm('Are you sure you want to reject this business account?')) return;
        setProcessingId(userId);
        try {
            await api.post(`/admin/users/${userId}/reject`);
            toast.warning('Account rejected');
            setUsers(users.filter(u => u.user_id !== userId));
        } catch (error) {
            toast.error('Update failed');
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-10 w-10 text-accent animate-spin" />
                <p className="text-muted-foreground animate-pulse">Loading KYC requests...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-secondary/10 py-10">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="font-manrope font-bold text-4xl text-foreground mb-2 flex items-center gap-3">
                            <ShieldAlert className="h-10 w-10 text-accent" />
                            KYC & Account Approvals
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Review and verify business registrations for platform access
                        </p>
                    </div>
                    <Badge variant="outline" className="px-4 py-1 text-lg border-accent/20 text-accent bg-accent/5">
                        {users.length} Pending Requests
                    </Badge>
                </div>

                {users.length === 0 ? (
                    <Card className="border-dashed border-2 py-20 text-center">
                        <CardContent className="space-y-4">
                            <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle2 className="h-10 w-10 text-green-600" />
                            </div>
                            <div className="space-y-1">
                                <p className="font-manrope font-bold text-2xl text-foreground">All Caught Up!</p>
                                <p className="text-muted-foreground">There are no pending user verification requests at the moment.</p>
                            </div>
                            <Button onClick={fetchPendingUsers} variant="outline" className="mt-4">
                                Refresh Queue
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6">
                        {users.map((user) => (
                            <Card key={user.user_id} className="border-border shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group">
                                <div className="flex flex-col lg:flex-row">
                                    {/* Left Section: User & Account Type */}
                                    <div className="p-6 bg-accent/5 w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-border">
                                        <div className="space-y-4">
                                            <div className="h-16 w-16 bg-accent/10 rounded-2xl flex items-center justify-center">
                                                <Users className="h-8 w-8 text-accent" />
                                            </div>
                                            <div>
                                                <h3 className="font-manrope font-bold text-xl text-foreground line-clamp-1">{user.full_name}</h3>
                                                <p className="text-sm text-muted-foreground mb-3">{user.email}</p>
                                                <Badge className={`${user.account_type === 'business'
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-secondary text-secondary-foreground'
                                                    } font-bold rounded-md px-3 py-1 uppercase text-[10px] tracking-widest`}>
                                                    {user.account_type || 'B2B ACCOUNT'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Section: Details & Actions */}
                                    <div className="flex-1 p-6">
                                        <div className="grid md:grid-cols-2 gap-8 mb-6">
                                            <div className="space-y-4">
                                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                                    <Building className="h-3.5 w-3.5" /> Company Information
                                                </h4>
                                                <div className="space-y-3">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs text-muted-foreground">Entity Name</span>
                                                        <span className="font-semibold">{user.company_name || 'Individual Registration'}</span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-xs text-muted-foreground">GSTIN</span>
                                                            <span className="font-mono text-sm font-bold text-accent">{user.company_gstin || 'N/A'}</span>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-xs text-muted-foreground">PAN</span>
                                                            <span className="font-mono text-sm font-bold text-foreground">{user.company_pan || 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                                    <MapPin className="h-3.5 w-3.5" /> Contact & Logistics
                                                </h4>
                                                <div className="space-y-3 text-sm">
                                                    <div className="flex items-center gap-2 text-foreground">
                                                        <Phone className="h-3.5 w-3.5 text-accent" />
                                                        <span>{user.company_phone || user.phone || 'No phone provided'}</span>
                                                    </div>
                                                    <div className="flex items-start gap-2 text-foreground">
                                                        <MapPin className="h-3.5 w-3.5 text-accent mt-0.5" />
                                                        <span className="leading-relaxed">{user.company_address || 'No registered address provided'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center justify-between pt-6 border-t border-border gap-4">
                                            <p className="text-xs text-muted-foreground italic">
                                                Requested on {new Date(user.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </p>
                                            <div className="flex items-center gap-3">
                                                <Button
                                                    variant="outline"
                                                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-semibold h-11 px-6 transition-colors"
                                                    onClick={() => handleReject(user.user_id)}
                                                    disabled={processingId === user.user_id}
                                                >
                                                    {processingId === user.user_id ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <UserX className="h-4 w-4 mr-2" />}
                                                    Reject Account
                                                </Button>
                                                <Button
                                                    className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold h-11 px-8 shadow-lg shadow-accent/10 transition-all hover:translate-y-[-2px] active:translate-y-[0px]"
                                                    onClick={() => handleApprove(user.user_id)}
                                                    disabled={processingId === user.user_id}
                                                >
                                                    {processingId === user.user_id ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <UserCheck className="h-4 w-4 mr-2" />}
                                                    Approve Account
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
