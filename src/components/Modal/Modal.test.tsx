import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import Modal from '@/components/Modal';

import styles from './Modal.module.css';

describe('Modal', () => {
  const originalShowModal = HTMLDialogElement.prototype.showModal;
  const originalClose = HTMLDialogElement.prototype.close;

  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = vi.fn(function showModal(this: any) {
      this.setAttribute('open', '');
    });

    HTMLDialogElement.prototype.close = vi.fn(function close(this: any) {
      this.removeAttribute('open');
    });
  });

  afterEach(() => {
    HTMLDialogElement.prototype.showModal = originalShowModal;
    HTMLDialogElement.prototype.close = originalClose;
  });

  it('renders the base class, title, and dialog attributes', () => {
    render(
      <Modal isOpen title="Delete product">
        Confirm deletion.
      </Modal>
    );

    const dialog = screen.getByRole('dialog', { name: 'Delete product' });

    expect(dialog).toBeInTheDocument();
    expect(dialog.className).toContain(styles.Modal);
    expect(dialog).toHaveAttribute('aria-labelledby');
    expect(screen.getByText('Delete product')).toHaveAttribute('id', dialog.getAttribute('aria-labelledby'));
    expect(screen.getByText('Confirm deletion.')).toBeInTheDocument();
  });

  it('hides the close button when requested', () => {
    render(<Modal isOpen showCloseButton={false} title="Delete product" />);

    expect(screen.queryByRole('button', { name: 'Close modal' })).not.toBeInTheDocument();
  });

  it('renders custom footer button labels', () => {
    render(<Modal isOpen primaryActionLabel="Save changes" secondaryActionLabel="Keep editing" title="Edit product" />);

    expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Keep editing' })).toBeInTheDocument();
  });

  it('applies disabled attributes to footer buttons', () => {
    render(
      <Modal
        disablePrimaryAction
        disableSecondaryAction
        isOpen
        primaryActionLabel="Save changes"
        secondaryActionLabel="Keep editing"
        title="Edit product"
      />
    );

    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Keep editing' })).toBeDisabled();
  });
});
