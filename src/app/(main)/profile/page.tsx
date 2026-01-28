import { getServerAuthSession } from '@src/server/auth';

import Avatar from '@mui/material/Avatar';
import Link from 'next/link';
import UploadNoteForm from '../uploadNotes/uploadNotes';
import { db } from '@src/server/db';
import { eq } from 'drizzle-orm';

export default async function ProfilePage() {
  const session = await getServerAuthSession();

  if (!session || !session.user) {
    return (
      <main className="min-h-screen p-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-2xl font-semibold text-white">Unauthorized</h1>
          <p className="mt-4 text-white">
            You must be logged in to view this page.
          </p>
        </div>
      </main>
    );
  }

  const uploadedFiles = await db.query.file.findMany({
    where: (f) => eq(f.authorId, session.user.id),
    with: {
      section: true,
    },
    orderBy: (f, { desc }) => [desc(f.createdAt)],
  });

  const user = {
    name: session?.user?.name ?? 'John Doe',
    handle: '@johndoe',
    email: session?.user?.email ?? 'johndoe@example.com',
    avatar: session?.user?.image ?? '/images/avatar.jpg',
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
        {uploadedFiles.length === 0 ? (
          <p className="mt-2 text-sm text-white/60">
            You haven&apos;t uploaded any notes yet.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {uploadedFiles.map((f) => (
              <li
                key={f.id}
                className="flex items-center justify-between rounded-md bg-white/5 px-3 py-2 text-sm"
              >
                <div>
                  <div className="font-medium">{f.fileTitle}</div>
                  <div className="text-xs text-white/60">
                    {f.section
                      ? `${f.section.prefix} ${f.section.number}.${f.section.sectionCode}`
                      : 'N/A'}
                    • Uploaded {new Date(f.createdAt).toLocaleString()}
                  </div>
                </div>
                {/* This gets from local - might need to change for production release */}
                <Link
                  href={`/uploads/${f.fileName}`}
                  target="_blank"
                  className="text-xs underline"
                >
                  View
                </Link>
              </li>
            ))}
          </ul>
        )}
        <UploadNoteForm />
      </div>
    </main>
  );
}
