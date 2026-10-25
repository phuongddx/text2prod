### Prototype

**You own the design decision, not the code. The prototype is a throwaway instrument; the real build follows Feature.** This is the `brainstorming` skill's spike path with more than one variant.

The one playbook where "smallest change" and the verification bar invert: speed over polish, code quality does not matter, no planning. The rigor is in picking the right design cheaply. Propose variations the user did not ask for; throw an approach away and try another.

1. Scope the decision the prototype exists to make: which layout, which interaction, which density, or for an empirical fork which behavior, timing, or approach. No decision means no prototype: route to `playbooks/feature.md`.
2. Gather references when the design space is open (prior art, a short moodboard of themes and layouts); let the user pick directions before building. Skip when the direction is set.
3. Build throwaway in a scratch directory separate from production source. For a visual decision, plain HTML/CSS/JS or the lightest stack that renders the idea. For a behavioral or timing decision, the smallest script that exercises the question. No production framework, no tests, no abstractions.
4. When comparing alternatives, build them behind one switcher, each variant labeled (`principles/references/exhaust-the-design-space.md`).
5. Verify on the surface the user uses: screenshot each variant, or log the timing or output you are deciding on. The observation is the test here, not an assertion.
6. Present alternatives, trade-offs, and a recommendation. The output is the decision plus the throwaway artifact, not shippable code. Hand the chosen direction to `playbooks/feature.md` for the real build.

**Reply:** the variants explored, the evidence (screenshots or observed output), trade-offs, your recommendation, and the scratch path. Say plainly that the prototype is throwaway.

_Adapted from pstack's `playbooks/prototype.md` by Lauren Tan (MIT, https://github.com/cursor/plugins)._
