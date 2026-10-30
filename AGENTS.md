# AGENTS.md

## Project

- Type: CDK construct library (cdk-lib), defined with projen using `GemeenteNijmegenCdkLib` from `@gemeentenijmegen/projen-project-type`.
- Project configuration lives in `.projenrc.ts`. Generated files (package.json, tsconfig, eslint config, workflows, etc.) are owned by projen.
  - Never edit generated files by hand. Change `.projenrc.ts`, then run `npx projen`.
  - If a generated file needs to change and projen offers no option for it, stop and ask.

## Commands

- `npx projen`: re-synthesize project files after changing `.projenrc.ts`
- `npx projen build`: full build (compile, lint, test)
- `npx projen test`: run tests only
- Run `npx projen build` before declaring any piece of work done. It must pass.

## Workflow

- Branch from an up-to-date `main`. Branch names use a semantic prefix, similar to semantic commits: `feat/*`, `fix/*`, `chore/*` or `docs/*`, followed by a short kebab-case description.
- Commit messages follow Conventional Commits (`feat: ...`, `fix: ...`, optional scope), imperative mood, describing the change and why.
- One logical change per branch/PR. Keep PRs small and focused. If you notice something unrelated that is worth fixing, mention it in your summary and do not change it.
- Before finishing: `npx projen build` passes and the self-review (below) is done.
- PRs are merged to `main` after review by someone else. You may commit on your feature branch. Pushing and opening the PR is left to the reviewer unless asked.
- Never merge or approve a PR, never push to `main` or release branches, never create tags, and never publish.
- If the task is ambiguous, or the code contradicts these instructions, ask instead of guessing.

### When working from a plan

- If you are given a plan, treat it as a working document outside the repository (gitignored under `.ai/`, currently `.ai/plans/*`). Work through it one PR at a time.
- Each plan lives in its own file.
- Keep each PR limited to what the plan says for that PR.
- Stop after each PR is complete and wait for review. Do not start the next PR on your own.
- If the plan is ambiguous, contradicts the code, or a step seems wrong, ask instead of guessing.
- Plans are never committed and never referenced (see the next section).

## Plans never leak into the repository

The plan is a working document for you and the reviewer. It is never committed and never referenced.

- No mention of the plan, plan steps, "PR 3", "phase 2", "step 4", or similar in code, comments, tests, docs, README, changelog, commit messages or PR descriptions.
- No comments that point at other PRs or future work ("will be replaced in a later PR", "see PR 5"). Either do the work now or leave it out.
- Make sure `.ai/` is in `.gitignore`. Check `git status` before committing: no plan files staged.
- Write commit messages and PR descriptions so that they make sense to someone who has never seen the plan.

## Documentation

- Documentation lives in `docs/` (plus the README for the overview). Plans, notes and other AI working files live in `.ai/`, which is gitignored. Never put one in the other's place.
- Write docs for a reader who has never seen a plan, an AI tool, or any of this context. They should be fully understandable on their own.
- Do not mention plans, PR numbers, agents, `AGENTS.md`, `.ai/` or AI-assisted workflows in docs. Never write "as discussed", "as planned" or "see the plan".
- Do not copy text from a plan into docs. Rewrite it in terms of what the library does, why, and how to use it.
- Describe the current state, not the history. Avoid "now", "no longer", "previously", "changed from"; that belongs in commit messages.
- Update the relevant docs in the same PR when behavior or public API changes. Do not add docs for things outside the scope of the PR.
- Keep docs short and concrete: purpose, usage with a minimal example, and non-obvious constraints.

## Code style

### Comments

- Comments explain why (intent, constraints, non-obvious decisions). Never what the code does and never which task produced it.
- If a comment only restates the next line, delete it. Prefer better names over comments.
- Single line: use `//`. Never write a single-line block comment such as `/** text */` or `/* text */`.
- Multi-line JSDoc (`/** ... */` spanning several lines) is for exported/public API only: constructs, props interfaces and their properties.
- Props and public classes need accurate documentation, since consumers read it. Keep it short and factual, and do not repeat the type information.
- No commented-out code. No TODO/FIXME unless the reviewer asked for one.

### Design

- Smallest change that works (KISS). Do not add abstractions, options, props, config flags, helper files or layers that the current PR does not need.
- Do not extract duplicated code until it has appeared three times, or unless the copies must stay in sync. Two similar blocks are fine (DRY applies to knowledge, not to lines that look alike).
- Follow the patterns already in the repository over introducing new ones. If you want to deviate, say so and why.
- No new dependencies without asking.

### CDK library specifics

- Public API (exported constructs and props) is a contract for consumers. Do not rename, remove or change the meaning of exported things unless the plan says so, and flag it clearly in your summary as a breaking change.
- Keep props minimal and sensible by default. Do not expose an option just because it is possible.
- If this library is published through jsii, exported API must stay jsii-compatible (no unsupported TypeScript constructs in exported signatures). The build will tell you; do not work around jsii errors without asking.
- Tests: use assertions on the synthesized template (`Template.fromStack`) for behavior that matters. Avoid snapshot-only tests that nobody can review, and do not test implementation details.

## Self-review before declaring done

When a PR's work is complete and `npx projen build` passes, review your own diff (`git diff` against the base branch) before reporting. Check:

1. Scope: does every change belong to this PR? Anything unrelated gets reverted or mentioned.
2. Simplicity (KISS): could any part be simpler or smaller? Any unused code, options or abstractions?
3. Duplication (DRY): real duplication of knowledge, applying the three-times rule above?
4. Comments: no what-comments, no single-line block comments, no plan/PR references, no commented-out code.
5. Public API: any exported change, and is it intended and documented?
6. Tests: is the new or changed behavior covered by a test that would fail if it broke?
7. Leaks: no plan files, no references to the plan in code, comments, docs or commit messages.

Classify findings:

- **must-fix**: bugs, scope creep, rule violations from this file, missing tests for new behavior, unintended API changes
- **should-fix**: clear improvements in readability or simplicity
- **nit**: taste

### Review level

The reviewer may set a level in the prompt ("review: pragmatic" or "review: strict"). Default is pragmatic.

- **pragmatic**: fix all must-fix findings. List should-fix and nit findings in your summary, but do not change code for them.
- **strict**: fix must-fix and should-fix findings. List nits.

Never gold-plate: do not make changes beyond the findings of this review.

## Reporting back

When a PR is done, reply briefly with:

- What changed, in 2-4 sentences
- Result of `npx projen build`
- Self-review findings that you left unfixed (should-fix/nit), and anything you noticed outside the scope
- Open questions or decisions that need the reviewer

Do not narrate every step or restate the plan.

## Keeping this file useful

When the reviewer corrects you on something that a rule here would have prevented, propose a one-line addition or sharpening of the relevant rule. Do not edit this file yourself unless asked; propose the change in your reply.
