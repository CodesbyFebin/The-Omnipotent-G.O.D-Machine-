import Link from 'next/link';
import { Footer, Nav } from './_components/nav';

export default function NotFound() {
  return (
    <>
      <Nav />
      <main className="container">
        <section className="hero">
          <h1>404</h1>
          <p className="lede">
            No route here. The runtime is still being built — most of the
            product routes named in the spec (<code>/agents</code>,{' '}
            <code>/models</code>, <code>/missions</code>, and so on) are not
            wired yet.
          </p>
          <Link href="/" className="btn btn-primary">
            Back to overview
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
