/**
 * Lightweight events for keeping admin UI in sync without a global store.
 * For example, the inbox announces changes so the sidebar badge refreshes.
 */

export const MESSAGES_CHANGED = 'admin:messages-changed';

/** Announces that messages were read, marked unread or deleted. */
export function notifyMessagesChanged() {
  window.dispatchEvent(new Event(MESSAGES_CHANGED));
}
