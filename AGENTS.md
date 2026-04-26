## Working Conventions

**No backward compatibility** — this is an undeployed prototype. Do not prioritize migration paths, backward compatibility shims, or preserving existing implementations. Existing code can be discarded or restructured without ceremony. Skip any "keep for compat" hedging. Delete old types, old components, old state fields without re-exporting or aliasing. Refactor aggressively. No deprecation notices or transitional layers.

---

## Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

## Visual Debugging with Playwright

Electron can't run headless in CI/sandbox. For visual inspection, run the renderer standalone and use the Playwright MCP browser tools.

### Start the renderer dev server

```bash
# From project root — uses src/renderer/vite.config.mjs (aliases + Tailwind + React)
npx vite src/renderer --port 5173
```

The renderer has a full `browserMock.ts` (imported in `main.tsx`) that stubs `window.appApi` with simulated downloads, format lists, and settings. No Electron needed.

### Playwright MCP tools workflow

1. **Navigate**: `browser_navigate` → `http://localhost:5173`
2. **Screenshot**: `browser_take_screenshot` — full viewport, always useful first
3. **Zoom in on an element** for pixel-level inspection:
   ```js
   // browser_evaluate
   () => {
     const el = document.querySelector('.your-class');
     el.style.transform = 'scale(3)';
     el.style.transformOrigin = 'left center';
     el.style.zIndex = '999';
   };
   // then browser_take_screenshot
   // then reset: el.style.transform = ''
   ```
4. **Get computed styles**: `browser_evaluate` → `window.getComputedStyle(el).paddingLeft` etc.
5. **Get bounding rect**: `el.getBoundingClientRect()` to know exact pixel positions.
6. **Simulate interaction**: `browser_click`, `browser_fill_form`, `browser_type` to walk through wizard steps.
7. **Check console errors**: inspect the console log file from `browser_navigate` result.

### Navigating wizard steps via mock

- Step 1 (URL): enter any `youtube.com` URL → click "Fetch formats →" (1.4s mock delay)
- Step 2 (Format): auto-loaded with mock formats including filesizes
- Step 3 (Save): radio picker, "Custom…" returns a random mock path
- Step 4 (Confirm): click "Pull it! ↓" → triggers simulated download in drawer
- Drawer: click "Download Queue" header to expand, watch progress update every 500ms
