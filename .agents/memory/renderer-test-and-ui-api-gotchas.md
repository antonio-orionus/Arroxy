---
name: renderer-test-and-ui-api-gotchas
description: base-nova primitives take a `render` prop (never Radix's `asChild`), and @testing-library/user-event is not a dependency — use fireEvent.
metadata:
  type: project
---

Two APIs that plausible-looking code reaches for and this repo does not have. Both cost
time repeatedly during the playlist multi-profile work (2026-08), across separate tasks.

**`asChild` does not exist here.** `CLAUDE.md` says not to add Radix, but the trap is
subtler than adding a dependency: `asChild` is the Radix idiom for projecting a child as
the trigger, and writing it against a `base-nova` primitive fails. These components take a
**`render` prop** instead — see `TooltipTrigger` in `src/renderer/src/components/ui/tooltip.tsx`
and its existing use in `StepConfirm.tsx`. This also solves nested-interactive-element
problems: `render` projects the real `<Button>` as the trigger rather than wrapping it in a
second interactive element, which is what keeps a `<button>` from nesting inside a `<button>`.

**`@testing-library/user-event` is not a dependency.** Only `@testing-library/dom`,
`/jest-dom` and `/react` are installed. Renderer tests use `fireEvent`. Anything written
as `userEvent.click(...)` will not resolve.

**How to check rather than assume:** read `package.json` for the testing-library set, and
read the actual `src/renderer/src/components/ui/<primitive>.tsx` before assuming a prop
exists. Copying a prop name from another project's idiom is the failure mode both of these
share.

Related: [[loc-limits-are-architecture-signals]], [[finish-before-pr]].
