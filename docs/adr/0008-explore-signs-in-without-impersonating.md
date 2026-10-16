# Explore signs in without impersonating a browser

Explore is an in-app browser in its own session, and some downloads (private,
members-only, age-restricted, or behind a bot check) can only succeed with the
account that signed in there. Three choices shape how that works, and each had a
tempting alternative.

The first is the user agent. Google's sign-in gate does not check which engine
renders the page; it checks for deception. A user agent that claims Chrome,
Firefox or Safari while the client hints say otherwise is a detectable lie and
is rejected. Explore therefore takes Electron's default user agent, replaces the
Electron and app-name tokens with a bland `Desktop/1.0`, and leaves the platform
and Chromium version real so they agree with the client hints. That token
asserts nothing checkable, and Google's `GlifWebSignIn` flow accepts it.
Impersonating a real browser is brittle, because every mismatch is a new
rejection to chase, and dishonest, because the page is told something false. It
is also not naming Arroxy: that passes too, but identifies the downloader,
which makes it a blocklist target.

The second is when cookies are used. A signed-in session is not strictly
better: it sometimes receives fewer formats than an anonymous one, and it
exposes the account to more traffic than it needs. Downloads run signed out by
default. A job escalates to the Explore session only when a run fails in a way
an account can fix, and the cookies are read fresh from the session for that
one run into a short-lived file that is deleted afterwards. The alternative,
sending the account's cookies on every download, was rejected as both riskier
for the account and worse for quality.

The third is where the choice lives. Explore is one more cookie mode beside
off, cookies file and browser, so the selected mode is the single source of a
job's identity and a job never mixes two. Off stays a real opt-out even when
signed in to Explore, and the file and browser modes keep their on-every-run
behaviour and are never switched automatically.

## Consequences

The user agent rule is easy to break with a well-meaning edit: "fixing" the
token to look like Chrome, or overriding client hints to match it, reintroduces
the exact failure this decision avoids. A test pins the user agent to the
platform default with only those tokens replaced.

The token can be added to a blocklist in the future. There is no remote
override; the response is a user-set token or a release.

Because cookies are read only at escalation, signed-in sessions cost nothing for
users who never hit an account-gated video, and a stale sign-in surfaces as a
failed escalation rather than being silently reused.

An older build does not know the `explore` cookie mode, so running one after
choosing it resets general settings to defaults. This is accepted and documented
in the changelog; it only affects users who picked Explore.

The Explore sign-in is stored like any Chromium profile: plaintext cookies in
a file only the user's account can read, the same exposure as a yt-dlp
`cookies.txt`. Electron's cookie-encryption fuse was weighed and rejected for
now. It only protects copies of the profile, not code running as the user, and
on this distribution it costs more than it buys: the unsigned macOS build would
ask for Keychain access after every update, Linux without a keyring signs users
out, and a downgrade drops the cookies. Revisit if the macOS build is signed.
