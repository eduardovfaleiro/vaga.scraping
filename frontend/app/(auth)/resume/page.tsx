'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function ResumePage() {
  const { logout } = useAuth();
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
    <div className="min-h-screen bg-zinc-50">
      <nav className="bg-white border-b border-zinc-200 py-3">
        <div className="max-w-2xl mx-auto px-4 flex items-center justify-between">
          <span className="font-semibold text-zinc-900">Vagazap</span>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/dashboard" className="text-zinc-600 hover:text-zinc-900">
              Recomendações
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
        <h1 className="text-xl font-semibold text-zinc-900 mb-6">Meu currículo</h1>

        <div className="flex flex-col items-start gap-4">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-zinc-900"
            >
              <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
              <path d="M12 12v9" />
              <path d="m16 16-4-4-4 4" />
            </svg>
            <label className="cursor-pointer text-zinc-900 hover:text-zinc-700 transition-colors underline text-sm font-medium">
              Importar Currículo
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <p className="text-sm text-green-600">{message}</p>}
        </div>
      </main>
    </div>
  );
}
