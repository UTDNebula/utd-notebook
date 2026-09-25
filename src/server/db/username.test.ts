import { describe, expect, it } from '@jest/globals';
import { editUsernameSchema } from '../../lib/schemas/account';
import { isUsernameConflict } from './username';

describe('username normalization', () => {
  it('maps case variants to the same username while preserving literal underscores', () => {
    for (const username of [
      'Some_Thing-123',
      'some_thing-123',
      'SOME_THING-123',
    ]) {
      expect(editUsernameSchema.parse({ username }).username).toBe(
        'some_thing-123',
      );
    }
  });

  it('rejects invalid usernames before saving', () => {
    for (const username of [
      '',
      'ab',
      'a'.repeat(31),
      'some thing',
      'name%',
      null,
    ]) {
      expect(editUsernameSchema.safeParse({ username }).success).toBe(false);
    }
  });
});

describe('username conflicts', () => {
  it('recognizes direct and wrapped database uniqueness errors', () => {
    const conflict = {
      code: '23505',
      constraint: 'user_metadata_username_unique_idx',
    };
    expect(isUsernameConflict(conflict)).toBe(true);
    expect(isUsernameConflict({ cause: conflict })).toBe(true);
    expect(
      isUsernameConflict({
        code: '23505',
        constraint_name: conflict.constraint,
      }),
    ).toBe(true);
  });

  it('does not mask other database errors', () => {
    expect(
      isUsernameConflict({ code: '23505', constraint: 'user_email_unique' }),
    ).toBe(false);
    expect(isUsernameConflict(new Error('Connection failed'))).toBe(false);
    const cyclic: { cause?: unknown } = {};
    cyclic.cause = cyclic;
    expect(isUsernameConflict(cyclic)).toBe(false);
  });
});
