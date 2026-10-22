# Triage labels

The `triage` skill and the other mattpocock/skills speak in canonical roles. This maps them to Arroxy's GitHub labels. An open issue carries exactly one kind label and one state label.

## Kind (the skill's category roles)

| Role | Label | Use for |
| --- | --- | --- |
| `bug` | `bug` | Something is broken |
| `enhancement` | `enhancement` | A new feature or an improvement |
| (Arroxy only) | `tests` | A missing or weak test |
| (Arroxy only) | `tech-debt` | Code health: refactors, typing, test infrastructure |
| (Arroxy only) | `i18n` | Translations and locale catalogs |
| (Arroxy only) | `documentation` | Docs and READMEs |

`bug`, `tests` and `tech-debt` issues name a `path/to/file.ts:123` location in code formatting.

## State

| Role | Label | Meaning |
| --- | --- | --- |
| `needs-triage` | `needs-triage` | The maintainer needs to evaluate it, or it misses a kind label or location |
| `needs-info` | `question` | Waiting on the reporter for more information |
| `ready-for-agent` | `ready-for-agent` | Clear enough for an agent to take without the maintainer |
| `ready-for-human` | `ready-for-human` | Needs the maintainer: a decision, a design call, an account or a native speaker |
| (Arroxy only) | `parked` | Real but on hold; the issue says why |
| `wontfix` | `wontfix` | Closed as not planned; a repeat of an open issue gets `duplicate` instead |

## Set by automation

The `issue-policy` workflow (`scripts/issuePolicy.ts`) checks issues filed by maintainers, and by agents on a maintainer's account: it adds `needs-triage` with one comment when an issue breaks a rule, and removes it once the issue is fixed. It leaves community issues alone, so those arrive unlabelled: they are the triage skill's "never triaged" bucket.
