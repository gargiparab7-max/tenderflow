import React from 'react';
import { Newspaper, ArrowRight, Download } from 'lucide-react';

export default function Press() {
    const news = [
        {
            date: "Feb 24, 2024",
            title: "TenderFlow Reaches 1,000 Verified B2B Accounts",
            desc: "Our platform continues to see rapid adoption as businesses seek digital alternatives for procurement."
        },
        {
            date: "Jan 12, 2024",
            title: "Digital Wallets Integration Complete",
            desc: "TenderFlow now supports secure digital payments with automated tax settlement for all marketplace tenders."
        }
    ];

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <header className="mb-16 border-b pb-12">
                    <h1 className="font-manrope font-bold text-5xl mb-4">Under the Spotlight</h1>
                    <p className="text-xl text-muted-foreground">The latest news and announcements from the TenderFlow team.</p>
                </header>

                <div className="grid lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-12">
                        {news.map((item, i) => (
                            <article key={i} className="group cursor-pointer">
                                <span className="text-accent text-sm font-bold uppercase tracking-widest">{item.date}</span>
                                <h3 className="font-manrope font-bold text-3xl mt-2 mb-4 group-hover:text-accent transition-colors">{item.title}</h3>
                                <p className="text-muted-foreground leading-relaxed mb-6">{item.desc}</p>
                                <div className="flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all underline underline-offset-4 decoration-accent/30">
                                    Read Full Release <ArrowRight className="h-4 w-4" />
                                </div>
                            </article>
                        ))}
                    </div>

                    <aside className="space-y-8">
                        <div className="bg-secondary/20 p-8 rounded-2xl border border-border">
                            <h3 className="font-manrope font-bold text-xl mb-4 flex items-center gap-2">
                                <Newspaper className="h-5 w-5 text-accent" /> Media Links
                            </h3>
                            <ul className="space-y-4">
                                <li>
                                    <button className="w-full flex items-center justify-between p-3 bg-white rounded-lg border border-border hover:border-accent transition-colors">
                                        <span className="text-sm font-medium">Media Kit 2024</span>
                                        <Download className="h-4 w-4 text-muted-foreground" />
                                    </button>
                                </li>
                                <li>
                                    <button className="w-full flex items-center justify-between p-3 bg-white rounded-lg border border-border hover:border-accent transition-colors">
                                        <span className="text-sm font-medium">Brand Guidelines</span>
                                        <Download className="h-4 w-4 text-muted-foreground" />
                                    </button>
                                </li>
                            </ul>
                        </div>

                        <div className="p-8 bg-primary rounded-2xl text-primary-foreground">
                            <h3 className="font-bold text-lg mb-2">Media Inquiries</h3>
                            <p className="text-sm opacity-80 mb-4">For interview requests or press data, please contact our PR team.</p>
                            <a href="mailto:tenderfloww@gmail.com" className="text-accent font-bold text-sm underline">tenderfloww@gmail.com</a>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
