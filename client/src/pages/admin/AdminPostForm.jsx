import { lazy, Suspense, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import RecordLoader from '@/components/admin/RecordLoader';
import FormActions from '@/components/admin/form/FormActions';
import ImageUploader from '@/components/admin/form/ImageUploader';
import TagsInput from '@/components/admin/form/TagsInput';
import {
  CheckboxField,
  FieldShell,
  FormSection,
  TextAreaField,
  TextField,
} from '@/components/admin/form/fields';
import useUploadSession from '@/hooks/useUploadSession';
import api from '@/lib/api';
import { handleSaveError } from '@/lib/adminForms';
import { postFormSchema } from '@/lib/adminSchemas';

// The Markdown renderer is large; load it only when the preview is opened.
const MarkdownContent = lazy(() => import('@/components/blog/MarkdownContent'));

const FIELDS = Object.keys(postFormSchema.shape);
const emptyPost = {
  title: '',
  slug: '',
  excerpt: '',
  tags: [],
  coverImage: [],
  content: '',
  published: false,
};

/** Markdown editor with Write and Preview tabs. */
function ContentEditor({ control, register, error }) {
  const [mode, setMode] = useState('write');
  const content = useWatch({ control, name: 'content' });

  const tabClass = (active) =>
    `rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
      active ? 'bg-bg text-text' : 'text-muted hover:text-text'
    }`;

  return (
    <FieldShell
      label="Content"
      required
      error={error}
      hint="Markdown: ## headings, **bold**, [links](https://...), lists, tables and fenced code blocks with a language, such as ```js."
    >
      {({ id, describedBy, invalid }) => (
        <div
          className={`overflow-hidden rounded-md border ${invalid ? 'border-danger/70' : 'border-border'}`}
        >
          <div className="flex items-center justify-between gap-2 border-b border-border bg-surface px-2 py-1.5">
            <div role="tablist" aria-label="Editor mode" className="flex gap-1">
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'write'}
                onClick={() => setMode('write')}
                className={tabClass(mode === 'write')}
              >
                Write
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'preview'}
                onClick={() => setMode('preview')}
                className={tabClass(mode === 'preview')}
              >
                Preview
              </button>
            </div>
            <span className="text-[11px] text-muted">{content?.length ?? 0} characters</span>
          </div>

          <textarea
            id={id}
            rows={20}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            hidden={mode !== 'write'}
            className="block w-full resize-y bg-bg px-4 py-3 font-mono text-sm leading-relaxed text-text focus:outline-none"
            {...register('content')}
          />

          {mode === 'preview' && (
            <div className="min-h-80 bg-bg px-5 py-6">
              {content?.trim() ? (
                <Suspense fallback={<p className="text-sm text-muted">Loading preview...</p>}>
                  <MarkdownContent>{content}</MarkdownContent>
                </Suspense>
              ) : (
                <p className="text-sm text-muted">Nothing to preview yet.</p>
              )}
            </div>
          )}
        </div>
      )}
    </FieldShell>
  );
}

function PostForm({ post }) {
  const navigate = useNavigate();
  const uploads = useUploadSession();
  const isEdit = Boolean(post);

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(postFormSchema),
    defaultValues: isEdit
      ? {
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt ?? '',
          tags: post.tags ?? [],
          coverImage: post.coverImage?.url
            ? [
                {
                  url: post.coverImage.url,
                  publicId: post.coverImage.publicId,
                  alt: post.coverImage.alt ?? '',
                },
              ]
            : [],
          content: post.content,
          published: post.published,
        }
      : emptyPost,
  });

  const onSubmit = async ({ coverImage, ...values }) => {
    const payload = { ...values, coverImage: coverImage[0] ?? null };
    try {
      if (isEdit) await api.put(`/blog/${post.id}`, payload);
      else await api.post('/blog', payload);
      uploads.commit();
      toast.success(
        isEdit ? 'Post updated.' : values.published ? 'Post published.' : 'Draft saved.',
      );
      navigate('/admin/blog');
    } catch (error) {
      handleSaveError(error, setError, FIELDS);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      <FormSection title="Article">
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
        <ContentEditor control={control} register={register} error={errors.content?.message} />
      </FormSection>

      <FormSection title="Summary and tags">
        <TextAreaField
          label="Excerpt"
          rows={3}
          registration={register('excerpt')}
          error={errors.excerpt?.message}
          hint="Shown in the blog list. Leave empty to use the opening of the article."
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
              placeholder="express"
            />
          )}
        />
      </FormSection>

      <FormSection
        title="Cover image"
        description="Optional. Shown in the blog list and at the top of the article."
      >
        <Controller
          control={control}
          name="coverImage"
          render={({ field }) => (
            <ImageUploader
              label="Cover"
              value={field.value}
              onChange={field.onChange}
              folder="blog"
              max={1}
              session={uploads}
            />
          )}
        />
      </FormSection>

      <FormSection title="Publishing">
        <CheckboxField
          label="Published"
          hint={
            post?.publishedAt
              ? 'Unchecking hides the post again. The original publication date is kept.'
              : 'Published posts are visible on the blog. Leave unchecked to save as a draft.'
          }
          registration={register('published')}
        />
      </FormSection>

      <FormActions
        cancelTo="/admin/blog"
        isSubmitting={isSubmitting}
        submitLabel={isEdit ? 'Save changes' : 'Create post'}
      />
    </form>
  );
}

/** Create (/admin/blog/new) and edit (/admin/blog/:id) screen. */
export default function AdminPostForm() {
  const { id } = useParams();
  return (
    <>
      <AdminPageHeader
        title={id ? 'Edit post' : 'New post'}
        backTo="/admin/blog"
        backLabel="All posts"
      />
      {id ? (
        <RecordLoader path={`/blog/id/${id}`} label="Post">
          {(post) => <PostForm key={post.id} post={post} />}
        </RecordLoader>
      ) : (
        <PostForm />
      )}
    </>
  );
}
