import { useState } from 'react';
import { Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/Logo';

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('admin@jeevanrakshak.demo');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      if (email === 'admin@jeevanrakshak.demo' && password === 'admin123') {
        onLogin();
      } else {
        setError('Invalid credentials. Use the demo login shown below.');
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-950 px-4">
      {/* Background accent */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-brand-700/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-navy-700/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <div className="rounded-2xl bg-white px-4 py-3 shadow-xl">
            <Logo size="lg" />
          </div>
        </div>

        <div className="card p-8">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-navy-900">Sign in to your account</h1>
            <p className="mt-1 text-sm text-navy-500">
              Access the blood supply command centre.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy-700">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy-700">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 rounded-lg bg-navy-50 px-4 py-3">
            <div className="flex items-center gap-2 text-xs font-medium text-navy-600">
              <ShieldCheck size={14} />
              Demo Credentials
            </div>
            <div className="mt-1.5 space-y-0.5 text-xs text-navy-500">
              <div>Email: admin@jeevanrakshak.demo</div>
              <div>Password: admin123</div>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs font-medium text-navy-400">
          Academic Prototype • Simulated Data
        </p>
      </div>
    </div>
  );
}
