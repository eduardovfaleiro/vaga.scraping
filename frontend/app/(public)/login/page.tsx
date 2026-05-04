'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch, extractError } from '@/lib/api';
import { setToken } from '@/lib/auth';
import GoogleLoginButton from '@/components/GoogleLoginButton';
import GithubLoginButton from '@/components/GithubLoginButton';

import { Card } from '@/components/Card';
import { Button } from '@/components/Button';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(extractError(data.detail) ?? 'Credenciais inválidas');
        return;
      }
      const { access_token } = await res.json();
      setToken(access_token);
      router.push('/dashboard');
    } catch {
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <Card className="w-full max-w-sm !p-8">
        <h1 className="text-display-lg font-bold text-primary tracking-tight mb-8 text-center">Entrar</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-secondary uppercase tracking-wider">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border border-border-subtle rounded-md px-4 py-2.5 text-sm outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors bg-background"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border border-border-subtle rounded-md px-4 py-2.5 text-sm outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors bg-background"
            />
          </div>
          {error && <p className="text-sm text-status-hot font-medium">{error}</p>}
          <Button
            type="submit"
            disabled={loading}
            className="w-full !py-3"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
        <div className="relative my-6 flex items-center">
          <div className="flex-1 border-t border-border-subtle" />
          <span className="mx-3 text-[10px] font-bold text-secondary uppercase tracking-widest">ou</span>
          <div className="flex-1 border-t border-border-subtle" />
        </div>
        <div className="flex flex-col gap-3">
          <GoogleLoginButton />
          <GithubLoginButton />
        </div>
        <div className="mt-8 flex flex-col gap-2 text-sm text-center">
          <Link href="/register" className="text-brand-action hover:underline font-medium">
            Não tem uma conta? Criar conta
          </Link>
          <Link href="/forgot-password" class="text-secondary hover:text-primary transition-colors">
            Esqueci minha senha
          </Link>
        </div>
      </Card>
    </div>
  );
}
