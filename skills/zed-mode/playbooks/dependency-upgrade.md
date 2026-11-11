### Dependency upgrade

**You own the version change. Read what changed upstream, then prove nothing broke downstream.** Use for a library, runtime, or tool bump, including a security patch. The upgrade ships alone, with no refactor, feature, or unrelated cleanup in the same PR.

1. Read the upstream record before touching the manifest. That is the advisory for a security patch, and the changelog or release notes for every version between the current one and the target. List each breaking change and deprecation, and cite what you read.
2. Find every call site of each changed API in this repo, including config, build scripts, and transitive pins in the lockfile. A changed API with no call sites is recorded as checked.
3. Pin current behavior before the bump. Run the existing suite and record the result. Where a changed API has no test, write a characterization test first with the `test-driven-development` skill.
4. Upgrade one major version at a time, through the package manager, never by hand-editing the lockfile. Commit each step once it is green (`principles/references/sequence-verifiable-units.md`).
5. Fix what the bump broke at the call site. A shim that hides the new behavior needs your human partner's OK. A failure you cannot explain goes to the `systematic-debugging` skill. Do not pin back silently.
6. Prove the result on the real artifact (`principles/references/prove-it-works.md`). The suite passes, the build runs on the surface the user uses, and the resolved version in the lockfile is the target. For a security patch, show that no vulnerable version remains anywhere in the dependency tree, using the package manager's own listing or audit command.
7. Run the `verification-before-completion` skill, then `playbooks/opening-a-pr.md`.

**Reply:** versions before and after, the breaking changes found and the call sites each touched, the proof (suite, build, resolved versions), and anything deferred.

_Original to Text2Prod._
