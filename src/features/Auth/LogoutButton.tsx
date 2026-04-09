'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import AuthAPI from '@/api/AuthAPI';
import Button from '@/components/Button';

export default function LogoutButton() {
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
    <Button disabled={isPending} onClick={handleLogout} type="button" variant="secondary">
      {isPending ? 'Signing out...' : 'Sign out'}
    </Button>
  );
}
