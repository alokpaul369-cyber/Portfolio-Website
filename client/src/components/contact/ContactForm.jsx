import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';
import Button from '@/components/ui/Button';
import api, { getErrorMessage } from '@/lib/api';
import { contactDefaults, contactSchema, MESSAGE_MAX } from '@/lib/contactSchema';
import FormField from './FormField';

const SUCCESS_MESSAGE = 'Message sent successfully. I will get back to you soon.';
const ERROR_MESSAGE = 'Something went wrong. Please try again.';
const FIELDS = new Set(['name', 'email', 'subject', 'message']);

/**
 * Contact form: validated on the client with zod, submitted to POST /api/contact.
 * - Server validation errors are shown on the matching fields.
 * - Rate-limit responses show the server's explanation.
 * - Any other failure shows a generic error toast; the visitor's input is kept.
 */
export default function ContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: contactDefaults,
    mode: 'onTouched',
  });

  // Subscribes to the message field only, for the character counter.
  const messageLength = useWatch({ control, name: 'message' })?.length ?? 0;

  const onSubmit = async (values) => {
    try {
      await api.post('/contact', values);
      toast.success(SUCCESS_MESSAGE);
      reset(contactDefaults);
    } catch (error) {
      const status = error.response?.status;
      const details = error.response?.data?.details;

      if (status === 400 && Array.isArray(details)) {
        details
          .filter((detail) => FIELDS.has(detail.field))
          .forEach((detail) => setError(detail.field, { message: detail.message }));
        toast.error('Please check the highlighted fields and try again.');
      } else if (status === 429) {
        toast.error(getErrorMessage(error));
      } else {
        toast.error(ERROR_MESSAGE);
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-label="Contact form"
      className="flex flex-col gap-5 rounded-xl border border-border bg-surface p-6 sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Name"
          autoComplete="name"
          placeholder="Your full name"
          registration={register('name')}
          error={errors.name?.message}
          disabled={isSubmitting}
        />
        <FormField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          registration={register('email')}
          error={errors.email?.message}
          disabled={isSubmitting}
        />
      </div>

      <FormField
        label="Subject"
        placeholder="What would you like to discuss?"
        registration={register('subject')}
        error={errors.subject?.message}
        disabled={isSubmitting}
      />

      <FormField
        label="Message"
        multiline
        rows={6}
        placeholder="Share some details about your project, role or question."
        registration={register('message')}
        error={errors.message?.message}
        disabled={isSubmitting}
        hint={
          <span
            className={`text-[11px] ${messageLength > MESSAGE_MAX ? 'text-danger' : 'text-muted'}`}
          >
            {messageLength}/{MESSAGE_MAX}
          </span>
        }
      />

      {/* Honeypot: visually hidden and skipped by keyboard and screen readers. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register('website')}
        />
      </div>

      <div className="flex flex-col-reverse items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted">All fields are required.</p>
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Sending...
            </>
          ) : (
            <>
              <Send className="size-4" aria-hidden="true" />
              Send message
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
