'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Leaf, Lock, Mail, AlertCircle, ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { CLINIC_INFO } from '@/lib/constants';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_project_url') return;
    const supabase = createBrowserSupabaseClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setResetMode(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const isConfigured = Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
        process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_project_url'
      );

      // If Supabase is connected, authenticate via live Supabase Auth
      if (isConfigured) {
        const supabase = createBrowserSupabaseClient();
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError || !data.session) {
          throw new Error(authError?.message || 'Invalid credentials.');
        }

        localStorage.setItem('vshma_admin_session', data.session.access_token);
        localStorage.setItem('vshma_admin_email', data.user.email || '');
        router.push('/admin/dashboard');
        return;
      }

      // If Supabase is not connected yet, allow demo staff login
      localStorage.setItem('vshma_admin_session', 'demo_admin_token_vshma');
      localStorage.setItem('vshma_admin_email', email || 'admin@vshma.in');
      router.push('/admin/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = () => {
    localStorage.setItem('vshma_admin_session', 'demo_admin_token_vshma');
    localStorage.setItem('vshma_admin_email', 'admin@vshma.in');
    router.push('/admin/dashboard');
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError('Please provide your admin email address first.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_project_url') {
        throw new Error('Password reset is unavailable until Supabase is configured.');
      }
      const supabase = createBrowserSupabaseClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/login`,
      });
      if (resetError) throw resetError;
      setResetSent(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not trigger reset.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (newPassword.length < 8) throw new Error('Use at least 8 characters for your new password.');
      const { error: updateError } = await createBrowserSupabaseClient().auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;
      await createBrowserSupabaseClient().auth.signOut();
      setResetMode(false);
      setPassword('');
      setNewPassword('');
      setResetSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F4] flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-forest text-gold flex items-center justify-center shadow-md">
              <Leaf className="w-6 h-6" />
            </div>
            <div className="text-left">
              <span className="font-heading text-2xl font-bold text-forest block leading-none">
                {CLINIC_INFO.name}
              </span>
              <span className="text-[10px] text-sage-dark uppercase tracking-widest font-semibold block mt-0.5">
                Staff Administration
              </span>
            </div>
          </Link>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
            Administrator Portal
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Sign in to manage appointments &amp; view patient requests
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-white rounded-3xl border border-sage/25 p-8 shadow-xl">
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5 mb-6">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {resetSent && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-start gap-2.5 mb-6">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Instructions sent to your email address if an account exists.</span>
            </div>
          )}

          {resetMode ? (
            <form onSubmit={handlePasswordUpdate} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="At least 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10 text-sm"
                    required
                  />
                </div>
              </div>
              <Button type="submit" size="lg" loading={loading} className="w-full text-sm font-semibold">
                Update Password
              </Button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="admin@vshma.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={handlePasswordReset}
                    className="text-xs text-sage-dark hover:text-forest underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  size="lg"
                  loading={loading}
                  className="w-full text-sm font-semibold shadow-md"
                >
                  <span>Sign In &amp; Enter Dashboard</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              {/* Instant Preview / Demo Access Button */}
              <div className="pt-3">
                <button
                  type="button"
                  onClick={handleDemoAccess}
                  className="w-full py-2.5 rounded-2xl bg-mint hover:bg-sage/30 text-forest text-xs font-semibold border border-sage/30 flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-gold" />
                  <span>One-Click Administrator Demo Access</span>
                </button>
              </div>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <Link
              href="/"
              className="text-xs text-gray-500 hover:text-forest transition-colors inline-flex items-center gap-1"
            >
              &larr; Return to Patient Website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
