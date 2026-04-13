import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required.').email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.')
});

export const requiredPasswordUpdateSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required.'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters.'),
    newPasswordConfirmation: z.string().min(6, 'Confirm your new password.')
  })
  .superRefine((values, context) => {
    if (
      values.currentPassword.length > 0 &&
      values.newPassword.length > 0 &&
      values.newPassword === values.currentPassword
    ) {
      context.addIssue({
        code: 'custom',
        path: ['newPassword'],
        message: 'New password must be different from your current password.'
      });
    }

    if (values.newPasswordConfirmation.length > 0 && values.newPassword !== values.newPasswordConfirmation) {
      context.addIssue({
        code: 'custom',
        path: ['newPasswordConfirmation'],
        message: 'New password confirmation must match the new password.'
      });
    }
  });
