'use client';

import { apiFetch } from '@/lib/api';
import { setToken } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function GithubLoginButton({ label = 'Continuar com GitHub' }: { label?: string }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const stateRef = useRef('');

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== 'github_oauth_callback') return;

      const { code, state, error: oauthError } = event.data;

      if (oauthError || !code || state !== stateRef.current) {
        setError('Autenticação com GitHub falhou');
        setLoading(false);
        return;
      }

      apiFetch('/auth/github', {
        method: 'POST',
        body: JSON.stringify({ code }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            setError(data.detail ?? 'Erro ao autenticar com GitHub');
            return;
          }
          const { access_token } = await res.json();
          setToken(access_token);
          router.push('/dashboard');
        })
        .catch(() => setError('Erro ao conectar com o servidor'))
        .finally(() => setLoading(false));
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [router]);

  function handleClick() {
    setError('');
    stateRef.current = crypto.randomUUID();

    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID ?? '';
    const redirectUri = `${window.location.origin}/auth/callback/github`;
    const url =
      `https://github.com/login/oauth/authorize` +
      `?client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=user:email` +
      `&state=${stateRef.current}`;

    const width = 600;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    window.open(url, 'github_oauth', `width=${width},height=${height},left=${left},top=${top}`);
    setLoading(true);
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="flex items-center justify-center gap-3 border border-border-subtle rounded-md px-4 py-2.5 text-sm font-semibold text-primary hover:bg-hover disabled:opacity-50 transition-colors cursor-pointer bg-surface"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden fill="currentColor">
          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
        </svg>
        {loading ? 'Aguarde...' : label}
      </button>
      {error && <p className="text-sm text-status-hot font-medium">{error}</p>}
    </div>
  );
}
