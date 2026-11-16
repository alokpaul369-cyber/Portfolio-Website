import { useState } from 'react';
import { ImageOff, Loader2, RotateCcw, Save } from 'lucide-react';
import { toast } from 'sonner';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import RecordLoader from '@/components/admin/RecordLoader';
import ImageUploader from '@/components/admin/form/ImageUploader';
import { FormSection } from '@/components/admin/form/fields';
import Button from '@/components/ui/Button';
import { site } from '@/config/site';
import useUploadSession from '@/hooks/useUploadSession';
import api, { getErrorMessage } from '@/lib/api';
import { portraitUrl } from '@/lib/cloudinary';

/** Small framed portrait used for the "currently live" preview. */
function LivePreview({ src, label }) {
  const [failed, setFailed] = useState(false);
  return (
    <figure className="flex w-40 shrink-0 flex-col gap-2">
      <div className="aspect-[4/5] overflow-hidden rounded-xl border border-border bg-bg">
        {failed ? (
          <div className="flex size-full items-center justify-center text-muted">
            <ImageOff className="size-5" strokeWidth={1.5} aria-hidden="true" />
          </div>
        ) : (
          <img
            src={src}
            alt=""
            onError={() => setFailed(true)}
            className="size-full object-cover"
          />
        )}
      </div>
      <figcaption className="text-xs text-muted">{label}</figcaption>
    </figure>
  );
}

/** Upload, replace or reset the Home page portrait. */
function ProfilePhotoForm({ settings }) {
  const uploads = useUploadSession();
  const [saved, setSaved] = useState(settings.profileImage);
  const [images, setImages] = useState(settings.profileImage ? [settings.profileImage] : []);
  const [busy, setBusy] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const draft = images[0] ?? null;
  const isDirty =
    (draft?.publicId ?? draft?.url ?? null) !== (saved?.publicId ?? saved?.url ?? null) ||
    (draft?.alt ?? '') !== (saved?.alt ?? '');

  const save = async (profileImage) => {
    setBusy(true);
    try {
      const { data } = await api.put('/settings', { profileImage });
      uploads.commit();
      setSaved(data.data.profileImage);
      setImages(data.data.profileImage ? [data.data.profileImage] : []);
      toast.success(profileImage ? 'Profile photo updated.' : 'Default photo restored.');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
      setConfirmReset(false);
    }
  };

  const onSave = () => {
    if (!draft) return save(null);
    return save({
      url: draft.url,
      ...(draft.publicId && { publicId: draft.publicId }),
      alt: draft.alt?.trim() || `Portrait of ${site.name}`,
    });
  };

  const liveSrc = saved?.url ? portraitUrl(saved.url) : site.profileImage;

  return (
    <div className="flex flex-col gap-6">
      <FormSection
        title="Current photo"
        description="This is the portrait visitors see on the Home page right now."
      >
        <div className="flex flex-wrap items-end gap-6">
          <LivePreview src={liveSrc} label={saved ? 'Uploaded photo' : 'Default photo'} />
          {saved && (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-bg disabled:opacity-60"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              Use default photo
            </button>
          )}
        </div>
      </FormSection>

      <FormSection
        title="New photo"
        description="Upload a JPEG, PNG, WebP or AVIF up to 4 MB. A portrait with your face near the top works best; the site crops it to 4:5 around your face automatically."
      >
        <div className="max-w-xs">
          <ImageUploader
            label="Profile photo"
            value={images}
            onChange={setImages}
            folder="profile"
            max={1}
            shape="portrait"
            session={uploads}
          />
        </div>
      </FormSection>

      <div className="flex justify-end">
        <Button size="sm" type="button" onClick={onSave} disabled={busy || !isDirty}>
          {busy ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Save className="size-4" aria-hidden="true" />
          )}
          {busy ? 'Saving...' : 'Save photo'}
        </Button>
      </div>

      <ConfirmDialog
        open={confirmReset}
        title="Use the default photo?"
        description="The uploaded photo will be removed from the site and deleted from storage. This cannot be undone."
        confirmLabel="Use default"
        busy={busy}
        onConfirm={() => save(null)}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  );
}

/** Admin page at /admin/profile. */
export default function AdminProfile() {
  return (
    <>
      <AdminPageHeader title="Profile" description="Manage the portrait shown on your Home page." />
      <RecordLoader path="/settings" label="Settings">
        {(settings) => <ProfilePhotoForm settings={settings} />}
      </RecordLoader>
    </>
  );
}
