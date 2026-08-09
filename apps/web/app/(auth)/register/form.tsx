'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function RegisterForm() {
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
      orgName: String(form.get('orgName') ?? ''),
    };
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(errorLabel(res.status, data.error));
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
      <Field label="Email" name="email" type="email" required autoComplete="email" />
      <Field
        label="Password (min 12 characters)"
        name="password"
        type="password"
        required
        autoComplete="new-password"
        minLength={12}
      />
      <Field
        label="Organization name"
        name="orgName"
        type="text"
        required
        autoComplete="organization"
      />
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
        {submitting ? 'Creating…' : 'Create account'}
      </button>
    </form>
  );
}

function Field(props: {
  label: string;
  name: string;
  type: string;
  required?: boolean;
  autoComplete?: string;
  minLength?: number;
}) {
  return (
    <label style={{ display: 'block', marginTop: '0.9rem' }}>
      <span style={{ display: 'block', marginBottom: '0.3rem', color: 'var(--text-muted)', fontSize: '0.92rem' }}>
        {props.label}
      </span>
      <input
        name={props.name}
        type={props.type}
        required={props.required}
        autoComplete={props.autoComplete}
        minLength={props.minLength}
        style={{
          width: '100%',
          padding: '0.65rem 0.75rem',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          color: 'var(--text)',
          fontFamily: 'inherit',
          fontSize: '1rem',
        }}
      />
    </label>
  );
}

function errorLabel(status: number, code?: string): string {
  if (status === 429) return 'Too many attempts. Please try again in a minute.';
  if (code === 'invalid_request') return 'Please check the form and try again.';
  if (code === 'registration_failed') return 'Registration failed. Try a different email.';
  return 'Something went wrong. Please try again.';
}
