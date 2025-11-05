'use client';

import Avatar from '@mui/material/Avatar';
import Link from 'next/link';

export default function ProfilePage() {
  const user = {
    name: 'John Doe',
    handle: '@johndoe',
    email: 'johndoe@example.com',
    avatar: '/images/avatar.jpg',
    posts: 0,
    reports_submitted: 0,
  };

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center gap-6">
          <Avatar
            alt={user.name}
            src={user.avatar}
            sx={{ width: 96, height: 96 }}
          />
          <div>
            <h1 className="text-2xl font-semibold">{user.name}</h1>
            <div className="text-sm text-white">{user.handle}</div>
            <p className="mt-2 text-white">{user.email}</p>
            <div className="mt-4 flex gap-4 text-sm text-white">
              <div>
                <strong className="font-bold">{user.posts}</strong> posts
              </div>
              <div>
                <strong className="font-bold">{user.reports_submitted}</strong>{' '}
                reports submitted
              </div>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Link
              href="/profile/edit"
              className="rounded-md px-4 py-2 text-white"
            >
              Edit Profile
            </Link>
          </div>
        </div>
        <h2 className="mt-10 text-xl font-semibold">Saved Notes:</h2>
        <h2 className="mt-10 text-xl font-semibold">Uploaded Notes:</h2>
      </div>
    </main>
  );
}
