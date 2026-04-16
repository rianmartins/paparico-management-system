'use client';
import { FC } from 'react';

import { useCurrentUserQuery } from '@/features/Auth/query';

import styles from './CurrentUserInformation.module.css';

function getRolesLabel(roles?: string[]) {
  if (!roles) {
    return 'Not available';
  }

  if (roles.length === 0) {
    return 'No roles assigned';
  }

  return roles.join(', ');
}

const CurrentUserInformation: FC = () => {
  const { data: user, isPending } = useCurrentUserQuery();
  const fallbackText = isPending ? 'Loading...' : 'Not available';

  return (
    <dl aria-label="User information" className={styles.details}>
      <div className={styles.item}>
        <dt className={styles.term}>Name</dt>
        <dd className={styles.value}>{user?.name ?? fallbackText}</dd>
      </div>
      <div className={styles.item}>
        <dt className={styles.term}>Email</dt>
        <dd className={styles.value}>{user?.email ?? fallbackText}</dd>
      </div>
      <div className={styles.item}>
        <dt className={styles.term}>Roles</dt>
        <dd className={styles.value}>{user ? getRolesLabel(user.roles) : fallbackText}</dd>
      </div>
    </dl>
  );
};

export default CurrentUserInformation;
