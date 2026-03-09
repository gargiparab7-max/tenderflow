import React from 'react';
import { Package, Mail, MapPin, Phone } from 'lucide-react';

export const Footer = () => {
    return (
        <footer className="bg-primary text-primary-foreground border-t border-accent/20 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Package className="h-6 w-6 text-accent" />
                            <span className="font-manrope font-bold text-xl">TenderFlow</span>
                        </div>
                        <p className="text-secondary-foreground/80 text-sm">
                            The professional platform for tender management and procurement excellence.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-manrope font-semibold text-lg mb-4">Platform</h3>
                        <ul className="space-y-2 text-sm text-white/80">
                            <li><a href="/marketplace" className="hover:text-accent transition-colors">Marketplace</a></li>
                            <li><a href="/how-it-works" className="hover:text-accent transition-colors">How it Works</a></li>
                            <li><a href="/pricing" className="hover:text-accent transition-colors">Pricing</a></li>
                            <li><a href="/success-stories" className="hover:text-accent transition-colors">Success Stories</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-manrope font-semibold text-lg mb-4">Company</h3>
                        <ul className="space-y-2 text-sm text-white/80">
                            <li><a href="/about" className="hover:text-accent transition-colors">About Us</a></li>
                            <li><a href="/careers" className="hover:text-accent transition-colors">Careers</a></li>
                            <li><a href="/press" className="hover:text-accent transition-colors">Press</a></li>
                            <li><a href="/contact" className="hover:text-accent transition-colors">Contact</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-manrope font-semibold text-lg mb-4">Contact Us</h3>
                        <ul className="space-y-3 text-sm text-white/80">
                            <li className="flex items-center space-x-3">
                                <Mail className="h-4 w-4 text-accent" />
                                <span>tenderfloww@gmail.com</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <Phone className="h-4 w-4 text-accent" />
                                <span>+1 (555) 123-4567</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <MapPin className="h-4 w-4 text-accent" />
                                <span>123 Business Avenue, Tech Hub</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-accent/10 mt-12 pt-8 text-center text-sm text-white/60">
                    <p>&copy; {new Date().getFullYear()} TenderFlow. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};
