import { useCallback, useEffect, useState } from 'react';
import api, { getErrorMessage } from '@/lib/api';

/**
 * Fetches JSON from the API with loading and error states.
 *
 * @param {string} path     API path, e.g. "/skills"
 * @param {object} [params] query parameters
 * @returns {{
 *   data: any,
 *   pagination: object | undefined,
 *   isLoading: boolean,
 *   error: string | null,
 *   errorStatus: number | null,
 *   retry: () => void,
 * }}
 *
 * `errorStatus` is the HTTP status of a failed request (for example 404),
 * or null for network errors. `body` is the full response body, for extra
 * fields such as `unreadCount`.
 *
 * Requests are cancelled when the component unmounts or the inputs change.
 * Loading is derived from whether the stored result belongs to the current
 * request, so the effect never sets state synchronously.
 */
export default function useApiQuery(path, params) {
  const [attempt, setAttempt] = useState(0);
  // Serialised so that a new but equal params object does not refetch.
  const paramsKey = JSON.stringify(params ?? {});
  const requestKey = `${path}|${paramsKey}|${attempt}`;

  const [result, setResult] = useState({
    key: null,
    data: undefined,
    pagination: undefined,
    error: null,
    errorStatus: null,
  });

  useEffect(() => {
    const controller = new AbortController();
    const key = `${path}|${paramsKey}|${attempt}`;

    api
      .get(path, { params: JSON.parse(paramsKey), signal: controller.signal })
      .then(({ data: body }) => {
        setResult({
          key,
          data: body.data,
          pagination: body.pagination,
          body,
          error: null,
          errorStatus: null,
        });
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        setResult({
          key,
          data: undefined,
          pagination: undefined,
          error: getErrorMessage(error),
          errorStatus: error.response?.status ?? null,
        });
      });

    return () => controller.abort();
  }, [path, paramsKey, attempt]);

  const retry = useCallback(() => setAttempt((count) => count + 1), []);
  const isCurrent = result.key === requestKey;

  return {
    data: isCurrent ? result.data : undefined,
    pagination: isCurrent ? result.pagination : undefined,
    body: isCurrent ? result.body : undefined,
    isLoading: !isCurrent,
    error: isCurrent ? result.error : null,
    errorStatus: isCurrent ? result.errorStatus : null,
    retry,
  };
}
