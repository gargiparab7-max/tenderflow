import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../utils/api';
import { setAuthData } from '../utils/auth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import { Package } from 'lucide-react';

export const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/login', formData);
      const { access_token, user } = response.data;
      
      setAuthData(access_token, user);
      toast.success('Login successful!');
      
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/marketplace');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background" data-testid="login-page">
      {/* Left side - Image */}
      <div 
        className="hidden lg:flex items-center justify-center bg-cover bg-center relative"
        style={{ backgroundImage: 'url(https://images.pexels.com/photos/699459/pexels-photo-699459.jpeg)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/85 via-primary/80 to-primary/75 flex items-center justify-center">
          <div className="text-center text-primary-foreground px-12 space-y-6">
            <div className="flex justify-center">
              <Package className="h-20 w-20 text-accent drop-shadow-lg" />
            </div>
            <div className="space-y-3">
              <h1 className="font-manrope font-bold text-5xl">Welcome to TenderFlow</h1>
              <p className="text-xl opacity-95">Your trusted platform for professional tender management</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex items-center justify-center p-6 sm:p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Glass morphism card */}
          <Card className="border border-white/20 shadow-xl bg-white/95 backdrop-blur-sm">
            <CardHeader className="space-y-3 pb-6">
              <CardTitle className="font-manrope text-3xl font-bold text-foreground">Sign in</CardTitle>
              <CardDescription className="text-base">Access your account to manage tenders</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5" data-testid="login-form">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-muted-foreground">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    data-testid="login-email-input"
                    className="text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-muted-foreground">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    data-testid="login-password-input"
                    className="text-base"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-11 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-base shadow-lg"
                  disabled={loading}
                  data-testid="login-submit-btn"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
              <div className="mt-6 text-center">
                <span className="text-muted-foreground text-sm">New to TenderFlow? </span>
                <Link to="/register" className="text-accent font-semibold hover:text-accent/80 transition-colors" data-testid="login-register-link">
                  Create account
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
