import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppLayout from './AppLayout';
import Brand from './Brand';

export default function LegalPageLayout({ title, description, children }) {
  const { user } = useAuth();

  const pageContent = (
    <div className={`page-container legal-page-content ${user ? 'legal-page-authenticated' : ''}`}>
      <header className="page-header legal-page-heading">
        <div>
          <p className="eyebrow">Policies &amp; information</p>
          <h1 className="page-title">{title}</h1>
          <p className="page-subtitle">{description}</p>
        </div>
        <Link className="legal-dashboard-link" to={user ? '/dashboard' : '/login'}>
          <ArrowLeft size={16} /> {user ? 'Back to dashboard' : 'Back to sign in'}
        </Link>
      </header>
      <article className="card legal-policy-card">
        <div className="legal-text">{children}</div>
      </article>
      <footer className="legal-page-footer">
        <span>SugarYield AI</span>
        <div><Link to="/terms-of-use">Terms of Use</Link><Link to="/privacy-policy">Privacy Policy</Link></div>
      </footer>
    </div>
  );

  if (user) return <AppLayout>{pageContent}</AppLayout>;

  return (
    <div className="public-legal-page">
      <header className="public-legal-topbar">
        <Brand />
        <nav aria-label="Account links">
          <Link to="/login">Sign in</Link>
          <Link className="public-legal-signup" to="/signup">Create account</Link>
        </nav>
      </header>
      <main className="public-legal-main">{pageContent}</main>
    </div>
  );
}
