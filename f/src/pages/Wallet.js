import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Wallet, TrendingUp, RefreshCw, Plus, ArrowUpRight, ArrowDownLeft, RotateCcw, CheckCircle2, IndianRupee, CreditCard, Shield } from 'lucide-react';
import { toast } from 'sonner';

export const WalletPage = () => {
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [topupAmount, setTopupAmount] = useState('');
    const [topupLoading, setTopupLoading] = useState(false);
    const [showTopup, setShowTopup] = useState(false);
    const [recentSuccess, setRecentSuccess] = useState(false);

    useEffect(() => {
        fetchWallet();
    }, []);

    const fetchWallet = async () => {
        try {
            const res = await api.get('/wallet');
            setBalance(res.data.balance);
            setTransactions(res.data.transactions || []);
        } catch (err) {
            toast.error('Failed to load wallet');
        } finally {
            setLoading(false);
        }
    };

    const handleTopup = async (e) => {
        e.preventDefault();
        const amount = parseFloat(topupAmount);
        if (!amount || amount <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }
        if (amount > 100000) {
            toast.error('Maximum top-up is ₹1,00,000 per transaction');
            return;
        }
        setTopupLoading(true);
        try {
            const res = await api.post('/wallet/topup', { amount });
            setBalance(res.data.balance);
            toast.success(res.data.detail);
            setTopupAmount('');
            setShowTopup(false);
            setRecentSuccess(true);
            setTimeout(() => setRecentSuccess(false), 3000);
            fetchWallet();
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Top-up failed');
        } finally {
            setTopupLoading(false);
        }
    };

    const QUICK_AMOUNTS = [500, 1000, 2500, 5000, 10000, 25000];

    const getTxnIcon = (type) => {
        switch (type) {
            case 'credit': return <ArrowDownLeft className="h-4 w-4 text-green-600" />;
            case 'debit': return <ArrowUpRight className="h-4 w-4 text-red-600" />;
            case 'refund': return <RotateCcw className="h-4 w-4 text-blue-600" />;
            default: return <RefreshCw className="h-4 w-4 text-muted-foreground" />;
        }
    };

    const getTxnBadgeColor = (type) => {
        switch (type) {
            case 'credit': return 'bg-green-100 text-green-700';
            case 'debit': return 'bg-red-100 text-red-700';
            case 'refund': return 'bg-blue-100 text-blue-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getTxnLabel = (type) => {
        switch (type) {
            case 'credit': return 'Top-up';
            case 'debit': return 'Payment';
            case 'refund': return 'Refund';
            default: return type;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="relative mx-auto mb-6 h-16 w-16">
                        <div className="absolute inset-0 rounded-2xl bg-accent/20 animate-ping" />
                        <div className="relative h-16 w-16 bg-accent/10 rounded-2xl flex items-center justify-center">
                            <Wallet className="h-8 w-8 text-accent" />
                        </div>
                    </div>
                    <p className="text-muted-foreground font-medium">Loading wallet...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-10" data-testid="wallet-page">
            <div className="max-w-2xl mx-auto px-4 sm:px-6">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="font-manrope font-bold text-4xl text-foreground mb-2 flex items-center gap-3">
                        <div className="h-12 w-12 bg-accent/10 rounded-2xl flex items-center justify-center">
                            <Wallet className="h-6 w-6 text-accent" />
                        </div>
                        My Wallet
                    </h1>
                    <p className="text-muted-foreground ml-15">Manage your balance and view transaction history</p>
                </div>

                {/* Balance Card */}
                <Card className={`mb-6 bg-gradient-to-br from-primary via-primary/95 to-primary/85 text-primary-foreground border-0 shadow-xl overflow-hidden relative ${recentSuccess ? 'ring-2 ring-green-400 ring-offset-2' : ''}`}>
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                    <CardContent className="p-8 relative">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-primary-foreground/60 text-xs font-semibold mb-1 uppercase tracking-widest">Available Balance</p>
                                <p className="font-manrope font-bold text-5xl mb-4 flex items-baseline gap-1" data-testid="wallet-balance">
                                    <span className="text-3xl">₹</span>
                                    {balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </p>
                                <div className="flex items-center gap-4 text-primary-foreground/70 text-sm">
                                    <span className="flex items-center gap-1.5">
                                        <Shield className="h-3.5 w-3.5" />
                                        Secure
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <TrendingUp className="h-3.5 w-3.5" />
                                        Instant payments
                                    </span>
                                </div>
                            </div>
                            <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                                <IndianRupee className="h-8 w-8 text-primary-foreground/80" />
                            </div>
                        </div>
                        <div className="mt-6 pt-5 border-t border-white/15 flex items-center gap-3">
                            <Button
                                onClick={() => setShowTopup(!showTopup)}
                                className="bg-white text-primary hover:bg-white/90 font-bold shadow-lg hover:shadow-xl transition-all"
                                data-testid="topup-btn"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Money
                            </Button>
                            {recentSuccess && (
                                <span className="flex items-center gap-1.5 text-green-300 text-sm font-medium animate-in fade-in duration-300">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Money added!
                                </span>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Top-up Form */}
                {showTopup && (
                    <Card className="mb-6 border-accent/20 shadow-lg animate-in slide-in-from-top-2 duration-200">
                        <CardHeader className="pb-3">
                            <CardTitle className="font-manrope text-xl flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-accent" />
                                Add Money to Wallet
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">Select a quick amount or enter a custom value</p>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleTopup} className="space-y-5">
                                {/* Quick amounts */}
                                <div>
                                    <Label className="text-xs font-bold text-muted-foreground mb-3 block uppercase tracking-wider">Quick Select</Label>
                                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                        {QUICK_AMOUNTS.map((amt) => (
                                            <button
                                                key={amt}
                                                type="button"
                                                onClick={() => setTopupAmount(String(amt))}
                                                className={`px-3 py-2.5 rounded-xl border text-sm font-bold transition-all duration-150 ${topupAmount === String(amt)
                                                    ? 'bg-accent text-accent-foreground border-accent shadow-md scale-105'
                                                    : 'bg-secondary/50 text-foreground border-border hover:border-accent/50 hover:bg-secondary'
                                                    }`}
                                            >
                                                ₹{amt >= 1000 ? `${amt / 1000}k` : amt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="topup-amount" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Custom Amount (₹)</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">₹</span>
                                        <Input
                                            id="topup-amount"
                                            type="number"
                                            min="1"
                                            max="100000"
                                            step="1"
                                            placeholder="Enter amount..."
                                            value={topupAmount}
                                            onChange={(e) => setTopupAmount(e.target.value)}
                                            className="text-lg font-semibold pl-8 h-12"
                                            data-testid="topup-amount-input"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-1">
                                    <Button
                                        type="submit"
                                        className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground font-bold h-12 text-base shadow-md"
                                        disabled={topupLoading || !topupAmount}
                                        data-testid="topup-submit-btn"
                                    >
                                        {topupLoading ? (
                                            <span className="flex items-center gap-2">
                                                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                                                Processing...
                                            </span>
                                        ) : (
                                            <>
                                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                                {`Add ₹${parseFloat(topupAmount || 0).toLocaleString('en-IN')}`}
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="h-12 px-6"
                                        onClick={() => { setShowTopup(false); setTopupAmount(''); }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Transactions */}
                <Card className="border-border shadow-md">
                    <CardHeader className="pb-4">
                        <CardTitle className="font-manrope text-xl flex items-center justify-between">
                            <span>Transaction History</span>
                            <Button variant="ghost" size="sm" onClick={fetchWallet} className="text-muted-foreground hover:text-accent gap-1.5">
                                <RefreshCw className="h-4 w-4" />
                                Refresh
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {transactions.length === 0 ? (
                            <div className="py-14 text-center">
                                <div className="inline-block p-5 bg-secondary/50 rounded-2xl mb-4">
                                    <Wallet className="h-10 w-10 text-muted-foreground/30 mx-auto" />
                                </div>
                                <p className="text-muted-foreground font-medium">No transactions yet</p>
                                <p className="text-muted-foreground/70 text-sm mt-1">Add money or place an order to get started</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border" data-testid="txn-list">
                                {transactions.map((txn) => (
                                    <div key={txn.txn_id} className="py-4 flex items-center justify-between group hover:bg-secondary/20 -mx-6 px-6 transition-colors" data-testid={`txn-${txn.txn_id}`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${txn.type === 'credit' ? 'bg-green-100' :
                                                txn.type === 'refund' ? 'bg-blue-100' : 'bg-red-100'
                                                }`}>
                                                {getTxnIcon(txn.type)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-foreground text-sm leading-tight">{txn.description}</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    {new Date(txn.created_at).toLocaleString('en-IN', {
                                                        day: '2-digit', month: 'short', year: 'numeric',
                                                        hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-manrope font-bold text-base ${txn.type === 'debit' ? 'text-red-600' : 'text-green-600'
                                                }`}>
                                                {txn.type === 'debit' ? '-' : '+'}₹{txn.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </p>
                                            <Badge className={`${getTxnBadgeColor(txn.type)} text-xs font-medium border-0 mt-1`}>
                                                {getTxnLabel(txn.type)}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

            </div>
        </div>
    );
};
