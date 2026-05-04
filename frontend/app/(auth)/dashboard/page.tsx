'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { fetchWithAuth } from '@/lib/api';
import { RecommendationCard } from '@/components/RecommendationCard';
import Link from 'next/link';
import Image from 'next/image';
import endGif from '@/assets/end.gif';

type Status = 'pending' | 'applied' | 'rejected';

interface Recommendation {
  id: string;
  job: {
    id: string;
    title: string;
    company: string;
    location: string;
    posted_at: string;
    url: string;
  };
  status: Status;
}

const TABS: { label: string; value: Status }[] = [
  { label: 'Pendentes', value: 'pending' },
  { label: 'Aplicadas', value: 'applied' },
  { label: 'Ignoradas', value: 'rejected' },
];

export default function DashboardPage() {
  const { userId, logout } = useAuth();
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [tab, setTab] = useState<Status>('pending');
  const [dateFilter, setDateFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) {
      const timer = setTimeout(() => setLoading(false), 2000);
      return () => clearTimeout(timer);
    }
    setLoading(true);
    fetchWithAuth(`/users/${userId}/recommendations`)
      .then((res) => {
        if (!res.ok) throw new Error('Erro ao carregar recomendações');
        return res.json();
      })
      .then(setRecs)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [userId]);

  async function updateStatus(recId: string, status: 'applied' | 'rejected') {
    if (!userId) return;
    const res = await fetchWithAuth(`/users/${userId}/recommendations/${recId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setRecs((prev) => prev.map((r) => (r.id === recId ? { ...r, status } : r)));
    }
  }

  const counts = {
    pending: recs.filter((r) => r.status === 'pending').length,
    applied: recs.filter((r) => r.status === 'applied').length,
    rejected: recs.filter((r) => r.status === 'rejected').length,
  };

  let filtered = recs.filter((r) => r.status === tab);

  if (tab === 'pending') {
    // Aplicar filtro de data
    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter((r) => {
        if (!r.job?.posted_at) return false;
        const postedAt = new Date(r.job.posted_at);
        const diffMs = now.getTime() - postedAt.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);

        if (dateFilter === '24h') return diffHours <= 24;
        if (dateFilter === 'week') return diffHours <= 24 * 7;
        if (dateFilter === 'month') return diffHours <= 24 * 30;
        return true;
      });
    }

    // Ordenar por data postada (mais recentes primeiro)
    filtered.sort((a, b) => {
      const dateA = a.job?.posted_at ? new Date(a.job.posted_at).getTime() : 0;
      const dateB = b.job?.posted_at ? new Date(b.job.posted_at).getTime() : 0;
      return dateB - dateA;
    });
  }

  return (
    <div className="min-h-screen">
      <nav className="bg-white border-b border-zinc-200 py-3">
        <div className="max-w-2xl mx-auto px-4 flex items-center justify-between">
          <span className="font-semibold text-zinc-900">Vagazap</span>
          <div className="flex items-center gap-4 text-sm">
            {/* <Link href="/resume" className="text-zinc-600 hover:text-zinc-900">
              Meu currículo
            </Link> */}
            <Link href="/settings" className="text-zinc-600 hover:text-zinc-900">
              Configurações
            </Link>
            <button onClick={logout} className="text-zinc-600 hover:text-zinc-900">
              Sair
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-zinc-900">Recomendações</h1>

          {tab === 'pending' && (
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="text-sm border border-zinc-200 rounded-md px-2 py-1 bg-white text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-400"
            >
              <option value="all">Todas</option>
              <option value="24h">Últimas 24h</option>
              <option value="week">Última semana</option>
              <option value="month">Último mês</option>
            </select>
          )}
        </div>

        <div className="flex bg-card border-b border-zinc-200 mb-6 ">
          {TABS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setTab(value)}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2 relative ${
                tab === value
                  ? 'text-zinc-900 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-zinc-900' // Underline for active tab
                  : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50/50'
              }`}
            >
              {label}
              <span
                className={`px-1.5 py-0.5 text-[10px] rounded-full transition-colors ${
                  tab === value ? 'bg-zinc-900 text-white' : 'bg-zinc-200 text-zinc-600'
                }`}
              >
                {counts[value]}
              </span>
            </button>
          ))}
        </div>

        {tab === 'rejected' && (
          <p className="text-xs text-zinc-500 text-center mb-4">
            Vagas ignoradas são excluídas permanentemente após 7 dias.
          </p>
        )}

        {loading && <p className="text-sm text-zinc-500">Carregando...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!loading && !error && filtered.length === 0 && (
          <p className="text-sm text-zinc-500">Nenhuma vaga nesta categoria.</p>
        )}
        <div className="flex flex-col gap-3">
          {filtered.map((rec) => {

            return (
              <RecommendationCard
                key={rec.id}
                id={rec.id}
                title={rec.job?.title || 'Vaga indisponível'}
                company={rec.job?.company || '-'}
                location={rec.job?.location || '-'}
                date={rec.job?.posted_at || ''}
                url={rec.job?.url || '#'}
                status={rec.status}
                onApply={(id) => updateStatus(id, 'applied')}
                onReject={(id) => updateStatus(id, 'rejected')} />
            );
          })}
        </div>
      </main>
    </div>
  );
}
