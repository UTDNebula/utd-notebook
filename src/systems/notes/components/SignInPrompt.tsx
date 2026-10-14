'use client';

import { Button } from '@mui/material';
import { useRegisterModal } from '@src/lib/modules/registerModal/RegisterModalProvider';

export default function SignInPrompt({ message }: { message: string }) {
  const { setShowRegisterModal } = useRegisterModal();

  return (
    <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
      <p className="text-lg font-semibold">{message}</p>
      <Button
        variant="contained"
        className="normal-case"
        onClick={() => setShowRegisterModal(true)}
      >
        Sign in
      </Button>
    </div>
  );
}
