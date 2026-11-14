import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CircleAlert, Eye, EyeOff, Loader2, Lock } from 'lucide-react';
import { TextField } from '@/components/admin/form/fields';
import Button from '@/components/ui/Button';
import { site } from '@/config/site';
import useAuth from '@/hooks/useAuth';
import { getErrorMessage } from '@/lib/api';

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Please enter your email address')
    .pipe(z.email('Please enter a valid email address')),
  password: z.string().min(1, 'Please enter your password'),
});

/**
 * Admin sign-in page at /admin/login.
 * After signing in, the admin returns to the page they originally requested.
 */
export default function AdminLogin() {
  const { status, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname?.startsWith('/admin')
    ? location.state.from.pathname
    : '/admin';

  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } });

  if (status === 'authenticated') {
    return <Navigate to={from} replace />;
  }

  const onSubmit = async ({ email, password }) => {
    setFormError('');
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-4 py-12 text-text">
      <Helmet>
        <title>Sign in | Admin</title>
      </Helmet>
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col gap-3">
          <p className="eyebrow flex items-center gap-2">
            <Lock className="size-3.5" strokeWidth={2} aria-hidden="true" />
            {site.name}
          </p>
          <h1 className="text-3xl font-bold tracking-tight">Admin sign in</h1>
          <p className="text-sm text-muted">Sign in to manage the portfolio content.</p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-5 rounded-xl border border-border bg-surface p-6 sm:p-8"
        >
          {formError && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-md border border-danger/40 bg-danger/10 px-3 py-2.5 text-sm text-danger"
            >
              <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {formError}
            </div>
          )}

          <TextField
            label="Email"
            type="email"
            autoComplete="username"
            autoFocus
            registration={register('email')}
            error={errors.email?.message}
            disabled={isSubmitting}
          />

          <div className="relative">
            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              registration={register('password')}
              error={errors.password?.message}
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword((shown) => !shown)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute top-[30px] right-2 inline-flex size-7 items-center justify-center rounded text-muted hover:text-text"
            >
              {showPassword ? (
                <EyeOff className="size-4" aria-hidden="true" />
              ) : (
                <Eye className="size-4" aria-hidden="true" />
              )}
            </button>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted">
          <a href="/" className="hover:text-primary">
            Return to the website
          </a>
        </p>
      </div>
    </main>
  );
}
