import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../utils/api';
import { setAuthData } from '../utils/auth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import { Package, Mail, ShieldCheck, RefreshCw, ArrowLeft } from 'lucide-react';

const STEPS = { FORM: 'form', OTP: 'otp' };

export const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(STEPS.FORM);
  const [pendingEmail, setPendingEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'customer',
    account_type: 'business', // 'individual' or 'business'
    company_name: '',
    company_gstin: '',
    company_pan: '',
    company_address: '',
    company_phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  // ── Step 1: Submit registration form ──────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/register', formData);
      setPendingEmail(formData.email);
      setStep(STEPS.OTP);
      toast.success('OTP sent to your email! Please check your inbox.');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // ── OTP box helpers ───────────────────────────────────────────────────────
  const handleOtpChange = (idx, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < 5) {
      document.getElementById(`otp-${idx + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      document.getElementById(`otp-${idx - 1}`)?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = Array(6).fill('');
    pasted.split('').forEach((ch, i) => { next[i] = ch; });
    setOtp(next);
    document.getElementById(`otp-${Math.min(pasted.length, 5)}`)?.focus();
  };

  // ── Step 2: Verify OTP ────────────────────────────────────────────────────
  const handleVerify = async (e) => {
    e.preventDefault();
    const otpStr = otp.join('');
    if (otpStr.length < 6) {
      toast.error('Please enter the complete 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/auth/verify-otp', {
        email: pendingEmail,
        otp: otpStr,
      });
      const { access_token, user } = response.data;
      setAuthData(access_token, user);
      toast.success('Email verified! Welcome to TenderFlow 🎉');
      navigate('/marketplace');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ─────────────────────────────────────────────────────────────
  const handleResend = async () => {
    setResending(true);
    try {
      await api.post('/auth/resend-otp', { email: pendingEmail });
      toast.success('New OTP sent! Please check your inbox.');
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background" data-testid="register-page">
      {/* Left side - decorative */}
      <div
        className="hidden lg:flex items-center justify-center bg-cover bg-center relative"
        style={{ backgroundImage: 'url(https://images.pexels.com/photos/6473973/pexels-photo-6473973.jpeg)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/85 via-primary/80 to-primary/75 flex items-center justify-center">
          <div className="text-center text-primary-foreground px-12 space-y-6">
            <div className="flex justify-center">
              <Package className="h-20 w-20 text-accent drop-shadow-lg" />
            </div>
            <div className="space-y-3">
              <h1 className="font-manrope font-bold text-5xl">Join TenderFlow</h1>
              <p className="text-xl opacity-95">Start managing your tenders efficiently today</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex items-center justify-center p-6 sm:p-8 bg-background overflow-y-auto">
        <div className="w-full max-w-md">

          {/* ── STEP 1: Registration Form ── */}
          {step === STEPS.FORM && (
            <Card className="border border-white/20 shadow-xl bg-white/95 backdrop-blur-sm">
              <CardHeader className="space-y-3 pb-6">
                <CardTitle className="font-manrope text-3xl font-bold text-foreground">Create account</CardTitle>
                <CardDescription className="text-base">Join TenderFlow to explore and bid on tenders</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5" data-testid="register-form">
                  {/* Account Type Toggle */}
                  <div className="p-1 bg-secondary rounded-xl flex gap-1 mb-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, account_type: 'business' })}
                      className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${formData.account_type === 'business'
                          ? 'bg-white shadow-sm text-primary scale-[1.02]'
                          : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                      Business / Enterprise
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, account_type: 'individual' })}
                      className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${formData.account_type === 'individual'
                          ? 'bg-white shadow-sm text-primary scale-[1.02]'
                          : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                      Individual / Visitor
                    </button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="text-sm font-semibold text-muted-foreground">Full Name</Label>
                    <Input
                      id="full_name"
                      type="text"
                      placeholder="John Doe"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      required
                      data-testid="register-name-input"
                      className="text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold text-muted-foreground">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      data-testid="register-email-input"
                      className="text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-semibold text-muted-foreground">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Min. 6 characters"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      minLength={6}
                      data-testid="register-password-input"
                      className="text-base"
                    />
                  </div>

                  {/* B2B Company Details - only for Business accounts */}
                  {formData.account_type === 'business' && (
                    <div className="pt-4 border-t border-border animate-in fade-in slide-in-from-top-2 duration-300">
                      <h3 className="font-manrope font-semibold text-lg mb-4 text-foreground">Company Details (KYC Required)</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="company_name" className="text-sm font-semibold text-muted-foreground">Company Name</Label>
                          <Input
                            id="company_name"
                            type="text"
                            placeholder="Acme Corp"
                            value={formData.company_name}
                            onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                            className="text-base"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="company_gstin" className="text-sm font-semibold text-muted-foreground">GSTIN</Label>
                            <Input
                              id="company_gstin"
                              type="text"
                              placeholder="27XXXX"
                              value={formData.company_gstin}
                              onChange={(e) => setFormData({ ...formData, company_gstin: e.target.value })}
                              className="text-base uppercase"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="company_pan" className="text-sm font-semibold text-muted-foreground">PAN</Label>
                            <Input
                              id="company_pan"
                              type="text"
                              placeholder="XXXXX..."
                              value={formData.company_pan}
                              onChange={(e) => setFormData({ ...formData, company_pan: e.target.value })}
                              className="text-base uppercase"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="company_phone" className="text-sm font-semibold text-muted-foreground">Business Phone</Label>
                          <Input
                            id="company_phone"
                            type="text"
                            placeholder="+91..."
                            value={formData.company_phone}
                            onChange={(e) => setFormData({ ...formData, company_phone: e.target.value })}
                            className="text-base"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="company_address" className="text-sm font-semibold text-muted-foreground">Registered Address</Label>
                          <Input
                            id="company_address"
                            type="text"
                            placeholder="123 Business Park..."
                            value={formData.company_address}
                            onChange={(e) => setFormData({ ...formData, company_address: e.target.value })}
                            className="text-base"
                            required
                          />
                        </div>
                        <p className="text-xs text-muted-foreground bg-secondary/50 p-2 rounded border border-border">
                          Note: Business accounts are subject to manual verification by our administrators.
                        </p>
                      </div>
                    </div>
                  )}

                  {formData.account_type === 'individual' && (
                    <div className="py-2 animate-in fade-in duration-300">
                      <p className="text-sm text-muted-foreground">
                        Registering as an individual lets you browse marketplace deals and track updates. Order placement may require business verification.
                      </p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-11 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-base shadow-lg"
                    disabled={loading}
                    data-testid="register-submit-btn"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2"><span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />Sending OTP...</span>
                    ) : (
                      <span className="flex items-center gap-2"><Mail className="h-4 w-4" />Continue with Email</span>
                    )}
                  </Button>
                </form>
                <div className="mt-6 text-center">
                  <span className="text-muted-foreground text-sm">Already have an account? </span>
                  <Link to="/login" className="text-accent font-semibold hover:text-accent/80 transition-colors" data-testid="register-login-link">
                    Sign in
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── STEP 2: OTP Verification ── */}
          {step === STEPS.OTP && (
            <Card className="border border-white/20 shadow-xl bg-white/95 backdrop-blur-sm">
              <CardHeader className="space-y-3 pb-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { setStep(STEPS.FORM); setOtp(['', '', '', '', '', '']); }}
                    className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <div>
                    <CardTitle className="font-manrope text-2xl font-bold text-foreground flex items-center gap-2">
                      <ShieldCheck className="h-6 w-6 text-accent" />
                      Verify Your Email
                    </CardTitle>
                  </div>
                </div>
                <CardDescription className="text-sm pl-11">
                  We sent a 6-digit code to <strong className="text-foreground">{pendingEmail}</strong>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleVerify} className="space-y-6">
                  {/* OTP boxes */}
                  <div className="flex justify-center gap-3" onPaste={handleOtpPaste}>
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`otp-${idx}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className="h-14 w-12 text-center text-2xl font-bold border-2 rounded-lg outline-none transition-all duration-150 focus:border-accent focus:ring-2 focus:ring-accent/20 bg-background"
                        style={{
                          borderColor: digit ? 'hsl(var(--accent))' : undefined,
                        }}
                        data-testid={`otp-input-${idx}`}
                        autoFocus={idx === 0}
                        autoComplete="off"
                      />
                    ))}
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-11 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-base shadow-lg"
                    disabled={loading}
                    data-testid="otp-verify-btn"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2"><span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />Verifying...</span>
                    ) : (
                      <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" />Verify & Create Account</span>
                    )}
                  </Button>
                </form>
                <div className="mt-5 text-center space-y-1">
                  <p className="text-muted-foreground text-sm">Didn't receive the code?</p>
                  <button
                    onClick={handleResend}
                    disabled={resending}
                    className="text-accent font-semibold text-sm hover:text-accent/80 transition-colors flex items-center gap-1 mx-auto disabled:opacity-50"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${resending ? 'animate-spin' : ''}`} />
                    {resending ? 'Sending...' : 'Resend OTP'}
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
};
