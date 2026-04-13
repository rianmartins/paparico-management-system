'use client';

import { useRouter } from 'next/navigation';

import AuthAPI from '@/api/AuthAPI';
import Button from '@/components/Button';
import Form, { FormErrorSummary, FormInput, applyFormApiErrors, useZodForm } from '@/components/Form';
import useToast from '@/hooks/useToast';
import type { LoginCredentials } from '@/types/Auth';

import { loginSchema } from './schema';
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
        <div className={styles.loginHeader}>
          <div>
            <p className={styles.eyebrow}>Account access</p>
            <h2>Sign in</h2>
          </div>
          <p className={styles.loginCopy}>Use your Paparico credentials to continue to the management dashboard.</p>
        </div>

        <Form className={styles.loginForm} form={form} onSubmit={handleSubmit}>
          <div className={styles.loginFields}>
            <FormInput<LoginCredentials>
              autoComplete="email"
              hint="Use the email address registered for your Paparico access."
              label="Email"
              name="email"
              placeholder="manager@paparico.pt"
              type="email"
            />
            <FormInput<LoginCredentials>
              autoComplete="current-password"
              hint="Your password is never stored in the browser."
              label="Password"
              name="password"
              placeholder="Enter your password"
              type="password"
            />
          </div>
          <FormErrorSummary form={form} />
          <Button className={styles.loginSubmit} disabled={form.formState.isSubmitting} type="submit">
            {form.formState.isSubmitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </Form>
      </section>
    </div>
  );
}
