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
    <>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-display-lg font-bold text-primary tracking-tight">Recomendações</h1>

        {tab === 'pending' && (
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="text-sm border border-border-subtle rounded-md px-3 py-1.5 bg-surface text-secondary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-colors"
          >
            <option value="all">Todas</option>
            <option value="24h">Últimas 24h</option>
            <option value="week">Última semana</option>
            <option value="month">Último mês</option>
          </select>
        )}
      </div>

      <div className="flex bg-surface border border-border-subtle rounded-lg overflow-hidden mb-8 shadow-sm">
        {TABS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 relative cursor-pointer ${
              tab === value
                ? 'text-primary bg-hover' 
                : 'text-secondary hover:text-primary hover:bg-hover'
            }`}
          >
            {label}
            <span
              className={`px-1.5 py-0.5 text-[10px] rounded-full transition-colors ${
                tab === value ? 'bg-brand-primary text-white' : 'bg-border-subtle text-secondary'
              }`}
            >
              {counts[value]}
            </span>
            {tab === value && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-primary" />
            )}
          </button>
        ))}
      </div>

      {tab === 'rejected' && (
        <p className="text-xs text-secondary text-center mb-6">
          Vagas ignoradas são excluídas permanentemente após 7 dias.
        </p>
      )}

      {loading && <p className="text-sm text-secondary">Carregando...</p>}
      {error && <p className="text-sm text-status-hot">{error}</p>}
      {!loading && !error && filtered.length === 0 && (
        <p className="text-sm text-secondary">Nenhuma vaga nesta categoria.</p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((rec) => (
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
        ))}
      </div>
    </>
  );
}
