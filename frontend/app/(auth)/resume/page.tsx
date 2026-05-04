'use client';

import { useState } from 'react';
import { Card } from '@/components/Card';

export default function ResumePage() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage('');
    setError('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('O currículo deve ser obrigatoriamente no formato PDF.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('O currículo deve ter no máximo 2MB.');
      return;
    }

    setMessage('Upload feito com sucesso!');
  };

  return (
    <>
      <h1 className="text-display-lg font-bold text-primary tracking-tight mb-8">Meu currículo</h1>

      <Card className="flex flex-col items-start gap-6">
        <p className="text-sm text-secondary">
          Faça o upload do seu currículo em PDF para que possamos extrair suas habilidades e melhorar as recomendações de vagas.
        </p>

        <div className="flex flex-col items-start gap-4 w-full">
          <label className="flex items-center gap-3 px-4 py-3 border border-dashed border-border-subtle rounded-lg w-full cursor-pointer hover:bg-hover transition-colors group">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-brand-primary group-hover:scale-110 transition-transform"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-primary">Selecionar arquivo</span>
              <span className="text-xs text-secondary">PDF até 2MB</span>
            </div>
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          {error && (
            <div className="p-3 bg-status-hot/10 border border-status-hot/20 rounded-md w-full">
              <p className="text-sm text-status-hot font-medium">{error}</p>
            </div>
          )}
          
          {message && (
            <div className="p-3 bg-brand-action/10 border border-brand-action/20 rounded-md w-full">
              <p className="text-sm text-brand-action font-medium">{message}</p>
            </div>
          )}
        </div>
      </Card>
    </>
  );
}
