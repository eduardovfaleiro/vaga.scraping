'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch, extractError } from '@/lib/api';
import { setToken } from '@/lib/auth';
import GoogleLoginButton from '@/components/GoogleLoginButton';
import GithubLoginButton from '@/components/GithubLoginButton';

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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-zinc-900 mb-6">Entrar</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border border-zinc-300 rounded-md px-3 py-2 text-sm outline-none focus:border-zinc-900 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border border-zinc-300 rounded-md px-3 py-2 text-sm outline-none focus:border-zinc-900 transition-colors"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="bg-zinc-900 text-white py-2 rounded-md text-sm font-medium hover:bg-zinc-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <div className="relative my-4 flex items-center">
          <div className="flex-1 border-t border-zinc-200" />
          <span className="mx-3 text-xs text-zinc-400">ou</span>
          <div className="flex-1 border-t border-zinc-200" />
        </div>
        <GoogleLoginButton />
        <div className="mt-2">
          <GithubLoginButton />
        </div>
        <div className="mt-4 flex flex-col gap-1 text-sm text-zinc-600">
          <Link href="/register" className="hover:text-zinc-900 underline">
            Criar conta
          </Link>
          <Link href="/forgot-password" className="hover:text-zinc-900 underline">
            Esqueci minha senha
          </Link>
        </div>
      </div>
    </div>
  );
}
