import { createElement } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import RecordLoader from '@/components/admin/RecordLoader';
import FormActions from '@/components/admin/form/FormActions';
import { FormSection, SelectField, TextField } from '@/components/admin/form/fields';
import { skillCategories } from '@/data/skills';
import api from '@/lib/api';
import { handleSaveError } from '@/lib/adminForms';
import { skillFormSchema } from '@/lib/adminSchemas';
import { getSkillIcon, SKILL_ICON_KEYS } from '@/lib/skillIcons';

const FIELDS = Object.keys(skillFormSchema.shape);
const categoryOptions = skillCategories.map(({ key, label }) => ({ value: key, label }));
const levelOptions = ['beginner', 'intermediate', 'advanced', 'expert'].map((level) => ({
  value: level,
  label: level[0].toUpperCase() + level.slice(1),
}));
const iconOptions = [
  { value: '', label: 'No icon' },
  ...SKILL_ICON_KEYS.map((key) => ({ value: key, label: key })),
];

const emptySkill = { name: '', category: 'language', level: 'intermediate', icon: '', order: 0 };

function SkillForm({ skill }) {
  const navigate = useNavigate();
  const isEdit = Boolean(skill);
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(skillFormSchema),
    defaultValues: isEdit
      ? {
          name: skill.name,
          category: skill.category,
          level: skill.level,
          icon: skill.icon ?? '',
          order: skill.order ?? 0,
        }
      : emptySkill,
  });
  const icon = useWatch({ control, name: 'icon' });

  const onSubmit = async (values) => {
    try {
      if (isEdit) await api.put(`/skills/${skill.id}`, values);
      else await api.post('/skills', values);
      toast.success(isEdit ? 'Skill updated.' : 'Skill created.');
      navigate('/admin/skills');
    } catch (error) {
      handleSaveError(error, setError, FIELDS);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      <FormSection>
        <TextField
          label="Name"
          required
          registration={register('name')}
          error={errors.name?.message}
          placeholder="React"
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            label="Category"
            required
            options={categoryOptions}
            registration={register('category')}
            error={errors.category?.message}
          />
          <SelectField
            label="Level"
            required
            options={levelOptions}
            registration={register('level')}
            error={errors.level?.message}
            hint="Stored for reference; not shown publicly."
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2 sm:items-start">
          <div className="flex items-end gap-3">
            <SelectField
              label="Icon"
              options={iconOptions}
              registration={register('icon')}
              error={errors.icon?.message}
              className="flex-1"
            />
            <span
              className="mb-px inline-flex size-[38px] shrink-0 items-center justify-center rounded-md border border-border bg-bg text-text"
              aria-label="Icon preview"
              role="img"
            >
              {createElement(getSkillIcon(icon), { className: 'size-5', 'aria-hidden': true })}
            </span>
          </div>
          <TextField
            label="Display order"
            type="number"
            min={0}
            registration={register('order', { valueAsNumber: true })}
            error={errors.order?.message}
            hint="Position within the category; lower first."
          />
        </div>
      </FormSection>
      <FormActions
        cancelTo="/admin/skills"
        isSubmitting={isSubmitting}
        submitLabel={isEdit ? 'Save changes' : 'Create skill'}
      />
    </form>
  );
}

/** Create (/admin/skills/new) and edit (/admin/skills/:id) screen. */
export default function AdminSkillForm() {
  const { id } = useParams();
  return (
    <>
      <AdminPageHeader
        title={id ? 'Edit skill' : 'New skill'}
        backTo="/admin/skills"
        backLabel="All skills"
      />
      {id ? (
        <RecordLoader path={`/skills/id/${id}`} label="Skill">
          {(skill) => <SkillForm key={skill.id} skill={skill} />}
        </RecordLoader>
      ) : (
        <SkillForm />
      )}
    </>
  );
}
