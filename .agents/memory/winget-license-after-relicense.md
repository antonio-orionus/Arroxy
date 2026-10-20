---
name: winget-license-after-relicense
description: The first Winget PR after the GPLv3 relicense (0.7.1) carries "License: MIT" forward and must be edited by hand before Microsoft merges it.
metadata:
  type: project
---

The app moved from MIT to GPL-3.0-or-later after 0.6.2 (ADR 0012); 0.7.0 was
withdrawn, so 0.7.1 is the first GPL release. `release_to_winget.yml` takes no
manifest fields: komac copies every locale field, `License` included, from the
previous version's manifest, so the 0.7.1 PR to `microsoft/winget-pkgs` will say
`License: MIT`.

**Why:** Winget would list a GPL release as MIT, and once merged a version's
manifest only changes through another PR.

**How to apply:** when the 0.7.1 PR opens, edit
`manifests/a/AntonioOrionus/Arroxy/0.7.1/AntonioOrionus.Arroxy.locale.en-US.yaml`
on its branch in the `antonio-orionus/winget-pkgs` fork: `License: GPL-3.0-or-later`.
Later versions copy the corrected value, so this is a one-time fix; delete this
memory after it is done. Scoop needs no hand edit: `publish-scoop` reads the
license from the tagged `package.json`.
