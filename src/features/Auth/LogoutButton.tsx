'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import AuthAPI from '@/api/AuthAPI';
import Button from '@/components/Button';

type LogoutButtonProps = {
  className?: string;
};

export default function LogoutButton({ className }: LogoutButtonProps = {}) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsPending(true);

    try {
      await AuthAPI.logout();
    } finally {
      router.replace('/');
      setIsPending(false);
    }
  };

  return (
    <Button className={className} disabled={isPending} onClick={handleLogout} type="button" variant="secondary">
      {isPending ? 'Signing out...' : 'Sign out'}
    </Button>
  );
}
