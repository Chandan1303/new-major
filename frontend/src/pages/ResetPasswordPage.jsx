import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, ArrowRight, CheckCircle2, LockKeyhole } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import PasswordInput from '../components/PasswordInput';
import SubmitButton from '../components/SubmitButton';
import { request } from '../services/api';

const schema = z.object({
  password: z.string()
    .min(10, 'Use at least 10 characters.')
    .regex(/[a-z]/, 'Include a lowercase letter.')
    .regex(/[A-Z]/, 'Include an uppercase letter.')
    .regex(/\d/, 'Include a number.'),
  confirm: z.string()
}).refine(values => values.password === values.confirm, {
  path: ['confirm'],
  message: 'Passwords do not match.'
});

export default function ResetPasswordPage() {
  const { token } = useParams();
  const [done, setDone] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async ({ password }) => {
    try {
      await request('post', '/auth/reset-password', { token, password });
      setDone(true);
    } catch (error) {
      setError('root', { message: error.message || 'Unable to reset your password. Request a new link and try again.' });
    }
  };

  return (
    <AuthLayout variant="modern">
      <section className="auth-rebuilt-card auth-rebuilt-aux-card" aria-labelledby="reset-password-heading">
        {done ? (
          <div className="auth-rebuilt-status">
            <div className="auth-rebuilt-status-icon is-success"><CheckCircle2 size={30} /></div>
            <div className="auth-rebuilt-eyebrow"><LockKeyhole size={15} /> Account recovery</div>
            <h2 id="reset-password-heading">Password updated</h2>
            <p className="auth-rebuilt-intro">Your password has been updated. You can now sign in with your new password.</p>
            <Link className="auth-rebuilt-submit auth-rebuilt-aux-primary" to="/login"><ArrowLeft size={17} /> Sign in</Link>
          </div>
        ) : (
          <>
            <div className="auth-rebuilt-eyebrow"><LockKeyhole size={15} /> Account recovery</div>
            <h2 id="reset-password-heading">Choose a new password</h2>
            <p className="auth-rebuilt-intro">Use at least 10 characters, including an uppercase letter, a lowercase letter, and a number.</p>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <PasswordInput label="New password" name="password" error={errors.password} register={register} autoComplete="new-password" placeholder="At least 10 characters" />
              <PasswordInput label="Confirm new password" name="confirm" error={errors.confirm} register={register} autoComplete="new-password" placeholder="Enter your new password again" />
              {errors.root && <div className="auth-rebuilt-alert" role="alert">{errors.root.message}</div>}
              <SubmitButton loading={isSubmitting} className="auth-rebuilt-submit" icon={ArrowRight}>Update password</SubmitButton>
            </form>
            <p className="auth-rebuilt-switch auth-rebuilt-back-link"><Link to="/login"><ArrowLeft size={14} /> Back to sign in</Link></p>
          </>
        )}
      </section>
    </AuthLayout>
  );
}
