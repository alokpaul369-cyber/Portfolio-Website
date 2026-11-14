import { useCallback, useEffect, useRef } from 'react';
import api from '@/lib/api';

/** Asks the server to delete an upload; failures are ignored (best effort). */
function discardUpload(publicId) {
  api.delete('/uploads', { data: { publicId } }).catch(() => {});
}

/**
 * Tracks images uploaded while a form is open, so files that never get saved
 * do not stay on Cloudinary.
 *
 * - track(publicId): call after each successful upload
 * - discard(publicId): call when the admin removes an image before saving
 *   (deleted right away if it was uploaded in this session)
 * - commit(): call after the form is saved; tracked uploads are now in use
 *
 * When the form closes without saving, any tracked uploads are deleted.
 * Images that were already saved are never deleted here; the server removes
 * them when the record is updated without them.
 */
export default function useUploadSession() {
  const pending = useRef(new Set());

  const track = useCallback((publicId) => {
    if (publicId) pending.current.add(publicId);
  }, []);

  const discard = useCallback((publicId) => {
    if (pending.current.delete(publicId)) discardUpload(publicId);
  }, []);

  const commit = useCallback(() => {
    pending.current.clear();
  }, []);

  useEffect(() => {
    const uploads = pending.current;
    return () => {
      uploads.forEach(discardUpload);
      uploads.clear();
    };
  }, []);

  return { track, discard, commit };
}
