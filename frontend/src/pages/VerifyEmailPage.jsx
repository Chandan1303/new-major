import React, { useEffect, useState, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, LoaderCircle, MailCheck, ShieldAlert } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import { request } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function VerifyEmailPage() {
  const { token } = useParams();
  const { setUser } = useAuth();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const [isRetrying, setIsRetrying] = useState(false);
  const verifyAttempted = useRef(false);

  const performVerification = async () => {
    if (!token) {
      setStatus('error');
      setMessage('This verification link is missing its token. Request a new link and try again.');
      return;
    }

    setStatus('verifying');
    setMessage('');

    try {
      const result = await request('get', `/auth/verify-email/${token}`);
      if (result.data?.alreadyVerified) {
        setStatus('already-verified');
        setMessage(result.message || 'Your email is already verified. You can access your account.');
      } else {
        setStatus('success');
        setMessage(result.message || 'Your email has been verified. You can now access your account.');
      }
      if (result.data?.user) setUser(result.data.user);
    } catch (error) {
      const errorMessage = error.message || '';
      if (errorMessage.toLowerCase().includes('already been used') || errorMessage.toLowerCase().includes('already verified')) {
        setStatus('already-verified');
        setMessage('Your email is already verified. You can sign in to your account.');
      } else {
        setStatus('error');
        setMessage(errorMessage || 'Verification failed. Please try again.');
      }
    } finally {
      setIsRetrying(false);
    }
  };

  useEffect(() => {
    if (verifyAttempted.current) return;
    verifyAttempted.current = true;
    performVerification();
  }, [token]);

  const handleRetry = () => {
    setIsRetrying(true);
    performVerification();
  };

  const isVerified = status === 'success' || status === 'already-verified';

  return (
    <AuthLayout variant="modern">
      <section className="auth-rebuilt-card auth-rebuilt-aux-card" aria-labelledby="verify-email-heading" aria-live="polite">
        {status === 'verifying' ? (
          <div className="auth-rebuilt-status">
            <div className="auth-rebuilt-status-icon is-pending"><LoaderCircle size={30} className="animate-spin" /></div>
            <div className="auth-rebuilt-eyebrow"><MailCheck size={15} /> Email verification</div>
            <h2 id="verify-email-heading">Verifying your email</h2>
            <p className="auth-rebuilt-intro">Please wait while we confirm your email address.</p>
          </div>
        ) : isVerified ? (
          <div className="auth-rebuilt-status">
            <div className="auth-rebuilt-status-icon is-success"><CheckCircle2 size={30} /></div>
            <div className="auth-rebuilt-eyebrow"><MailCheck size={15} /> Email verification</div>
            <h2 id="verify-email-heading">{status === 'already-verified' ? 'Email already verified' : 'Email verified'}</h2>
            <p className="auth-rebuilt-intro">{message}</p>
            <div className="auth-rebuilt-aux-actions">
              <Link to="/login" className="auth-rebuilt-submit"><ArrowRight size={17} /> Sign in</Link>
            </div>
          </div>
        ) : (
          <div className="auth-rebuilt-status">
            <div className="auth-rebuilt-status-icon is-error"><ShieldAlert size={30} /></div>
            <div className="auth-rebuilt-eyebrow"><MailCheck size={15} /> Email verification</div>
            <h2 id="verify-email-heading">Verification didn’t complete</h2>
            <p className="auth-rebuilt-intro">{message}</p>
            <div className="auth-rebuilt-aux-actions">
              <button type="button" className="auth-rebuilt-submit" onClick={handleRetry} disabled={isRetrying}>
                <ArrowRight size={17} /> {isRetrying ? 'Retrying…' : 'Try again'}
              </button>
              <Link to="/resend-verification" className="auth-rebuilt-secondary-link">Send a new verification link</Link>
            </div>
            <p className="auth-rebuilt-switch auth-rebuilt-back-link"><Link to="/login"><ArrowLeft size={14} /> Back to sign in</Link></p>
          </div>
        )}
      </section>
    </AuthLayout>
  );
}
