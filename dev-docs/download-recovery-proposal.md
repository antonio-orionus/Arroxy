# Probe and download recovery proposal

Status: draft for discussion, 2026-10-19. This records investigation and a proposed direction; it does not authorize implementation or change the existing account policy.

## Goal

Make it possible to answer, for every probe and job: which identity was used, which extraction strategy was used, what failed or remained incomplete, what recovery was attempted, and why recovery stopped. Use Explore where it can help while preserving playlist pagination, explicit cookie preferences, cancellation, and saved media.

The default should work without configuring yt-dlp internals. Advanced controls should express the user's intent about account use and waiting, rather than expose arbitrary client lists or token strings.

## Verified findings

### The installed token path is broken

Arroxy 0.6.2 emits a token/visitor-data YouTube extractor block followed by a separate player-client block. The installed yt-dlp `2026.10.10.233141` replaces the first dictionary with the second. Both token and visitor data disappear. This was reproduced offline using the actual managed macOS executable and a temporary extractor that reported its parsed configuration; a single combined block retained all three options.

This explains the missing-Visitor-Data warning. It does not prove that correcting the arguments will remove YouTube's HTTP 429 or improve every video's formats.

The existing unit test explicitly expects both separate blocks. Fixture E2E runs real yt-dlp but replaces YouTube extraction with a fixture that does not inspect token options. The smoke report infers `poToken` from its presence anywhere in argv, so it also misses replacement. These are three checks sharing the same false assumption.

### The historical probe exception is deliberate

- `fc25de1d` (2026-05-23, release 0.3.6) disabled tokens on all probes after manually supplied visitor data stopped playlist pagination at 100 entries.
- `72daa21f` (2026-06-14) restored the token ladder only for explicit single-video probes. Automatic/playlist probes remain excluded.
- Bulk collection expansion uses playlist mode; per-video bulk metadata hydration uses video mode. Bulk input is not itself an extraction strategy.
- Explore-signed-in runs exclude the anonymous token independently of probe mode.

See [historical changelog](../CHANGELOG.md), [YtDlp](../src/main/services/YtDlp.ts), [bulk expansion](../src/renderer/src/store/wizard/bulkCollectionExpansion.ts), and [per-video hydration](../src/renderer/src/store/wizard/bulkMetadataHydration.ts).

### Explore is already used, but only through narrow recovery rules

| Operation | Current Explore behavior |
| --- | --- |
| Single-video probe | Escalates eligible hard failures; degraded success does not escalate |
| Playlist enumeration | Can escalate account-only/private/missing playlists and bot checks; bot-check escalation does not make all children signed in |
| Media download | Can escalate eligible failures after existing anonymous recovery; re-extracts instead of replaying anonymous metadata |
| Subtitle-only job | Can escalate eligible failures |
| Subtitles after saved media | Inherits job auth and handles rejected cookies; never newly escalates; failure remains soft |
| Title backfill | Explicitly opts out of escalation |

Eligibility also requires Explore cookie mode, Explore enabled, a supported site, and authentication cookies. Selecting file/browser cookies does not silently switch to Explore. Once a job escalates, its auth persists across later phases and restart. A lost session does not silently become anonymous.

Signed-in spawns are paced: at most two concurrent, at least five seconds between starts, and a six-spawn cap per job attempt. Probes without a job key get a temporary budget per `YtDlp.run`, not one budget covering the whole logical probe.

Sources: [composition](../src/main/index.ts), [escalation matcher](../src/main/services/exploreEscalation.ts), [gate](../src/main/services/exploreGate.ts), [signed-in phase flow](../src/main/services/phases/signedInFlow.ts), [spawn gate](../src/main/services/exploreSpawnGate.ts), and [accepted account policy](in-app-browser-spec.md).

### Recovery and interpretation are fragmented

| Owner | Current decision |
| --- | --- |
| `YtDlp.invokeWithRetry` | Token, re-mint, then no-token strategy; progresses only on nonzero `botBlock`; token-provider failure skips to no-token |
| `ProbeService` | One timeout retry; one additional retry for selected warning patterns; retains initial usable result if retry fails, otherwise compares format counts |
| `ProbeService` / signed-in phase flow | Account escalation and rejected-cookie verification |
| `VideoPhase` | Cached-info replay recovery, anonymous token-session reset for transport failure, and cookieless quality recovery |
| yt-dlp process | Transport/fragment retries configured by the bridge |
| Queue automatic retry | Retries network, chunk-transfer, postprocess, and rate-limit failures if enabled; 30/60/120/300-second backoff |

The probe timeout is currently per invocation (180 seconds by default), not one end-to-end deadline. Recovery layers can multiply work. There is no shared rate-limit cooldown coordinating probes and queued jobs for the same site/route.

An explicit player-client list also changes what the final ladder step means: it preserves that list and removes the token, rather than choosing the generic alternative clients. With the argument-overwrite bug, the first and re-minted steps can already be effectively tokenless, making nominally different attempts equivalent. Additionally, cached-info transport recovery checks the site/error but not the active identity before resetting the anonymous token session; that work cannot change an Explore-signed-in run, which deliberately does not use the anonymous token.

Signals also lose meaning:

- Probe warnings collapse to `botWall` or `extractor`. HTTP 429 and an account-resolvable bot check therefore share a UI category.
- Missing Visitor Data is not itself one of the probe degradation patterns; the latest result was marked degraded because of webpage failure/429.
- Low-level failures classify the whole stderr blob; probes subsequently classify the selected raw error again. Warning and terminal-error precedence can therefore differ by caller.
- UI account guidance treats all `unavailable` failures as potentially needing cookies, while main only escalates private/members-only variants. Removed content can receive overly broad guidance.
- A logged `pot` strategy or a token present in argv proves intention, not successful parsing or token acceptance by YouTube.
- The existing quality-limit detector deliberately targets severe video degradation below both the requested cap and 720p, with a withheld-format signal. It is not a general measure of metadata completeness or every profile mismatch.

Sources: [probe](../src/main/services/ProbeService.ts), [video phase](../src/main/services/phases/VideoPhase.ts), [automatic retry](../src/shared/autoRetry.ts), [format-limit signals](../src/main/services/download/formatLimitSignals.ts), [UI guidance](../src/renderer/src/store/wizard/probeErrorExperience.ts), [smoke report](../src/main/downloadSmokeReport.ts).

## Recommended approach

A local argument fix alone repairs a real defect but leaves policy fragmentation. Adding more retries independently would amplify it. Recommend a staged consolidation into one app-owned recovery policy, retaining the existing process, queue, session, and filesystem adapters.

The policy receives the operation, requested result, resolved identity, session capability, attempt history, and normalized outcome. It returns one next action or a terminal outcome with a reason. The process adapter executes exactly one planned invocation. Existing phases retain media/subtitle ownership, and the queue retains delayed retry scheduling; neither invents another hidden extraction ladder.

Separate three facts:

1. **Execution outcome:** success, soft failure with a usable result, hard failure, or cancellation.
2. **Evidence:** rate limit, account requirement, bot check, missing token context, extractor/JS failure, withheld formats, transport failure, rejected cookies, or unknown. Preserve multiple observations and their source; identify the terminal cause separately.
3. **Recovery decision:** continue, refresh token, change client strategy, use Explore, re-extract cached metadata, verify session, defer, or stop.

Keep these app-owned initially. Reuse `ytdlp-errors` classification; do not put a separately published package redesign on the critical path. New app enums belong in `schemas.ts`. Update the glossary only when the new terms are agreed.

### Proposed policy matrix

| Evidence and usable result | Proposed automatic behavior |
| --- | --- |
| Requested result available, incidental client warning | Keep it; retain diagnostics; no retry just to remove warnings |
| Explicit account requirement, including structured metadata on an otherwise successful probe | Use Explore once if permitted; an exit-code-zero result must not hide an account requirement |
| Explicit bot check after anonymous strategies are exhausted | One Explore escalation if permitted and no rate-limit evidence requires a cooldown |
| HTTP 429 / rate-limit signal, usable result present | Keep usable result, mark uncertainty precisely, stop immediate extraction retries, apply shared cooldown to new matching work |
| HTTP 429 / rate-limit signal, no usable result | Defer under the configured automatic-retry policy or wait for user action; do not switch identity as an automatic response to throttling |
| Missing token/visitor context or JS extraction failure | One targeted recovery only if it can change the failing condition; expose local configuration defects distinctly |
| Withheld formats and requested result unavailable | Bounded alternative extraction strategy; retain best usable candidate. Offer explicit Explore use when appropriate, without claiming sign-in guarantees higher quality |
| Cached media URLs fail before transfer | One fresh extraction; anonymous identity reset only when that identity is actually in use and transport evidence supports it |
| Explore cookies rejected | Verify once; refresh jar once if still signed in; otherwise require sign-in. Preserve saved media |
| Transport interruption during media transfer | Bounded transfer retry/resume; no format or identity change that splices incompatible partial files |
| Removed / DRM / geo / output / disk failure | Specific explanation and remedy; no authentication ladder for an unrelated failure |
| Subtitle failure after media success | Keep media and report a soft failure; any future subtitle-only retry must not redownload media |

Rate limiting and account use are separate dimensions. Upstream documents that limits may apply to a guest session or an account; it does not establish that every 429 is an IP block or that changing accounts will solve it. Keep the existing conservative automatic policy rather than making an unsupported universal claim.

### Strategy invariants

- Playlist/automatic enumeration never receives manually injected anonymous visitor data or PO tokens. Signed-in enumeration may use its normal cookies.
- Single-video inspection and media extraction share the same owned YouTube option assembly. Serialize one block per extractor key and verify the effective parsed values with real yt-dlp.
- Explore runs never receive the anonymous PO token. File/browser-cookie runs require explicit compatibility evaluation; their identity must not be mislabeled anonymous merely because job auth has not escalated.
- Cache reuse requires compatible resolved identity and extraction context. Changing identity requires fresh extraction and deliberate handling of partial output.
- Every action is recorded with a reason and consumes a shared operation budget. A refresh or alternative strategy cannot recursively restart the ladder.
- Preserve live revocation: sign-out, disabling Explore, pause, and cancel are rechecked before waiting work spawns.
- Preserve the best usable candidate by requested media/audio/subtitle requirements, not simply the number of formats.
- Unknown warnings remain evidence, not invented hard failures or automatic account-use triggers.

Proposed initial budget: at most six app-level process launches per logical probe or job attempt, including freshness and fallback launches; a probe's existing 180-second timeout becomes an end-to-end deadline. Signed-in pacing remains two concurrent/five-second spacing, within the same budget. Queue automatic retries remain separate, user-configured attempts with an explicit delay and shared cooldown. These are proposed defaults to validate against the scenario matrix, not measurements of today's limits. Child-process HTTP/fragment retries are a different budget and must be visible and bounded separately; media transfer is not cut off at the probe deadline.

### Token strategy requires a controlled comparison

Correct option assembly changes real behavior because tokens that were previously discarded will become effective. Before choosing token-first versus token-on-demand, compare a small set of anonymous single-video probes with (a) yt-dlp defaults, (b) current explicit clients without a token, and (c) correctly combined token/client options. Record usable formats, requested-quality fit, warnings, elapsed time, and number of requests/attempts where observable. Stop the comparison on a rate-limit response rather than adding load.

Do not infer token usefulness from earlier `poToken: true` smoke reports. Do not include real signed-in tests in CI. Account-bound token minting is outside this first change; revisit only if measurements show an actual signed-in deficiency.

## User-facing controls and explanation

Initially add **Use Explore for this job** to Interactive Download and the appropriate quick-download action. It is an explicit identity choice, used from the first probe and retained through download; if sign-in is unavailable, ask the user to sign in instead of silently running anonymously. A plain Retry keeps the current policy.

After the unified policy and tests land, offer an advanced **Explore account use** preference, applicable only when Explore is the selected cookie source:

- **When needed (recommended):** anonymous first, bounded account escalation for the documented conditions.
- **From the start:** use the signed-in Explore session for probes and downloads on supported sites. Applies consistently to bulk items; stays paced; no anonymous token and no silent anonymous fallback.
- **Never:** an explicit signed-out mode; no account escalation. File/browser cookie sources remain separately selected and are never silently overridden by an Explore preference.

Keep existing pacing and automatic-retry controls, but explain their scope. Avoid user-editable ladder order, raw client lists, manual visitor data, or arbitrary token text. Those would expose implementation details and create many untested combinations.

Add a compact **Attempt details** view shared by probe results and queue items. Show actual identity, planned strategy, result/limitation, elapsed time, next action, and stopping reason. Distinguish “token supplied” from “token accepted”; normal production logs cannot prove the latter. Include a redacted correlation ID in diagnostics. Do not log cookies or token contents.

For the latest incident, the useful summary would be: “Formats available up to 1080p. YouTube rate-limited part of the metadata request. This probe ran signed out; Explore was not used because the result was usable and the signal was a rate limit.” Keep the token-configuration defect in diagnostic details.

## Delivery plan and verification

1. **Repair argument assembly and its diagnostics as a small standalone fix.** Own final extractor-option composition in the app; correct the smoke summary. Add the regression before implementation. Avoid package publication unless the app fix genuinely requires a changed bridge contract. → verify: the actual yt-dlp parser retains token, visitor data, and client settings together; playlist and Explore cases omit anonymous token context; redaction still hides values. Perform the bounded anonymous comparison before rollout.

2. **Define the outcome/decision contract and characterize existing behavior.** Add app-owned signal normalization, operation identity, attempt history, and the policy table. Carry precise causes to UI guidance; add clear cooldown/stop reasons. → verify: transcript cases for warning-only 429, fatal 429, bot check, private versus removed content, successful response with account metadata, token context loss, JS failure, and unknown warnings; mixed stderr cannot change the primary cause merely by moving a warning earlier.

3. **Move probes onto the shared policy first.** Replace identical degraded retries with targeted actions; introduce one deadline and budget; preserve a usable result when recovery fails. Account use is based on the explicit policy and evidence, including exit-zero cases. → verify: fixture E2E covers wizard and background quick probes, bulk per-video hydration, playlist expansion beyond 100 entries, cancellation while waiting, and no spawns after budget/deadline exhaustion. Real-parser assertions cover every relevant operation/identity combination.

4. **Move media and subtitles onto the same decisions.** Replace nested extraction recovery while preserving queue automatic retry, resume handling, sticky auth, cookie verification, and subtitle soft failure. Coordinate rate-limit cooldown across new probes/jobs on the same site and configured network route. → verify: fixture E2E covers escalation with per-request identity evidence, restart after escalation, cached-URL failure, rejected cookies, partial transfer, quality recovery, rate-limit bursts, and subtitles failing after saved media. Account switches must never reuse incompatible cached metadata or splice partial files.

5. **Add explicit account controls and attempt details.** Implement the per-job action first; add the persistent advanced preference only after the same policy has passed all operation cases. Drive available actions from main's decision rather than reclassifying errors in the renderer. → verify: Scenario Workbench for layouts, focused renderer tests for controls, fixture E2E for actual identity selection and settings changes while a job waits. Translate once the copy and flow are approved, using the project translation workflow.

6. **Validate and document the shipped behavior.** Replace conflicting policy descriptions in the workflow map, account spec, smoke guide, and glossary. Keep the historical changelog historical. → verify: `bun run check`, build followed by headless Fixture Product E2E, targeted packaged macOS/Windows/Linux checks appropriate to cookie/process behavior, and a tiny live drift smoke. Produce an effective-configuration/attempt report for release review, not merely a passing exit code.

## Testing rules for this work

- Pure policy tests choose the next action from named observations; they do not duplicate the implementation's condition tree.
- Real yt-dlp contract tests inspect parsed configuration using synthetic values and an offline fixture. No account or live YouTube is needed.
- Fixture extractors must assert relevant consumed configuration and report identity. A fixture that ignores the input under test cannot prove that input works.
- Product E2E proves user workflow, identity propagation, bounded attempts, and filesystem results. Use `ARROXY_E2E_HEADLESS=1` and rebuild first.
- Live smoke detects platform drift and informs strategy choice; it does not replace deterministic acceptance.
- A green format-selection report does not establish that all clients succeeded, the token was accepted, or the requested quality was met.

## External references and limits

- [yt-dlp option parser at the deployed revision](https://github.com/yt-dlp/yt-dlp/blob/897341241f2bfb2439fe0367f4c7c9ccd29a3828/yt_dlp/options.py): repeated extractor keys replace previous values.
- [yt-dlp YouTube guidance](https://github.com/yt-dlp/yt-dlp/wiki/Extractors): default clients, account use, rate limits, and request spacing. Site behavior changes; do not turn example limits into product guarantees.
- [PO Token Guide](https://github.com/yt-dlp/yt-dlp/wiki/PO-Token-Guide): token requirements and binding depend on client/context. An Explore session alone does not establish a need for account-bound token minting.

Open design choice: whether the advanced “From the start” preference should be app-wide for supported sites or per-site. Recommend per-site when more than one Explore-capable site needs independent account behavior; the initial per-job action avoids making that expansion a prerequisite.
