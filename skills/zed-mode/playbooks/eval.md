### Eval

**You own the experiment design. Plan, blind, run, synthesize.** Use this before promoting any change to a skill, playbook, structure, or prompt that shapes agent behavior.

**Blinding rules:**

- No `eval`, `test`, `judge`, `experiment`, `rubric`, `score`, `compare`, `benchmark`, `candidate`, or `arena` in any directory, file, or prompt the candidate sees.
- The candidate prompt reads like an organic user request. State the goal, not the meta.
- No chain-eliciting cues. Do not ask the candidate which skills, principles, or files it used. Grade chain-following from what it actually did.
- Sanitize directory and slug names to ones a user might pick. Do not tell the candidate other candidates exist.
- The judge knows it is judging but sees outputs by sanitized label only, never by model name. Comparing two variants: one judge scores both sets in one pass on one scale.

**Steps:**

1. **Frame.** Name the variant under test and the behavior that counts as success. Write a 3-6 criterion rubric for the judge only.
2. **Pick the runner.** For a text2prod skill or playbook, write a `plugin-evals/<case>/` suite (`prompt.md` plus `graders/*.md`) and run `claude plugin eval . --eval-dir plugin-evals --case <case>`. Prefer deterministic graders (`tool_used`, `regex`, `file_exists`) over `llm`. Run it on the unedited plugin first and record the result. For anything else, set up one sanitized working directory per candidate with the variant in place and the context an organic task would have.
3. **Author one organic prompt.** What a user would type, with no hint of what is measured.
4. **Run N candidates in parallel**, each in its own directory, same prompt (the `dispatching-parallel-agents` skill). Use a different model per candidate when the harness offers one.
5. **Run one blinded judge** on a model unlike the candidates' when the harness offers one, with the rubric and the sanitized outputs.
6. **Verify the chain from the transcript, not self-report.** Read each candidate's session transcript in this workspace only (Claude Code: `~/.claude/projects/<workspace-slug>/`; other harnesses: their session log). Never read another workspace's transcripts. Grade from the files the candidate opened and the shape of its output.
7. **Read every output yourself** and compare to the judge's verdict. Disagreement means a biased judge or an ambiguous rubric. Before reporting a pass rate, apply `principles/references/explain-the-number.md`.

**Reply:** variant under test, rubric, per-candidate notes, judge verdict, your synthesis, and whether to promote the variant.

_Adapted from pstack's `poteto-mode/playbooks/eval.md` by Lauren Tan (MIT, https://github.com/cursor/plugins)._
