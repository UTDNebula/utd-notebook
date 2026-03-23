'use client';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import { useStore } from '@tanstack/react-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import Panel from '@src/components/common/Panel';
import { setSnackbar, SnackbarPresets } from '@src/components/global/Snackbar';
import { SelectUserMetadata } from '@src/server/db/models';
import { useTRPC } from '@src/trpc/react';
import { useAppForm } from '@src/utils/form';
import { editUsernameSchema } from '@src/utils/formSchemas';
import useDebounce from '@src/utils/useDebounce';

type UsernameProps = {
  user: SelectUserMetadata;
};

export default function Username({ user }: UsernameProps) {
  const api = useTRPC();

  const editAccountMutation = useMutation(
    api.userMetadata.updateById.mutationOptions({
      onSuccess: () => {
        setSnackbar(SnackbarPresets.savedName('username'));
      },
      onError: (error) => {
        setSnackbar(SnackbarPresets.errorMessage(error.message));
      },
    }),
  );

  const [defaultValues, setDefaultValues] = useState({
    username: user?.username ?? '',
  });

  const form = useAppForm({
    defaultValues,
    onSubmit: async ({ value, formApi }) => {
      const updated = await editAccountMutation.mutateAsync({
        updateUser: { username: value.username },
      });
      if (updated) {
        setDefaultValues({ username: updated.username ?? '' });
        formApi.reset({ username: updated.username ?? '' });
      }
    },
    validators: {
      onChange: editUsernameSchema,
    },
  });

  // Set to true when there is a zod error to prevent fetching
  const [simpleError, setSimpleError] = useState(false);
  const input = useStore(form.store, (state) => state.values.username);
  const debouncedSearch = useDebounce(input, 300);
  const { data: usernameExists, isFetching } = useQuery(
    api.userMetadata.usernameExists.queryOptions(
      { username: debouncedSearch },
      {
        enabled:
          !!debouncedSearch &&
          debouncedSearch !== (user?.username ?? '') &&
          !simpleError,
      },
    ),
  );
  const isFetchingOrWaiting = isFetching || debouncedSearch !== input;

  // Update async errors
  useEffect(() => {
    const currentUsername = user?.username ?? '';
    const isNewUsername = input !== currentUsername;

    // Loading
    if (isNewUsername && isFetchingOrWaiting) {
      form.setFieldMeta('username', (prev) => {
        if (prev.errorMap.onChange?.length) return prev;
        return {
          ...prev,
          errorMap: {
            onChange: [{ message: 'Checking availability..' }],
          },
          isValidating: true,
        };
      });
      return;
    }

    // Taken
    if (isNewUsername && usernameExists && !isFetchingOrWaiting) {
      form.setFieldMeta('username', (prev) => {
        if (prev.errorMap.onChange?.length) return prev;
        return {
          ...prev,
          errorMap: {
            onChange: [
              ...(prev.errorMap.onChange || []),
              { message: 'This username is already taken' },
            ],
          },
          isValid: false,
          isValidating: false,
        };
      });
      return;
    }

    // Success, remove async errors
    if (isNewUsername && !usernameExists && !isFetchingOrWaiting) {
      form.setFieldMeta('username', (prev) => {
        return {
          ...prev,
          errorMap: {
            onChange:
              prev.errorMap.onChange?.filter(
                (err: { message?: string } | undefined) =>
                  err?.message !== 'Checking availability..' &&
                  err?.message !== 'This username is already taken',
              ) ?? [],
          },
          isValidating: false,
        };
      });
      return;
    }

    // Default
    if (!isNewUsername) {
      form.setFieldMeta('username', (prev) => ({
        ...prev,
        isValidating: false,
      }));
    }
  }, [user?.username, form, input, isFetchingOrWaiting, usernameExists]);

  // Show first error
  const helperText = (errors: ({ message?: string } | undefined)[]) => {
    const stringErrors = errors
      .map((error) => error?.message)
      .filter((error) => typeof error === 'string');
    if (stringErrors.length) {
      return stringErrors[0] === 'This username is already taken' ? (
        <span className="flex items-center gap-1">
          <WarningIcon fontSize="inherit" />
          {`${input} is already taken.`}
        </span>
      ) : (
        <span>
          {stringErrors[0]}
          {'. '}
        </span>
      );
    }
    if (input !== (user?.username ?? '')) {
      return (
        <span className="flex items-center gap-1 text-green-700">
          <CheckCircleIcon fontSize="inherit" />
          {`${input} is available.`}
        </span>
      );
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isFetchingOrWaiting || usernameExists) {
          return;
        }
        form.handleSubmit();
      }}
    >
      <Panel
        heading="Username"
        description={
          <p>
            Your username is how you are publicly identified on UTD Notebook. It
            may only contain letters, numbers, hyphens, and underscores.
          </p>
        }
      >
        <div className="m-2 mt-0 flex flex-col gap-4">
          <form.AppField
            name="username"
            validators={{
              onChange: ({ value }) => {
                const result =
                  editUsernameSchema.shape.username.safeParse(value);
                const normalizeToArray = result.success
                  ? []
                  : result.error.issues.map((issue) => ({
                      message: issue.message,
                    }));
                setSimpleError(normalizeToArray.length !== 0);
                return normalizeToArray;
              },
            }}
          >
            {(field) => (
              <field.TextField
                label="Username"
                maxLength={30}
                className="w-full"
                error={
                  !field.state.meta.isValid && !field.state.meta.isValidating
                }
                helperText={helperText(field.state.meta.errors)}
              />
            )}
          </form.AppField>
        </div>
        <div className="flex flex-wrap justify-end items-center gap-2">
          <form.AppForm>
            <form.ResetButton />
          </form.AppForm>
          <form.AppForm>
            <form.SubmitButton />
          </form.AppForm>
        </div>
      </Panel>
    </form>
  );
}
