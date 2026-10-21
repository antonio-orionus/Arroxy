# Changelog fragments

A PR with a user-facing change adds one file here instead of editing `CHANGELOG.md`, so open PRs never conflict over the changelog. A PR with nothing user-facing adds none.

## Writing one

Name it `<slug>.<kind>.md`: a kebab-case slug unique to the change (the branch name with `/` turned into `-`, such as `fix-explore-zoom`) and one of these kinds:

| Kind        | Goes under                          | Shape                                         |
| ----------- | ----------------------------------- | --------------------------------------------- |
| `highlight` | `## Highlights`                     | `**Bold lead-in.** One or two sentences.`     |
| `fix`       | `## Fixes`                          | One or two sentences.                         |
| `note`      | `## Good to know`                   | One or two sentences.                         |
| `intro`     | A paragraph right under `## X`      | One or two sentences, for news above it all.  |

The file holds one paragraph of plain Markdown: no heading, no bullet marker (assembly adds both). Say what the user sees, in the app's own UI words, with no internals and no exact sizes. Example, `explore-zoom.fix.md`:

```md
Explore remembers your zoom after a restart.
```

To change an entry before release, edit its fragment; a PR that reworks a feature not released yet edits that feature's fragment rather than adding another. A section that is already released is corrected in `CHANGELOG.md` itself.

## Releasing

`bun run changelog:assemble` (after the `package.json` bump) writes every fragment into `## <version>` at the top of `CHANGELOG.md`, kinds in the order above and each kind in the order its fragments merged, then deletes them. Read the section over and commit it with `release: <version>`.

`bun run check` fails on a malformed fragment, and on a hand-written unreleased section in `CHANGELOG.md`: a `## Unreleased` heading, or a section newer than the `package.json` version. `bun run release:stable` refuses to tag while a fragment is left over or the version's section is missing or empty.
