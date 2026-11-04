import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@src/server/auth';
import Page from './CreateNotePage';

jest.mock('next/headers', () => ({ headers: jest.fn() }));
jest.mock('next/navigation', () => ({ redirect: jest.fn() }));
jest.mock('@src/server/auth', () => ({
  auth: { api: { getSession: jest.fn() } },
}));
jest.mock('@src/systems/notes/forms/CreateNoteForm', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@src/systems/search/components/Header', () => ({
  __esModule: true,
  default: () => null,
}));

const redirectError = new Error('NEXT_REDIRECT');

describe('create-note sign-in return address', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(headers).mockResolvedValue(
      new Headers({
        'X-Forwarded-Host': 'localhost:3000',
        'X-Forwarded-Proto': 'http',
      }) as Awaited<ReturnType<typeof headers>>,
    );
    jest.mocked(auth.api.getSession).mockResolvedValue(null);
    jest.mocked(redirect).mockImplementation(() => {
      throw redirectError;
    });
  });

  it.each([
    { name: 'missing course', q: undefined, expected: null },
    { name: 'empty course', q: '', expected: null },
    { name: 'selected course', q: 'CS 3345', expected: 'CS 3345' },
    {
      name: 'special characters',
      q: 'CS & + % # / ?',
      expected: 'CS & + % # / ?',
    },
    {
      name: 'repeated course',
      q: ['CS 3345', 'MATH 2413'],
      expected: 'CS 3345',
    },
    { name: 'empty first course', q: ['', 'CS 3345'], expected: null },
  ])('preserves the return destination for $name', async ({ q, expected }) => {
    await expect(Page({ searchParams: Promise.resolve({ q }) })).rejects.toBe(
      redirectError,
    );

    expect(redirect).toHaveBeenCalledTimes(1);
    const signInUrl = new URL(
      jest.mocked(redirect).mock.calls[0]![0],
      'http://localhost:3000',
    );
    expect(signInUrl.pathname).toBe('/auth');
    const callback = new URL(signInUrl.searchParams.get('callbackUrl')!);
    expect(callback.origin).toBe('http://localhost:3000');
    expect(callback.pathname).toBe('/notes/create');
    expect(callback.searchParams.get('q')).toBe(expected);
    expect([...callback.searchParams.keys()]).toEqual(
      expected === null ? [] : ['q'],
    );
  });

  it('renders the form without redirecting a signed-in visitor', async () => {
    jest
      .mocked(auth.api.getSession)
      .mockResolvedValue({ user: { id: 'user-1' } } as NonNullable<
        Awaited<ReturnType<typeof auth.api.getSession>>
      >);

    const page = await Page({
      searchParams: Promise.resolve({ q: 'CS 3345' }),
    });

    expect(page).toBeTruthy();
    expect(redirect).not.toHaveBeenCalled();
  });
});
