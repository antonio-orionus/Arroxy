---
name: donation-rails-are-crypto-only
description: Donations are crypto-only because the maintainer resides in Ukraine; GitHub Sponsors, Ko-fi and Buy Me a Coffee cannot receive funds there.
metadata:
  type: project
---

`DONATE.md` lists Bitcoin and Tron addresses and nothing else. This is a
constraint, not an oversight — do not propose adding GitHub Sponsors, Ko-fi,
Buy Me a Coffee, or a generic "add a fiat option" suggestion.

The maintainer resides in Ukraine, which as of 2026-08-25 is **not** on GitHub's
list of supported regions for *receiving* sponsorship funds (anyone anywhere may
sponsor; only residents of supported regions may be paid). Verified against the
GitHub Sponsors supported-regions docs and community discussion #67578, where
the gap is still open after ~2 years of requests. In that thread Ko-fi is
reported non-functional for Ukraine, Buy Me a Coffee shut down operations there,
and Patreon is subscriptions-only. The documented fiscal-host route (Open Source
Collective and six others) is not confirmed to unblock unsupported regions, and
a host can only be chosen at Sponsors signup.

`.github/FUNDING.yml` therefore carries only a `custom:` link pointing at
`DONATE.md`. That is the correct configuration, not a placeholder. A `github:`
key would be an invalid entry — GitHub flags the file and renders no button —
and `gh api graphql { user { hasSponsorsListing } }` returns `false` for the
account.

**Why:** an agent reading `DONATE.md` cold sees crypto-only, reads it as an
unforced conversion mistake, and recommends the fiat option that is exactly
what sanction/payment-rail geography has removed.

**How to apply:** treat the crypto rail as fixed. Improvements to donation
conversion have to come from the page itself — ordering, friction, which asset
leads — not from adding a rail. See [[no-ai-attribution]] for the other standing
rule about what never goes into this repo's public-facing files.
