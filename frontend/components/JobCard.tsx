'use client';

interface JobCardProps {
  title: string;
  company: string;
  location: string;
  date: string;
  url: string;
}

export function JobCard({ title, company, location, date, url }: JobCardProps) {
  return (
    <div className="bg-card text-card-foreground border border-zinc-200 rounded-md p-4 flex flex-col gap-2">
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
    </div>
  );
}
