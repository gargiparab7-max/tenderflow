import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import {
    Users,
    UserCog,
    Building,
    User,
    ShieldCheck,
    ShieldAlert,
    Mail,
    Search,
    ChevronRight,
    Loader2,
    ToggleLeft,
    ToggleRight
} from 'lucide-react';

export const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/users');
            setUsers(response.data);
        } catch (error) {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleType = async (userId, currentType) => {
        const newType = currentType === 'business' ? 'individual' : 'business';
        const confirmMsg = `Are you sure you want to change this account to ${newType}? ${newType === 'individual' ? 'It will be auto-approved.' : 'It will require admin approval again.'}`;

        if (!window.confirm(confirmMsg)) return;

        setProcessingId(userId);
        try {
            await api.put(`/admin/users/${userId}/account-type`, { account_type: newType });
            toast.success(`Account changed to ${newType}`);
            // Refresh local state
            setUsers(users.map(u =>
                u.user_id === userId
                    ? { ...u, account_type: newType, is_approved: newType === 'individual' }
                    : u
            ));
        } catch (error) {
            toast.error('Update failed');
        } finally {
            setProcessingId(null);
        }
    };

    const filteredUsers = users.filter(u =>
        u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 text-accent animate-spin mb-4" />
                <p className="text-muted-foreground">Fetching user directory...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-secondary/10 py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="font-manrope font-bold text-4xl text-foreground mb-2 flex items-center gap-3">
                            <UserCog className="h-10 w-10 text-accent" />
                            User Management
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Manage account types and verification statuses for all users
                        </p>
                    </div>

                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search names, emails or companies..."
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-white outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid gap-4">
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                            <Card key={user.user_id} className="border-border hover:shadow-md transition-shadow overflow-hidden group">
                                <CardContent className="p-0">
                                    <div className="flex flex-col lg:flex-row lg:items-center">
                                        {/* Profile Info */}
                                        <div className="p-6 lg:w-1/3 flex items-center gap-4 border-b lg:border-b-0 lg:border-r border-border">
                                            <div className="h-12 w-12 bg-accent/10 rounded-full flex items-center justify-center text-accent">
                                                {user.account_type === 'business' ? <Building className="h-6 w-6" /> : <User className="h-6 w-6" />}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-lg truncate">{user.full_name}</h3>
                                                <p className="text-sm text-muted-foreground flex items-center gap-1 truncate">
                                                    <Mail className="h-3 w-3" /> {user.email}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Status & Type */}
                                        <div className="p-6 lg:flex-1 grid grid-cols-2 lg:grid-cols-3 items-center gap-4">
                                            <div>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Account Type</p>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant={user.account_type === 'business' ? 'default' : 'secondary'} className="uppercase font-bold text-[10px]">
                                                        {user.account_type}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Approval Status</p>
                                                <div className="flex items-center gap-2">
                                                    {user.is_approved ? (
                                                        <span className="flex items-center gap-1.5 text-green-600 text-sm font-semibold">
                                                            <ShieldCheck className="h-4 w-4" /> Approved
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1.5 text-amber-600 text-sm font-semibold">
                                                            <ShieldAlert className="h-4 w-4" /> Pending
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="col-span-2 lg:col-span-1 border-t lg:border-t-0 pt-4 lg:pt-0">
                                                {user.account_type === 'business' && (
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-bold text-muted-foreground mb-1 uppercase">Entity</span>
                                                        <span className="text-sm font-medium truncate">{user.company_name || 'N/A'}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action buttons */}
                                        <div className="p-4 lg:p-6 bg-secondary/20 flex lg:flex-row gap-3 items-center justify-end">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="bg-white hover:bg-white/80 border-accent/20 text-accent font-bold gap-2 text-xs h-9"
                                                onClick={() => handleToggleType(user.user_id, user.account_type)}
                                                disabled={processingId === user.user_id}
                                            >
                                                {processingId === user.user_id ? (
                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                ) : (
                                                    user.account_type === 'business' ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />
                                                )}
                                                {user.account_type === 'business' ? 'Remove Business' : 'Make Business'}
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <Card className="p-20 text-center border-dashed border-2">
                            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                            <p className="text-muted-foreground">No users found matching your search.</p>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};
