import React from 'react';
import { Shield, Target, Users, Award } from 'lucide-react';

export default function About() {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="bg-primary pt-20 pb-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-primary-foreground">
                    <h1 className="font-manrope font-bold text-5xl mb-6">Empowering Procurement Excellence</h1>
                    <p className="text-xl opacity-90 max-w-2xl mx-auto">
                        TenderFlow is the leading digital ecosystem for B2B tender management, connecting ambitious businesses with reliable suppliers.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
                <div className="grid md:grid-cols-4 gap-6">
                    {[
                        { icon: <Target className="h-6 w-6" />, title: 'Mission', desc: 'To democratize the bidding process for businesses of all sizes.' },
                        { icon: <Shield className="h-6 w-6" />, title: 'Trust', desc: 'Building a secure environment through rigorous KYC verification.' },
                        { icon: <Users className="h-6 w-6" />, title: 'Network', desc: 'Connecting over 5,000 active businesses across the country.' },
                        { icon: <Award className="h-6 w-6" />, title: 'Quality', desc: 'Ensuring only verified high-quality tenders are listed.' },
                    ].map((item, i) => (
                        <div key={i} className="bg-white p-8 rounded-2xl shadow-xl border border-border">
                            <div className="h-12 w-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent mb-6">
                                {item.icon}
                            </div>
                            <h3 className="font-manrope font-bold text-xl mb-2">{item.title}</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="py-24 grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-6">
                        <h2 className="font-manrope font-bold text-4xl">Our Journey</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Founded in 2024, TenderFlow emerged with a single goal: to solve the complexity of traditional procurement. We noticed that small and medium enterprises often struggled to find valid tender opportunities, while larger entities faced challenges in supplier verification.
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                            Today, we serve as the bridge between supply and demand, providing a transparent, automated, and secure platform for tender management.
                        </p>
                    </div>
                    <div className="relative">
                        <div className="aspect-square bg-accent/5 rounded-3xl border-2 border-dashed border-accent/20 flex items-center justify-center p-8">
                            <div className="text-center">
                                <p className="text-6xl font-bold text-accent mb-2">2024</p>
                                <p className="text-muted-foreground uppercase tracking-widest font-bold">Launch Year</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
