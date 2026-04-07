import { ApiError } from '@/api/errors';
import type { ErrorPageContext, ErrorPageDiagnostic, NormalizedErrorDisplay } from '@/types/ErrorPage';

const GENERIC_TITLE = 'Something went wrong';
const GENERIC_DESCRIPTION = 'An unexpected error interrupted this page. Try again, or return to the dashboard.';
const API_TITLE = 'We could not load this page';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getText(value: unknown) {
  if (typeof value === 'string') {
    const trimmed = value.trim();

    return trimmed.length > 0 ? trimmed : null;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  return null;
}

function getDigest(error: unknown) {
  if (!isRecord(error)) {
    return null;
  }

  return getText(error.digest);
}

function getName(error: unknown) {
  if (!isRecord(error)) {
    return null;
  }

  return getText(error.name);
}

function getStatus(error: unknown) {
  if (!isRecord(error)) {
    return null;
  }

  return getText(error.status);
}

function getCode(error: unknown) {
  if (!isRecord(error)) {
    return null;
  }

  return getText(error.code);
}

function pushDiagnostic(diagnostics: ErrorPageDiagnostic[], label: string, value: string | null) {
  if (!value) {
    return;
  }

  diagnostics.push({ label, value });
}

function getApiDescription(error: ApiError) {
  if (error.status === 0 || error.name === 'NetworkError') {
    return 'The dashboard could not reach the backend service. Check the API connection and try again.';
  }

  if (error.status >= 500) {
    return 'The backend failed while preparing this page. Try again in a moment.';
  }

  if (error.status === 404) {
    return 'The requested resource could not be found.';
  }

  if (error.status === 400 || error.status === 422) {
    return 'The backend rejected this request and the page could not finish loading.';
  }

  return 'An API error prevented this page from loading correctly.';
}

export function normalizeErrorForDisplay(error: unknown, context?: ErrorPageContext): NormalizedErrorDisplay {
  const diagnostics: ErrorPageDiagnostic[] = [];

  if (context) {
    pushDiagnostic(diagnostics, context.label, context.value);
  }

  if (error instanceof ApiError) {
    pushDiagnostic(diagnostics, 'Type', error.name);
    pushDiagnostic(diagnostics, 'Status', error.status > 0 ? String(error.status) : null);
    pushDiagnostic(diagnostics, 'Code', error.code);
    pushDiagnostic(diagnostics, 'Reference', getDigest(error));

    return {
      title: API_TITLE,
      description: getApiDescription(error),
      diagnostics
    };
  }

  pushDiagnostic(diagnostics, 'Type', getName(error) ?? (error instanceof Error ? error.name : null));
  pushDiagnostic(diagnostics, 'Status', getStatus(error));
  pushDiagnostic(diagnostics, 'Code', getCode(error));
  pushDiagnostic(diagnostics, 'Reference', getDigest(error));

  return {
    title: GENERIC_TITLE,
    description: GENERIC_DESCRIPTION,
    diagnostics
  };
}
