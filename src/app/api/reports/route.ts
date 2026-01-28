// This file defines the API route for POST /api/reports
// It lets logged-in users submit a report for a specific file.

import { headers } from 'next/headers';
import { NextResponse } from 'next/server'; // Used to send HTTP responses (JSON, status codes)
import { z } from 'zod'; // Zod validates and parses input data

// Import session helper to check if a user is logged in
import { auth } from '@src/server/auth';
// Import database connection and the "report" table schema
import { db } from '@src/server/db';
import { report } from '@src/server/db/schema/reports';

// This ensures the API only accepts the correct fields
const CreateReportSchema = z.object({
  fileId: z.string().min(1),
  category: z
    .enum(['inappropriate', 'copyright', 'spam', 'other'])
    .default('other'),
  details: z.string().min(1),
});

// This function runs when someone sends a POST request to /api/reports
export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // If there’s no session or no user ID, reject the request
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Try to parse and validate the incoming request body
  let body: z.infer<typeof CreateReportSchema>;
  try {
    body = CreateReportSchema.parse(await req.json());
  } catch (e) {
    return NextResponse.json(
      { error: 'Invalid body', details: (e as Error).message },
      { status: 400 },
    );
  }

  // Insert the validated report into the database
  const [created] = await db
    .insert(report)
    .values({
      userId: session.user.id,
      fileId: body.fileId,
      category: body.category,
      details: body.details,
    })
    .returning(); // return the newly created record

  // Send the inserted report back as JSON
  return NextResponse.json(created, { status: 201 });
}
