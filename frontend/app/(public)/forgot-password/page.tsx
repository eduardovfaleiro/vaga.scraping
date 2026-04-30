'use client';

import { useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch('/auth/forgot_password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    } finally {
      setLoading(false);
      setSent(true);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-zinc-900 mb-6">Recuperar senha</h1>
        {sent ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-zinc-700">
              Se esse e-mail estiver cadastrado, você receberá as instruções em breve.
            </p>
            <Link href="/login" className="text-sm underline text-zinc-600 hover:text-zinc-900">
              Voltar ao login
            </Link>
          </div>
        ) : (
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
            <button
              type="submit"
              disabled={loading}
              className="bg-zinc-900 text-white py-2 rounded-md text-sm font-medium hover:bg-zinc-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Enviando...' : 'Enviar instruções'}
            </button>
            <Link href="/login" className="text-sm underline text-zinc-600 hover:text-zinc-900">
              Voltar ao login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
