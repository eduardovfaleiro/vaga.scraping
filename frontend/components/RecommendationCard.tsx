'use client';

import { Card } from './Card';
import { Button } from './Button';

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
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-primary leading-snug">{title}</h3>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-xs bg-brand-primary text-white px-3 py-1 rounded-md hover:bg-brand-primary-hover transition-colors"
        >
          Ver vaga
        </a>
      </div>
      <p className="text-sm text-secondary">{company}</p>
      <div className="flex items-center gap-3 text-xs text-secondary">
        <span>{location}</span>
        <span>·</span>
        <span>{date ? new Date(date).toLocaleDateString('pt-BR') : 'Data não informada'}</span>
      </div>
      {status === 'pending' && (
        <div className="flex gap-2 pt-1">
          <Button
            onClick={() => onApply?.(id)}
            className="flex-1 !py-1.5"
          >
            Aplicar
          </Button>
          <Button
            onClick={() => onReject?.(id)}
            variant="outline"
            className="flex-1 !py-1.5"
          >
            Ignorar
          </Button>
        </div>
      )}
      {status !== 'pending' && (
        <span className={`self-start text-xs px-2 py-0.5 rounded-md ${
          status === 'applied' ? 'bg-status-info text-status-info-text' : 'bg-hover text-secondary'
        }`}>
          {status === 'applied' ? 'Aplicada' : 'Ignorada'}
        </span>
      )}
    </Card>
  );
}
