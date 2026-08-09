import Link from 'next/link';
import { SITE } from '../_lib/site';

export function Nav() {
  return (
    <header className="nav" role="banner">
      <div className="nav-inner">
        <Link href="/" className="brand" aria-label={`${SITE.name} home`}>
          CodingAgent<span className="brand-sub">/ GOD</span>
        </Link>
        <nav className="nav-links" aria-label="Primary">
          <Link href="/god">GOD Machine</Link>
          <Link href="/comparisons">Comparisons</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/security">Security</Link>
          <a
            href={SITE.githubUrl}
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
    <footer className="footer" role="contentinfo">
      <div className="footer-inner">
        <div>
          <div className="footer-brand">CodingAgent / GOD</div>
          <div className="footer-tag">Open Agentic Development OS.</div>
          <div className="footer-meta">
            Open source · Apache-2.0 · Self-hostable · Model-agnostic · Sovereign
          </div>
        </div>
        <nav aria-label="Footer">
          <ul className="footer-nav">
            <li><Link href="/god">GOD Machine</Link></li>
            <li><Link href="/what-is-agentic-development-os">What is an Agentic Development OS?</Link></li>
            <li><Link href="/what-is-a-coding-agent">What is an AI coding agent?</Link></li>
            <li><Link href="/comparisons">Compare vs Cursor / Cline / OpenHands</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
            <li><Link href="/security">Security</Link></li>
            <li><a href={SITE.githubUrl} target="_blank" rel="noopener noreferrer">GitHub</a></li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
