import { z } from 'zod';

export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required.'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters.')
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
  });
