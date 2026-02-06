/**
 * Error sanitization utility to prevent information leakage.
 * Maps database/internal error codes to safe user-friendly messages.
 */

// Map of PostgreSQL/Supabase error codes to safe user messages
const ERROR_CODE_MAP: Record<string, string> = {
  // PostgreSQL error codes
  'insufficient_privilege': 'Access denied. You do not have permission for this action.',
  'unique_violation': 'This record already exists.',
  'foreign_key_violation': 'Related record not found.',
  'check_violation': 'The provided data is invalid.',
  'not_null_violation': 'A required field is missing.',
  'PGRST116': 'Record not found.',
  'PGRST301': 'Service temporarily unavailable.',
  '23505': 'This record already exists.',
  '23503': 'Related record not found.',
  '23514': 'The provided data is invalid.',
  '23502': 'A required field is missing.',
  '42501': 'Access denied. You do not have permission for this action.',
  
  // Auth errors
  'invalid_credentials': 'Invalid email or password.',
  'user_not_found': 'Account not found.',
  'email_not_confirmed': 'Please confirm your email address.',
  'invalid_grant': 'Session expired. Please log in again.',
  
  // Rate limiting
  'rate_limit_exceeded': 'Too many requests. Please try again later.',
  
  // Network errors
  'FetchError': 'Network error. Please check your connection.',
  'TypeError': 'Something went wrong. Please try again.',
};

// Default message when error code is not mapped
const DEFAULT_ERROR_MESSAGE = 'An error occurred. Please try again or contact support if the issue persists.';

/**
 * Sanitizes error messages to prevent information leakage.
 * Returns a user-friendly message without exposing internal details.
 */
export function sanitizeError(error: unknown): string {
  if (!error) {
    return DEFAULT_ERROR_MESSAGE;
  }

  // Handle string errors
  if (typeof error === 'string') {
    // Check if the string contains any mapped error patterns
    const lowerError = error.toLowerCase();
    for (const [code, message] of Object.entries(ERROR_CODE_MAP)) {
      if (lowerError.includes(code.toLowerCase())) {
        return message;
      }
    }
    return DEFAULT_ERROR_MESSAGE;
  }

  // Handle Error objects
  if (error instanceof Error) {
    // Check for PostgreSQL error code
    const pgError = error as Error & { code?: string; details?: string; hint?: string };
    
    if (pgError.code && ERROR_CODE_MAP[pgError.code]) {
      return ERROR_CODE_MAP[pgError.code];
    }

    // Check error name
    if (ERROR_CODE_MAP[pgError.name]) {
      return ERROR_CODE_MAP[pgError.name];
    }
  }

  // Handle Supabase error objects
  if (typeof error === 'object' && error !== null) {
    const errorObj = error as { code?: string; message?: string; error?: string; status?: number };
    
    // Check for error code
    if (errorObj.code && ERROR_CODE_MAP[errorObj.code]) {
      return ERROR_CODE_MAP[errorObj.code];
    }

    // Check for specific status codes
    if (errorObj.status === 401) {
      return 'Session expired. Please log in again.';
    }
    if (errorObj.status === 403) {
      return 'Access denied. You do not have permission for this action.';
    }
    if (errorObj.status === 404) {
      return 'Record not found.';
    }
    if (errorObj.status === 429) {
      return 'Too many requests. Please try again later.';
    }
    if (errorObj.status && errorObj.status >= 500) {
      return 'Service temporarily unavailable. Please try again later.';
    }
  }

  return DEFAULT_ERROR_MESSAGE;
}

/**
 * Logs errors safely - only in development mode.
 * In production, errors should be sent to a monitoring service.
 */
export function logError(context: string, error: unknown): void {
  if (import.meta.env.DEV) {
    console.error(`[${context}]`, error);
  }
  // In production, you could send to a monitoring service like Sentry
  // Example: Sentry.captureException(error, { extra: { context } });
}

/**
 * Masks sensitive data like account numbers.
 * Shows only the last N characters, replacing the rest with asterisks.
 */
export function maskSensitiveData(value: string | null | undefined, visibleChars: number = 4): string {
  if (!value) return '-';
  
  const trimmed = value.trim();
  if (trimmed.length <= visibleChars) {
    return '*'.repeat(trimmed.length);
  }
  
  const masked = '*'.repeat(trimmed.length - visibleChars);
  const visible = trimmed.slice(-visibleChars);
  return masked + visible;
}

/**
 * Masks IBAN numbers - shows first 4 and last 4 characters.
 */
export function maskIBAN(iban: string | null | undefined): string {
  if (!iban) return '-';
  
  const cleaned = iban.replace(/\s/g, '');
  if (cleaned.length <= 8) {
    return maskSensitiveData(cleaned, 4);
  }
  
  return cleaned.slice(0, 4) + '*'.repeat(cleaned.length - 8) + cleaned.slice(-4);
}

/**
 * Masks SWIFT/BIC codes - shows first 4 characters only.
 */
export function maskSWIFT(swift: string | null | undefined): string {
  if (!swift) return '-';
  
  if (swift.length <= 4) {
    return swift;
  }
  
  return swift.slice(0, 4) + '*'.repeat(swift.length - 4);
}
