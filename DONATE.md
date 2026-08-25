# Supporting Arroxy

Arroxy is free software under the MIT License — no ads, no telemetry, no account,
no paid tier, and no usage limits. Donations are optional and buy no influence
over the roadmap; feature priority is decided in [public issues](../../issues).

## Free ways to help

These cost nothing, and they help more than a small donation does:

- **Star the repo** — it's how most people find Arroxy
- **Report bugs** with your OS version and `main.log`
- **Translate** — every locale drifts as features land
- **Tell someone** still using an ad-riddled online converter

---

## USDT (TRC-20)

<img src="build/donate-tron.png" alt="QR code for the Arroxy Tron donation address" width="180" align="right" />

Network: **Tron mainnet**. Cheapest option — a transfer costs about a dollar.
The same address also accepts TRX and other TRC-20 tokens.

```
TCigPD799TZmGuvZx5p1DcifGDL4ML7XKA
```

Pick the **Tron / TRC-20** network when you send. USDT sent as ERC-20 or BEP-20
will not arrive.

## Bitcoin

<img src="build/donate-btc.png" alt="QR code for the Arroxy Bitcoin donation address" width="180" align="right" />

Network: **Bitcoin mainnet**. Native SegWit (bech32, P2WPKH).

```
bc1qe9yt5tfxam76duht6zu4nlurhhrpt0u5gfxglu
```

Send only BTC on the Bitcoin network — "BTC" on BEP-20, or wrapped BTC on
Ethereum, will not arrive.

---

## Before you send

Crypto payments are irreversible. This file is the only official source for these
addresses: check anything you find elsewhere against it, and compare the whole
string rather than the first and last few characters.

Both addresses and their QR images are pinned in
[`scripts/check-donation-addresses.mjs`](scripts/check-donation-addresses.mjs),
which fails CI if either changes.

Thank you — people finding Arroxy useful is most of why it keeps getting worked on.
