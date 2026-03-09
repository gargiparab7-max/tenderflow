import React from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';

export default function Contact() {
    const handleSubmit = (e) => {
        e.preventDefault();
        toast.success('Message sent! Our team will get back to you shortly.');
        e.target.reset();
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
                <div className="grid lg:grid-cols-2 gap-16">
                    <div>
                        <h1 className="font-manrope font-bold text-5xl mb-6">Get in Touch</h1>
                        <p className="text-xl text-muted-foreground mb-12">
                            Have questions about our verification process or marketplace? We're here to help you navigate the future of procurement.
                        </p>

                        <div className="space-y-8">
                            <div className="flex items-start gap-4">
                                <div className="h-12 w-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent flex-shrink-0">
                                    <Mail className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Email Us</h3>
                                    <p className="text-muted-foreground">For general inquiries and support</p>
                                    <a href="mailto:tenderfloww@gmail.com" className="text-accent font-bold mt-1 inline-block">tenderfloww@gmail.com</a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="h-12 w-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent flex-shrink-0">
                                    <Phone className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Call Us</h3>
                                    <p className="text-muted-foreground">Mon-Fri from 9am to 6pm</p>
                                    <p className="font-bold text-foreground mt-1">+1 (555) 123-4567</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="h-12 w-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent flex-shrink-0">
                                    <MapPin className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Visit Us</h3>
                                    <p className="text-muted-foreground">Our corporate headquarters</p>
                                    <p className="font-bold text-foreground mt-1">123 Business Avenue, Tech Hub, Mumbai</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-border">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>First Name</Label>
                                    <Input placeholder="John" required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Last Name</Label>
                                    <Input placeholder="Doe" required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Email Address</Label>
                                <Input type="email" placeholder="john@example.com" required />
                            </div>
                            <div className="space-y-2">
                                <Label>Message</Label>
                                <textarea
                                    className="w-full h-32 p-4 rounded-xl border border-border focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none bg-background resize-none text-sm"
                                    placeholder="How can we help you?"
                                    required
                                ></textarea>
                            </div>
                            <Button type="submit" className="w-full h-14 bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-lg rounded-xl shadow-lg">
                                <Send className="h-5 w-5 mr-2" /> Send Message
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
