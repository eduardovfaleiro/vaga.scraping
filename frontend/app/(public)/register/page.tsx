'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch, extractError } from '@/lib/api';
import { SkillsInput } from '@/components/SkillsInput';
import GoogleLoginButton from '@/components/GoogleLoginButton';
import GithubLoginButton from '@/components/GithubLoginButton';

import { Card } from '@/components/Card';
import { Button } from '@/components/Button';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    title: '',
    phone: '',
    match_threshold: 70,
  });
  const [skills, setSkills] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function setField(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (skills.length === 0) {
      setError('Adicione ao menos uma skill');
      return;
    }
    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        name: form.name,
        email: form.email,
        password: form.password,
        title: form.title,
        skills,
        match_threshold: form.match_threshold,
      };
      if (form.phone) body.phone = form.phone;

      const res = await apiFetch('/users', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(extractError(data.detail) ?? 'Erro ao criar conta');
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
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
      <Card className="w-full max-w-sm !p-8">
        <h1 className="text-display-lg font-bold text-primary tracking-tight mb-8 text-center">Criar conta</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Nome</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              required
              className="border border-border-subtle rounded-md px-4 py-2.5 text-sm outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors bg-background"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-secondary uppercase tracking-wider">E-mail</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setField('email', e.target.value)}
              required
              className="border border-border-subtle rounded-md px-4 py-2.5 text-sm outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors bg-background"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Senha</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setField('password', e.target.value)}
              required
              className="border border-border-subtle rounded-md px-4 py-2.5 text-sm outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors bg-background"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Cargo atual</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              required
              placeholder="Ex: Desenvolvedor Backend"
              className="border border-border-subtle rounded-md px-4 py-2.5 text-sm outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors bg-background"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Skills</label>
            <SkillsInput skills={skills} onChange={setSkills} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Telefone (opcional)</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setField('phone', e.target.value)}
              placeholder="(11) 99999-9999"
              className="border border-border-subtle rounded-md px-4 py-2.5 text-sm outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors bg-background"
            />
          </div>
          <div className="flex flex-col gap-2.5">
            <label className="text-xs font-semibold text-secondary uppercase tracking-wider">
              Match mínimo: {form.match_threshold}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={form.match_threshold}
              onChange={(e) => setField('match_threshold', Number(e.target.value))}
              className="accent-brand-primary cursor-pointer"
            />
          </div>
          {error && <p className="text-sm text-status-hot font-medium">{error}</p>}
          <Button
            type="submit"
            disabled={loading}
            className="w-full !py-3 mt-2"
          >
            {loading ? 'Criando conta...' : 'Criar conta'}
          </Button>
        </form>
        <div className="relative my-6 flex items-center">
          <div className="flex-1 border-t border-border-subtle" />
          <span className="mx-3 text-[10px] font-bold text-secondary uppercase tracking-widest">ou</span>
          <div className="flex-1 border-t border-border-subtle" />
        </div>
        <div className="flex flex-col gap-3">
          <GoogleLoginButton label="Criar conta com Google" />
          <GithubLoginButton label="Criar conta com GitHub" />
        </div>
        <div className="mt-8 text-sm text-center">
          <Link href="/login" className="text-brand-action hover:underline font-medium">
            Já tem uma conta? Entrar
          </Link>
        </div>
      </Card>
    </div>
  );
}
