import { useId, useRef, useState } from 'react';
import { ImagePlus, Loader2, Star, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import api, { getErrorMessage } from '@/lib/api';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_SIZE_MB = 5;

/**
 * Uploads images to Cloudinary through POST /api/uploads and manages the list.
 *
 * Works with an array of images ({ url, publicId, alt }). With `max={1}` it
 * behaves as a single-image field. The first image is the primary one
 * (card thumbnail or cover); "Make primary" moves an image to the front.
 *
 * @param {object} props
 * @param {Array<{ url: string, publicId?: string, alt?: string }>} props.value
 * @param {(images: object[]) => void} props.onChange
 * @param {'projects' | 'blog' | 'profile' | 'certificates' | 'general'} props.folder
 * @param {number} [props.max=10]
 * @param {'landscape' | 'portrait'} [props.shape='landscape']  preview shape (16:10 or 4:5)
 * @param {{ track: Function, discard: Function }} props.session  from useUploadSession
 */
export default function ImageUploader({
  label,
  hint,
  value = [],
  onChange,
  folder,
  max = 10,
  session,
  shape = 'landscape',
}) {
  const inputId = useId();
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(0);
  const remaining = max - value.length - uploading;

  const uploadFile = async (file) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error(`${file.name}: only JPEG, PNG, WebP and AVIF images are allowed.`);
      return null;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`${file.name}: images must be ${MAX_SIZE_MB} MB or smaller.`);
      return null;
    }

    const form = new FormData();
    form.append('image', file);
    try {
      const { data } = await api.post(`/uploads?folder=${folder}`, form, { timeout: 60000 });
      session?.track(data.data.publicId);
      return { url: data.data.url, publicId: data.data.publicId, alt: '' };
    } catch (error) {
      toast.error(`${file.name}: ${getErrorMessage(error)}`);
      return null;
    }
  };

  const handleFiles = async (fileList) => {
    // A single-image field always accepts one new file, which replaces the current one.
    const allowed = max === 1 ? 1 - uploading : remaining;
    const files = [...fileList].slice(0, Math.max(0, allowed));
    if (fileList.length > files.length) {
      toast.error(`You can add up to ${max} image${max === 1 ? '' : 's'}.`);
    }
    if (files.length === 0) return;

    setUploading((count) => count + files.length);
    const results = await Promise.all(files.map(uploadFile));
    setUploading((count) => count - files.length);

    const uploaded = results.filter(Boolean);
    if (uploaded.length > 0) {
      // For a single-image field, the new image replaces the old one.
      if (max === 1) {
        value.forEach((image) => session?.discard(image.publicId));
        onChange(uploaded.slice(0, 1));
      } else {
        onChange([...value, ...uploaded]);
      }
    }
  };

  const removeAt = (index) => {
    session?.discard(value[index].publicId);
    onChange(value.filter((_, i) => i !== index));
  };

  const makePrimary = (index) => {
    const next = [...value];
    const [image] = next.splice(index, 1);
    onChange([image, ...next]);
  };

  const setAlt = (index, alt) => {
    onChange(value.map((image, i) => (i === index ? { ...image, alt } : image)));
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium">{label}</span>
        {hint && <p className="text-xs text-muted">{hint}</p>}
      </div>

      {value.length > 0 && (
        <ul className={`grid gap-4 ${max === 1 ? '' : 'sm:grid-cols-2'}`}>
          {value.map((image, index) => (
            <li
              key={image.publicId || image.url}
              className="overflow-hidden rounded-lg border border-border bg-bg"
            >
              <div
                className={`relative ${shape === 'portrait' ? 'aspect-[4/5]' : 'aspect-[16/10]'}`}
              >
                <img
                  src={image.url}
                  alt={image.alt || ''}
                  loading="lazy"
                  decoding="async"
                  className="size-full object-cover"
                />
                {index === 0 && max > 1 && (
                  <span className="absolute top-2 left-2 rounded bg-bg/90 px-2 py-0.5 text-[11px] font-medium">
                    Primary
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2 p-3">
                <label className="sr-only" htmlFor={`${inputId}-alt-${index}`}>
                  Alt text for image {index + 1}
                </label>
                <input
                  id={`${inputId}-alt-${index}`}
                  value={image.alt ?? ''}
                  maxLength={150}
                  onChange={(event) => setAlt(index, event.target.value)}
                  placeholder="Alt text (describe the image)"
                  className="w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs focus:border-primary focus:outline-none"
                />
                <div className="flex items-center gap-2">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => makePrimary(index)}
                      className="inline-flex items-center gap-1 text-xs text-muted hover:text-primary"
                    >
                      <Star className="size-3.5" aria-hidden="true" />
                      Make primary
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeAt(index)}
                    className="ml-auto inline-flex items-center gap-1 text-xs text-muted hover:text-danger"
                  >
                    <Trash2 className="size-3.5" aria-hidden="true" />
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {(remaining > 0 || uploading > 0 || max === 1) && (
        <div
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            handleFiles(event.dataTransfer.files);
          }}
          className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border px-4 py-6 text-center"
        >
          {uploading > 0 ? (
            <p className="inline-flex items-center gap-2 text-sm text-muted" role="status">
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Uploading {uploading} image{uploading === 1 ? '' : 's'}...
            </p>
          ) : (
            <>
              <ImagePlus className="size-5 text-muted" strokeWidth={1.5} aria-hidden="true" />
              <p className="text-sm text-muted">
                Drag images here or{' '}
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="font-medium text-primary hover:underline"
                >
                  {max === 1 && value.length > 0 ? 'choose a replacement' : 'choose files'}
                </button>
              </p>
              <p className="text-xs text-muted">JPEG, PNG, WebP or AVIF, up to {MAX_SIZE_MB} MB</p>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(',')}
            multiple={max > 1}
            className="hidden"
            onChange={(event) => {
              handleFiles(event.target.files);
              event.target.value = '';
            }}
          />
        </div>
      )}
    </div>
  );
}
