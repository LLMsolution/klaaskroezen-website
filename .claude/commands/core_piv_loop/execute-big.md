---
description: Execute a development plan using Agent Teams for parallel multi-agent builds (for large features)
argument-hint: [plan-file-path] [num-agents]
---

# Execute Big: Multi-Agent Team Build

Parallel, multi-agent execution using the `build-with-agent-team` skill. Contract-first protocol with Archon task management.

**When to use:** Large features with 4+ tasks that have independent workstreams (e.g., backend + frontend + tests in parallel). If the plan's "Execution Strategy" recommends team execution, use this.

**For smaller features with sequential tasks, use `/execute-small` instead.**

## Step 0: Ensure Feature Branch

**IMPORTANT:** Never commit directly to `main`. Always work on a feature branch.

**Check current branch:**
```bash
git branch --show-current
```

**If on `main`, create a feature branch:**
```bash
git checkout -b feat/descriptive-feature-name
```

## Update Status

**Update `.agents/STATUS.md` before starting:**
- Find the matching feature row → set Status to `in-progress`, Updated to today's date
- Update "Current Focus" to this feature
- Add to "Recent Activity": `- [date]: [Feature name] execution started (team build)`

## Execute

Now invoke the `build-with-agent-team` skill with the plan path and optional team size.

The skill handles everything:
- Reading and analyzing the plan
- RAG research via Archon before spawning agents
- Creating Archon project and tasks
- Determining optimal team structure
- Contract-first spawning (upstream agents publish contracts first)
- Lead verification and relay of contracts
- Parallel implementation with coordination
- Agent-level and lead-level validation
- Archon task finalization

Run:
```
/skill build-with-agent-team $ARGUMENTS
```

## After Completion

When the build-with-agent-team skill completes:

1. **Update `.agents/STATUS.md`:**
   - Find the matching feature row → set Status to `done`, Updated to today's date
   - Update "Current Focus" to next planned feature (or "No features in progress")
   - Add to "Recent Activity": `- [date]: [Feature name] implementation completed (team build)`
2. Run `/validate` to perform final validation
3. Review the Archon project status — all tasks should be "done"
4. Ready for `/commit` command
