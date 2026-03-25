import type { FieldValues, UseFormReturn } from 'react-hook-form';

import { ApiError, ValidationError } from '@/api/errors';
import type { ToastContextValue } from '@/components/Toast';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getPathSegments(path: string) {
  return path
    .replace(/\[(\d+)\]/g, '.$1')
    .split('.')
    .filter(Boolean);
}

function hasPath(value: unknown, path: string) {
  let current = value;

  for (const segment of getPathSegments(path)) {
    if (!isRecord(current) && !Array.isArray(current)) {
      return false;
    }

    if (!(segment in current)) {
      return false;
    }

    current = current[segment as keyof typeof current];
  }

  return true;
}

function getMessage(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const message = getMessage(item);

      if (message) {
        return message;
      }
    }

    return undefined;
  }

  if (isRecord(value)) {
    if (typeof value.message === 'string' && value.message.trim().length > 0) {
      return value.message;
    }

    if ('_errors' in value) {
      return getMessage(value._errors);
    }
  }

  return undefined;
}

function setRootError<TFieldValues extends FieldValues>(form: UseFormReturn<TFieldValues>, message: string) {
  form.setError('root' as never, {
    type: 'server',
    message
  });
}

export type ApplyFormApiErrorsOptions = {
  defaultMessage?: string;
  unexpectedToastTitle?: string;
  toast?: Pick<ToastContextValue, 'error'>;
};

export default function applyFormApiErrors<TFieldValues extends FieldValues>(
  error: unknown,
  form: UseFormReturn<TFieldValues>,
  options: ApplyFormApiErrorsOptions = {}
) {
  const fallbackMessage = options.defaultMessage ?? 'We could not submit the form. Try again.';

  if (error instanceof ValidationError) {
    const currentValues = form.getValues();
    const unknownMessages: string[] = [];
    let appliedFieldErrors = 0;

    if (isRecord(error.details)) {
      for (const [key, value] of Object.entries(error.details)) {
        const message = getMessage(value);

        if (!message) {
          continue;
        }

        if (hasPath(currentValues, key)) {
          form.setError(key as never, {
            type: 'server',
            message
          });
          appliedFieldErrors += 1;
          continue;
        }

        unknownMessages.push(message);
      }
    }

    if (unknownMessages.length > 0) {
      setRootError(form, unknownMessages[0]);
      return;
    }

    if (appliedFieldErrors === 0) {
      setRootError(form, error.message || fallbackMessage);
    }

    return;
  }

  const message = error instanceof ApiError && error.message ? error.message : fallbackMessage;

  setRootError(form, message);

  if (options.toast && error instanceof ApiError) {
    options.toast.error({
      title: options.unexpectedToastTitle ?? 'Unable to submit form',
      description: message
    });
  }
}
