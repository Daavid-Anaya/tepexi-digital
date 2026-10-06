# Security audit remediation recovery plan

Status: local prerequisite slice prepared on `chore/bug-security-issue-form`; delivery authorized, native review preflight pending, PR blocked by missing verified approved-issue linkage. No commit, push, PR, or merge performed.

## Objective and authorization

Create the security audit issue before changing dependencies. The delegated route is bounded local prerequisite implementation, triggered by the user's confirmation to add a bug/security form after diagnosis found only a feature form on remote main.

Overall user authorization: create the GitHub issue in `github.com/Daavid-Anaya/tepexi-digital` using the current `gh` session, then implement the dependency correction after the confirmed issue. These operations are dependency-blocked, not awaiting separate issue/implementation authorization. This delegated task authorizes only adding `.github/ISSUE_TEMPLATE/bug-security.yml` and this recovery document locally, with an exact Engram mirror at `odd/security-audit-remediation/tasks` in project `tepexi-digital`.

Additional current user authorization: create a branch, commit and push this local form prerequisite, and open a PR in `github.com/Daavid-Anaya/tepexi-digital` using the current GitHub session, without automatic merge. This grants prerequisite delivery authority, not issue approval, protected-label changes, an extra prerequisite issue, or a policy waiver. Merge remains unauthorized. This worker stops after final source normalization and checks so the parent can perform the bound native review preflight before commit/push. Dependency changes, installation, and another audit run remain outside this worker task; the original issue-creation and subsequent implementation authorization above is preserved. Do not invent commit identity, approval, labels, or first-person affirmations. Preserve the production high/critical audit gate.

## Stable tasks

| ID | Work unit | State and closure evidence |
| --- | --- | --- |
| T1 | Add and structurally verify the local bug/security Issue Form | Local implementation observed; structural checks passed on the authorized feature branch. Not closed: native review preflight and commit pending; no commit identity. |
| T2 | Publish the form to remote default branch | Branch/commit/push/PR authorized for the prerequisite only. PR blocked: no verified approved issue supplied for required linkage. Merge unauthorized; default-branch publication and readback pending. A branch push or unmerged PR does not make the form available on the default branch. |
| T3 | Publish the security audit issue using that default-branch form | Already user-authorized for `github.com/Daavid-Anaya/tepexi-digital` using the current `gh` session; dependency-blocked by T2, outside this worker task. Recheck policy, duplicates, answers, and permitted labels before publication. |
| T4 | Remediate dependencies after the confirmed issue | Already user-authorized; dependency-blocked by T3, outside this worker task. Preserve issue-before-remediation order. |
| T5 | Verify remediation and record delivery evidence | Blocked by T4; run authorized audit and project checks, report remaining findings honestly. |

No task is closed without its required delivery evidence. T1 can be observed locally without claiming an ODD work-unit commit exists.

## Acceptance and review boundary

- Match the existing feature form's simple control style; retain required Description and Scope and optional Validation.
- Add required Reproduction, Expected behavior, Actual behavior, and Versions and environment controls with unique IDs.
- Warn against secrets, personal data, and public exploit details; sensitive vulnerability details belong in a verified private reporting channel, not this public form.
- Do not add labels, bypasses, mandatory affirmations, dependencies, or unrelated edits.
- Verify YAML parsing, supported control structure, unique IDs, required fields, and whitespace; record actual commands and results.
- Runtime harness: N/A, static Issue Form configuration has no local runtime boundary. GitHub rendering remains unverified until authorized publication.
- TDD mode: unknown; no explicit configuration established. Static structural checks do not imply a TDD runner or mode.
- Forecast: approximately 130 authored added lines for form plus recovery document; generated lockfile lines excluded. No hard 400-line cap or cosmetic shaving. Treat these files as one prerequisite review unit; later remediation is a separate unit.
- Rollback boundary: remove only the new form and recovery document; leave feature form, manifests, lockfile, and audit policy unchanged.

## Evidence and checks

- Initial `git rev-parse --show-toplevel && git status --short`: expected repository root; clean working tree, exit 0.
- Initial local `.github/ISSUE_TEMPLATE/` contained only `feature.yml`; Description and Scope are required, Validation optional. No local SECURITY or CONTRIBUTING file found.
- README dependency policy blocks production high/critical vulnerabilities; `package.json` retains `audit:prod` with `--prod --audit-level high`.
- Delegated prior diagnosis, not rerun here: remote main only has `feature.yml`; audit exit 1 with 14 findings (1 critical, 7 high, 4 moderate, 2 low); Next 16.3.3 patched by 16.3.6; braces 3.0.3 remains on codegen > chokidar and codegen > globby > fast-glob > micromatch. Workspace overrides take precedence and duplicated manifest configuration has drifted. Revalidate these findings before later remediation.
- Parser discovery: `node -e` using `require.resolve` found neither root `yaml` nor `js-yaml`; no dependency installed. `python -c "import yaml; print('PyYAML ' + yaml.__version__)"` found PyYAML 6.0.3, exit 0.
- `python -c` with `yaml.safe_load` and assertions: PASS, exit 0; metadata, 8 controls (1 markdown, 7 unique textarea IDs), 6 required fields, optional Validation identical to feature form, no labels/affirmations, and privacy guidance.
- `git diff --check`: exit 0. New files are untracked, so additionally ran `git diff --no-index --check -- /dev/null <path>` for each new file: exit 1 (new-file differences), no whitespace errors; Git emitted only LF-to-CRLF warnings. Independent `python -c` whitespace/newline assertions passed, exit 0.
- `git status --short`: only the new form and `odd/` are untracked. `git diff --stat` and `git diff --cached --stat`: empty; nothing staged or tracked changed. `git diff --no-index --stat -- /dev/null <path>`: form 62 added lines; document initially 48, now 51; total 113 authored added lines, no lockfile changes.
- Prior worker evidence above predates delivery authorization. This worker read the full recovery file and Engram mirror before updating either; no dependency change, staging, commit, push, PR, protected-label mutation, or native review lifecycle performed.
- Current `git rev-parse --show-toplevel`, `git status --short`, `git diff`, `git log --oneline -10`, `git remote -v`, and `git branch --show-current` confirmed main at `f5356ee`, the intended target, and only these two untracked files. `git switch -c chore/bug-security-issue-form` succeeded, exit 0.
- Target-host read-only `gh api --hostname github.com repos/Daavid-Anaya/tepexi-digital/contents` and reads of `.github`, `.github/workflows`, and `.github/ISSUE_TEMPLATE` succeeded, exit 0: no repository PR template, CONTRIBUTING, or SECURITY file in the root or `.github`; workflows are only `ci.yml` and `security-audit.yml`; default-branch form is only `feature.yml`. Local workflow reads found CI and the production high/critical audit gate, not an approved-issue validation workflow. The mandatory approved-issue linkage comes from the loaded `branch-pr` skill, not a verified repository CI rule; no approved issue has been verified for this prerequisite.
- Current `python -c` using `yaml.safe_load` and assertions passed, exit 0, with PyYAML 6.0.3: metadata, 8 supported controls, 7 unique IDs, 6 required fields, unchanged optional Validation, no labels/affirmations, privacy guidance, and a sensitive-pattern scan of the form. `git diff --check` passed, exit 0. Full `git diff --no-index -- /dev/null <path>` inspected both additions (exit 1 means differences; only LF-to-CRLF warnings). The first combined whitespace/privacy command failed from PowerShell quoting before checks ran; the corrected `python -c` passed, exit 0, for both files: whitespace, final newline, UTF-8/no BOM, and sensitive-pattern scan. Current slice: 62 form lines plus 55 recovery lines, 117 authored additions. `git status --short --untracked-files=all` confirmed exactly these two files; nothing staged.
- Proposed single work-unit commit: `chore(github): add bug and security audit issue form`, containing only the new form and this recovery document. Runtime harness and shellcheck: N/A; no runtime boundary or modified shell script. GitHub rendering and remote CI remain unverified.

## Next step

Parent: run native review preflight against the final normalized two-file slice before committing/pushing. Resolve the missing approved-issue linkage with the human before PR creation; do not invent linkage, approve an issue, create an extra prerequisite issue, or waive policy. No merge is authorized. After independently authorized default-branch delivery and readback, use the original issue authorization to recheck policy, duplicates, answers, and labels, then publish and confirm the security audit issue before any dependency remediation.
