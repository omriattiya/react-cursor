---
name: publish-npm-release
description: Publishes a new pnpm package version to the npm registry and creates a GitHub Release whose notes summarize all changes since the last release. Use when the user asks to publish, release, bump the version, ship to npm, or create a GitHub release.
---

# Publish npm release

Ship `@omriattiya/react-cursor` (name from `package.json`) to npm, then open a GitHub Release whose body is a **summarized changelog of every change since the last release**.

Always ask the user for the bump type (`patch` / `minor` / `major`) before changing version. Do not infer it.

## Preconditions (stop if any fail)

1. Working tree clean (`git status`). Uncommitted or unstaged files → stop.
2. On default branch (`master` or `main`) and up to date with `origin`.
3. npm auth — follow **npm login** below. Do not continue until `npm whoami` succeeds.
4. `pnpm test` and `pnpm typecheck` pass.
5. Last git tag exists (`git describe --tags --abbrev=0`). If none, changelog range is the full history.

Do not `--force`, `--no-verify`, or skip hooks. Do not publish from a dirty tree or a non-default branch.

## npm login

Check first:

```bash
npm whoami
```

If it prints a username, auth is fine. If it 401s (or any auth error), **start login immediately** — do not only tell the user to run it themselves:

```bash
pnpm login --registry https://registry.npmjs.org/
```

`pnpm login` uses the web flow. In a non-TTY agent shell it prints an `https://www.npmjs.com/login?...` URL and polls until the browser session finishes.

Then tell the user, verbatim:

1. Open the URL printed by `pnpm login` (or the QR code if shown).
2. Sign in at npmjs.com with the account that owns `@omriattiya` (or has publish rights).
3. Complete 2FA / security key if prompted.
4. Wait until the terminal says login succeeded.

Do not type the user's password, OTP, or token into the command. Do not write tokens into the repo or commit `.npmrc`.

After the login command exits 0, re-run `npm whoami`. If it still fails:

- Ask the user to run `pnpm login --registry https://registry.npmjs.org/` in **their** terminal (agent TTY may not open a browser), then retry `npm whoami`.
- Fallback: `npm login --auth-type=web --registry https://registry.npmjs.org/`.
- If they use a granular token instead: they paste it into user-level `~/.npmrc` as `//registry.npmjs.org/:_authToken=<token>` (never the project `.npmrc`). Then `npm whoami` again.

Only proceed with the release after `npm whoami` succeeds. If publish later asks for OTP, ask the user for the code and retry with `--otp <code>`. Do not invent an OTP.

## Workflow

Copy and track:

```
Release:
- [ ] Bump type confirmed (patch | minor | major)
- [ ] Changelog drafted from commits since last tag
- [ ] Tests + typecheck passed
- [ ] pnpm version
- [ ] pnpm publish --access public
- [ ] git push --follow-tags
- [ ] GitHub Release created
```

### 1. Confirm bump

Ask with options **patch**, **minor**, **major**. Compute the next version from `package.json` `version` and show it (e.g. `0.5.0` + minor → `0.6.0`). Wait for the answer.

### 2. Draft changelog

Last tag (example `v0.5.0`):

```bash
git describe --tags --abbrev=0
git log <last-tag>..HEAD --pretty=format:"%s" --no-merges
```

Summarize those commits into **user-facing GitHub Release notes**. Do not paste a raw commit dump.

- Collapse noisy/repeated subjects into one bullet.
- Drop version-bump-only commits (`0.5.0`, `Bump version to …`).
- Group when useful: Features, Fixes, Docs / playground, Internal.
- Each bullet is one short summary of what changed for consumers.
- End with a compare link:

```markdown
## What's changed

### Features
- …

### Fixes
- …

**Full Changelog**: https://github.com/omriattiya/react-cursor/compare/<last-tag>...v<new-version>
```

Omit empty groups. If there are no commits since the last tag, **stop** — nothing to release.

Show the notes + new version to the user, then continue (they already chose the bump).

### 3. Bump, publish, tag

Scoped package must be public:

```bash
pnpm version <patch|minor|major>
pnpm publish --access public
git push --follow-tags
```

- `prepublishOnly` already runs `pnpm build`. Do not publish if build/publish fails.
- If npm asks for 2FA OTP, ask the user for the code and retry with `--otp <code>`. Do not invent an OTP.
- If `pnpm version` already committed/tagged but publish fails: do **not** push tags. Fix auth/build, retry `pnpm publish --access public`.
- If publish succeeds but push/release fails: package is live — still push tags and create the GitHub Release.

### 4. GitHub Release

Prefer GitHub CLI:

```bash
gh release create v<new-version> --title v<new-version> --notes-file <temp-notes.md>
```

Write notes to a temp markdown file (no bash heredoc on Windows PowerShell). Delete the file after.

If `gh` is missing, use GitHub MCP to create the release with the same tag, title, and body. If neither works, leave the notes in the reply so the user can paste them on GitHub.

Do not mark the release as prerelease unless the user asked.

## Notes

- Tags in this repo are `vX.Y.Z` (`pnpm version` default).
- Version commit message is the bare version (`0.6.0`) — leave `pnpm version` defaults.
- Only `dist` is published (`files` in `package.json`). Playground is not.
- Never amend a version commit that was already pushed.
- Never publish an already-published version; bump again instead.
