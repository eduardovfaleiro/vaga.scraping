'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { fetchWithAuth, apiFetch, extractError } from '@/lib/api';
import { clearToken } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SkillsInput } from '@/components/SkillsInput';
import { formatPhone } from '@/lib/utils';

interface UserData {
  id: string;
  name: string;
  email: string;
  title: string;
  skills: string[];
  phone?: string;
  match_threshold: number;
}

interface EditForm {
  name: string;
  title: string;
  phone: string;
  match_threshold: number;
  skills: string[];
}

export default function SettingsPage() {
  const { userId } = useAuth();
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [form, setForm] = useState<EditForm | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!userId) return;
    fetchWithAuth(`/users/${userId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Erro ao carregar dados');
        return res.json();
      })
      .then(setUser)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [userId]);

  function startEdit() {
    if (!user) return;
    setForm({
      name: user.name,
      title: user.title,
      phone: user.phone ?? '',
      match_threshold: user.match_threshold,
      skills: [...user.skills],
    });
    setSaveError('');
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setForm(null);
    setSaveError('');
  }

  async function handleSave() {
    if (!userId || !form) return;
    setSaving(true);
    setSaveError('');
    try {
      const body: Record<string, unknown> = {
        name: form.name,
        title: form.title,
        phone: form.phone || null,
        match_threshold: form.match_threshold,
        skills: form.skills,
      };
      const res = await fetchWithAuth(`/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(extractError(data.detail));
      }
      const updated: UserData = await res.json();
      setUser(updated);
      setEditing(false);
      setForm(null);
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await apiFetch('/auth/logout', { method: 'POST' });
    clearToken();
    router.push('/login');
  }

  async function handleDelete() {
    if (!userId) return;
    setDeleting(true);
    try {
      const res = await fetchWithAuth(`/users/${userId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao excluir conta');
      clearToken();
      router.push('/login');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro desconhecido');
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <div className="min-h-screen">
      <nav className="bg-white border-b border-zinc-200 py-3">
        <div className="max-w-2xl mx-auto px-4 flex items-center justify-between">
          <span className="font-semibold text-zinc-900">Vagazap</span>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/dashboard" className="text-zinc-600 hover:text-zinc-900">
              Recomendações
            </Link>
            <Link href="/resume" className="text-zinc-600 hover:text-zinc-900">
              Meu currículo
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-xl font-semibold text-zinc-900 mb-6">Configurações</h1>

        {loading && <p className="text-sm text-zinc-500">Carregando...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {user && !editing && (
          <div className="flex flex-col gap-4">
            <div className="border border-zinc-200 rounded-md p-4 flex flex-col gap-3">
              <Row label="Nome" value={user.name} />
              <Row label="E-mail" value={user.email} />
              <Row label="Cargo" value={user.title} />
              <Row label="Telefone" value={formatPhone(user.phone)} />
              <Row label="Match mínimo" value={`${user.match_threshold}%`} />
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                  Skills
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {user.skills.map((s) => (
                    <span
                      key={s}
                      className="text-xs bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={startEdit}
                className="w-full py-2 text-sm font-medium bg-zinc-900 text-white rounded-md hover:bg-zinc-700 transition-colors"
              >
                Editar perfil
              </button>
              <button
                onClick={handleLogout}
                className="w-full py-2 text-sm font-medium bg-white text-zinc-900 border border-zinc-900 rounded-md hover:bg-zinc-100 transition-colors"
              >
                Sair
              </button>
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="w-full py-2 text-sm font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
                >
                  Excluir conta
                </button>
              ) : (
                <div className="border border-red-200 rounded-md p-4 flex flex-col gap-3">
                  <p className="text-sm text-zinc-700">
                    Tem certeza? Esta ação não pode ser desfeita.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="flex-1 py-2 text-sm font-medium bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      {deleting ? 'Excluindo...' : 'Confirmar exclusão'}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="flex-1 py-2 text-sm font-medium bg-white text-zinc-900 border border-zinc-300 rounded-md hover:bg-zinc-100 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {editing && form && (
          <div className="flex flex-col gap-4">
            <div className="border border-zinc-200 rounded-md p-4 flex flex-col gap-4">
              <Field label="Nome">
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full text-sm border border-zinc-300 rounded-md px-3 py-2 outline-none focus:border-zinc-900 transition-colors"
                />
              </Field>

              <Field label="Cargo">
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full text-sm border border-zinc-300 rounded-md px-3 py-2 outline-none focus:border-zinc-900 transition-colors"
                />
              </Field>

              <Field label="Telefone">
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                  className="w-full text-sm border border-zinc-300 rounded-md px-3 py-2 outline-none focus:border-zinc-900 transition-colors"
                />
              </Field>

              <Field label={`Match mínimo: ${form.match_threshold}%`}>
                <input
                  type="range"
                  min={10}
                  max={100}
                  step={5}
                  value={form.match_threshold}
                  onChange={(e) =>
                    setForm({ ...form, match_threshold: Number(e.target.value) })
                  }
                  className="w-full accent-zinc-900"
                />
              </Field>

              <Field label="Skills">
                <SkillsInput
                  skills={form.skills}
                  onChange={(skills) => setForm({ ...form, skills })}
                />
              </Field>

              {saveError && <p className="text-sm text-red-600">{saveError}</p>}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2 text-sm font-medium bg-zinc-900 text-white rounded-md hover:bg-zinc-700 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
              <button
                onClick={cancelEdit}
                disabled={saving}
                className="flex-1 py-2 text-sm font-medium bg-white text-zinc-900 border border-zinc-300 rounded-md hover:bg-zinc-100 disabled:opacity-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">{label}</span>
      <span className="text-sm text-zinc-900">{value}</span>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">{label}</span>
      {children}
    </div>
  );
}
