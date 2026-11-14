import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, LogOut, Save } from 'lucide-react';
import { toast } from 'sonner';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { CheckboxField, FormSection, TextField } from '@/components/admin/form/fields';
import Button from '@/components/ui/Button';
import useAuth from '@/hooks/useAuth';
import { handleSaveError } from '@/lib/adminForms';
import { emailFormSchema, MIN_PASSWORD_LENGTH, passwordFormSchema } from '@/lib/adminSchemas';
import api, { getErrorMessage } from '@/lib/api';
import { formatDate, formatRelative } from '@/lib/format';

/** "Nov 8, 2026 (3 days ago)", or a fallback when the date is not known. */
function describeDate(date, fallback) {
  return date ? `${formatDate(date)} (${formatRelative(date)})` : fallback;
}

/** Submit button with a spinner, shared by the two forms. */
function SubmitButton({ busy, children }) {
  return (
    <Button size="sm" type="submit" disabled={busy} className="self-end">
      {busy ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <Save className="size-4" aria-hidden="true" />
      )}
      {busy ? 'Saving...' : children}
    </Button>
  );
}

/** Change the sign-in email; the current password confirms it is really the admin. */
function EmailForm() {
  const { admin, setAdmin } = useAuth();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(emailFormSchema),
    defaultValues: { email: admin?.email ?? '', currentPassword: '' },
  });

  const onSubmit = async (values) => {
    try {
      const { data } = await api.put('/auth/email', values);
      setAdmin(data.admin);
      reset({ email: data.admin.email, currentPassword: '' });
      toast.success('Sign-in email changed.');
    } catch (error) {
      handleSaveError(error, setError, ['email', 'currentPassword']);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="New email"
          type="email"
          autoComplete="email"
          required
          registration={register('email')}
          error={errors.email?.message}
          disabled={isSubmitting}
        />
        <TextField
          label="Current password"
          type="password"
          autoComplete="current-password"
          required
          registration={register('currentPassword')}
          error={errors.currentPassword?.message}
          disabled={isSubmitting}
        />
      </div>
      <SubmitButton busy={isSubmitting}>Change email</SubmitButton>
    </form>
  );
}

/** Change the password. Other browsers are signed out; this one stays signed in. */
function PasswordForm() {
  const { setAdmin } = useAuth();
  const [showPasswords, setShowPasswords] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const onSubmit = async ({ currentPassword, newPassword }) => {
    try {
      const { data } = await api.put('/auth/password', { currentPassword, newPassword });
      setAdmin(data.admin);
      reset();
      toast.success('Password changed. Other sessions have been signed out.');
    } catch (error) {
      handleSaveError(error, setError, ['currentPassword', 'newPassword']);
    }
  };

  const type = showPasswords ? 'text' : 'password';

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <TextField
        label="Current password"
        type={type}
        autoComplete="current-password"
        required
        className="sm:max-w-sm"
        registration={register('currentPassword')}
        error={errors.currentPassword?.message}
        disabled={isSubmitting}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="New password"
          type={type}
          autoComplete="new-password"
          required
          hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
          registration={register('newPassword')}
          error={errors.newPassword?.message}
          disabled={isSubmitting}
        />
        <TextField
          label="Confirm new password"
          type={type}
          autoComplete="new-password"
          required
          registration={register('confirmPassword')}
          error={errors.confirmPassword?.message}
          disabled={isSubmitting}
        />
      </div>
      <CheckboxField
        label="Show passwords"
        checked={showPasswords}
        onChange={(event) => setShowPasswords(event.target.checked)}
      />
      <SubmitButton busy={isSubmitting}>Change password</SubmitButton>
    </form>
  );
}

/**
 * Admin account page: sign-in details, change email, change password and
 * sign out of every other session.
 */
export default function AdminAccount() {
  const { admin } = useAuth();
  const [confirmRevoke, setConfirmRevoke] = useState(false);
  const [revoking, setRevoking] = useState(false);

  const revoke = async () => {
    setRevoking(true);
    try {
      await api.post('/auth/sessions/revoke');
      toast.success('Signed out of all other sessions.');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setRevoking(false);
      setConfirmRevoke(false);
    }
  };

  const details = [
    { label: 'Sign-in email', value: admin?.email },
    {
      label: 'Previous sign-in',
      value: describeDate(admin?.previousLoginAt, 'No earlier sign-in recorded'),
    },
    {
      label: 'Password last changed',
      value: describeDate(admin?.passwordChangedAt, 'Not recorded'),
    },
  ];

  return (
    <>
      <AdminPageHeader title="Account" description="Your sign-in details and security settings." />

      <div className="flex flex-col gap-6">
        <FormSection title="Sign-in details">
          <dl className="grid gap-4 sm:grid-cols-3">
            {details.map(({ label, value }) => (
              <div key={label} className="flex flex-col gap-1">
                <dt className="text-xs text-muted">{label}</dt>
                <dd className="text-sm font-medium break-words">{value}</dd>
              </div>
            ))}
          </dl>
        </FormSection>

        <FormSection
          title="Change email"
          description="The address you use to sign in. This is separate from the public contact email under Site content."
        >
          <EmailForm />
        </FormSection>

        <FormSection
          title="Change password"
          description="Changing your password signs out every other browser. This one stays signed in."
        >
          <PasswordForm />
        </FormSection>

        <FormSection
          title="Sessions"
          description="If you signed in on a device you no longer use, end every session except this one."
        >
          <button
            type="button"
            onClick={() => setConfirmRevoke(true)}
            className="inline-flex w-fit items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium transition-colors hover:border-danger hover:text-danger"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Sign out everywhere else
          </button>
        </FormSection>
      </div>

      <ConfirmDialog
        open={confirmRevoke}
        title="Sign out everywhere else?"
        description="Every other browser and device will need to sign in again. This browser stays signed in."
        confirmLabel="Sign out others"
        busy={revoking}
        onConfirm={revoke}
        onCancel={() => setConfirmRevoke(false)}
      />
    </>
  );
}
