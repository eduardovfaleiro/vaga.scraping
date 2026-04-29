'use client';

interface RecommendationCardProps {
  id: string;
  title: string;
  company: string;
  location: string;
  date: string;
  url: string;
  status: 'pending' | 'applied' | 'rejected';
  onApply?: (id: string) => void;
  onReject?: (id: string) => void;
}

export function RecommendationCard({
  id,
  title,
  company,
  location,
  date,
  url,
  status,
  onApply,
  onReject,
}: RecommendationCardProps) {
  return (
    <div className="border border-zinc-200 rounded-md p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-zinc-900 leading-snug">{title}</h3>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-xs bg-zinc-900 text-white px-3 py-1 rounded hover:bg-zinc-700 transition-colors"
        >
          Ver vaga
        </a>
      </div>
      <p className="text-sm text-zinc-600">{company}</p>
      <div className="flex items-center gap-3 text-xs text-zinc-500">
        <span>{location}</span>
        <span>·</span>
        <span>{new Date(date).toLocaleDateString('pt-BR')}</span>
      </div>
      {status === 'pending' && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => onApply?.(id)}
            className="flex-1 text-sm bg-zinc-900 text-white py-1.5 rounded hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            Aplicar
          </button>
          <button
            onClick={() => onReject?.(id)}
            className="flex-1 text-sm bg-white text-zinc-900 border border-zinc-900 py-1.5 rounded hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            Rejeitar
          </button>
        </div>
      )}
      {status !== 'pending' && (
        <span className="self-start text-xs bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded">
          {status === 'applied' ? 'Aplicada' : 'Rejeitada'}
        </span>
      )}
    </div>
  );
}
