'use client';

import { useEffect } from 'react';

export default function GithubCallbackPage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const error = params.get('error');

    if (window.opener) {
      window.opener.postMessage(
        { type: 'github_oauth_callback', code, state, error },
        window.location.origin,
      );
      window.close();
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-sm text-secondary">Autenticando com GitHub...</p>
    </div>
  );
}
