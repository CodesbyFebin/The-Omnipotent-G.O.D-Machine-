import type { Metadata } from 'next';
import { RegisterForm } from './form';

export const metadata: Metadata = {
  title: 'Create account',
  description: 'Register for GOD Machine.',
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return (
    <section className="hero" style={{ maxWidth: 480 }}>
      <h1>Create account</h1>
      <p className="lede">
        You'll get a personal organization to work in. You can add teammates
        later.
      </p>
      <RegisterForm />
      <p style={{ marginTop: '1.25rem', color: 'var(--text-muted)' }}>
        Already have an account? <a href="/login">Sign in</a>.
      </p>
    </section>
  );
}
