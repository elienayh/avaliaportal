import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { store } from '../services/store';
import { getSupabase } from '../services/supabase';
import { Lock, Shield, X, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';

interface AdminLoginModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ open, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear inputs and error every time modal opens - never keep saved emails
  useEffect(() => {
    if (open) {
      setEmail('');
      setPassword('');
      setShowPassword(false);
      setError(null);
      setLoading(false);
      setGoogleLoading(false);
    }
  }, [open]);

  if (!open) return null;

  // Real Google OAuth trigger via Supabase
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);

    const supabase = getSupabase();
    if (!supabase) {
      setError('A chave pública (Anon Key) do Supabase ainda não está configurada no sistema. Forneça a chave anon para ativar o login com o Google.');
      setGoogleLoading(false);
      return;
    }

    try {
      const isIframe = window.self !== window.top;
      const redirectUrl = window.location.origin;

      if (isIframe) {
        // In iframe environments (e.g. preview), Google blocks embedded frame redirects (X-Frame-Options: DENY)
        const { data, error: authError } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUrl,
            queryParams: {
              access_type: 'offline',
              prompt: 'select_account',
            },
            skipBrowserRedirect: true,
          },
        });

        if (authError) {
          setError(`Supabase Auth: ${authError.message}`);
          setGoogleLoading(false);
          return;
        }

        if (data?.url) {
          window.open(data.url, '_blank');
          setGoogleLoading(false);
          return;
        }
      } else {
        const { error: authError } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUrl,
            queryParams: {
              access_type: 'offline',
              prompt: 'select_account',
            },
          },
        });

        if (authError) {
          setError(`Supabase Auth: ${authError.message}`);
          setGoogleLoading(false);
          return;
        }
      }
    } catch (err: unknown) {
      console.warn('OAuth attempt exception:', err);
      setError(err instanceof Error ? err.message : 'Falha na inicialização do Google OAuth.');
      setGoogleLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Por favor, informe seu e-mail institucional.');
      return;
    }

    if (!password) {
      setError('Por favor, digite sua senha de acesso.');
      return;
    }

    setLoading(true);

    try {
      // 1. Try Supabase Auth if connected
      const supabase = getSupabase();
      if (supabase) {
        try {
          const { data, error: supaErr } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: password,
          });
          if (data?.user && !supaErr) {
            const res = store.loginWithGoogleEmail(cleanEmail, data.user.user_metadata?.full_name);
            if (res.success && res.user) {
              setLoading(false);
              onSuccess(res.user);
              onClose();
              return;
            }
          }
        } catch (supaEx) {
          console.warn('Supabase auth attempt:', supaEx);
        }
      }

      // 2. Validate institutional administrator credentials and password
      const res = store.loginWithCredentials(cleanEmail, password);
      setLoading(false);

      if (res.success && res.user) {
        onSuccess(res.user);
        onClose();
      } else {
        setError(res.error || 'Credenciais inválidas ou e-mail sem autorização administrativa.');
      }
    } catch (err: unknown) {
      setLoading(false);
      setError(err instanceof Error ? err.message : 'Falha ao autenticar.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Frosted Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/65 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 transition-all transform animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 relative border-b border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-3">
            <img
              src="/logo.png"
              alt="Colégio Portal"
              className="w-12 h-12 rounded-2xl object-cover border border-sky-400/40 shadow-md shadow-sky-500/20 bg-slate-950"
            />
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-sky-400">
                Colégio Portal
              </span>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-tight">
                Acesso da Coordenação
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Painel exclusivo para a equipe de coordenação e administração pedagógica.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4 sm:space-y-5">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Official Google OAuth Action Button */}
          <button
            type="button"
            disabled={googleLoading || loading}
            onClick={handleGoogleSignIn}
            className="w-full py-3 px-4 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold flex items-center justify-center gap-3 transition shadow-xs disabled:opacity-60 active:bg-slate-100"
          >
            {/* Google G SVG Icon */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{googleLoading ? 'Conectando ao Google...' : 'Continuar com o Google'}</span>
          </button>

          {/* Separator */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-[10px] sm:text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              ou com e-mail institucional
            </span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          {/* Form requiring manual login credentials - NO pre-saved emails */}
          <form onSubmit={handlePasswordSubmit} className="space-y-3.5" autoComplete="off">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                E-mail Administrativo
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                required
                autoComplete="off"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-hidden transition"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Senha de Acesso
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-hidden transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold shadow-md flex items-center justify-center gap-2 transition"
            >
              <span>{loading ? 'Validando...' : 'Entrar no Painel'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer security note */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              Sessão autenticada e criptografada
            </span>
            <span>Colégio Portal</span>
          </div>
        </div>
      </div>
    </div>
  );
};
