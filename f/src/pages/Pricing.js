import React from 'react';
import { Check, Info } from 'lucide-react';

export default function Pricing() {
    const plans = [
        {
            name: "Individual",
            price: "0",
            desc: "For small visitors and browsers",
            features: ["Browse Markets", "Project Visibility", "Email Notifications", "Basic Dashboard"]
        },
        {
            name: "Business",
            price: "Contact",
            isPopular: true,
            desc: "For verified B2B organizations",
            features: ["Bid Submission", "Secure Wallet Access", "GST Compliant Invoices", "KYC Priority Verification", "Order Management"]
        }
    ];

    return (
        <div className="min-h-screen bg-background py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="font-manrope font-bold text-5xl mb-6">Simple Pricing</h1>
                    <p className="text-xl text-muted-foreground">Verification is free. Pay only for what you win.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {plans.map((plan, i) => (
                        <div key={i} className={`p-10 rounded-[2rem] border-2 transition-all duration-300 ${plan.isPopular ? 'border-accent bg-accent/5' : 'border-border bg-white shadow-xl'}`}>
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h3 className="font-manrope font-bold text-2xl mb-2">{plan.name}</h3>
                                    <p className="text-muted-foreground text-sm">{plan.desc}</p>
                                </div>
                                {plan.isPopular && <span className="px-3 py-1 bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-wider rounded-full">POPULAR</span>}
                            </div>

                            <div className="mb-8">
                                <span className="text-4xl font-bold">₹{plan.price}</span>
                                {plan.price !== "Contact" && <span className="text-muted-foreground">/month</span>}
                            </div>

                            <div className="space-y-4 mb-10">
                                {plan.features.map((f, idx) => (
                                    <div key={idx} className="flex items-center gap-3 text-sm font-medium">
                                        <Check className="h-4 w-4 text-accent" />
                                        {f}
                                    </div>
                                ))}
                            </div>

                            <a
                                href="/register"
                                className={`w-full block text-center py-4 rounded-xl font-bold transition-all ${plan.isPopular ? 'bg-accent text-accent-foreground hover:scale-[1.02]' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}
                            >
                                {plan.price === "Contact" ? "Verify Now" : "Sign Up For Free"}
                            </a>
                        </div>
                    ))}
                </div>

                <div className="mt-20 p-8 rounded-2xl bg-secondary/30 flex items-start gap-4 max-w-4xl mx-auto border border-border">
                    <Info className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        <strong>Bidding Fee:</strong> While accounts are free, winning bids are subject to a standard platform fee of 2.5% per successful tender execution, which includes all digital document safeguarding and tax processing services.
                    </p>
                </div>
            </div>
        </div>
    );
}
