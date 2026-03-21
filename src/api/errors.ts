import axios from 'axios';

export interface ApiErrorPayload {
  status: number;
  code: string;
  message: string;
  details?: unknown;
  raw?: unknown;
}

export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;
  raw?: unknown;

  constructor({ status, code, message, details, raw }: ApiErrorPayload) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.raw = raw;
  }
}

export class BadRequestError extends ApiError {
  constructor(payload: ApiErrorPayload) {
    super(payload);
    this.name = 'BadRequestError';
  }
}

export class NotFoundError extends ApiError {
  constructor(payload: ApiErrorPayload) {
    super(payload);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends ApiError {
  constructor(payload: ApiErrorPayload) {
    super(payload);
    this.name = 'ValidationError';
  }
}

export class ServerError extends ApiError {
  constructor(payload: ApiErrorPayload) {
    super(payload);
    this.name = 'ServerError';
  }
}

export class NetworkError extends ApiError {
  constructor(payload: ApiErrorPayload) {
    super(payload);
    this.name = 'NetworkError';
  }
}

const FALLBACK_MESSAGES = {
  default: 'An unexpected API error occurred.',
  badRequest: 'The request could not be processed.',
  notFound: 'The requested resource could not be found.',
  validation: 'The submitted data is invalid.',
  server: 'The server could not process the request.',
  network: 'The backend is unreachable. Check your connection and try again.'
} as const;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getPayloadCode(raw: unknown, status: number) {
  if (isObject(raw) && typeof raw.code === 'string' && raw.code.length > 0) {
    return raw.code;
  }

  return `HTTP_${status || 0}`;
}

function getPayloadMessage(raw: unknown, fallbackMessage: string) {
  if (isObject(raw) && typeof raw.message === 'string' && raw.message.length > 0) {
    return raw.message;
  }

  if (typeof raw === 'string' && raw.length > 0) {
    return raw;
  }

  return fallbackMessage;
}

function getPayloadDetails(raw: unknown) {
  if (isObject(raw) && 'details' in raw) {
    return raw.details;
  }

  if (isObject(raw) && 'errors' in raw) {
    return raw.errors;
  }

  return undefined;
}

function createPayload(status: number, raw: unknown, fallbackMessage: string): ApiErrorPayload {
  return {
    status,
    code: getPayloadCode(raw, status),
    message: getPayloadMessage(raw, fallbackMessage),
    details: getPayloadDetails(raw),
    raw
  };
}

export function normalizeApiError(error: unknown): ApiError {
  if (!axios.isAxiosError(error)) {
    return new ApiError(createPayload(0, error, error instanceof Error ? error.message : FALLBACK_MESSAGES.default));
  }

  if (!error.response) {
    return new NetworkError({
      status: 0,
      code: 'HTTP_0',
      message: FALLBACK_MESSAGES.network,
      raw: error.toJSON?.() ?? error.message
    });
  }

  const { status, data } = error.response;

  if (status === 400) {
    return new BadRequestError(createPayload(status, data, FALLBACK_MESSAGES.badRequest));
  }

  if (status === 404) {
    return new NotFoundError(createPayload(status, data, FALLBACK_MESSAGES.notFound));
  }

  if (status === 422) {
    return new ValidationError(createPayload(status, data, FALLBACK_MESSAGES.validation));
  }

  if (status >= 500) {
    return new ServerError(createPayload(status, data, FALLBACK_MESSAGES.server));
  }

  return new ApiError(createPayload(status, data, FALLBACK_MESSAGES.default));
}
