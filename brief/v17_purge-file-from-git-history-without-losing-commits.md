# Project Brief v17: Surgical File Purge from Git History Without Destroying Commits

**File:** `brief/v17_purge-file-from-git-history-without-losing-commits.md`  
**Target:** Git Security, History Rewriting, Secret Token Remediation, Repository Integrity  
**Status:** Architecture Specification & Operational Runbook  

---

## 1. Executive Summary & Problem Statement

In modern software repositories, accidental commits containing private credentials, API tokens, or proprietary design documents present a high-severity security risk:

> **The Fundamental Git Trap**: Simply running `git rm <file>` followed by a new commit **only deletes the file from the HEAD snapshot**. The sensitive file, its plain-text content, and the exposed credentials **remain permanently etched in every preceding Git commit object** (`.git/objects/pack/*`), fully accessible to anyone inspecting the Git log, forks, or clone archives.

### The Challenge:
How do we permanently and irreversibly eradicate a leaked file from **every commit in the entire repository history**, while guaranteeing:
1. **Zero Loss of Legitimate History**: All other commits, commit messages, author metadata, timestamps, branches, and tags remain 100% intact.
2. **Zero Damage to Other Files**: Only the targeted file is expunged.
3. **Remote Synchronization**: The remote GitHub repository is cleanly updated via forced update without leaving orphaned heads or corrupted tracking refs.

---

## 2. Comparison Analysis: The Three Approaches

| Metric | Approach A: Normal `git rm` | Approach B: Nuclear Wipe (`rm -rf .git`) | Approach C: Surgical Purge (`git-filter-repo` / `purge-file.ps1`) |
| :--- | :--- | :--- | :--- |
| **History Erasure** | ❌ **FAILED**. File remains viewable in all past commits. | ✅ Erased (because all history is obliterated). | ✅ **SUCCESS**. Erased from every single commit in history. |
| **Commit History** | ✅ Preserved. | ❌ **LOST 100%**. Repo resets to a blank 0-commit project. | ✅ **PRESERVED 100%**. All past commits, authors, and timestamps remain intact. |
| **Code Changes** | Only affects newest commit. | Loses all historical diffs and blame tracking. | **Surgical**: Only the targeted path is stripped across the Merkle tree. |
| **Remote Push** | `git push` (normal). | `git push -f` (replaces GitHub with 1 commit). | `git push --force --all` (clean rewritten history). |
| **Security Verdict** | **High Risk** (Secret remains public). | Safe from leak, but **unacceptable collateral damage**. | **Optimal & Industry Standard** (GitHub official recommendation). |

---

## 3. Git Architectural Mechanics: Why Hashes Must Change

Git organizes repository snapshots using a **Merkle Tree (Directed Acyclic Graph)**:

```
[Commit A] ──► [Commit B] ──► [Commit C (Leaked File)] ──► [Commit D] ──► [HEAD]
   SHA: 1a2b      SHA: 3c4d              SHA: 5e6f            SHA: 7a8b     SHA: 9c0d
```

1. Each commit hash is cryptographically computed from:
   $$\text{SHA} = \text{Hash}(\text{Tree Content} + \text{Parent SHA} + \text{Author} + \text{Committer} + \text{Timestamp} + \text{Message})$$
2. When the target file is purged from `Commit C`:
   - The tree object of `Commit C` changes $\implies$ its SHA becomes `Commit C'`.
   - Because `Commit D` references parent `Commit C'`, `Commit D`'s hash must change $\implies$ `Commit D'`.
   - All subsequent downstream commits receive new cryptographic hashes.
3. **The Critical Distinction**:
   - The **hashes** change.
   - The **commit messages, timestamps, authors, and other files** do **NOT** change.

---

## 4. The `purge-file.ps1` Architecture

The automated PowerShell tool [`purge-file.ps1`](file:///d:/0pro/human-atlas/purge-file.ps1) orchestrates the entire remediation workflow safely:

```
┌────────────────────────────────────────────────────────┐
│ 1. Verify Clean Git Working Tree (Stash if needed)    │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│ 2. Cache Remote Origin URL                             │
│    (git-filter-repo auto-removes remotes for safety)   │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│ 3. Execute git-filter-repo Engine                      │
│    `git filter-repo --path <Target> --invert-paths`    │
│    • Rewrites all 35+ commits in < 1 second            │
│    • Repacks and garbage-collects orphaned loose blobs │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│ 4. Restore Remote Origin & Verify Local Log            │
│    `git log --all --oneline -- <Target>` == EMPTY      │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│ 5. Force-Push Cleaned Refs to GitHub                   │
│    `git push origin --force --all`                     │
│    `git push origin --force --tags`                    │
└────────────────────────────────────────────────────────┘
```

### Key Script Flags & Options:
- `--invert-paths`: Inverts the filter logic to say *"keep every file and folder in the world, EXCEPT this target file"*.
- `--force`: Bypasses non-fresh clone safety restrictions on local working copies.

---

## 5. GitHub Cloud Gotchas & Cache Invalidation

While `git filter-repo` and `git push --force --all` eradicate the file from your branch tips and Git tree, GitHub's cloud platform retains secondary references:

### 5.1. Pull Request References (`refs/pull/*`)
- If the purged file was ever included in an active or merged Pull Request, GitHub preserves the original commit objects inside hidden PR refs (`refs/pull/<PR_ID>/head`).
- **Remediation**:
  1. Close and delete any PR branch associated with the file.
  2. If the repository was public, contact GitHub Support to request an explicit garbage collection (`git gc`) on the server repository.

### 5.2. Cached Direct Commit URLs
- Anyone with the exact 40-character SHA of an old commit can potentially view cached diff views until GitHub's server-side background garbage collection runs.
- **Remediation**:
  - Always rotate/revoke any leaked token immediately. Changing history prevents future search and scraping, but revoking the token nullifies any past capture.

---

## 6. Verification Checklist

To verify that the file has been 100% eliminated:

```bash
# 1. Search all local commits across all branches
git log --all --oneline -- "brief/v09_download-via-api-sketchfab-public-download.md"
# Output MUST be completely blank!

# 2. Search Git rev-list objects directly
git rev-list --objects --all | grep "v09_download-via-api-sketchfab-public-download.md"
# Output MUST be completely blank!

# 3. Verify remote tracking branch status
git status
# Output: On branch main-pakcli, up to date with 'origin/main-pakcli'

# 4. Verify commit chain remains unbroken
git log -n 5 --oneline
# Shows all commit messages intact with new clean SHAs
```

---

## 7. Conclusion

By deploying [`purge-file.ps1`](file:///d:/0pro/human-atlas/purge-file.ps1) with `git-filter-repo`, the repository was completely cleaned:
- File `brief/v09_download-via-api-sketchfab-public-download.md` and its hardcoded credentials were eradicated across all 35 commits.
- Remote branch `main-pakcli` on GitHub was cleanly synchronized via forced update.
- Zero commits, zero feature history, and zero collateral files were compromised.
