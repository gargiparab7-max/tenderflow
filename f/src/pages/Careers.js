import React from 'react';
import { Briefcase, MapPin, Search } from 'lucide-react';

export default function Careers() {
    const jobs = [
        { title: "Senior Backend Developer", dept: "Engineering", type: "Full-time", loc: "Remote" },
        { title: "Product Designer", dept: "Product", type: "Full-time", loc: "Mumbai, India" },
        { title: "Compliance Manager", dept: "Operations", type: "Full-time", loc: "Delhi, India" }
    ];

    return (
        <div className="min-h-screen bg-background">
            <div className="bg-secondary/10 py-24 text-center">
                <h1 className="font-manrope font-bold text-5xl mb-6">Join the Revolution</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto px-4">
                    Help us build the future of digital procurement and tender management.
                </p>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="flex flex-col md:flex-row gap-4 mb-12">
                    <div className="flex-grow relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <input type="text" placeholder="Search roles..." className="w-full pl-12 pr-4 py-4 rounded-xl border border-border bg-white outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" />
                    </div>
                </div>

                <div className="space-y-4">
                    {jobs.map((job, i) => (
                        <div key={i} className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between hover:shadow-md hover:border-accent/40 transition-all cursor-pointer group">
                            <div className="space-y-2 mb-4 md:mb-0">
                                <h3 className="font-manrope font-bold text-xl group-hover:text-accent transition-colors">{job.title}</h3>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /> {job.dept}</span>
                                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {job.loc}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1 bg-secondary text-primary font-bold text-[10px] uppercase rounded-full tracking-wider">{job.type}</span>
                                <button className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-accent hover:text-accent-foreground transition-all">Apply</button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-20">
                    <div className="bg-gradient-to-br from-primary to-primary/90 p-12 rounded-[2rem] text-primary-foreground flex flex-col items-center">
                        <h2 className="font-manrope font-bold text-3xl mb-4">Don't see a fit?</h2>
                        <p className="text-primary-foreground/80 mb-8 max-w-lg text-center">We're always looking for talented individuals. Send your CV to tenderfloww@gmail.com and we'll keep you in mind.</p>
                        <a href="mailto:tenderfloww@gmail.com" className="px-10 py-4 bg-accent text-accent-foreground font-bold rounded-xl hover:scale-105 transition-all">General Application</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
