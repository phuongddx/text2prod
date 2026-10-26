# Redesign From First Principles

**When it applies:** Apply when integrating a new requirement into an existing design.

**Why:** A requirement bolted onto an old design keeps the old design's assumptions and adds a special case; a redesign that treats it as foundational removes both.

When integrating a change, don't bolt it onto the existing design. Redesign as if the requirement had been a foundational assumption from the start.

- Read all affected files and understand the current design
- Ask: "if we were writing this from scratch with this new requirement, what would we build?"
- Propagate the change through every reference: types, docs, examples, rationale sections
- Think about the whole redesign, then deliver it incrementally

This is the method for preserving option value when integrating changes into an existing design.

_Adapted from pstack's `principle-redesign-from-first-principles` by Lauren Tan (MIT, https://github.com/cursor/plugins)._
