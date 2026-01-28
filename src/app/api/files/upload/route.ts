import fs from 'fs';
import path from 'path';
import { and, eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@src/server/auth';
import { db } from '@src/server/db';
import { file } from '@src/server/db/schema/file';

const allowedTypes = ['image/png', 'image/jpeg', 'application/pdf'];

const uploadFormSchema = z.object({
  file: z.any(),
  prefix: z.string().min(1, { message: 'Prefix is missing' }),
  courseNumber: z.string().min(1, { message: 'Course number is missing' }),
  sectionCode: z.string().min(1, { message: 'Section code is missing' }),
  professor: z.string().min(1, { message: 'Professor is missing' }),
  term: z.enum(['Spring', 'Summer', 'Fall']),
  year: z.coerce.number({ message: 'Year is missing' }),
});

// Upload file to database w/ file metadata (Local)
export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const result = uploadFormSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return NextResponse.json(
      { success: false, errors: result.error },
      { status: 400 },
    );
  }

  const data = result.data;
  const newFile = data.file as File;

  if (!(newFile instanceof File)) {
    return NextResponse.json({ error: 'Invalid file upload' }, { status: 400 });
  }

  if (newFile.size === 0) {
    return NextResponse.json({ error: 'File is empty' }, { status: 400 });
  }

  if (!allowedTypes.includes(newFile.type)) {
    return NextResponse.json(
      { error: 'Unsupported file type' },
      { status: 400 },
    );
  }

  // Find section
  const sectionData = await db.query.section.findFirst({
    where: (sec) =>
      and(
        eq(sec.prefix, data.prefix),
        eq(sec.number, data.courseNumber),
        eq(sec.sectionCode, data.sectionCode),
        eq(sec.professor, data.professor),
        eq(sec.term, data.term),
        eq(sec.year, data.year),
      ),
  });

  if (!sectionData) {
    return NextResponse.json({ error: 'Section not found' }, { status: 404 });
  }

  try {
    // Local file upload - might need to change for production?
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.promises.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, newFile.name);

    const buffer = Buffer.from(await newFile.arrayBuffer());
    await fs.promises.writeFile(filePath, buffer);

    // File metadata
    const fileMetadata = {
      authorId: session.user.id,
      sectionId: sectionData.id,
      fileTitle: newFile.name, // required by schema
      fileName: newFile.name, // required by schema
    };

    const result = await db.insert(file).values(fileMetadata).returning();

    return NextResponse.json(
      { message: 'File uploaded successfully', data: result },
      { status: 201 },
    );
  } catch (err) {
    console.error('File upload error:', err);
    return NextResponse.json({ error: 'File upload failed' }, { status: 500 });
  }
}
