import React from 'react';
import { UserPlus, Search, Gavel, CheckCircle } from 'lucide-react';

export default function HowItWorks() {
    const steps = [
        {
            icon: <UserPlus className="h-8 w-8 text-accent" />,
            title: "1. Create Account",
            desc: "Register as an Individual to browse, or as a Business for full bidding capabilities. Business accounts undergo KYC verification."
        },
        {
            icon: <Search className="h-8 w-8 text-accent" />,
            title: "2. Discover Tenders",
            desc: "Use our advanced marketplace to filter and find tenders that match your category, budget, and business expertise."
        },
        {
            icon: <Gavel className="h-8 w-8 text-accent" />,
            title: "3. Place Your Bid",
            desc: "Submit your proposals directly through the platform. Manage your budget using our integrated secure wallet system."
        },
        {
            icon: <CheckCircle className="h-8 w-8 text-accent" />,
            title: "4. Win & Execute",
            desc: "Our automated system handles confirmations, tax calculations (GST/CGST), and provides professional payment slips."
        }
    ];

    return (
        <div className="min-h-screen bg-secondary/5 pt-20 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-20">
                    <h1 className="font-manrope font-bold text-5xl mb-6">Simple, Transparent Process</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        From discovery to delivery, we've streamlined the procurement cycle into four simple steps.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
                    <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-accent/10 -translate-y-1/2 -z-10" />

                    {steps.map((step, i) => (
                        <div key={i} className="bg-white p-8 rounded-3xl shadow-lg border border-border group hover:border-accent transition-all duration-300">
                            <div className="h-16 w-16 bg-accent/5 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                                {step.icon}
                            </div>
                            <h3 className="font-manrope font-bold text-2xl mb-4">{step.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-32 bg-primary rounded-[3rem] p-12 lg:p-20 text-center text-primary-foreground relative overflow-hidden">
                    <div className="relative z-10 max-w-3xl mx-auto">
                        <h2 className="font-manrope font-bold text-4xl mb-8">Ready to grow your business?</h2>
                        <p className="text-lg opacity-80 mb-10 leading-relaxed">
                            Join thousands of businesses that trust TenderFlow for their procurement needs. Create your account today and start discovering opportunities.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a href="/register" className="px-10 py-4 bg-accent text-accent-foreground font-bold rounded-xl hover:scale-105 transition-transform">Get Started Now</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
