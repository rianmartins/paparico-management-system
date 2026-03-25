import type { ReactNode } from 'react';
import { useState } from 'react';
import { mount } from 'cypress/react';

import Modal from './Modal';

type ControlledModalHarnessProps = {
  children?: ReactNode;
  primaryActionLabel?: ReactNode;
  secondaryActionLabel?: ReactNode;
  showCloseButton?: boolean;
};

function ControlledModalHarness({
  children,
  primaryActionLabel = 'Confirm',
  secondaryActionLabel = 'Cancel',
  showCloseButton = true
}: ControlledModalHarnessProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      primaryActionLabel={primaryActionLabel}
      secondaryActionLabel={secondaryActionLabel}
      showCloseButton={showCloseButton}
      title="Delete product"
    >
      {children ?? 'Confirm deletion.'}
    </Modal>
  );
}

describe('Modal', () => {
  it('opens when isOpen is true', () => {
    mount(<Modal isOpen title="Delete product" />);

    cy.get('dialog').should('have.prop', 'open', true);
    cy.contains('Delete product').should('be.visible');
  });

  it('does not remain open when isOpen is false', () => {
    mount(<Modal isOpen={false} title="Delete product" />);

    cy.get('dialog').should('have.prop', 'open', false);
  });

  it('calls the close path from the header close button', () => {
    mount(<ControlledModalHarness />);

    cy.get('button[aria-label="Close modal"]').click();
    cy.get('dialog').should('have.prop', 'open', false);
  });

  it('calls the close path from the native dialog cancel event', () => {
    mount(<ControlledModalHarness />);

    cy.get('dialog').then(($dialog) => {
      $dialog[0].dispatchEvent(new Event('cancel', { cancelable: true }));
    });

    cy.get('dialog').should('have.prop', 'open', false);
  });

  it('calls the primary and secondary action handlers', () => {
    const onPrimaryAction = cy.stub().as('onPrimaryAction');
    const onSecondaryAction = cy.stub().as('onSecondaryAction');

    mount(
      <Modal
        isOpen
        onPrimaryAction={onPrimaryAction}
        onSecondaryAction={onSecondaryAction}
        primaryActionLabel="Save changes"
        secondaryActionLabel="Discard"
        title="Edit product"
      >
        Review your edits.
      </Modal>
    );

    cy.contains('button', 'Discard').click();
    cy.get('@onSecondaryAction').should('have.been.calledOnce');

    cy.contains('button', 'Save changes').click();
    cy.get('@onPrimaryAction').should('have.been.calledOnce');
  });

  it('renders footer buttons only when labels are supplied', () => {
    mount(<Modal isOpen title="Details" />);

    cy.get('footer').should('not.exist');
  });

  it('omits the close button when showCloseButton is false', () => {
    mount(<ControlledModalHarness showCloseButton={false} />);

    cy.get('button[aria-label="Close modal"]').should('not.exist');
  });
});
