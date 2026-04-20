'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { fetchWithAuth, apiFetch } from '@/lib/api';
import { clearToken } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface UserData {
  id: string;
  name: string;
  email: string;
  title: string;
  skills: string[];
  phone?: string;
  match_threshold: number;
}

export default function SettingsPage() {
  const { userId } = useAuth();
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
    <div className="min-h-screen bg-zinc-50">
      <nav className="bg-white border-b border-zinc-200 px-4 py-3 flex items-center justify-between">
        <span className="font-semibold text-zinc-900">Vagas</span>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/dashboard" className="text-zinc-600 hover:text-zinc-900">
            Recomendações
          </Link>
        </div>
      </nav>

      <main className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-xl font-semibold text-zinc-900 mb-6">Configurações</h1>

        {loading && <p className="text-sm text-zinc-500">Carregando...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {user && (
          <div className="flex flex-col gap-4">
            <div className="border border-zinc-200 rounded-md p-4 flex flex-col gap-3">
              <Row label="Nome" value={user.name} />
              <Row label="E-mail" value={user.email} />
              <Row label="Cargo" value={user.title} />
              {user.phone && <Row label="Telefone" value={user.phone} />}
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
