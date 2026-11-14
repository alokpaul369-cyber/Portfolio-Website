import { useNavigate, useParams } from 'react-router';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import RecordLoader from '@/components/admin/RecordLoader';
import FormActions from '@/components/admin/form/FormActions';
import {
  CheckboxField,
  FormSection,
  SelectField,
  TextAreaField,
  TextField,
} from '@/components/admin/form/fields';
import api from '@/lib/api';
import { handleSaveError, linesToList, toDateInput } from '@/lib/adminForms';
import { experienceFormSchema } from '@/lib/adminSchemas';

const FIELDS = ['type', 'role', 'company', 'startDate', 'endDate', 'current', 'description'];
const typeOptions = [
  { value: 'work', label: 'Work' },
  { value: 'education', label: 'Education' },
];
const emptyEntry = {
  type: 'work',
  role: '',
  company: '',
  startDate: '',
  endDate: '',
  current: false,
  description: '',
};

function ExperienceForm({ entry }) {
  const navigate = useNavigate();
  const isEdit = Boolean(entry);
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(experienceFormSchema),
    defaultValues: isEdit
      ? {
          type: entry.type,
          role: entry.role,
          company: entry.company,
          startDate: toDateInput(entry.startDate),
          endDate: toDateInput(entry.endDate),
          current: entry.current,
          description: (entry.description ?? []).join('\n'),
        }
      : emptyEntry,
  });
  const [type, current] = useWatch({ control, name: ['type', 'current'] });
  const isEducation = type === 'education';

  const onSubmit = async (values) => {
    const payload = {
      ...values,
      endDate: values.current ? null : values.endDate || null,
      description: linesToList(values.description),
    };
    try {
      if (isEdit) await api.put(`/experience/${entry.id}`, payload);
      else await api.post('/experience', payload);
      toast.success(isEdit ? 'Entry updated.' : 'Entry created.');
      navigate('/admin/experience');
    } catch (error) {
      handleSaveError(error, setError, FIELDS);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      <FormSection>
        <SelectField
          label="Type"
          required
          options={typeOptions}
          registration={register('type')}
          className="sm:max-w-xs"
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label={isEducation ? 'Degree' : 'Role'}
            required
            registration={register('role')}
            error={errors.role?.message}
            placeholder={
              isEducation ? 'B.Sc. in Computer Science & Engineering' : 'Backend Developer Intern'
            }
          />
          <TextField
            label={isEducation ? 'Institution' : 'Company'}
            required={!isEducation}
            registration={register('company')}
            error={errors.company?.message}
            hint={isEducation ? 'Optional.' : undefined}
          />
        </div>
      </FormSection>

      <FormSection title="Dates">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Start date"
            type="date"
            required
            registration={register('startDate')}
            error={errors.startDate?.message}
          />
          <TextField
            label="End date"
            type="date"
            registration={register('endDate')}
            error={errors.endDate?.message}
            disabled={current}
            hint={current ? 'Not needed while this is current.' : undefined}
          />
        </div>
        <CheckboxField
          label={isEducation ? 'Currently studying here' : 'I currently work here'}
          hint="Current entries show as Present and appear first."
          registration={register('current')}
        />
      </FormSection>

      <FormSection title="Description">
        <TextAreaField
          label="Key points"
          rows={6}
          registration={register('description')}
          error={errors.description?.message}
          hint="One point per line, up to 10 lines of 300 characters."
        />
      </FormSection>

      <FormActions
        cancelTo="/admin/experience"
        isSubmitting={isSubmitting}
        submitLabel={isEdit ? 'Save changes' : 'Create entry'}
      />
    </form>
  );
}

/** Create (/admin/experience/new) and edit (/admin/experience/:id) screen. */
export default function AdminExperienceForm() {
  const { id } = useParams();
  return (
    <>
      <AdminPageHeader
        title={id ? 'Edit entry' : 'New entry'}
        backTo="/admin/experience"
        backLabel="All entries"
      />
      {id ? (
        <RecordLoader path={`/experience/id/${id}`} label="Entry">
          {(entry) => <ExperienceForm key={entry.id} entry={entry} />}
        </RecordLoader>
      ) : (
        <ExperienceForm />
      )}
    </>
  );
}
