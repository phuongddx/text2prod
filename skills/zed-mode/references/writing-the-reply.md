# Writing the reply

Default rules for every reply and every prose surface you produce:
replies, docs, commit messages, PR bodies, code comments. Your human
partner's output style and instruction files (`CLAUDE.md`, `AGENTS.md`,
`GEMINI.md`) win over any rule here. For a full pass over a draft, use
the `unslop` skill.

Write it clean as you draft. A cleanup pass afterwards does not remove
these patterns.

- **Short declarative sentences.** One thought per sentence, ended with a period.
- **No long dash anywhere.** Write a file-list bullet as a sentence ("`main.js` owns persistence") and a bold header as its own sentence ("**Verification.** End to end in the browser").
- **No colon as a mid-sentence connector.** A colon before a list is fine.
- **Terse is not an excuse to drop content.** Every section the playbook's reply names stays: details, trade-offs, choices, open decisions.
- **Frame impact for the consumer and the maintainer.** First name who the work is for and what changes for them. Then say what the next engineer who owns the code inherits. If you cannot say what either would notice, the work or the explanation is off.
- **Never fabricate a link, citation, or transcript reference.** Link only what you produced or read this session.
- **Every claim carries its evidence in the same sentence.** Use the levels in `evidence-levels.md`, or say measured, inferred, or guess. A prediction or an unseen cause is a guess. Never hand your human partner a check you could run.

Comments follow the same rules. Keep a comment only for a non-obvious
why the code cannot show. Test and verify scripts get no
phase-narrating comments; the assertion message documents the step.

_Adapted from pstack's `poteto-mode/SKILL.md` (Writing the reply, Comments) by Lauren Tan (MIT, https://github.com/cursor/plugins)._
