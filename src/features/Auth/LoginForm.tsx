'use client';

import { useRouter } from 'next/navigation';

import AuthAPI from '@/api/AuthAPI';
import Button from '@/components/Button';
import Form, { FormErrorSummary, FormInput, applyFormApiErrors, useZodForm } from '@/components/Form';
import useToast from '@/hooks/useToast';
import EnvelopeIcon from '@/icons/EnvelopeIcon';
import LockIcon from '@/icons/LockIcon';
import type { LoginCredentials } from '@/types/Auth';

import { loginSchema } from './schema';
import LoginHeader from './LoginHeader';
import styles from './LoginForm.module.css';

export type LoginFormProps = {
  redirectsTo?: string;
};

export default function LoginForm({ redirectsTo }: LoginFormProps) {
  const form = useZodForm(loginSchema, {
    defaultValues: {
      email: '',
      password: ''
    }
  });
  const router = useRouter();
  const toast = useToast();

  const handleSubmit = async (values: LoginCredentials) => {
    form.clearErrors('root');

    try {
      await AuthAPI.login(values);
      router.replace(redirectsTo ?? '/products');
    } catch (error) {
      applyFormApiErrors(error, form, {
        toast,
        defaultMessage: 'We could not sign you in. Try again.',
        unexpectedToastTitle: 'Unable to sign in'
      });
    }
  };

  return (
    <div className={styles.loginGrid}>
      <section className={styles.loginCard}>
        <LoginHeader />

        <Form className={styles.loginForm} form={form} onSubmit={handleSubmit}>
          <div className={styles.loginFields}>
            <FormInput<LoginCredentials>
              autoComplete="email"
              label="Email"
              leftIcon={<EnvelopeIcon />}
              name="email"
              placeholder="email@exemplo.com"
              type="email"
            />
            <FormInput<LoginCredentials>
              autoComplete="current-password"
              label="Senha"
              leftIcon={<LockIcon />}
              name="password"
              placeholder="••••••••"
              type="password"
            />
          </div>
          <FormErrorSummary form={form} />
          <Button className={styles.loginSubmit} disabled={form.formState.isSubmitting} type="submit">
            {form.formState.isSubmitting ? 'Entrando...' : 'Entrar'}
          </Button>
          <p className={styles.loginFooter}>
            Esqueceu a senha?{' '}
            <button className={styles.loginFooterLink} type="button">
              Click aqui para alterar
            </button>
            .
          </p>
        </Form>
      </section>
    </div>
  );
}
