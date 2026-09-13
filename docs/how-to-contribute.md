# How to contribute

This guide covers a safe contribution from local setup through review. The
project's default integration branch is `develop`.

## Before starting

1. Find or create a GitHub issue and agree on its scope.
2. Ask to be assigned so work is not duplicated.
3. Confirm whether the change touches Notebook, the Nebula Library submodule,
   or both.
4. Keep credentials, student data, and private links out of issues and chat.

## Local setup

Use Node.js 22, which matches the repository's continuous-integration jobs.

```bash
git clone https://github.com/UTDNebula/utd-notebook.git --recurse-submodules
cd utd-notebook
npm install
```

If the repository was cloned without submodules, initialize them without
changing their recorded revisions:

```bash
git submodule update --init --recursive
```

Create a local `.env` file using values supplied through an authorized project
channel. The validated environment variables are:

| Variable                                     | Purpose                                                 |
| -------------------------------------------- | ------------------------------------------------------- |
| `BETTER_AUTH_URL`                            | Local Better Auth URL; normally `http://localhost:3000` |
| `BETTER_AUTH_SECRET`                         | Private session-signing secret                          |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`   | Google OAuth credentials                                |
| `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET` | Discord OAuth credentials                               |
| `DATABASE_URL`                               | PostgreSQL connection string                            |
| `NEBULA_API_URL`                             | Nebula API base URL                                     |
| `NEBULA_API_STORAGE_BUCKET`                  | Storage bucket name                                     |
| `NEBULA_API_KEY`                             | Nebula API credential                                   |
| `NEBULA_API_STORAGE_KEY`                     | Storage credential                                      |
| `SENTRY_AUTH_TOKEN`                          | Optional Sentry build credential                        |
| `NEXT_PUBLIC_SENTRY_DSN`                     | Optional public Sentry DSN                              |

Never commit an environment file or paste real values into a pull request,
issue, log excerpt, screenshot, or documentation.

Start the development server with:

```bash
npm run dev
```

## Branches

Update `develop`, then create a focused feature branch:

```bash
git switch develop
git pull --ff-only
git switch -c feature/<short-name>
```

Use a different clear prefix for non-feature work when appropriate, such as
`fix/`, `docs/`, or `refactor/`. Never do feature work directly on `develop`.

Before running any command that publishes changes, check all three of these:

```bash
git status --short --branch
git branch --show-current
git remote -v
```

## Where code belongs

- Put only Next.js entrypoints and framework-required adapters in `src/app`.
- Put feature behavior in the owning directory under `src/systems`.
- Put truly reusable Notebook code in a specifically named `src/lib` area.
- Put authentication, database, storage, and procedures in `src/server`.
- Change `src/nebula-library` only when the behavior is shared across Nebula
  projects.

Read [Project structure](./project-structure.md) before adding a new top-level
directory. ESLint enforces the main import boundaries.

For structural changes, use `git mv` so history remains visible. Make moves in
small commits, update imports without reformatting unrelated files, and keep
behavioral or visual changes in separate commits. Use `git log --follow` or
`git blame -C -C` to verify important history after a move.

## Required checks

Run these before requesting review:

```bash
npm run lint:check
npm run format:check
npm run type:check
npm test
npm run build
```

Use the check-only lint and formatting scripts while reviewing a refactor;
`npm run lint` and `npm run format` modify files.

The current `npm test` wrapper uses POSIX environment-variable syntax. On
Windows, run it from Git Bash or WSL. A native PowerShell equivalent is:

```powershell
$env:NODE_OPTIONS='--experimental-vm-modules'
node .\node_modules\dotenv-cli\cli.js node .\node_modules\jest\bin\jest.js --detectOpenHandles --forceExit
```

If Jest reports that no tests were found, say so explicitly in the pull
request; do not represent an empty suite as passing coverage. Add focused tests
when changing behavior that can be exercised automatically.

Also inspect the final diff:

```bash
git diff --check
git diff --stat develop...HEAD
git status --short
```

Generated course data should be rebuilt with the matching scripts rather than
edited manually:

```bash
npm run fetchdata
npm run buildautocomplete
npm run buildcoursenames
npm run buildsections
```

## Commits and pull requests

Keep commits small, reviewable, and single-purpose. A useful commit message
states the outcome, for example `refactor: move search implementation into
system`.

Open the pull request against `develop`. Include:

- the issue and intended outcome;
- a concise summary of what changed;
- manual and automated verification results;
- screenshots for visible changes;
- migrations, environment changes, or deployment considerations;
- documentation that was added or updated;
- any use of AI assistance and what was independently reviewed.

Review generated output and AI-assisted changes exactly as you would
hand-written code. The contributor remains responsible for correctness,
security, licenses, and repository policy.

## Nebula Library submodule

`src/nebula-library` is a separate repository. Before changing it, verify its
status from the Notebook root:

```bash
git submodule status
git -C src/nebula-library status --short --branch
```

Create and review the library change in its own repository first. After that
change is accepted, update Notebook to the approved submodule commit and review
the pointer change. Do not mix unrelated Notebook and library changes, do not
force-update a shared branch, and do not accidentally commit a locally modified
or untracked submodule.

## Documentation and wiki

Stable developer documentation lives in `docs`. Update it in the same pull
request when architecture, ownership, setup, or workflow changes.

`.github/workflows/publish-wiki.yml` publishes `docs` after documentation is
merged to `develop`; the internal refactor migration map is excluded. The
GitHub wiki must be initialized once by creating its first page before that
workflow can publish. Never put secrets or private planning material in the
wiki.

## Security checklist

- Validate input again at the server boundary.
- Keep private environment variables out of client components.
- Preserve authentication and authorization checks when moving code.
- Treat uploaded files and external URLs as untrusted.
- Avoid logging tokens, connection strings, personal data, or file contents.
- Review database migrations and destructive operations separately.
- Ask a maintainer before introducing a new external service or credential.
