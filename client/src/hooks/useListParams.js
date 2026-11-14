import { useCallback } from 'react';
import { useSearchParams } from 'react-router';

/**
 * Reads and updates list filters stored in the URL query string, so filtered
 * views can be shared and survive reloads and the back button.
 *
 * @returns {{
 *   get: (key: string) => string,
 *   page: number,
 *   update: (changes: Record<string, string | number | null | undefined>) => void,
 * }}
 *
 * `update` removes empty values. Changing anything other than `page` returns
 * to page 1 and replaces the history entry (filters and typing should not
 * fill the back button history); page changes add a history entry.
 */
export default function useListParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const get = useCallback((key) => searchParams.get(key) ?? '', [searchParams]);
  const page = Math.max(1, Number.parseInt(searchParams.get('page') ?? '1', 10) || 1);

  const update = useCallback(
    (changes) => {
      const isPageChange = 'page' in changes;
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          Object.entries(changes).forEach(([key, value]) => {
            if (value) next.set(key, String(value));
            else next.delete(key);
          });
          if (!isPageChange) next.delete('page');
          return next;
        },
        { replace: !isPageChange },
      );
    },
    [setSearchParams],
  );

  return { get, page, update };
}
