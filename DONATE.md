# Supporting Arroxy

Arroxy is free software under the MIT License — no ads, no telemetry, no account,
no paid tier, and no usage limits. Donations are optional and buy no influence
over the roadmap; feature priority is decided in [public issues](../../issues).

If Arroxy has saved you time and you'd like to contribute, these are the only
addresses the project uses.

---

## Bitcoin

<img src="build/donate-btc.png" alt="QR code for the Arroxy Bitcoin donation address" width="180" align="right" />

Network: **Bitcoin mainnet**. Native SegWit (bech32, P2WPKH).

```
bc1qe9yt5tfxam76duht6zu4nlurhhrpt0u5gfxglu
```

Send only BTC on the Bitcoin network. "BTC" on other chains — BEP-20, or wrapped
BTC on Ethereum — will not arrive and cannot be recovered.

## Tron

<img src="build/donate-tron.png" alt="QR code for the Arroxy Tron donation address" width="180" align="right" />

Network: **Tron mainnet (TRC-20)**. Accepts TRX and TRC-20 tokens including USDT.

```
TCigPD799TZmGuvZx5p1DcifGDL4ML7XKA
```

If you're sending USDT, pick the **Tron / TRC-20** network. USDT sent as ERC-20
or BEP-20 to this address is unrecoverable.

---

## Before you send

Crypto payments are irreversible, and donation addresses are a known target for
substitution — usually via a fork, a lookalike site, or a message that reads as
official.

**This file is the only official source for these addresses.** Check anything
you find elsewhere against it, and compare the whole string rather than the
first and last few characters, since lookalike addresses are chosen to match at
both ends.

Arroxy will never message you an address, ask for a seed phrase or private key,
or run a token sale or airdrop. It has no token.

The addresses and QR images are pinned in
[`scripts/check-donation-addresses.mjs`](scripts/check-donation-addresses.mjs),
which fails CI if either changes. History: `git log -p -- DONATE.md`.

---

## Free ways to help

Worth more than a small donation, and they cost nothing:

- **Star the repo** — it's how most people find Arroxy
- **Report bugs** with your OS version and `main.log`
- **Translate** — Arroxy ships in 23 languages and they drift as features land
- **Tell someone** still using an ad-riddled online converter

Thank you — people finding Arroxy useful is most of why it keeps getting worked on.
