'use client';

import { useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';

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
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <Card className="w-full max-w-sm !p-8">
        <h1 className="text-display-lg font-bold text-primary tracking-tight mb-8 text-center">Recuperar senha</h1>
        {sent ? (
          <div className="flex flex-col gap-6 text-center">
            <p className="text-sm text-secondary">
              Se esse e-mail estiver cadastrado, você receberá as instruções em breve.
            </p>
            <Link href="/login" className="text-sm text-brand-action hover:underline font-medium">
              Voltar ao login
            </Link>
          </div>
        ) : (
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
            <Button
              type="submit"
              disabled={loading}
              className="w-full !py-3"
            >
              {loading ? 'Enviando...' : 'Enviar instruções'}
            </Button>
            <div className="text-center mt-4">
              <Link href="/login" className="text-sm text-brand-action hover:underline font-medium">
                Voltar ao login
              </Link>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
