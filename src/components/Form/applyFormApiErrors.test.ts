import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useForm } from 'react-hook-form';

import { ApiError, NetworkError, ValidationError } from '@/api/errors';

import applyFormApiErrors from './applyFormApiErrors';

type FormValues = {
  email: string;
  role: string;
};

describe('applyFormApiErrors', () => {
  it('maps validation details onto matching form fields', () => {
    const { result } = renderHook(() =>
      useForm<FormValues>({
        defaultValues: {
          email: '',
          role: ''
        }
      })
    );

    act(() => {
      applyFormApiErrors(
        new ValidationError({
          status: 422,
          code: 'VALIDATION',
          message: 'Submitted data is invalid.',
          details: {
            email: ['Email already exists.'],
            role: ['Role is invalid.']
          }
        }),
        result.current
      );
    });

    expect(result.current.getFieldState('email').error?.message).toBe('Email already exists.');
    expect(result.current.getFieldState('role').error?.message).toBe('Role is invalid.');
  });

  it('falls back to a root error for unknown validation keys', () => {
    const { result } = renderHook(() =>
      useForm<FormValues>({
        defaultValues: {
          email: '',
          role: ''
        }
      })
    );

    act(() => {
      applyFormApiErrors(
        new ValidationError({
          status: 422,
          code: 'VALIDATION',
          message: 'Submitted data is invalid.',
          details: {
            permissions: ['Permissions are invalid.']
          }
        }),
        result.current
      );
    });

    expect(result.current.getFieldState('root' as never).error?.message).toBe('Permissions are invalid.');
  });

  it('sets a root error and toast for unexpected API failures', () => {
    const { result } = renderHook(() =>
      useForm<FormValues>({
        defaultValues: {
          email: '',
          role: ''
        }
      })
    );
    const toast = {
      error: vi.fn()
    };

    act(() => {
      applyFormApiErrors(
        new NetworkError({
          status: 0,
          code: 'HTTP_0',
          message: 'The backend is unreachable.',
          raw: null
        }),
        result.current,
        {
          toast,
          unexpectedToastTitle: 'Unable to save user'
        }
      );
    });

    expect(result.current.getFieldState('root' as never).error?.message).toBe('The backend is unreachable.');
    expect(toast.error).toHaveBeenCalledWith({
      title: 'Unable to save user',
      description: 'The backend is unreachable.'
    });
  });

  it('uses the fallback message for unknown errors', () => {
    const { result } = renderHook(() =>
      useForm<FormValues>({
        defaultValues: {
          email: '',
          role: ''
        }
      })
    );

    act(() => {
      applyFormApiErrors(new Error('Boom'), result.current, {
        defaultMessage: 'Unable to save the user.'
      });
    });

    expect(result.current.getFieldState('root' as never).error?.message).toBe('Unable to save the user.');
  });

  it('keeps generic api errors inside the standard root channel', () => {
    const { result } = renderHook(() =>
      useForm<FormValues>({
        defaultValues: {
          email: '',
          role: ''
        }
      })
    );

    act(() => {
      applyFormApiErrors(
        new ApiError({
          status: 400,
          code: 'BAD_REQUEST',
          message: 'Request could not be processed.',
          raw: null
        }),
        result.current
      );
    });

    expect(result.current.getFieldState('root' as never).error?.message).toBe('Request could not be processed.');
  });
});
