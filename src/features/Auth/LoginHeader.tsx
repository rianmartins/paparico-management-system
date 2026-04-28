import Image from 'next/image';

import styles from './LoginHeader.module.css';

export default function LoginHeader() {
  return (
    <div className={styles.header}>
      <Image alt="Paparico" className={styles.logo} height={76} priority src="/logo.png" width={277} />
      <p className={styles.subtitle}>Sistema de Gerenciamento Interno</p>
    </div>
  );
}
