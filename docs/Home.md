# UTD Notebook developer wiki

UTD Notebook is a full-stack web application for sharing and finding course
notes. Students can search by course or professor, view PDF notes, save and
rate notes, upload their own notes, manage a profile, and report content.

This wiki is the source of truth for stable project documentation. Meeting
notes, proposals, and undecided ideas belong in the team's planning workspace;
accepted technical decisions belong here.

## Start here

- [Project architecture](./project-architecture.md) explains how requests,
  data, authentication, storage, and the main libraries fit together.
- [Project structure](./project-structure.md) explains where code belongs and
  how to find the implementation for a feature.
- [How to contribute](./how-to-contribute.md) covers setup, branches, checks,
  commits, pull requests, and repository safety.

## Architecture at a glance

```text
Browser
  |
  v
Next.js entrypoints in src/app
  |
  +--> feature implementations in src/systems
  |      |
  |      +--> reusable code in src/lib
  |      +--> typed procedures in src/server
  |
  +--> framework adapters and metadata

src/server
  +--> Better Auth
  +--> tRPC procedures
  +--> Drizzle ORM --> PostgreSQL / Neon
  +--> Nebula API storage

src/lib --> shared Nebula components in src/nebula-library
```

The main dependency direction is:

```text
app -> systems -> lib
 |       |
 +-------+----> server
```

`src/app` is intentionally thin. It defines routes and delegates application
behavior to the owning system. `src/systems` owns Notebook features. `src/lib`
contains reusable application infrastructure and shared primitives.

## Main systems

| System       | Owns                                                       |
| ------------ | ---------------------------------------------------------- |
| `account`    | Authentication screens, onboarding, settings, and profiles |
| `moderation` | Reports and administrative review screens                  |
| `notes`      | Note display, upload, edit, saving, rating, and note URLs  |
| `search`     | Search UI, autocomplete handlers, datasets, and generators |

## Quick local start

1. Clone with submodules or initialize `src/nebula-library` after cloning.
2. Install dependencies with `npm install`.
3. Obtain authorized development environment values from a project lead. Do
   not copy secrets into chat, screenshots, issues, or documentation.
4. Run `npm run dev` and open `http://localhost:3000`.

See [How to contribute](./how-to-contribute.md) for the complete setup and
verification workflow.
