import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, ArrowRight, CheckCircle2, Mail, ShieldCheck } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import SubmitButton from '../components/SubmitButton';
import { request } from '../services/api';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm({
    resolver: zodResolver(z.object({ email: z.string().email('Enter a valid email address.') }))
  });

  const onSubmit = async values => {
    try {
      await request('post', '/auth/forgot-password', values);
      setSent(true);
    } catch (error) {
      setError('root', { message: error.message || 'Unable to send a reset link. Please try again.' });
    }
  };

  return (
    <AuthLayout variant="modern">
      <section className="auth-rebuilt-card auth-rebuilt-aux-card" aria-labelledby="forgot-password-heading">
        {sent ? (
          <div className="auth-rebuilt-status">
            <div className="auth-rebuilt-status-icon is-success"><CheckCircle2 size={30} /></div>
            <div className="auth-rebuilt-eyebrow"><Mail size={15} /> Account recovery</div>
            <h2 id="forgot-password-heading">Check your email</h2>
            <p className="auth-rebuilt-intro">If an account matches that address, a secure password reset link has been sent. Check your inbox and spam folder.</p>
            <Link className="auth-rebuilt-submit auth-rebuilt-aux-primary" to="/login"><ArrowLeft size={17} /> Back to sign in</Link>
          </div>
        ) : (
          <>
            <div className="auth-rebuilt-eyebrow"><ShieldCheck size={15} /> Account recovery</div>
            <h2 id="forgot-password-heading">Reset your password</h2>
            <p className="auth-rebuilt-intro">Enter the email address linked to your account and we’ll send a secure reset link.</p>
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
              <SubmitButton loading={isSubmitting} className="auth-rebuilt-submit" icon={ArrowRight}>Send reset link</SubmitButton>
            </form>
            <p className="auth-rebuilt-switch auth-rebuilt-back-link"><Link to="/login"><ArrowLeft size={14} /> Back to sign in</Link></p>
          </>
        )}
      </section>
    </AuthLayout>
  );
}
