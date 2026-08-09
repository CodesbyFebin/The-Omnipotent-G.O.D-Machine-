import type { Metadata } from 'next';
import { LoginForm } from './form';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to GOD Machine.',
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <section className="hero" style={{ maxWidth: 440 }}>
      <h1>Sign in</h1>
      <LoginForm />
      <p style={{ marginTop: '1.25rem', color: 'var(--text-muted)' }}>
        No account yet? <a href="/register">Create one</a>.
      </p>
    </section>
  );
}
