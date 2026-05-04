'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetch, extractError } from '@/lib/api';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (newPassword !== confirm) {
      setError('As senhas não coincidem');
      return;
    }
    if (!token) {
      setError('Token inválido ou ausente');
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch('/auth/reset_password', {
        method: 'POST',
        body: JSON.stringify({ token, new_password: newPassword }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(extractError(data.detail) ?? 'Erro ao redefinir senha');
        return;
      }
      router.push('/login');
    } catch {
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <Card className="w-full max-w-sm !p-8">
        <h1 className="text-display-lg font-bold text-primary tracking-tight mb-8 text-center">Nova senha</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Nova senha</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="border border-border-subtle rounded-md px-4 py-2.5 text-sm outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors bg-background"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Confirmar senha</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
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
            {loading ? 'Salvando...' : 'Salvar senha'}
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
