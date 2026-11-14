import { useState } from 'react';
import { toast } from 'sonner';
import api, { getErrorMessage } from '@/lib/api';

/**
 * State and actions for "delete with confirmation" in admin lists.
 *
 * @param {object} options
 * @param {(item: object) => string} options.path   API path for the item, e.g. item => `/projects/${item.id}`
 * @param {string} options.label                     noun for messages, e.g. "Project"
 * @param {() => void} options.onDeleted             called after a successful delete (refresh the list)
 * @returns {{ target: object | null, busy: boolean, request: Function, cancel: Function, confirm: Function }}
 */
export default function useDeleteConfirm({ path, label, onDeleted }) {
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const confirm = async () => {
    if (!target) return;
    setBusy(true);
    try {
      await api.delete(path(target));
      toast.success(`${label} deleted.`);
      setTarget(null);
      onDeleted?.();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return {
    target,
    busy,
    request: setTarget,
    cancel: () => !busy && setTarget(null),
    confirm,
  };
}
