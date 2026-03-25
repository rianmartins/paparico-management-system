import cx from 'classnames';

import styles from './Toast.module.css';
import type { ToastProps } from './types';

export default function Toast({ description, dismissible = true, id, onClose, title, variant }: ToastProps) {
  const titleId = title ? `${id}-title` : undefined;
  const descriptionId = `${id}-description`;

  return (
    <article
      aria-atomic="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className={cx(styles.Toast, styles[variant])}
      role={variant === 'error' || variant === 'warning' ? 'alert' : 'status'}
    >
      <div className={styles.content}>
        {title ? (
          <p className={styles.title} id={titleId}>
            {title}
          </p>
        ) : null}

        <p className={styles.description} id={descriptionId}>
          {description}
        </p>
      </div>

      {dismissible ? (
        <button aria-label="Dismiss notification" className={styles.closeButton} onClick={onClose} type="button">
          <span aria-hidden="true">&times;</span>
        </button>
      ) : null}
    </article>
  );
}
