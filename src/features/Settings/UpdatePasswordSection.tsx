'use client';

import AuthAPI from '@/api/AuthAPI';
import { ApiError } from '@/api/errors';
import Button from '@/components/Button';
import Form, { FormErrorSummary, FormInput, applyFormApiErrors, useZodForm } from '@/components/Form';
import { markPasswordUpdateComplete } from '@/features/Auth/session';
import useToast from '@/hooks/useToast';
import type { UpdatePasswordPayload } from '@/types/Auth';

import { updatePasswordSchema } from './schema';
import styles from './UpdatePasswordSection.module.css';

const DEFAULT_ERROR_MESSAGE = 'We could not update your password. Try again.';

function getPasswordUpdateErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.message.length > 0) {
    return error.message;
  }

  return DEFAULT_ERROR_MESSAGE;
}

export default function UpdatePasswordSection() {
  const form = useZodForm(updatePasswordSchema, {
    defaultValues: {
      currentPassword: '',
      newPassword: ''
    }
  });
  const toast = useToast();

  const handleSubmit = async (values: UpdatePasswordPayload) => {
    form.clearErrors('root');

    try {
      await AuthAPI.updatePassword(values);
      form.reset();
      markPasswordUpdateComplete();
      toast.success({
        title: 'Password updated',
        description: 'Your password has been updated.'
      });
    } catch (error) {
      const description = getPasswordUpdateErrorMessage(error);

      applyFormApiErrors(error, form, {
        defaultMessage: description
      });
      toast.error({
        title: 'Unable to update password',
        description
      });
    }
  };

  return (
    <section aria-labelledby="update-password-title" className={styles.section}>
      <div className={styles.header}>
        <h2 id="update-password-title">Update password</h2>
        <p>Use a new password for your next sign-in.</p>
      </div>

      <Form className={styles.form} form={form} onSubmit={handleSubmit}>
        <div className={styles.fields}>
          <FormInput<UpdatePasswordPayload>
            label="Current password"
            name="currentPassword"
            placeholder="Enter your current password"
            type="password"
          />
          <FormInput<UpdatePasswordPayload>
            hint="Use at least 6 characters."
            label="New password"
            name="newPassword"
            placeholder="Enter your new password"
            type="password"
          />
        </div>

        <FormErrorSummary form={form} />

        <Button className={styles.submitButton} disabled={form.formState.isSubmitting} type="submit">
          {form.formState.isSubmitting ? 'Updating password...' : 'Update password'}
        </Button>
      </Form>
    </section>
  );
}
