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

| Kind | Methods |
| --- | --- |
| Session | `hello` |
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

`controlJsonSchemas()` returns the envelope, every method's params and result, every event's data and the error table as JSON Schema (draft 2020-12).

## Stability contract

- `hello` negotiates a protocol **major**: the client lists the majors it speaks, the app answers with the highest one both speak or `version_unsupported` naming both ranges. This release describes major 1.
- Within a major, changes are additive: new optional fields, new methods, new event kinds. Payload schemas drop unknown fields and `parseControlEvent` ignores unknown event kinds, so an older client keeps working against a newer app.
- The envelope is strict: an unknown envelope field is an error.
- Enum values (statuses, error codes, states) are closed: a new value is a new major.

## License

MIT
