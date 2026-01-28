'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { Button, Stack, Typography } from '@mui/material';

export default function LoginButtons() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <Typography color="white">Loading...</Typography>;
  }

  // If logged in, show user info + logout
  if (session?.user) {
    return (
      <Stack spacing={2}>
        <Typography color="white">
          Logged in as {session.user.name ?? session.user.email}
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => void signOut()}
        >
          Sign out
        </Button>
      </Stack>
    );
  }

  // If not logged in, show Google & Discord buttons
  return (
    <Stack spacing={2}>
      <Button
        variant="contained"
        onClick={() => void signIn('google', { callbackUrl: '/homepage' })}
      >
        Continue with Google
      </Button>
      <Button
        variant="outlined"
        onClick={() => void signIn('discord', { callbackUrl: '/homepage' })}
      >
        Continue with Discord
      </Button>
    </Stack>
  );
}
