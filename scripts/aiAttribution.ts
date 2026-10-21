// What counts as crediting an AI as an author (AGENTS.md, "No AI attribution"),
// shared by the PR policy and the issue policy. No dependencies, so the issue
// policy workflow runs it without installing the workspace.

// A co-author trailer naming an assistant product, a "generated with/by"
// credit, or an assistant's noreply address. Products only, never words that
// are also people's names (Devin, Ai); `claude` never matches as `CLAUDE.md`.
// The product list repeats in each literal, since a lint rule forbids
// building these from a string.
const ATTRIBUTION = [
	/co-authored-by:.*\b(?:claude\b(?!\.md)|anthropic|codex|openai|chatgpt|gpt-?\d\w*|copilot|gemini|cursor agent|aider)\b/i,
	/generated (?:with|by) \[?(?:claude\b(?!\.md)|anthropic|codex|openai|chatgpt|gpt-?\d\w*|copilot|gemini|cursor agent|devin|aider|an? ai|ai)\b/i,
	/noreply@(?:anthropic|openai)\.com/i
]

/** Text that credits an assistant as an author of a commit, PR or issue. */
export const creditsAnAssistant = (text: string): boolean => ATTRIBUTION.some(pattern => pattern.test(text))

// "Found by Codex reviewing …": a finding credited to an assistant or an AI
// review bot.
const FINDER = /\bfound by\b[^\n]*\b(?:claude\b(?!\.md)|anthropic|codex|openai|chatgpt|gpt-?\d\w*|copilot|gemini|cursor agent|aider|coderabbit)\b/i

/** Text that credits an assistant as an author or as the finder of what it reports. */
export const creditsAnAssistantFinding = (text: string): boolean => creditsAnAssistant(text) || FINDER.test(text)
