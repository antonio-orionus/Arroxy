# One Control API for outside callers

Status: accepted, 2026-10-21. The architecture plan, the phone remote-control plan
and their research are maintainer-only.

Several callers that are not the Arroxy window are planned: a phone, local AI
agents, a command line, `arroxy://` links, and later the server mode. Built one
at a time, each would grow its own parser, its own feed of queue events, its own
list of allowed callers and its own rules. Instead, every one of them reaches the
app through one **Control API**, and each kind of caller is only an **entry
point** in front of it.

**A second, public API beside the renderer's private one.** The renderer's IPC
stays what it is: full trust, built from the same commit as the app, free to
change in any release, and allowed to open dialogs. The Control API is the
opposite on every axis: small, versioned (additive within a major, majors
negotiated on connect), never interactive, scoped per client, and shaped as
public projections rather than internal types. Clients ship apart from the app
(the phone's web app deploys from `main` while desktops update later), so one
API cannot serve both without either freezing the renderer's or breaking the
clients'. A question the app would ask in the window becomes state the client
reads and answers instead, such as a row that needs your choice.

**Intake runs in the main process before any outside caller ships.** Taking in a
link (URL intent, placeholder row, probe, profile, prepared rows, and the choices
and retries of unresolved rows) moves out of the renderer first, and the Download
button, Explore and the global hotkey use it there too. The renderer is a poor
host for callers that do not need the window: its queue copy stops updating
while the window is hidden, its state is lost on reload, and on macOS there may
be no window at all. The server shell then gets the same intake with no second
implementation and no new port (ADR 0005).

**Entry points carry Control API messages and nothing else.** An entry point
authenticates, frames and forwards; none contains a verb. The phone relay, the
local socket and the later server HTTP carry the same messages. MCP is not one of
them: a separate MIT bridge package speaks MCP to agents and the Control API to
the app, so the app needs no MCP SDK, MCP revisions ship as bridge releases, and
the bridge can answer while Arroxy is closed. The local socket is a Unix socket
or named pipe, never a local HTTP port, which no browser page can reach. An
`arroxy://` link has no identity at all: it only fills the URL field, with
Undo, and queues nothing.

**The schemas are an MIT package.** Requests, results, events and errors live
in their own MIT workspace package, kept in this repo and never published, so
the phone app, the bridge and the GPL app share one contract without GPL code
crossing into MIT code. A change to the public contract is a reviewed change to
that package, not a package release.

**The desktop may authenticate its own clients.** The maintainer's dual-deploy
plan keeps the desktop local-only (it never becomes a client of a remote engine,
and ships no auth code); this amends the second half. Pairing a phone and issuing
a secret to each local client the user allows are device authorisation, not a
login system, and they ship in the desktop. The server's user accounts, login
screen and sessions still stay out of the desktop bundle, as ADR 0005's import
rule guarantees. Phones reach the desktop through a relay we run that forwards
end-to-end encrypted frames it cannot read; the phone app is a web app, not a
store app.

**Processes running as the same OS user are inside the trust boundary.** They can
read a client's secret, but they can also edit Arroxy's settings or run yt-dlp
themselves, so no gate inside one user account would hold. The gates exist to
keep out other OS users, web pages, and programs the user never allowed. No
client ever supplies a path, a yt-dlp option or file contents.

## Consequences

Every feature that reaches Arroxy from outside is an entry point plus, at most,
new Control API requests; a feature that wants its own route into the queue is
the thing this decision rules out. Every outside entry point sits behind its own
release flag until it ships.
