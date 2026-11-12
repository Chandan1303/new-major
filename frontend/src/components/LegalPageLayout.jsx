import React, { Children, cloneElement, isValidElement } from 'react';
import { ArrowLeft, BookOpenText, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppLayout from './AppLayout';
import Brand from './Brand';

const textContent = node => {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textContent).join('');
  if (isValidElement(node)) return textContent(node.props.children);
  return '';
};

export default function LegalPageLayout({ title, description, children }) {
  const { user } = useAuth();
  const sections = Children.toArray(children).filter(child => isValidElement(child) && child.type === 'section');
  const sectionItems = sections.map((section, index) => {
    const heading = Children.toArray(section.props.children).find(child => isValidElement(child) && ['h2', 'h3'].includes(child.type));
    const label = textContent(heading?.props.children).replace(/^\d+\.\s*/, '').trim() || `Section ${index + 1}`;
    const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `section-${index + 1}`;
    return { id: `policy-${index + 1}-${slug}`, label, section };
  });

  let policySectionIndex = 0;
  const policyContent = Children.map(children, child => {
    if (!isValidElement(child) || child.type !== 'section') return child;
    const item = sectionItems[policySectionIndex++];
    return item ? cloneElement(child, { id: item.id, className: `legal-policy-section ${child.props.className || ''}`.trim() }) : child;
  });

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
      <div className="legal-reading-layout">
        {sectionItems.length > 0 && (
          <nav className="legal-toc" aria-label="Policy sections">
            <div className="legal-toc-heading"><BookOpenText size={17} /><span>On this page</span></div>
            <ol>
              {sectionItems.map((item, index) => (
                <li key={item.id}><a href={`#${item.id}`}><span>{String(index + 1).padStart(2, '0')}</span>{item.label}</a></li>
              ))}
            </ol>
            <div className="legal-toc-note"><ShieldCheck size={15} /><span>Review the full policy before using the service.</span></div>
          </nav>
        )}
        <article className="card legal-policy-card">
          <div className="legal-text">{policyContent}</div>
        </article>
      </div>
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
