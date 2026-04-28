'use client';

import AuthAPI from '@/api/AuthAPI';
import { RequiredPasswordUpdateFormValues } from '@/types/Auth';
import { ApiError } from '@/api/errors';
import Button from '@/components/Button';
import Form, { FormErrorSummary, FormInput, applyFormApiErrors, useZodForm } from '@/components/Form';
import Modal from '@/components/Modal';
import useToast from '@/hooks/useToast';
import LockIcon from '@/icons/LockIcon';

import { requiredPasswordUpdateSchema } from './schema';
import { markPasswordUpdateComplete } from './session';
import LoginHeader from './LoginHeader';
import styles from './RequiredPasswordUpdateModal.module.css';

export type RequiredPasswordUpdateModalProps = {
  isOpen: boolean;
};

const DEFAULT_ERROR_MESSAGE = 'Não foi possível atualizar sua senha. Tente novamente.';

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
        title: 'Senha atualizada',
        description: 'Sua senha foi atualizada com sucesso.'
      });
      markPasswordUpdateComplete();
    } catch (error) {
      const description = getPasswordUpdateErrorMessage(error);

      applyFormApiErrors(error, form, {
        defaultMessage: description
      });
      toast.error({
        title: 'Erro ao atualizar senha',
        description
      });
    }
  };

  return (
    <Modal dialogClassName={styles.dialog} className={styles.modal} isOpen={isOpen} showCloseButton={false}>
      <LoginHeader />

      <Form className={styles.form} form={form} onSubmit={handleSubmit}>
        <div className={styles.fields}>
          <FormInput<RequiredPasswordUpdateFormValues>
            label="Senha atual"
            name="currentPassword"
            leftIcon={<LockIcon />}
            placeholder="Digite sua senha atual"
            type="password"
          />
          <FormInput<RequiredPasswordUpdateFormValues>
            hint="Use pelo menos 6 caracteres."
            label="Nova senha"
            leftIcon={<LockIcon />}
            name="newPassword"
            placeholder="Digite sua nova senha"
            type="password"
          />
          <FormInput<RequiredPasswordUpdateFormValues>
            label="Confirmar nova senha"
            name="newPasswordConfirmation"
            leftIcon={<LockIcon />}
            placeholder="Confirme sua nova senha"
            type="password"
          />
        </div>

        <FormErrorSummary form={form} />

        <Button className={styles.submitButton} disabled={form.formState.isSubmitting} type="submit">
          {form.formState.isSubmitting ? 'Atualizando...' : 'Atualizar senha'}
        </Button>
      </Form>
    </Modal>
  );
}
