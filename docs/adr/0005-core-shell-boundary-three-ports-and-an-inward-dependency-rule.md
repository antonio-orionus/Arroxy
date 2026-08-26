# The core/shell boundary is three ports and an inward dependency rule

The download engine must be able to run headless in a container while the Electron
desktop app keeps working unchanged. The boundary that makes this possible is
smaller than it looks, and it is a *direction* rather than a layer.

**`core/` must never import `shell/`.** That single rule is the boundary. It is
enforced by an oxlint `no-restricted-imports` glob, not by convention, because
the desktop app will eventually be built from a bundle that must not contain the
server's auth code, login screen, or WebSocket client — a guarantee no runtime
branch can make.

**Only three concerns become ports:** logging, event push, and channel dispatch.
Each has a second implementation genuinely arriving with the server shell, and
each is already ambient in a way that makes the dependency invisible at the call
site. Everything else that looked like a port candidate was cut.

The reason is that the Electron coupling is far smaller than it appears.
`src/main/` is 10,377 LOC across 87 files, and only **11** import Electron at
value level. Seven of those eleven are native desktop capabilities — tray,
clipboard, dialogs, window management, the updater, the hidden-window token
provider. Those do not need an interface; they need to be on the other side of
the line. Most of the boundary work is therefore *moving code*, not abstracting
it, and the remaining injection points use constructor arguments, which is
already this codebase's idiom.

An earlier draft specified six ports on the symmetric-adapter model: one
interface per cross-cutting concern, one adapter file per port per shell, with a
lint rule enforcing the pairs. Applied against the real tree, four of those ports
had zero or one implementation and one was actively harmful.
`chooseFolder(): Promise<string | null>` *inverts* under a remote folder browser —
the server would have to push a request to a specific client and correlate a
reply, a control flow no sink shape expresses. Registering native handlers
directly from the Electron shell leaves that future feature as a new channel plus
a component, rather than as the unwinding of a wrong abstraction.

## Consequences

A port with one implementation is a defect here, not a placeholder. New ports are
added when the second implementation arrives, and the cut candidates are recorded
in `DUAL_DEPLOY_PLAN.md` §5 with what each one would have cost, so the question
does not get relitigated from scratch.

Two enforcement facts are counterintuitive enough to be worth stating, because
both fail silently. A restricted `tsconfig` does **not** block Electron —
`"types": []` suppresses only automatic `@types` inclusion, and an explicit
import still resolves through `electron.d.ts`. Blocking Electron is entirely the
lint rule's job, and only the lint rule catches `import type {BrowserWindow}`.
Separately, an oxlint `no-restricted-imports` pattern needs `**` to match nested
specifiers; `@shell/*` matches only single-segment paths, so a spot-check against
a shallow import will falsely validate a broken gate. Details and the measured
evidence live in `.agents/memory/typescript-and-oxlint-boundary-gates.md`.

Finally, the gates prove core does not *import* Electron. They do not prove core
does not *assume* it. `ytDlpJsRuntime.ts` passes every gate while unconditionally
returning `ELECTRON_RUN_AS_NODE: '1'` — meaningless in a container. Assumptions
of that shape have to be found by reading, not by tooling.
