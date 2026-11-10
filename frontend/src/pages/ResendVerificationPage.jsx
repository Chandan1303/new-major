import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, ArrowRight, CheckCircle2, Mail, ShieldCheck } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import SubmitButton from '../components/SubmitButton';
import { request } from '../services/api';

const schema = z.object({ email: z.string().email('Enter a valid email address.') });

export default function ResendVerificationPage() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async values => {
    try {
      await request('post', '/auth/resend-verification', values);
      setSent(true);
    } catch (error) {
      setError('root', { message: error.message || 'Unable to send a verification link. Please try again.' });
    }
  };

  return (
    <AuthLayout variant="modern">
      <section className="auth-rebuilt-card auth-rebuilt-aux-card" aria-labelledby="resend-verification-heading">
        {sent ? (
          <div className="auth-rebuilt-status">
            <div className="auth-rebuilt-status-icon is-success"><CheckCircle2 size={30} /></div>
            <div className="auth-rebuilt-eyebrow"><Mail size={15} /> Email verification</div>
            <h2 id="resend-verification-heading">Check your email</h2>
            <p className="auth-rebuilt-intro">If an unverified account exists for that address, a new verification link has been sent. Check your inbox and spam folder.</p>
            <div className="auth-rebuilt-notice">The verification link expires in 24 hours.</div>
            <Link className="auth-rebuilt-submit auth-rebuilt-aux-primary" to="/login"><ArrowLeft size={17} /> Back to sign in</Link>
          </div>
        ) : (
          <>
            <div className="auth-rebuilt-eyebrow"><ShieldCheck size={15} /> Email verification</div>
            <h2 id="resend-verification-heading">Resend verification email</h2>
            <p className="auth-rebuilt-intro">Enter your account email and we’ll send a fresh verification link.</p>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="auth-rebuilt-field">
                <label htmlFor="email">Email address</label>
                <div className="auth-rebuilt-input-wrap">
                  <Mail size={17} aria-hidden="true" />
                  <input id="email" type="email" autoComplete="email" placeholder="name@myfarm.com" aria-invalid={!!errors.email} {...register('email')} />
                </div>
                {errors.email && <p className="auth-rebuilt-error" role="alert">{errors.email.message}</p>}
              </div>
              {errors.root && <div className="auth-rebuilt-alert" role="alert">{errors.root.message}</div>}
              <SubmitButton loading={isSubmitting} className="auth-rebuilt-submit" icon={ArrowRight}>Send verification email</SubmitButton>
            </form>
            <p className="auth-rebuilt-switch auth-rebuilt-back-link">Remember your password? <Link to="/login">Sign in</Link></p>
          </>
        )}
      </section>
    </AuthLayout>
  );
}
