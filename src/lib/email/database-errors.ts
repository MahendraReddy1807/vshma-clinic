export interface NotificationLogDatabaseError {
  code?: string;
  message?: string;
  hint?: string;
}

export function formatNotificationLogDatabaseError(error: NotificationLogDatabaseError | null | undefined) {
  if (!error) return 'Unknown database error';
  const message = error.message || 'Unknown database error';
  const code = error.code ? ` (${error.code})` : '';
  if (error.code === '42703' || error.code === 'PGRST204') {
    return `notification_logs schema is missing a required column${code}: ${message}. Apply supabase/migrations/20261120140000_vshma_notification_logs_schema_fix.sql before retrying.`;
  }
  if (error.code === '23505') {
    return `notification_logs rejected a duplicate idempotency key${code}: ${message}`;
  }
  return `${message}${code}${error.hint ? ` Hint: ${error.hint}` : ''}`;
}
