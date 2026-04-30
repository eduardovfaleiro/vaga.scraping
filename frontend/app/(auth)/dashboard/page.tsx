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
  { label: 'Rejeitadas', value: 'rejected' },
];

export default function DashboardPage() {
  const { userId, logout } = useAuth();
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [tab, setTab] = useState<Status>('pending');
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

  const filtered = recs.filter((r) => r.status === tab);

  return (
    <div className="min-h-screen">
      <nav className="bg-white border-b border-zinc-200 py-3">
        <div className="max-w-2xl mx-auto px-4 flex items-center justify-between">
          <span className="font-semibold text-zinc-900">Vagazap</span>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/resume" className="text-zinc-600 hover:text-zinc-900">
              Meu currículo
            </Link>
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
        <h1 className="text-xl font-semibold text-zinc-900 mb-6">Recomendações</h1>

        <div className="flex border-b border-zinc-200 mb-6">
          {TABS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setTab(value)}
              className={`flex-1 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center justify-center gap-2 ${tab === value
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-700'
                }`}
            >
              {label}
              <span className={`px-1.5 py-0.5 text-[10px] rounded-full transition-colors ${tab === value
                ? 'bg-zinc-900 text-white'
                : 'bg-zinc-100 text-zinc-500 group-hover:bg-zinc-200'
                }`}>
                {counts[value]}
              </span>
            </button>
          ))}
        </div>

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
          {!loading && !error && filtered.length > 0 && (
            <div className="flex justify-center mt-6 pb-6">
              <Image src={endGif} alt="Fim da lista" width={800} height={100} unoptimized />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
