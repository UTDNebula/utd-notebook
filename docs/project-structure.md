# Project structure

This page answers: "Where should I look, and where should new code go?"

## Source tree

```text
src/
|-- app/                 Next.js routes and framework entrypoints
|-- lib/                 Reusable Notebook infrastructure and primitives
|-- systems/             Feature-owned application code
|-- server/              Authentication, database, storage, and tRPC
|-- nebula-library/      Shared Nebula component-library submodule
|-- env.mjs              Environment validation
|-- instrumentation.ts   Server instrumentation
`-- instrumentation-client.ts
```

Use this decision sequence when placing a file:

```text
Does Next.js require this exact path?
  yes -> app/
  no
   |
Is it server-only infrastructure or a server procedure?
  yes -> server/
  no
   |
Is one major Notebook feature responsible for it?
  yes -> systems/<feature>/
  no
   |
Is it reusable Notebook infrastructure or a shared primitive?
  yes -> a specifically named area in lib/
  no
   |
Is it shared by multiple Nebula projects?
  yes -> nebula-library/ through its own repository workflow
```

Do not create a new generic catch-all directory to avoid making an ownership
decision.

## `src/app`: routing only

`app` defines the App Router contract. Most page and route files are one-line
re-exports of an implementation owned by a system.

```text
app/
|-- admin/                       Moderation entrypoints
|-- api/
|   |-- auth/[...all]/route.ts   Better Auth adapter
|   |-- autocomplete/route.ts    Search handler entrypoint
|   |-- courseNameAutocomplete/  Search handler entrypoint
|   |-- files/[id]/route.ts      Note PDF handler entrypoint
|   `-- trpc/[trpc]/route.ts     tRPC HTTP adapter
|-- auth/                        Account entrypoint
|-- get-started/                 Account onboarding entrypoint
|-- notes/                       Note page entrypoints
|-- profile/                     Account profile entrypoints
|-- report/                      Moderation entrypoint
|-- settings/                    Account entrypoint
|-- layout.tsx                   Root providers and metadata
|-- global-error.tsx             Next.js global error boundary
|-- sitemap.ts                   Dynamic sitemap
`-- manifest and icon files      Next.js metadata conventions
```

Framework-required adapters may contain framework wiring, but business logic
does not belong here. A page should normally delegate to a file under
`systems/<feature>/pages`.

## `src/systems`: feature ownership

Each system groups the UI and supporting code for one Notebook capability.
Systems may depend on `lib` and `server`. They must not import `app`.

### Account

```text
systems/account/
|-- components/
|   |-- getting-started/   Onboarding wizard
|   |-- profile/           Profile note lists
|   `-- settings/          Account settings forms
|-- data/utdDegrees.ts     Major and minor choices
`-- pages/                 Auth, onboarding, settings, and profile screens
```

Start here for sign-in screens, first-time user setup, profile presentation,
or account settings.

### Moderation

```text
systems/moderation/
|-- components/            Report form and admin header
`-- pages/                 Report and admin screens
```

Server procedures for reports remain in `server/api/routers`; this system owns
the user-facing workflows.

### Notes

```text
systems/notes/
|-- api/file.ts            Validated PDF delivery handler
|-- components/            Cards, grids, note details, ratings, and actions
|-- forms/                 Create and edit note forms
|-- hooks/                 Browser upload behavior
|-- pages/                 Note list, detail, create, and edit screens
`-- utils/noteSlug.ts      Note-route parsing and display text
```

Start here for note cards, PDFs, uploads, editing, saving, ratings, and note
page behavior.

### Search

```text
systems/search/
|-- api/                    Autocomplete request handlers
|-- components/             Search bar and search-aware header composition
|-- data/                   Generated autocomplete datasets
|-- pages/HomePage.tsx      Search-oriented home screen
|-- scripts/                Dataset fetch and generation scripts
`-- utils/                  Search query and graph logic
```

`scripts` write generated files back into the system. The shared section list
is the exception: it lives in `lib/sections` because the server also consumes
it.

## `src/lib`: reusable application code

`lib` is reusable within Notebook. It must not import `app` or `systems`.
Choose a named area rather than dropping unrelated code into `lib/utils`.

```text
lib/
|-- components/
|   |-- form/              TanStack Form controls and registration
|   `-- shared controls    Back button, breadcrumbs, confirmation, empty state
|-- icons/                 Notebook and authentication icons
|-- modules/
|   |-- navigation/        Header shell, profile menu, and sidebar
|   |-- registerModal/     Shared sign-in prompt flow
|   `-- snackbar/          Application notifications
|-- note-files/            Shared note-file identifiers, limits, and URLs
|-- schemas/               Account, moderation, and note validation
|-- sections/              Shared section types, normalization, and data
|-- styles/                Global CSS and shared visual constants
|-- trpc/                  React/server tRPC adapters and query client
|-- types/                 Shared transport types
`-- utils/                 Small feature-independent helpers
```

Some library files use server types or tRPC router types to maintain a typed
client/server contract. They still may not reach upward into feature systems.

## `src/server`: centralized backend

```text
server/
|-- api/
|   |-- routers/           File, report, saved-note, section, storage, and user
|   |-- root.ts            Application router composition
|   `-- trpc.ts            Context, serialization, auth, and procedures
|-- db/
|   |-- migrations/        Ordered SQL migrations and Drizzle metadata
|   |-- schema/            Database tables, enums, and relations
|   |-- index.ts           Neon/Drizzle connection
|   `-- models.ts          Runtime schemas and inferred model types
|-- auth.ts                Better Auth configuration
`-- storage.ts             Nebula API storage transport
```

The backend remains centralized. Do not move server code into feature systems
without a deliberate decision to adopt full vertical slices.

## `src/nebula-library`: nested repository

`nebula-library` is a Git submodule shared across Nebula applications. Import
it with `@nebula-library/*`, not `@src/nebula-library/*`. Changes inside it have
their own branch, commit, and pull-request lifecycle; updating Notebook then
records the resulting submodule commit.

## Import boundaries

ESLint enforces these rules:

- legacy roots such as `@src/components`, `@src/utils`, and `@src/data` may not
  be reintroduced;
- code outside `app` may not import route entrypoints;
- `lib` and `server` may not import a feature system;
- the shared submodule uses the `@nebula-library/*` alias.

If an import rule seems inconvenient, first reconsider ownership. Do not work
around it with a long relative path.
