'use client';

import { useCallback, useEffect, useState } from 'react';
import { clearToken, getToken, getUserId, setToken } from '@/lib/auth';
import { apiFetch } from '@/lib/api';

export function useAuth() {
  const [token, setTokenState] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const logout = useCallback(async () => {
    await apiFetch('/auth/logout', { method: 'POST' });
    clearToken();
    window.location.href = '/login';
  }, []);

  const refresh = useCallback(async (): Promise<string | null> => {
    try {
      const res = await apiFetch('/auth/refresh', { method: 'POST' });
      if (res.ok) {
        const { access_token } = await res.json();
        setToken(access_token);
        setTokenState(access_token);
        setUserId(getUserId());
        return access_token;
      }
    } catch (e) {
      console.error('Falha ao atualizar token', e);
    }
    clearToken();
    window.location.href = '/login';
    return null;
  }, []);

  useEffect(() => {
    const t = getToken();
    if (t) {
      setTokenState(t);
      setUserId(getUserId());
    } else {
      refresh();
    }
  }, [refresh]);

  return { token, userId, logout, refresh };
}
