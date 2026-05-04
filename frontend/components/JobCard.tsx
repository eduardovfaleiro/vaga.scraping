'use client';

import { Card } from './Card';

interface JobCardProps {
  title: string;
  company: string;
  location: string;
  date: string;
  url: string;
}

export function JobCard({ title, company, location, date, url }: JobCardProps) {
  return (
    <Card className="flex flex-col gap-2">
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
        <span>{new Date(date).toLocaleDateString('pt-BR')}</span>
      </div>
    </Card>
  );
}
