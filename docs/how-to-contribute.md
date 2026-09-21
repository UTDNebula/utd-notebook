# How to contribute

This guide picks up after you have the app running locally. If you still need
to set up the project, start with [Getting started](./getting-started.md).

The project uses `develop` as its integration branch. Most contributions begin
with a GitHub issue and end with a focused pull request into `develop`.

## Contents

- [Before you start](#before-you-start)
- [Create a branch](#create-a-branch)
- [Find the right home for a change](#find-the-right-home-for-a-change)
- [Keep the change reviewable](#keep-the-change-reviewable)
- [Run the required checks](#run-the-required-checks)
- [Prepare the pull request](#prepare-the-pull-request)
- [Work with the Nebula Library](#work-with-the-nebula-library)
- [Update documentation](#update-documentation)
- [Review security](#review-security)

## Before you start

Find an existing issue or create one that explains the problem. Ask to be
assigned before starting a larger change so two people do not solve the same
thing in parallel.

Take a moment to decide whether the work belongs in Notebook, the Nebula
Library submodule, or both. If the change affects more than one repository,
plan separate pull requests.

## Create a branch

Start from an up-to-date copy of `develop`:

```bash
git switch develop
git pull --ff-only
git switch -c feature/<short-name>
```

Choose a prefix that matches the work. Common examples are `feature/`, `fix/`,
`docs/`, and `refactor/`. Do not make feature changes directly on `develop`.

Before publishing anything, confirm the current branch and remote:

```bash
git status --short --branch
git branch --show-current
git remote -v
```

## Find the right home for a change

The quickest rule is to put behavior next to the feature that owns it:

- Next.js route entrypoints and framework files belong in `src/app`.
- Account, moderation, note, and search behavior belong in `src/systems`.
- Code shared across Notebook belongs in a clearly named area of `src/lib`.
- Authentication, database, storage, and server procedures belong in
  `src/server`.
- Components shared by more than one Nebula project belong in
  `src/nebula-library`.

[Project structure](./project-structure.md) has examples for each area. ESLint
checks the main dependency boundaries.

## Keep the change reviewable

A reviewer should be able to understand one commit without sorting through an
unrelated cleanup. Keep formatting, file moves, and behavior changes separate
when possible.

Use `git mv` for structural work so Git can follow the old file history. After
a large move, check an important file with:

```bash
git log --follow -- path/to/file
git blame -C -C path/to/file
```

Avoid running a repository-wide formatter during a focused change. Format the
files you touched, then use the check-only commands before review.

## Run the required checks

Run these commands from the Notebook root:

```bash
npm run lint:check
npm run format:check
npm run type:check
npm test
npm run build
```

`npm run lint` and `npm run format` modify files. Use the check variants when
you only want to validate the branch.

The current test script uses POSIX environment syntax. On Windows, use Git Bash
or WSL. A PowerShell equivalent is available in
[Getting started](./getting-started.md#verify-the-setup).

If Jest reports that it found no tests, include that exact result in the pull
request. Do not describe an empty test suite as passing coverage.

Before opening the pull request, inspect the final diff:

```bash
git diff --check
git diff --stat develop...HEAD
git status --short
```

Generated course data should come from the project scripts rather than manual
JSON edits:

```bash
npm run fetchdata
npm run buildautocomplete
npm run buildcoursenames
npm run buildsections
```

## Prepare the pull request

Use small commits with messages that describe the result. For example:

```text
refactor: move search implementation into system
```

Open the pull request against `develop` and include:

- The issue and expected outcome
- A short explanation of the implementation
- Automated and manual test results
- Screenshots for visible changes
- Database, environment, or deployment considerations
- Documentation updates
- An AI disclosure that explains what was generated and what you reviewed

AI-assisted work should receive the same review as hand-written work. The
contributor is still responsible for correctness, security, licenses, and
project policy.

## Work with the Nebula Library

`src/nebula-library` is a separate Git repository. Check both repositories
before making a library change:

```bash
git submodule status
git -C src/nebula-library status --short --branch
```

Create the library change on its own branch and send it through the Nebula
Library review process. Once that work is approved, update Notebook to the
accepted submodule commit and review the pointer change.

Do not mix unrelated Notebook and library changes. Avoid force-updating a
shared branch, and check that the submodule does not contain accidental local
changes before committing the Notebook pointer.

## Update documentation

Developer documentation lives in `docs`. Update the relevant page whenever a
change affects setup, architecture, code ownership, or the contribution
process.

The wiki workflow publishes `docs` after documentation reaches `develop`. The
GitHub wiki needs an initial page before the first publishing run. Keep private
planning notes and credentials out of the wiki.

## Review security

Before requesting review, ask these questions:

- Is untrusted input validated again on the server
- Are private environment values kept out of client components
- Are authentication and authorization checks still enforced
- Are uploaded files and external URLs treated as untrusted
- Could a log expose tokens, connection strings, personal data, or file content
- Does a database migration include a destructive operation
- Does a new service require a credential or a maintainer decision

If any answer is unclear, call it out in the pull request and ask for a focused
review.
