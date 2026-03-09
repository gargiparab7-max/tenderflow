import React from 'react';
import { Quote, ExternalLink } from 'lucide-react';

export default function SuccessStories() {
    const stories = [
        {
            company: "TechInfrastructure Solutions",
            achivement: "Secured ₹50L Bridge Project",
            story: "Through TenderFlow's marketplace, we discovered a government tender that perfectly matched our specialized hardware capabilities. The transparent bidding process allowed us to showcase our value effectively.",
            author: "Rajesh Kumar, CEO"
        },
        {
            company: "GreenEnergy Systems",
            achivement: "Expanded Operations by 40%",
            story: "The secure wallet system and automated GST calculations saved us weeks of administrative work. We can now focus on fulfilling orders instead of managing paperwork.",
            author: "Sonia Mehta, Ops Lead"
        }
    ];

    return (
        <div className="min-h-screen bg-background">
            <div className="bg-primary py-24 text-primary-foreground">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="font-manrope font-bold text-5xl mb-6">Success Stories</h1>
                    <p className="text-xl opacity-80 max-w-2xl mx-auto">
                        Discover how businesses are leveraging TenderFlow to reach new heights and streamline their procurement.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid md:grid-cols-2 gap-12">
                    {stories.map((s, i) => (
                        <div key={i} className="bg-white p-10 rounded-3xl shadow-xl border border-border relative overflow-hidden group hover:border-accent transition-colors">
                            <Quote className="absolute -top-4 -right-4 h-32 w-32 text-accent/5 group-hover:text-accent/10 transition-colors" />
                            <div className="relative z-10">
                                <div className="bg-accent/10 text-accent px-4 py-1 rounded-full text-xs font-bold inline-block mb-6 uppercase tracking-wider">
                                    {s.achivement}
                                </div>
                                <h3 className="font-manrope font-bold text-2xl mb-4 text-foreground">{s.company}</h3>
                                <p className="text-muted-foreground leading-relaxed italic mb-8">
                                    "{s.story}"
                                </p>
                                <div className="border-t pt-6">
                                    <p className="font-bold text-foreground">{s.author}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-20 bg-secondary/20 p-12 rounded-[2rem] text-center border-2 border-dashed border-border">
                    <h2 className="font-manrope font-bold text-3xl mb-4">Want to share your story?</h2>
                    <p className="text-muted-foreground mb-8 text-lg">We love seeing our partners grow. Tell us how TenderFlow helped your business.</p>
                    <a href="/contact" className="text-accent font-bold flex items-center justify-center gap-2 hover:gap-3 transition-all">
                        Contact Support <ExternalLink className="h-4 w-4" />
                    </a>
                </div>
            </div>
        </div>
    );
}
