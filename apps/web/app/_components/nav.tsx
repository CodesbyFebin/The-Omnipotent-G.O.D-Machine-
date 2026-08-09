import Link from 'next/link';

export function Nav() {
  return (
    <header className="nav">
      <div className="nav-inner">
        <Link href="/" className="brand">
          CodingAgent<span className="brand-sub">/ GOD</span>
        </Link>
        <nav className="nav-links" aria-label="Primary">
          <Link href="/god">GOD Machine</Link>
          <a
            href="https://github.com/CodesbyFebin/The-Omnipotent-G.O.D-Machine-"
            rel="noopener noreferrer"
            target="_blank"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <span>Open-source. Self-hostable. Model-agnostic. Sovereign.</span>
        <span>Apache-2.0 · Phase 0 · No production claims</span>
      </div>
    </footer>
  );
}
