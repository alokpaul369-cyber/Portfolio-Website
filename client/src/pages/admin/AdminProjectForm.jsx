import { useNavigate, useParams } from 'react-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import RecordLoader from '@/components/admin/RecordLoader';
import FormActions from '@/components/admin/form/FormActions';
import ImageUploader from '@/components/admin/form/ImageUploader';
import TagsInput from '@/components/admin/form/TagsInput';
import {
  CheckboxField,
  FormSection,
  SelectField,
  TextAreaField,
  TextField,
} from '@/components/admin/form/fields';
import { projectCategories } from '@/data/projects';
import useUploadSession from '@/hooks/useUploadSession';
import api from '@/lib/api';
import { handleSaveError } from '@/lib/adminForms';
import { projectFormSchema } from '@/lib/adminSchemas';

const FIELDS = Object.keys(projectFormSchema.shape);
const categoryOptions = [...projectCategories, { key: 'other', label: 'Other' }].map(
  ({ key, label }) => ({ value: key, label }),
);

const emptyProject = {
  title: '',
  slug: '',
  category: 'full-stack',
  description: '',
  techStack: [],
  liveUrl: '',
  githubUrl: '',
  featured: false,
  order: 0,
  images: [],
};

/** Maps an API project to form values. */
function toFormValues(project) {
  return {
    ...emptyProject,
    ...Object.fromEntries(
      Object.keys(emptyProject).map((key) => [key, project[key] ?? emptyProject[key]]),
    ),
    images: (project.images ?? []).map(({ url, publicId, alt }) => ({
      url,
      publicId,
      alt: alt ?? '',
    })),
  };
}

function ProjectForm({ project }) {
  const navigate = useNavigate();
  const uploads = useUploadSession();
  const isEdit = Boolean(project);

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(projectFormSchema),
    defaultValues: isEdit ? toFormValues(project) : emptyProject,
  });

  const onSubmit = async (values) => {
    try {
      if (isEdit) await api.put(`/projects/${project.id}`, values);
      else await api.post('/projects', values);
      uploads.commit();
      toast.success(isEdit ? 'Project updated.' : 'Project created.');
      navigate('/admin/projects');
    } catch (error) {
      handleSaveError(error, setError, FIELDS);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      <FormSection title="Details">
        <TextField
          label="Title"
          required
          registration={register('title')}
          error={errors.title?.message}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Slug"
            registration={register('slug')}
            error={errors.slug?.message}
            hint="Used in the URL. Leave empty to generate it from the title."
            placeholder="real-world-backend-system"
          />
          <SelectField
            label="Category"
            required
            options={categoryOptions}
            registration={register('category')}
            error={errors.category?.message}
          />
        </div>
        <TextAreaField
          label="Description"
          required
          rows={6}
          registration={register('description')}
          error={errors.description?.message}
          hint="The first lines appear on the project card."
        />
        <Controller
          control={control}
          name="techStack"
          render={({ field, fieldState }) => (
            <TagsInput
              label="Tech stack"
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
              max={20}
              placeholder="Node.js"
            />
          )}
        />
      </FormSection>

      <FormSection title="Links">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="GitHub URL"
            type="url"
            registration={register('githubUrl')}
            error={errors.githubUrl?.message}
            placeholder="https://github.com/..."
          />
          <TextField
            label="Live URL"
            type="url"
            registration={register('liveUrl')}
            error={errors.liveUrl?.message}
            placeholder="https://..."
          />
        </div>
      </FormSection>

      <FormSection
        title="Images"
        description="The primary image is used on the project card and at the top of the detail page."
      >
        <Controller
          control={control}
          name="images"
          render={({ field }) => (
            <ImageUploader
              label="Screenshots"
              value={field.value}
              onChange={field.onChange}
              folder="projects"
              max={10}
              session={uploads}
            />
          )}
        />
      </FormSection>

      <FormSection title="Display">
        <div className="grid gap-5 sm:grid-cols-2 sm:items-start">
          <CheckboxField
            label="Featured"
            hint="Featured projects appear first and on the Home page."
            registration={register('featured')}
          />
          <TextField
            label="Display order"
            type="number"
            min={0}
            registration={register('order', { valueAsNumber: true })}
            error={errors.order?.message}
            hint="Lower numbers appear first."
          />
        </div>
      </FormSection>

      <FormActions
        cancelTo="/admin/projects"
        isSubmitting={isSubmitting}
        submitLabel={isEdit ? 'Save changes' : 'Create project'}
      />
    </form>
  );
}

/** Create (/admin/projects/new) and edit (/admin/projects/:id) screen. */
export default function AdminProjectForm() {
  const { id } = useParams();

  return (
    <>
      <AdminPageHeader
        title={id ? 'Edit project' : 'New project'}
        backTo="/admin/projects"
        backLabel="All projects"
      />
      {id ? (
        <RecordLoader path={`/projects/id/${id}`} label="Project">
          {(project) => <ProjectForm key={project.id} project={project} />}
        </RecordLoader>
      ) : (
        <ProjectForm />
      )}
    </>
  );
}
