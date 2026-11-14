import { useNavigate, useParams } from 'react-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import RecordLoader from '@/components/admin/RecordLoader';
import FormActions from '@/components/admin/form/FormActions';
import ImageUploader from '@/components/admin/form/ImageUploader';
import { FormSection, TextField } from '@/components/admin/form/fields';
import useSiteContent from '@/hooks/useSiteContent';
import useUploadSession from '@/hooks/useUploadSession';
import api from '@/lib/api';
import { handleSaveError, toDateInput } from '@/lib/adminForms';
import { certificationFormSchema } from '@/lib/adminSchemas';

const FIELDS = [
  'title',
  'issuer',
  'issueDate',
  'expiryDate',
  'credentialId',
  'credentialUrl',
  'image',
  'order',
];
const emptyEntry = {
  title: '',
  issuer: '',
  issueDate: '',
  expiryDate: '',
  credentialId: '',
  credentialUrl: '',
  image: [],
  order: 0,
};

function CertificationForm({ entry }) {
  const navigate = useNavigate();
  const { refresh } = useSiteContent();
  const uploads = useUploadSession();
  const isEdit = Boolean(entry);
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(certificationFormSchema),
    defaultValues: isEdit
      ? {
          title: entry.title,
          issuer: entry.issuer,
          issueDate: toDateInput(entry.issueDate),
          expiryDate: toDateInput(entry.expiryDate),
          credentialId: entry.credentialId ?? '',
          credentialUrl: entry.credentialUrl ?? '',
          image: entry.image?.url
            ? [
                {
                  url: entry.image.url,
                  publicId: entry.image.publicId,
                  alt: entry.image.alt ?? '',
                },
              ]
            : [],
          order: entry.order ?? 0,
        }
      : emptyEntry,
  });

  const onSubmit = async ({ image, ...values }) => {
    const picture = image[0];
    const payload = {
      ...values,
      expiryDate: values.expiryDate || null,
      image: picture
        ? {
            url: picture.url,
            ...(picture.publicId && { publicId: picture.publicId }),
            alt: picture.alt?.trim() || `${values.title} certificate`,
          }
        : null,
    };
    try {
      if (isEdit) await api.put(`/certifications/${entry.id}`, payload);
      else await api.post('/certifications', payload);
      uploads.commit();
      toast.success(isEdit ? 'Certification updated.' : 'Certification created.');
      // The public menu and sections depend on these entries.
      refresh();
      navigate('/admin/certifications');
    } catch (error) {
      handleSaveError(error, setError, FIELDS);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      <FormSection title="Certificate">
        <TextField
          label="Title"
          required
          registration={register('title')}
          error={errors.title?.message}
        />
        <TextField
          label="Issuer"
          required
          registration={register('issuer')}
          error={errors.issuer?.message}
          hint="The organisation that issued it."
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Issue date"
            type="date"
            required
            registration={register('issueDate')}
            error={errors.issueDate?.message}
          />
          <TextField
            label="Expiry date"
            type="date"
            registration={register('expiryDate')}
            error={errors.expiryDate?.message}
            hint="Leave empty if it does not expire."
          />
        </div>
      </FormSection>

      <FormSection title="Verification" description="Optional details that let a visitor check it.">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Credential ID"
            registration={register('credentialId')}
            error={errors.credentialId?.message}
          />
          <TextField
            label="Credential link"
            type="url"
            registration={register('credentialUrl')}
            error={errors.credentialUrl?.message}
          />
        </div>
      </FormSection>

      <FormSection
        title="Image"
        description="Optional picture of the certificate. JPEG, PNG, WebP or AVIF up to 5 MB."
      >
        <Controller
          control={control}
          name="image"
          render={({ field }) => (
            <ImageUploader
              label="Certificate image"
              value={field.value}
              onChange={field.onChange}
              folder="certificates"
              max={1}
              session={uploads}
            />
          )}
        />
      </FormSection>

      <FormSection title="Display">
        <TextField
          label="Display order"
          type="number"
          min={0}
          className="sm:max-w-xs"
          registration={register('order', { valueAsNumber: true })}
          error={errors.order?.message}
          hint="Among certificates with the same issue date; lower first."
        />
      </FormSection>

      <FormActions
        cancelTo="/admin/certifications"
        isSubmitting={isSubmitting}
        submitLabel={isEdit ? 'Save changes' : 'Create certification'}
      />
    </form>
  );
}

/** Create (/admin/certifications/new) and edit (/admin/certifications/:id) screen. */
export default function AdminCertificationForm() {
  const { id } = useParams();
  return (
    <>
      <AdminPageHeader
        title={id ? 'Edit certification' : 'New certification'}
        backTo="/admin/certifications"
        backLabel="All certifications"
      />
      {id ? (
        <RecordLoader path={`/certifications/id/${id}`} label="Certification">
          {(entry) => <CertificationForm key={entry.id} entry={entry} />}
        </RecordLoader>
      ) : (
        <CertificationForm />
      )}
    </>
  );
}
