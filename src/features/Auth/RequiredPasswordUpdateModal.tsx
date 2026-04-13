'use client';

import AuthAPI from '@/api/AuthAPI';
import { RequiredPasswordUpdateFormValues } from '@/types/Auth';
import { ApiError } from '@/api/errors';
import Button from '@/components/Button';
import Form, { FormErrorSummary, FormInput, applyFormApiErrors, useZodForm } from '@/components/Form';
import Modal from '@/components/Modal';
import useToast from '@/hooks/useToast';

import { requiredPasswordUpdateSchema } from './schema';
import { markPasswordUpdateComplete } from './session';
import styles from './RequiredPasswordUpdateModal.module.css';

export type RequiredPasswordUpdateModalProps = {
  isOpen: boolean;
};

const DEFAULT_ERROR_MESSAGE = 'We could not update your password. Try again.';

function getPasswordUpdateErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.message.length > 0) {
    return error.message;
  }

  return DEFAULT_ERROR_MESSAGE;
}

export default function RequiredPasswordUpdateModal({ isOpen }: RequiredPasswordUpdateModalProps) {
  const form = useZodForm(requiredPasswordUpdateSchema, {
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      newPasswordConfirmation: ''
    }
  });
  const toast = useToast();

  const handleSubmit = async (values: RequiredPasswordUpdateFormValues) => {
    form.clearErrors('root');

    try {
      await AuthAPI.updatePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      });
      form.reset();
      toast.success({
        title: 'Password updated',
        description: 'Your password has been updated.'
      });
      markPasswordUpdateComplete();
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
    <Modal dialogClassName={styles.dialog} isOpen={isOpen} showCloseButton={false} title="Update your password">
      <div className={styles.intro}>
        <p className={styles.copy}>Choose a new password to continue.</p>
      </div>

      <Form className={styles.form} form={form} onSubmit={handleSubmit}>
        <div className={styles.fields}>
          <FormInput<RequiredPasswordUpdateFormValues>
            label="Current password"
            name="currentPassword"
            placeholder="Enter your current password"
            type="password"
          />
          <FormInput<RequiredPasswordUpdateFormValues>
            hint="Use at least 6 characters."
            label="New password"
            name="newPassword"
            placeholder="Enter your new password"
            type="password"
          />
          <FormInput<RequiredPasswordUpdateFormValues>
            label="Confirm new password"
            name="newPasswordConfirmation"
            placeholder="Confirm your new password"
            type="password"
          />
        </div>

        <FormErrorSummary form={form} />

        <Button className={styles.submitButton} disabled={form.formState.isSubmitting} type="submit">
          {form.formState.isSubmitting ? 'Updating password...' : 'Update password'}
        </Button>
      </Form>
    </Modal>
  );
}
