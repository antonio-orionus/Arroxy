import {applyPlan, listFeedbackForms, listWebhooks, planWebhooks} from './tallyWebhooks.js'

// Registers the feedback Worker's webhook on every Arroxy feedback form in
// Tally, and repairs one that is disabled or signs with an old secret. Safe to
// re-run, e.g. after adding a localized form. Keys come from the Keychain:
//
//   TALLY_API_KEY="$(security find-generic-password -s tally-api-key -a antonio-orionus -w)" \
//   TALLY_SIGNING_SECRET="$(security find-generic-password -s tally-webhook-signing-secret -a antonio-orionus -w)" \
//   bun run tally:webhooks [--dry-run]

const apiKey = process.env.TALLY_API_KEY?.trim()
const secret = process.env.TALLY_SIGNING_SECRET?.trim()
if (!apiKey || !secret) {
	console.error('Set TALLY_API_KEY and TALLY_SIGNING_SECRET (see the top of scripts/tally-webhooks.ts).')
	process.exit(2)
}
const dryRun = process.argv.includes('--dry-run')

const [forms, webhooks] = await Promise.all([listFeedbackForms(apiKey), listWebhooks(apiKey)])
const plan = planWebhooks(forms, webhooks, secret)
for (const action of plan) console.log(`${action.kind.padEnd(6)} ${action.form.id}  ${action.form.name}`)
const changes = plan.filter(action => action.kind !== 'ok').length
console.log(`${plan.length} feedback forms: ${changes} to change, ${plan.length - changes} already set.`)

if (dryRun || changes === 0) process.exit(0)
await applyPlan(plan, apiKey, secret)
console.log(`Done: ${changes} webhooks created or updated.`)
