'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    const form = new FormData(event.currentTarget);
    const body = {
      email: String(form.get('email') ?? ''),
      password: String(form.get('password') ?? ''),
    };
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        setError(res.status === 429
          ? 'Too many attempts. Please try again in a minute.'
          : 'Invalid email or password.');
        setSubmitting(false);
        return;
      }
      router.push('/app');
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <label style={{ display: 'block', marginTop: '0.9rem' }}>
        <span style={{ display: 'block', marginBottom: '0.3rem', color: 'var(--text-muted)', fontSize: '0.92rem' }}>
          Email
        </span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          style={inputStyle}
        />
      </label>
      <label style={{ display: 'block', marginTop: '0.9rem' }}>
        <span style={{ display: 'block', marginBottom: '0.3rem', color: 'var(--text-muted)', fontSize: '0.92rem' }}>
          Password
        </span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          style={inputStyle}
        />
      </label>
      {error && (
        <p role="alert" style={{ color: 'var(--accent-red)', marginTop: '0.5rem' }}>
          {error}
        </p>
      )}
      <button
        type="submit"
        className="btn btn-primary"
        disabled={submitting}
        style={{ marginTop: '1rem' }}
      >
        {submitting ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.65rem 0.75rem',
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  color: 'var(--text)',
  fontFamily: 'inherit',
  fontSize: '1rem',
};
