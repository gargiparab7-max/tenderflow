import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ShieldCheck, Clock, TrendingUp, ArrowRight, Package, Users, Zap, BarChart3, CheckCircle2 } from 'lucide-react';
import { getAuthData } from '../utils/auth';

export const Landing = () => {
  const { user } = getAuthData();

  return (
    <div className="min-h-screen bg-background" data-testid="landing-page">
      {/* Hero Section */}
      <section
        className="relative bg-cover bg-center min-h-[700px] flex items-center overflow-hidden"
        style={{ backgroundImage: 'url(https://images.pexels.com/photos/35499843/pexels-photo-35499843.jpeg)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/90 to-primary/80"></div>

        {/* Floating decorative shapes */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-accent/60 rounded-full animate-ping" />
        <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-white/40 rounded-full animate-ping" style={{ animationDelay: '1s' }} />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white/90 text-sm font-medium mb-8">
            <Zap className="h-4 w-4 text-accent" />
            B2B Procurement Platform
          </div>

          <h1 className="font-manrope font-bold text-5xl md:text-6xl xl:text-7xl text-primary-foreground mb-6 leading-tight" data-testid="hero-title">
            Professional Tender
            <span className="block text-accent">Management</span>
          </h1>
          <p className="text-xl md:text-2xl text-primary-foreground/80 mb-10 max-w-3xl mx-auto leading-relaxed font-light">
            Streamline your procurement with our modern platform. Discover, manage, and track tenders efficiently.
          </p>
          {user ? (
            <Link to={user.role === 'admin' ? '/admin/dashboard' : '/marketplace'}>
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg font-bold px-10 py-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200" data-testid="hero-dashboard-btn">
                Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          ) : (
            <div className="flex gap-4 justify-center flex-wrap">
              <Link to="/register">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg font-bold px-10 py-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200" data-testid="hero-get-started-btn">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/marketplace">
                <Button size="lg" variant="outline" className="text-lg font-semibold px-10 py-6 bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50 shadow-lg backdrop-blur-sm" data-testid="hero-browse-btn">
                  Browse Tenders
                </Button>
              </Link>
            </div>
          )}

          {/* Trust indicators */}
          <div className="mt-14 flex items-center justify-center gap-8 text-primary-foreground/50 text-sm flex-wrap">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-green-400" /> Verified Suppliers</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-blue-400" /> Secure Payments</span>
            <span className="flex items-center gap-1.5"><Users className="h-4 w-4 text-purple-400" /> B2B Focused</span>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-0 -mt-12 relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-xl bg-white hover:scale-105 transition-transform duration-200">
              <CardContent className="p-6 text-center">
                <p className="font-manrope font-bold text-4xl text-accent mb-1">500+</p>
                <p className="text-muted-foreground text-sm font-medium">Active Tenders</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-xl bg-white hover:scale-105 transition-transform duration-200">
              <CardContent className="p-6 text-center">
                <p className="font-manrope font-bold text-4xl text-accent mb-1">₹50Cr+</p>
                <p className="text-muted-foreground text-sm font-medium">Transaction Volume</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-xl bg-white hover:scale-105 transition-transform duration-200">
              <CardContent className="p-6 text-center">
                <p className="font-manrope font-bold text-4xl text-accent mb-1">200+</p>
                <p className="text-muted-foreground text-sm font-medium">Verified Businesses</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-accent/10 rounded-full text-accent text-sm font-bold mb-4 uppercase tracking-wider">Features</span>
            <h2 className="font-manrope font-bold text-4xl md:text-5xl text-foreground mb-4" data-testid="features-title">
              Why Choose TenderFlow?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need for professional tender management in one place
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-border shadow-md hover:shadow-xl hover:border-accent/30 hover:-translate-y-1 transition-all duration-300 h-full group" data-testid="feature-card-1">
              <CardHeader>
                <div className="h-14 w-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Package className="h-7 w-7 text-blue-600" />
                </div>
                <CardTitle className="font-manrope text-xl">Wide Selection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Access a comprehensive range of industrial equipment and tools through our tender marketplace.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border shadow-md hover:shadow-xl hover:border-accent/30 hover:-translate-y-1 transition-all duration-300 h-full group" data-testid="feature-card-2">
              <CardHeader>
                <div className="h-14 w-14 bg-green-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <ShieldCheck className="h-7 w-7 text-green-600" />
                </div>
                <CardTitle className="font-manrope text-xl">Secure Platform</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Your data and transactions are protected with enterprise-grade security measures.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border shadow-md hover:shadow-xl hover:border-accent/30 hover:-translate-y-1 transition-all duration-300 h-full group" data-testid="feature-card-3">
              <CardHeader>
                <div className="h-14 w-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Clock className="h-7 w-7 text-purple-600" />
                </div>
                <CardTitle className="font-manrope text-xl">Real-time Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Stay informed with instant notifications and real-time tender status updates.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border shadow-md hover:shadow-xl hover:border-accent/30 hover:-translate-y-1 transition-all duration-300 h-full group" data-testid="feature-card-4">
              <CardHeader>
                <div className="h-14 w-14 bg-orange-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="h-7 w-7 text-orange-600" />
                </div>
                <CardTitle className="font-manrope text-xl">Analytics Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Track your orders and performance with comprehensive analytics and insights.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-secondary/30 border-y border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-accent/10 rounded-full text-accent text-sm font-bold mb-4 uppercase tracking-wider">Process</span>
            <h2 className="font-manrope font-bold text-4xl md:text-5xl text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground">Get started in three simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Register & Verify', desc: 'Create your B2B account and complete KYC verification for full access.' },
              { step: '02', title: 'Browse & Select', desc: 'Explore our marketplace of verified tenders and find the best procurement deals.' },
              { step: '03', title: 'Order & Track', desc: 'Place orders with wallet payments and track them in real-time on your dashboard.' },
            ].map((item, i) => (
              <div key={i} className="text-center group">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-accent text-accent-foreground font-manrope font-bold text-xl mb-5 shadow-lg group-hover:scale-110 transition-transform duration-200">
                  {item.step}
                </div>
                <h3 className="font-manrope font-bold text-xl text-foreground mb-3">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-primary via-primary/95 to-primary/85 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="font-manrope font-bold text-4xl md:text-5xl text-primary-foreground mb-6" data-testid="cta-title">
            Ready to Transform Your Procurement?
          </h2>
          <p className="text-lg text-primary-foreground/70 mb-10 max-w-2xl mx-auto">
            Join businesses using TenderFlow for efficient tender management and seamless procurement
          </p>
          {!user && (
            <Link to="/register">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg font-bold px-10 py-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200" data-testid="cta-register-btn">
                Create Free Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};
