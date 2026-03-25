import { mount } from 'cypress/react';
import { useState } from 'react';
import { z } from 'zod';

import { ServerError, ValidationError } from '@/api/errors';
import Button from '@/components/Button';
import ToastProvider from '@/components/Toast/ToastProvider';
import useToast from '@/hooks/useToast';

import applyFormApiErrors from './applyFormApiErrors';
import Form from './Form';
import FormErrorSummary from './FormErrorSummary';
import FormInput from './FormInput';
import FormSelect from './FormSelect';
import useZodForm from './useZodForm';

const schema = z.object({
  email: z.string().min(1, 'Email is required.').email('Enter a valid email address.'),
  role: z.string().min(1, 'Select a role.')
});

type FormValues = z.output<typeof schema>;
type SubmissionMode = 'success' | 'validation' | 'server';

type FormHarnessProps = {
  onSubmit?: (values: FormValues) => void;
};

function FormHarness({ onSubmit }: FormHarnessProps) {
  const form = useZodForm(schema, {
    defaultValues: {
      email: '',
      role: ''
    }
  });
  const toast = useToast();
  const [mode, setMode] = useState<SubmissionMode>('success');

  const handleSubmit = async (values: FormValues) => {
    form.clearErrors('root');

    try {
      if (mode === 'validation') {
        throw new ValidationError({
          status: 422,
          code: 'VALIDATION_ERROR',
          message: 'Submitted data is invalid.',
          details: {
            email: ['Email is already in use.'],
            role: ['Role cannot be assigned.']
          }
        });
      }

      if (mode === 'server') {
        throw new ServerError({
          status: 500,
          code: 'SERVER_ERROR',
          message: 'The server could not save the user.',
          raw: null
        });
      }

      onSubmit?.(values);
    } catch (error) {
      applyFormApiErrors(error, form, {
        toast,
        defaultMessage: 'Unable to save the user.',
        unexpectedToastTitle: 'Unable to save user'
      });
    }
  };

  return (
    <div>
      <div>
        <button onClick={() => setMode('success')} type="button">
          Success mode
        </button>
        <button onClick={() => setMode('validation')} type="button">
          Validation mode
        </button>
        <button onClick={() => setMode('server')} type="button">
          Server mode
        </button>
      </div>

      <Form form={form} onSubmit={handleSubmit}>
        <FormInput<FormValues>
          hint="Use the user's company email."
          label="Email"
          name="email"
          placeholder="name@example.com"
          type="email"
        />
        <FormSelect<FormValues>
          hint="Choose the access role."
          label="Role"
          name="role"
          options={[
            { value: 'manager', label: 'Manager' },
            { value: 'staff', label: 'Staff' }
          ]}
          placeholder="Select a role"
        />
        <FormErrorSummary form={form} />
        <Button type="submit">Save user</Button>
      </Form>
    </div>
  );
}

describe('Form', () => {
  function mountHarness(onSubmit?: (values: FormValues) => void) {
    mount(
      <ToastProvider>
        <FormHarness onSubmit={onSubmit} />
      </ToastProvider>
    );
  }

  it('shows inline schema errors and blocks empty submissions', () => {
    const handleSubmit = cy.stub().as('handleSubmit');

    mountHarness(handleSubmit);

    cy.contains('button', 'Save user').click();

    cy.contains('Email is required.').should('be.visible');
    cy.contains('Select a role.').should('be.visible');
    cy.get('@handleSubmit').should('not.have.been.called');
  });

  it('shows inline schema errors for invalid values', () => {
    const handleSubmit = cy.stub().as('handleSubmit');

    mountHarness(handleSubmit);

    cy.get('input[name="email"]').type('not-an-email');
    cy.get('select[name="role"]').select('manager');
    cy.contains('button', 'Save user').click();

    cy.contains('Enter a valid email address.').should('be.visible');
    cy.get('@handleSubmit').should('not.have.been.called');
  });

  it('submits parsed values when the form is valid', () => {
    const handleSubmit = cy.stub().as('handleSubmit');

    mountHarness(handleSubmit);

    cy.get('input[name="email"]').type('manager@paparico.pt');
    cy.get('select[name="role"]').select('manager');
    cy.contains('button', 'Save user').click();

    cy.get('@handleSubmit').should('have.been.calledOnceWith', {
      email: 'manager@paparico.pt',
      role: 'manager'
    });
  });

  it('maps backend validation errors to matching fields', () => {
    mountHarness();

    cy.contains('button', 'Validation mode').click();
    cy.get('input[name="email"]').type('manager@paparico.pt');
    cy.get('select[name="role"]').select('manager');
    cy.contains('button', 'Save user').click();

    cy.contains('Email is already in use.').should('be.visible');
    cy.contains('Role cannot be assigned.').should('be.visible');
  });

  it('shows a root error and toast for unexpected failures', () => {
    mountHarness();

    cy.contains('button', 'Server mode').click();
    cy.get('input[name="email"]').type('manager@paparico.pt');
    cy.get('select[name="role"]').select('manager');
    cy.contains('button', 'Save user').click();

    cy.contains('The server could not save the user.').should('be.visible');
    cy.contains('Unable to save user').should('be.visible');
  });

  it('keeps input and select descriptions wired through hints and errors', () => {
    mountHarness();

    cy.contains('button', 'Save user').click();

    cy.get('input[name="email"]').should(($input) => {
      const describedBy = $input.attr('aria-describedby') ?? '';
      const inputId = $input.attr('id');

      expect(describedBy).to.contain(`${inputId}-hint`);
      expect(describedBy).to.contain(`${inputId}-error`);
    });

    cy.get('select[name="role"]').should(($select) => {
      const describedBy = $select.attr('aria-describedby') ?? '';
      const selectId = $select.attr('id');

      expect(describedBy).to.contain(`${selectId}-hint`);
      expect(describedBy).to.contain(`${selectId}-error`);
    });
  });
});
