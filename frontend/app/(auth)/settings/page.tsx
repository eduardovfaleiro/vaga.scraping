'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { fetchWithAuth, apiFetch, extractError } from '@/lib/api';
import { clearToken } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { SkillsInput } from '@/components/SkillsInput';
import { formatPhone } from '@/lib/utils';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';

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

  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  function toggleTheme(newTheme: 'light' | 'dark') {
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }

  return (
    <>
      <h1 className="text-display-lg font-bold text-primary tracking-tight mb-8">Configurações</h1>

      {loading && <p className="text-sm text-secondary">Carregando...</p>}
      {error && <p className="text-sm text-status-hot font-medium">{error}</p>}

      {user && !editing && (
        <div className="flex flex-col gap-6">
          <Card className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-2">Perfil</h2>
            <Row label="Nome" value={user.name} />
            <Row label="E-mail" value={user.email} />
            <Row label="Cargo" value={user.title} />
            <Row label="Telefone" value={formatPhone(user.phone)} />
            <Row label="Match mínimo" value={`${user.match_threshold}%`} />
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
                Skills
              </span>
              <div className="flex flex-wrap gap-1.5">
                {user.skills.map((s) => (
                  <span
                    key={s}
                    className="text-xs bg-hover text-primary px-2.5 py-1 rounded-md font-medium border border-border-subtle"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </Card>

          <Card className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-2">Aparência</h2>
            <div className="flex items-center justify-between">
              <span className="text-base text-primary font-medium">Tema do sistema</span>
              <div className="flex p-1 bg-hover rounded-lg border border-border-subtle">
                <button
                  onClick={() => toggleTheme('light')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                    theme === 'light'
                      ? 'bg-surface text-primary shadow-sm'
                      : 'text-secondary hover:text-primary'
                  }`}
                >
                  Claro
                </button>
                <button
                  onClick={() => toggleTheme('dark')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                    theme === 'dark'
                      ? 'bg-surface text-primary shadow-sm'
                      : 'text-secondary hover:text-primary'
                  }`}
                >
                  Escuro
                </button>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button onClick={startEdit}>
              Editar perfil
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              Sair
            </Button>
            
            <div className="sm:col-span-2 mt-4 pt-6 border-t border-border-subtle">
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="text-sm font-medium text-status-hot hover:underline cursor-pointer"
                >
                  Excluir conta
                </button>
              ) : (
                <Card className="border-status-hot/20 bg-status-hot/5">
                  <p className="text-sm text-primary font-medium mb-4">
                    Tem certeza? Esta ação não pode ser desfeita.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      variant="danger"
                      onClick={handleDelete}
                      disabled={deleting}
                      className="flex-1"
                    >
                      {deleting ? 'Excluindo...' : 'Confirmar exclusão'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setConfirmDelete(false)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}

      {editing && form && (
        <div className="flex flex-col gap-6">
          <Card className="flex flex-col gap-5">
            <Field label="Nome">
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full text-sm border border-border-subtle rounded-md px-4 py-2.5 outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors bg-background"
              />
            </Field>

            <Field label="Cargo">
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full text-sm border border-border-subtle rounded-md px-4 py-2.5 outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors bg-background"
              />
            </Field>

            <Field label="Telefone">
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="(11) 99999-9999"
                className="w-full text-sm border border-border-subtle rounded-md px-4 py-2.5 outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors bg-background"
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
                className="w-full accent-brand-primary cursor-pointer"
              />
            </Field>

            <Field label="Skills">
              <SkillsInput
                skills={form.skills}
                onChange={(skills) => setForm({ ...form, skills })}
              />
            </Field>

            {saveError && <p className="text-sm text-status-hot font-medium">{saveError}</p>}
          </Card>

          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1"
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
            <Button
              variant="outline"
              onClick={cancelEdit}
              disabled={saving}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-semibold text-secondary uppercase tracking-wider">{label}</span>
      <span className="text-base text-primary font-medium">{value}</span>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-secondary uppercase tracking-wider">{label}</span>
      {children}
    </div>
  );
}
