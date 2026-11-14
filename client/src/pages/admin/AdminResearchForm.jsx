import { useNavigate, useParams } from 'react-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import RecordLoader from '@/components/admin/RecordLoader';
import FormActions from '@/components/admin/form/FormActions';
import TagsInput from '@/components/admin/form/TagsInput';
import {
  CheckboxField,
  FormSection,
  SelectField,
  TextAreaField,
  TextField,
} from '@/components/admin/form/fields';
import { researchStatuses, researchTypes } from '@/data/research';
import useSiteContent from '@/hooks/useSiteContent';
import api from '@/lib/api';
import { handleSaveError, linesToList, toDateInput } from '@/lib/adminForms';
import { researchFormSchema } from '@/lib/adminSchemas';

const FIELDS = [
  'title',
  'slug',
  'type',
  'status',
  'summary',
  'abstract',
  'authors',
  'venue',
  'date',
  'tags',
  'paperUrl',
  'doiUrl',
  'codeUrl',
  'projectUrl',
  'featured',
  'visible',
  'order',
];
const toOptions = (list) => list.map(({ key, label }) => ({ value: key, label }));
const emptyEntry = {
  title: '',
  slug: '',
  type: 'paper',
  status: 'ongoing',
  summary: '',
  abstract: '',
  authors: '',
  venue: '',
  date: '',
  tags: [],
  paperUrl: '',
  doiUrl: '',
  codeUrl: '',
  projectUrl: '',
  featured: false,
  visible: true,
  order: 0,
};

function ResearchForm({ entry }) {
  const navigate = useNavigate();
  const { refresh } = useSiteContent();
  const isEdit = Boolean(entry);
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(researchFormSchema),
    defaultValues: isEdit
      ? {
          ...emptyEntry,
          title: entry.title,
          slug: entry.slug ?? '',
          type: entry.type,
          status: entry.status,
          summary: entry.summary,
          abstract: entry.abstract ?? '',
          authors: (entry.authors ?? []).join('\n'),
          venue: entry.venue ?? '',
          date: toDateInput(entry.date),
          tags: entry.tags ?? [],
          paperUrl: entry.paperUrl ?? '',
          doiUrl: entry.doiUrl ?? '',
          codeUrl: entry.codeUrl ?? '',
          projectUrl: entry.projectUrl ?? '',
          featured: entry.featured,
          visible: entry.visible,
          order: entry.order ?? 0,
        }
      : emptyEntry,
  });

  const onSubmit = async (values) => {
    const payload = {
      ...values,
      authors: linesToList(values.authors),
      date: values.date || null,
    };
    try {
      if (isEdit) await api.put(`/research/${entry.id}`, payload);
      else await api.post('/research', payload);
      toast.success(isEdit ? 'Research entry updated.' : 'Research entry created.');
      // The public menu and sections depend on these entries.
      refresh();
      navigate('/admin/research');
    } catch (error) {
      handleSaveError(error, setError, FIELDS);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      <FormSection title="Entry">
        <TextField
          label="Title"
          required
          registration={register('title')}
          error={errors.title?.message}
        />
        <TextField
          label="Slug"
          registration={register('slug')}
          error={errors.slug?.message}
          hint="Used in the URL. Leave empty to generate it from the title. Changing it breaks existing links."
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            label="Type"
            required
            options={toOptions(researchTypes)}
            registration={register('type')}
            error={errors.type?.message}
          />
          <SelectField
            label="Status"
            required
            options={toOptions(researchStatuses)}
            registration={register('status')}
            error={errors.status?.message}
          />
        </div>
      </FormSection>

      <FormSection title="Description">
        <TextAreaField
          label="Summary"
          required
          rows={3}
          maxLength={300}
          registration={register('summary')}
          error={errors.summary?.message}
          hint="One or two sentences, up to 300 characters. Shown in lists."
        />
        <TextAreaField
          label="Abstract"
          rows={8}
          registration={register('abstract')}
          error={errors.abstract?.message}
          hint="Optional. Plain text; leave a blank line between paragraphs."
        />
        <Controller
          control={control}
          name="tags"
          render={({ field, fieldState }) => (
            <TagsInput
              label="Tags"
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
              max={10}
              lowercase
              placeholder="machine learning"
            />
          )}
        />
      </FormSection>

      <FormSection title="Authors and venue">
        <TextAreaField
          label="Authors"
          rows={4}
          registration={register('authors')}
          error={errors.authors?.message}
          hint="One name per line, in the order they should appear. Include your own name."
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Venue"
            registration={register('venue')}
            error={errors.venue?.message}
            hint="Journal, conference or institution. Optional."
          />
          <TextField
            label="Date"
            type="date"
            registration={register('date')}
            error={errors.date?.message}
            hint="Optional. Only the month and year are shown."
          />
        </div>
      </FormSection>

      <FormSection
        title="Links"
        description="All optional. Each must start with http:// or https://."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Paper link"
            type="url"
            registration={register('paperUrl')}
            error={errors.paperUrl?.message}
          />
          <TextField
            label="DOI link"
            type="url"
            placeholder="https://doi.org/..."
            registration={register('doiUrl')}
            error={errors.doiUrl?.message}
          />
          <TextField
            label="Code link"
            type="url"
            registration={register('codeUrl')}
            error={errors.codeUrl?.message}
          />
          <TextField
            label="Project link"
            type="url"
            registration={register('projectUrl')}
            error={errors.projectUrl?.message}
          />
        </div>
      </FormSection>

      <FormSection title="Display">
        <CheckboxField
          label="Visible on the site"
          hint="Untick to keep this entry as a draft that only you can see."
          registration={register('visible')}
        />
        <CheckboxField
          label="Featured"
          hint="Featured entries appear in the Research section of the Home page (up to three). With none featured, Home has no Research section."
          registration={register('featured')}
        />
        <TextField
          label="Display order"
          type="number"
          min={0}
          className="sm:max-w-xs"
          registration={register('order', { valueAsNumber: true })}
          error={errors.order?.message}
          hint="Among entries with the same date; lower first."
        />
      </FormSection>

      <FormActions
        cancelTo="/admin/research"
        isSubmitting={isSubmitting}
        submitLabel={isEdit ? 'Save changes' : 'Create entry'}
      />
    </form>
  );
}

/** Create (/admin/research/new) and edit (/admin/research/:id) screen. */
export default function AdminResearchForm() {
  const { id } = useParams();
  return (
    <>
      <AdminPageHeader
        title={id ? 'Edit research entry' : 'New research entry'}
        backTo="/admin/research"
        backLabel="All research"
      />
      {id ? (
        <RecordLoader path={`/research/id/${id}`} label="Research entry">
          {(entry) => <ResearchForm key={entry.id} entry={entry} />}
        </RecordLoader>
      ) : (
        <ResearchForm />
      )}
    </>
  );
}
