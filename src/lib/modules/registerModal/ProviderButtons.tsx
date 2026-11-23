'use client';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState, type SubmitEvent } from 'react';
import AuthIcons from '@src/lib/icons/AuthIcons';
import { authClient } from '@src/lib/utils/auth-client';

const providerNames = {
  google: 'Google',
  discord: 'Discord',
} as const;

const ProviderButton = ({
  provider,
  callbackUrl,
}: {
  provider: 'google' | 'discord';
  callbackUrl?: string;
}) => (
  <Button
    variant="contained"
    size="large"
    onClick={() => {
      void authClient.signIn.social({
        provider,
        callbackURL: callbackUrl ?? window.location.href,
        newUserCallbackURL: '/get-started',
      });
    }}
    className="min-w-max bg-white whitespace-nowrap normal-case hover:bg-neutral-100 dark:bg-neutral-700 dark:hover:bg-neutral-600"
    startIcon={AuthIcons[provider]}
  >
    <Typography className="text-base font-extrabold text-slate-800 md:text-xs dark:text-slate-200">
      <span className="min-w-fit">Sign in with {providerNames[provider]}</span>
    </Typography>
  </Button>
);

export const DevelopmentLoginForm = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError(undefined);
    setIsPending(true);

    try {
      const result = isSignUp
        ? await authClient.signUp.email({
            name,
            email,
            password,
            callbackURL: '/get-started',
          })
        : await authClient.signIn.email({
            email,
            password,
            callbackURL: window.location.href,
          });

      if (result.error) {
        setError(
          result.error.message ??
            (isSignUp ? 'Unable to create account' : 'Unable to sign in'),
        );
        return;
      }

      window.location.assign(isSignUp ? '/get-started' : window.location.href);
    } catch {
      setError('Unable to connect to the authentication server');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-sm flex-col gap-3"
    >
      {isSignUp && (
        <TextField
          label="Name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="name"
          required
          fullWidth
        />
      )}

      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        autoComplete="email"
        required
        fullWidth
      />

      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        autoComplete={isSignUp ? 'new-password' : 'current-password'}
        required
        fullWidth
      />

      {error && <Alert severity="error">{error}</Alert>}

      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={isPending}
        className="normal-case"
      >
        {isPending
          ? isSignUp
            ? 'Creating account…'
            : 'Signing in…'
          : isSignUp
            ? 'Sign up'
            : 'Sign in'}
      </Button>

      <Alert severity="info">
        Email login is available only during local development.
      </Alert>

      <Button
        type="button"
        variant="text"
        disabled={isPending}
        onClick={() => {
          setIsSignUp((current) => !current);
          setError(undefined);
        }}
        className="normal-case"
      >
        {isSignUp
          ? 'Already have an account? Sign in'
          : 'Need an account? Sign up'}
      </Button>
    </form>
  );
};

export default ProviderButton;
