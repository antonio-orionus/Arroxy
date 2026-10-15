# Vendored anti-slop plugin

- Upstream repository: https://github.com/dmmulroy/anti-slop
- Upstream version: v0.1.2
- Upstream commit: `e8c4880471b23ab7f216fba7b27d173a6ef07d4c` (`chore: prepare v0.1.2`, 2026-08-31)
- Upstream license: MIT; the complete text is in `LICENSE`.
- Dependencies: `oxlint` and `@oxlint/plugins`, pinned exactly to Arroxy's `oxlint` version.
- Distribution rationale: upstream publishes no official npm package and explicitly intends this plugin to be vendored.
- Local modification policy: do not modify rule semantics during initial adoption. Any later fork requires focused rule tests and a documented rationale; update this record with the new source commit and local changes.
- Scope: the generic plugin is registered; the optional Effect plugin is intentionally not registered because Arroxy does not use Effect.

This directory is root-owned lint infrastructure, not a workspace package. The
`shared/`, `rules/`, and `effect/` directories are copied from the upstream
commit above and are excluded from Arroxy's root lint/format/typecheck file
allowlists except when invoked by the Oxlint bridge.
