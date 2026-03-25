import { mount } from 'cypress/react';

import ToastProvider from './ToastProvider';
import useToast from '@/hooks/useToast';

function ToastHarness() {
  const toast = useToast();

  return (
    <div>
      <button
        onClick={() =>
          toast.success({
            title: 'Success',
            description: 'The product was saved.'
          })
        }
        type="button"
      >
        Show success
      </button>

      <button
        onClick={() =>
          toast.error({
            title: 'Error',
            description: 'The product could not be saved.'
          })
        }
        type="button"
      >
        Show error
      </button>

      <button
        onClick={() =>
          toast.info({
            description: 'Inventory sync in progress.',
            duration: 1000
          })
        }
        type="button"
      >
        Show info
      </button>
    </div>
  );
}

describe('ToastProvider', () => {
  it('shows success and error toasts through the hook', () => {
    mount(
      <ToastProvider>
        <ToastHarness />
      </ToastProvider>
    );

    cy.contains('button', 'Show success').click();
    cy.contains('Success').should('be.visible');
    cy.contains('The product was saved.').should('be.visible');

    cy.contains('button', 'Show error').click();
    cy.contains('Error').should('be.visible');
    cy.contains('The product could not be saved.').should('be.visible');
  });

  it('dismisses a toast from the close button', () => {
    mount(
      <ToastProvider>
        <ToastHarness />
      </ToastProvider>
    );

    cy.contains('button', 'Show success').click();
    cy.get('button[aria-label="Dismiss notification"]').first().click();
    cy.contains('The product was saved.').should('not.exist');
  });

  it('auto-dismisses a toast after its duration', () => {
    cy.clock();

    mount(
      <ToastProvider>
        <ToastHarness />
      </ToastProvider>
    );

    cy.contains('button', 'Show info').click();
    cy.contains('Inventory sync in progress.').should('be.visible');
    cy.tick(1000);
    cy.contains('Inventory sync in progress.').should('not.exist');
  });
});
