# Getting started

This guide takes you from a fresh clone to a working local copy of UTD
Notebook. If something fails along the way, the troubleshooting section covers
the most common causes.

## Contents

- [What you need](#what-you-need)
- [Clone the repository](#clone-the-repository)
- [Install dependencies](#install-dependencies)
- [Configure the environment](#configure-the-environment)
- [Run the app](#run-the-app)
- [Verify the setup](#verify-the-setup)
- [Common problems](#common-problems)

## What you need

Before you begin, make sure you have:

- Git
- Node.js 22 and its bundled npm version
- Access to the project credentials needed for local development
- Permission to use the development database and Nebula storage service

Check the tools that are already installed:

```bash
git --version
node --version
npm --version
```

## Clone the repository

Clone Notebook together with the Nebula Library submodule:

```bash
git clone https://github.com/UTDNebula/utd-notebook.git --recurse-submodules
cd utd-notebook
```

If you already have a clone and `src/nebula-library` is missing or empty, run:

```bash
git submodule update --init --recursive
```

The submodule should stay on the revision recorded by Notebook unless you are
working on a separate Nebula Library change.

## Install dependencies

For a clean setup, install the exact versions recorded in `package-lock.json`:

```bash
npm ci
```

Run the command again after switching to a branch that changes the lockfile.
Do not commit `node_modules`.

## Configure the environment

Create your local environment file from the example:

```bash
cp .env.example .env
```

The example lists every supported variable without including real secrets.
Ask a project lead for database, OAuth, and storage credentials through an
authorized channel.

| Variable                                     | What it is used for                          |
| -------------------------------------------- | -------------------------------------------- |
| `BETTER_AUTH_URL`                            | Better Auth URL for the local app            |
| `BETTER_AUTH_SECRET`                         | Private session signing secret               |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`   | Google OAuth                                 |
| `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET` | Discord OAuth                                |
| `DATABASE_URL`                               | PostgreSQL connection                        |
| `NEBULA_API_URL`                             | Nebula API base URL                          |
| `NEBULA_API_STORAGE_BUCKET`                  | Notebook storage bucket                      |
| `NEBULA_API_KEY`                             | Nebula API authentication                    |
| `NEBULA_API_STORAGE_KEY`                     | Nebula storage authentication                |
| `SENTRY_AUTH_TOKEN`                          | Optional Sentry build access                 |
| `NEXT_PUBLIC_SENTRY_DSN`                     | Optional browser error reporting destination |

For local development, `BETTER_AUTH_URL` is normally
`http://localhost:3000`. Generate a private Better Auth secret with:

```bash
openssl rand -hex 32
```

Do not commit `.env` or share its values in chat, issues, pull requests,
screenshots, or logs.

## Run the app

Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000`. Next.js will print the local URL and report each
request in the terminal.

## Verify the setup

Run the same check-only commands used during review:

```bash
npm run lint:check
npm run format:check
npm run type:check
npm run build
```

The current test script uses POSIX environment syntax. On Windows, run it from
Git Bash or WSL. You can also run Jest from PowerShell with:

```powershell
$env:NODE_OPTIONS='--experimental-vm-modules'
node .\node_modules\dotenv-cli\cli.js node .\node_modules\jest\bin\jest.js --detectOpenHandles --forceExit
```

If Jest says that no tests were found, report that result clearly. It does not
mean the project has automated coverage.

## Common problems

### ESLint is not recognized

This usually means `node_modules` is incomplete or `node_modules/.bin` is
missing. Recreate the dependency installation:

```bash
npm ci
```

### Environment validation fails

Compare `.env` with `.env.example` and make sure every required value is
present. Empty placeholders are not valid credentials.

### The Nebula Library is missing

Restore the recorded submodule revision:

```bash
git submodule update --init --recursive
```

### The page shows a hydration warning with unfamiliar attributes

Try the page in a private browser window with extensions disabled. Browser
extensions can add attributes before React loads, which makes the browser HTML
different from the server HTML.
