# arroxy-control

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

The schemas of the Arroxy **Control API**: the small, versioned protocol that programs other than the Arroxy window use to drive the [Arroxy](https://github.com/antonio-orionus/Arroxy) desktop app. A phone, a local AI agent through the `arroxy-mcp` bridge, and scripts all speak it.

This package holds [zod](https://zod.dev) schemas for every request, result, event and error, their TypeScript types, and a JSON Schema export for clients that do not use zod. It has no state and does no I/O: connecting to the app is the client's job.

```bash
bun add arroxy-control
```

Node ≥ 20. ESM + CJS.

## Messages

Every entry point carries the same envelopes: one JSON object per line on the local socket, one per encrypted frame on the phone relay.

```jsonc
{"type": "request", "id": "r1", "method": "links.add", "params": {"requestId": "a1", "url": "https://www.youtube.com/watch?v=..."}}
{"type": "response", "id": "r1", "ok": true, "result": {"intakeId": "i1", "placeholderId": "q1"}}
{"type": "response", "id": "r2", "ok": false, "error": {"code": "not_found", "message": "No queue item q9.", "retryable": false, "next": "Check the id with queue.list or intake.get; ..."}}
{"type": "event", "event": "intake.updated", "seq": 4, "bootId": "b1", "data": {"intake": {"intakeId": "i1", "placeholderId": "q1", "state": {"state": "queued", "itemIds": ["q2"]}, "updatedAt": 1760000000000}}}
```

On the local socket a connection opens with a three-step handshake. The app proves it holds the discovery token before the client proves anything, so the client's first frame carries no secret: on Windows another OS user can squat a stale pipe name and read whatever a client sends first.

```jsonc
// 1. The client says hello with the majors it speaks and a fresh nonce. No credential.
{"type": "request", "id": "h1", "method": "hello", "params": {"protocol": {"majors": [1]}, "client": {"name": "arroxy-mcp", "version": "0.1.0"}, "clientNonce": "<clientNonce>"}}
// 2. The app answers with its proof over clientNonce and a nonce of its own.
//    The client checks serverProof and drops the connection if it does not match.
{"type": "response", "id": "h1", "ok": true, "result": {"serverProof": "<server proof>", "serverNonce": "<serverNonce>"}}
// 3. The client proves itself over both nonces.
{"type": "request", "id": "h2", "method": "auth", "params": {"clientId": "c1", "proof": "<client proof>"}}
{"type": "response", "id": "h2", "ok": true, "result": {"protocol": 1, "appVersion": "0.9.0", "bootId": "b1", "clientId": "c1", "rules": ["trusted"]}}
```

The proofs:

```text
serverProof = HMAC(token, "arroxy-control/v1 server\n" + clientNonce)
proof       = HMAC(key,   "arroxy-control/v1 client\n" + serverNonce + "\n" + clientNonce)
```

The two labels keep a server proof from ever passing as a client proof, so a client without the token cannot say hello with another connection's `serverNonce` and replay the answer as its `auth` proof. The `key` depends on the case:

- **Known client:** `auth {clientId, proof}`, keyed by its `clientSecret`.
- **First connection:** `auth {proof}` with no `clientId`, keyed by the token. The app answers `approval_pending` with `details.approvalId` and asks the user to Allow or Deny.
- **After Allow:** on a new connection, `auth {approvalId, proof}`, keyed by the token. The result carries the `clientId` and the issued `clientSecret`, exactly once.

HMAC is HMAC-SHA256 keyed by the UTF-8 bytes of the secret or token, over the UTF-8 bytes of the message, written as base64url without padding (43 characters). `handshakeServerProof(token, clientNonce)` and `handshakeClientProof(key, serverNonce, clientNonce)` compute them with WebCrypto. Nonces are 16 to 64 random bytes in base64url without padding (22 to 86 characters).

Until `auth` succeeds the app accepts one `hello`, then one `auth`, and nothing else:

- The connection has 2 s from connect until `auth` succeeds. Past that the app sends a `handshake_timeout` error whose `id` is `null` and closes.
- Every frame before a successful `auth` is capped at 4 KiB; a longer one drops the connection.
- A second `hello`, any method other than `auth` after `hello`, or any method before `hello` answers `unauthorized` and closes.

The token and the socket path come from the discovery file, `control.json` in the app's user data folder (`controlDiscoverySchema`). The app rewrites it on each launch and deletes it on a clean quit; a client checks that the app is alive by connecting.

| Kind | Methods |
| --- | --- |
| Session | `hello`, `auth` |
| Queries | `status`, `profiles.list`, `queue.list` (paged), `queue.get`, `intake.get` |
| Wait | `wait` (one intake or one item, `until: settled \| done`, at most 240 s) |
| Intake | `links.add`, `intake.choose`, `intake.retry`, `intake.cancel` |
| Queue | `queue.pause`, `queue.resume`, `queue.cancel`, `queue.retry`, `queue.remove`, `queue.pauseAll`, `queue.resumeAll` |
| Events | `events.subscribe`, `events.unsubscribe` |

`links.add` returns at once with an intake handle. The link is probed in the background, and the intake moves from `probing` to `queued`, `needsYourChoice`, `probeFailed`, `nothingNew` or `cancelled`. Read it with `intake.get`, `wait`, or `intake.updated` events. The same `(client, requestId)` always returns the same intake, so resending a request never queues twice.

Errors carry a code from a fixed table, whether retrying can help, and a one-line next step: see `CONTROL_ERROR_TABLE`.

## Usage

The app side parses a request and answers with typed params:

```ts
import {controlError, controlRequestEnvelopeSchema, parseControlRequest} from 'arroxy-control'

const envelope = controlRequestEnvelopeSchema.parse(JSON.parse(line))
const parsed = parseControlRequest(envelope)
if (!parsed.ok) return reply(envelope.id, parsed.error)
if (parsed.request.method === 'queue.get') {
	const {itemId} = parsed.request.params
}
```

A client parses results and events:

```ts
import {controlEventEnvelopeSchema, parseControlEvent, parseControlResult} from 'arroxy-control'

const result = parseControlResult('links.add', response.result)
const event = parseControlEvent(controlEventEnvelopeSchema.parse(message))
if (event.status === 'event' && event.event.event === 'queue.progress') render(event.event.data.progress)
```

`controlJsonSchemas()` returns the envelope, the discovery file, every method's params and result, every event's data and the error table as JSON Schema (draft 2020-12).

## Stability contract

- `hello` negotiates a protocol **major**: the client lists the majors it speaks, the app answers `version_unsupported` naming both ranges when none is shared, and the `auth` result carries the highest one both speak. This release describes major 1.
- Within a major, changes are additive: new optional fields, new methods, new event kinds. Payload schemas drop unknown fields and `parseControlEvent` ignores unknown event kinds, so an older client keeps working against a newer app.
- The envelope is strict: an unknown envelope field is an error.
- Enum values (statuses, error codes, states) are closed: a new value is a new major.

## License

MIT
