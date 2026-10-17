# Styles are token layers over a Minimal base, and Minimal is the no-GPU fallback

Some users want a quieter, less colourful app than the Aurora look. Arroxy therefore
ships more than one style. A style is a set of values for one shared token contract,
in light and dark, and switching style changes paint only, never layout or behavior.
DESIGN.md §8 holds the contract and its rules.

Minimal is the base layer, not one more layer next to Aurora. `:root` and `.dark`
carry Minimal's values, and Aurora overrides the contract under
`:root[data-style="aurora"]`. Every style after it is another override of the same
contract. Building it the other way round, with Aurora as the base and Minimal
switching effects off, would force every future style to undo Aurora's specifics
one by one. Today about 120 tokens are set per sky, most of them per component, so
that approach gets more expensive with each style added. Component tokens are
derived from the contract once and are never set by a style.

Minimal also replaces the CSS imitation of the aurora as the no-GPU fallback. A
style that needs hardware WebGL renders as Minimal when there is none. The
alternative was the existing photo-plus-keyframe imitation, which keeps the brand
look on weak machines. It was rejected because it is a second implementation of
every backdrop, kept looking like the shader by hand. It still animates on the CPU
on exactly the machines that can least afford it. It also forced its own glass
overrides to keep text readable. Minimal needs none of that.

## Consequences

- Someone who chose Aurora on a machine without hardware WebGL sees Minimal, with a
  note in Settings explaining why. Their choice is kept and comes back when a GPU
  becomes available.
- The CSS backdrop fallback, its photo assets and its keyframes are deleted, as is
  the "GPU / CSS only" backdrop setting. The style picker replaces it.
- A new style costs an enum value, a registry entry, one stylesheet and a label in
  every locale. Contract-completeness, style-isolation and contrast tests gate it
  automatically.
- Identity tokens are the same in every style: brand blue, status hues,
  typography, spacing and radii. A style that wants to change one is a brand
  change, not a style.
- User-made or imported styles are out of scope. They would need validation of
  untrusted values and contrast enforcement on colours Arroxy did not choose.
