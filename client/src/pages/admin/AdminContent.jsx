import { useContext, useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, RotateCcw, Save } from 'lucide-react';
import { toast } from 'sonner';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import RecordLoader from '@/components/admin/RecordLoader';
import DocumentUploader from '@/components/admin/form/DocumentUploader';
import RepeatableRows from '@/components/admin/form/RepeatableRows';
import { FormSection, TextAreaField, TextField } from '@/components/admin/form/fields';
import Button from '@/components/ui/Button';
import { SiteContentContext } from '@/context/siteContentContext';
import useUploadSession from '@/hooks/useUploadSession';
import { contentFormSchema } from '@/lib/adminSchemas';
import api, { getErrorMessage } from '@/lib/api';
import { CONTENT_LIMITS, DEFAULT_CONTENT, mergeContent } from '@/lib/siteContent';

const TEXT_FIELDS = ['role', 'tagline', 'location', 'availability', 'email', 'linkedin'];

/** Form values for the given settings: saved values where set, defaults elsewhere. */
function toFormValues(settings) {
  const content = mergeContent(settings);
  return {
    role: content.role,
    tagline: content.tagline,
    location: content.location,
    availability: content.availability,
    email: content.email,
    linkedin: content.linkedin ?? '',
    aboutParagraphs: content.aboutParagraphs.map((text) => ({ text })),
    keyFacts: content.keyFacts.map(({ value, label }) => ({ value, label })),
  };
}

const sameList = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/**
 * Request body for the form values. A value equal to the built-in default (or
 * left empty) is sent as null, so the site keeps following the default.
 */
function toRequestContent(values) {
  const content = {};
  for (const field of TEXT_FIELDS) {
    const value = values[field].trim();
    content[field] = value && value !== (DEFAULT_CONTENT[field] ?? '') ? value : null;
  }

  const paragraphs = values.aboutParagraphs.map((item) => item.text.trim());
  content.aboutParagraphs = sameList(paragraphs, DEFAULT_CONTENT.aboutParagraphs)
    ? null
    : paragraphs;

  const facts = values.keyFacts.map(({ value, label }) => ({
    value: value.trim(),
    label: label.trim(),
  }));
  const defaultFacts = DEFAULT_CONTENT.keyFacts.map(({ value, label }) => ({ value, label }));
  content.keyFacts = sameList(facts, defaultFacts) ? null : facts;

  return content;
}

/** Small "Reset to default" control shown beside a field that differs from its default. */
function ResetButton({ onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-muted transition-colors hover:text-primary"
    >
      <RotateCcw className="size-3" aria-hidden="true" />
      Reset {label} to default
    </button>
  );
}

/** The form itself, rendered once the current settings have been loaded. */
function ContentForm({ settings }) {
  const { applySettings } = useContext(SiteContentContext);
  const uploads = useUploadSession();
  // The CV is handled outside react-hook-form: it is a file, saved with the form.
  const [cv, setCv] = useState(() => mergeContent(settings).cv);
  const [cvChanged, setCvChanged] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(contentFormSchema),
    defaultValues: toFormValues(settings),
  });

  const paragraphs = useFieldArray({ control, name: 'aboutParagraphs' });
  const facts = useFieldArray({ control, name: 'keyFacts' });
  const values = useWatch({ control });

  const onSubmit = async (formValues) => {
    const body = { content: toRequestContent(formValues) };
    if (cvChanged) {
      body.cv = cv ? { url: cv.url, publicId: cv.publicId, filename: cv.filename } : null;
    }

    try {
      const { data } = await api.put('/settings', body);
      uploads.commit();
      applySettings(data.data);
      reset(toFormValues(data.data));
      setCv(mergeContent(data.data).cv);
      setCvChanged(false);
      toast.success('Site content saved.');
    } catch (error) {
      // Server field names look like "content.tagline" or "content.keyFacts.0.label".
      const details = error?.response?.data?.details;
      let placed = 0;
      if (Array.isArray(details)) {
        details.forEach(({ field, message }) => {
          const name = String(field ?? '')
            .replace(/^content\./, '')
            .split('.')[0];
          if (name in formValues) {
            setError(name, { message });
            placed += 1;
          }
        });
      }
      toast.error(placed > 0 ? 'Please correct the highlighted fields.' : getErrorMessage(error));
    }
  };

  const resetField = (field) =>
    setValue(field, DEFAULT_CONTENT[field] ?? '', { shouldDirty: true, shouldValidate: true });
  const differs = (field) => (values[field] ?? '').trim() !== (DEFAULT_CONTENT[field] ?? '');

  const textField = (field, label, props = {}) => (
    <div className="flex flex-col gap-1.5">
      <TextField
        label={label}
        registration={register(field)}
        error={errors[field]?.message}
        disabled={isSubmitting}
        {...props}
      />
      {DEFAULT_CONTENT[field] && differs(field) && (
        <ResetButton label={label.toLowerCase()} onClick={() => resetField(field)} />
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      <FormSection
        title="Introduction"
        description="Shown at the top of the Home page and on the Contact page."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          {textField('role', 'Role', { maxLength: CONTENT_LIMITS.role })}
          {textField('location', 'Location', { maxLength: CONTENT_LIMITS.location })}
        </div>
        <div className="flex flex-col gap-1.5">
          <TextAreaField
            label="Tagline"
            rows={3}
            maxLength={CONTENT_LIMITS.tagline}
            hint={`${(values.tagline ?? '').length}/${CONTENT_LIMITS.tagline} characters`}
            registration={register('tagline')}
            error={errors.tagline?.message}
            disabled={isSubmitting}
          />
          {differs('tagline') && (
            <ResetButton label="tagline" onClick={() => resetField('tagline')} />
          )}
        </div>
        {textField('availability', 'Availability', { maxLength: CONTENT_LIMITS.availability })}
      </FormSection>

      <FormSection title="About" description="The paragraphs and key facts in the About section.">
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-medium">Paragraphs</h3>
          <RepeatableRows
            itemLabel="paragraph"
            fields={paragraphs.fields}
            min={1}
            max={CONTENT_LIMITS.paragraphs}
            onAdd={() => paragraphs.append({ text: '' })}
            onRemove={paragraphs.remove}
            onMove={paragraphs.move}
            error={errors.aboutParagraphs?.message ?? errors.aboutParagraphs?.root?.message}
            renderRow={(index) => (
              <TextAreaField
                label={`Paragraph ${index + 1}`}
                rows={4}
                maxLength={CONTENT_LIMITS.paragraph}
                registration={register(`aboutParagraphs.${index}.text`)}
                error={errors.aboutParagraphs?.[index]?.text?.message}
                disabled={isSubmitting}
              />
            )}
          />
        </div>

        <div className="flex flex-col gap-3 border-t border-border pt-5">
          <h3 className="text-sm font-medium">Key facts</h3>
          <p className="text-xs text-muted">
            Short figures shown beside the paragraphs, for example a count and what it counts.
            Remove them all to hide the row.
          </p>
          <RepeatableRows
            itemLabel="key fact"
            fields={facts.fields}
            max={CONTENT_LIMITS.facts}
            onAdd={() => facts.append({ value: '', label: '' })}
            onRemove={facts.remove}
            onMove={facts.move}
            error={errors.keyFacts?.message ?? errors.keyFacts?.root?.message}
            renderRow={(index) => (
              <div className="grid gap-3 sm:grid-cols-[8rem_1fr]">
                <TextField
                  label="Value"
                  maxLength={CONTENT_LIMITS.factValue}
                  registration={register(`keyFacts.${index}.value`)}
                  error={errors.keyFacts?.[index]?.value?.message}
                  disabled={isSubmitting}
                />
                <TextField
                  label="Label"
                  maxLength={CONTENT_LIMITS.factLabel}
                  registration={register(`keyFacts.${index}.label`)}
                  error={errors.keyFacts?.[index]?.label?.message}
                  disabled={isSubmitting}
                />
              </div>
            )}
          />
          <button
            type="button"
            onClick={() => {
              paragraphs.replace(toFormValues(null).aboutParagraphs);
              facts.replace(toFormValues(null).keyFacts);
            }}
            className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-muted transition-colors hover:text-primary"
          >
            <RotateCcw className="size-3" aria-hidden="true" />
            Reset About text and key facts to default
          </button>
        </div>
      </FormSection>

      <FormSection
        title="Links and CV"
        description="Contact email, LinkedIn profile and the CV offered for download on the Home page."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          {textField('email', 'Public email', { type: 'email', autoComplete: 'off' })}
          <TextField
            label="LinkedIn URL"
            type="url"
            placeholder="https://www.linkedin.com/in/your-profile"
            hint="Leave empty to hide the LinkedIn link."
            registration={register('linkedin')}
            error={errors.linkedin?.message}
            disabled={isSubmitting}
          />
        </div>
        <DocumentUploader
          label="CV"
          value={cv}
          onChange={(next) => {
            setCv(next);
            setCvChanged(true);
          }}
          session={uploads}
          hint="PDF, up to 4 MB. The Download CV button appears on the Home page once a file is saved."
        />
      </FormSection>

      <div className="flex justify-end">
        <Button size="sm" type="submit" disabled={isSubmitting || (!isDirty && !cvChanged)}>
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Save className="size-4" aria-hidden="true" />
          )}
          {isSubmitting ? 'Saving...' : 'Save content'}
        </Button>
      </div>
    </form>
  );
}

/**
 * Admin page for the text, links and CV shown on the public site.
 * Values start from the built-in defaults; anything changed here is saved to
 * the site settings and appears on the public pages straight away.
 */
export default function AdminContent() {
  return (
    <>
      <AdminPageHeader
        title="Site content"
        description="Text, links and CV shown on the public site. Your name is set in the site code because it is part of the search-engine tags."
      />
      {/* Always edit the latest saved values, not a cached copy. */}
      <RecordLoader path="/settings" label="Site content">
        {(settings) => <ContentForm settings={settings} />}
      </RecordLoader>
    </>
  );
}
