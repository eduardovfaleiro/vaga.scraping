'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch, extractError } from '@/lib/api';
import { SkillsInput } from '@/components/SkillsInput';
import GoogleLoginButton from '@/components/GoogleLoginButton';
import GithubLoginButton from '@/components/GithubLoginButton';

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
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-zinc-900 mb-6">Criar conta</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700">Nome</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              required
              className="border border-zinc-300 rounded-md px-3 py-2 text-sm outline-none focus:border-zinc-900 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700">E-mail</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setField('email', e.target.value)}
              required
              className="border border-zinc-300 rounded-md px-3 py-2 text-sm outline-none focus:border-zinc-900 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700">Senha</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setField('password', e.target.value)}
              required
              className="border border-zinc-300 rounded-md px-3 py-2 text-sm outline-none focus:border-zinc-900 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700">Cargo atual</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              required
              placeholder="Ex: Desenvolvedor Backend"
              className="border border-zinc-300 rounded-md px-3 py-2 text-sm outline-none focus:border-zinc-900 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700">Skills</label>
            <SkillsInput skills={skills} onChange={setSkills} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700">Telefone (opcional)</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setField('phone', e.target.value)}
              placeholder="(11) 99999-9999"
              className="border border-zinc-300 rounded-md px-3 py-2 text-sm outline-none focus:border-zinc-900 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-700">
              Match mínimo: {form.match_threshold}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={form.match_threshold}
              onChange={(e) => setField('match_threshold', Number(e.target.value))}
              className="accent-zinc-900"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="bg-zinc-900 text-white py-2 rounded-md text-sm font-medium hover:bg-zinc-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>
        <div className="relative my-4 flex items-center">
          <div className="flex-1 border-t border-zinc-200" />
          <span className="mx-3 text-xs text-zinc-400">ou</span>
          <div className="flex-1 border-t border-zinc-200" />
        </div>
        <GoogleLoginButton label="Criar conta com Google" />
        <div className="mt-2">
          <GithubLoginButton label="Criar conta com GitHub" />
        </div>
        <div className="mt-4 text-sm text-zinc-600">
          <Link href="/login" className="hover:text-zinc-900 underline">
            Já tenho conta
          </Link>
        </div>
      </div>
    </div>
  );
}
