---
description: Execute a development plan sequentially with Archon task management (for small/medium features)
argument-hint: [plan-file-path]
---

# Execute Small: Sequential Plan Execution

Sequential, single-agent execution with Archon task management. One task at a time, in order.

**When to use:** Small to medium features (1-5 tasks), tasks that depend on each other, changes touching the same files. If the plan's "Execution Strategy" recommends sequential execution, use this.

**For larger features with independent workstreams, use `/execute-big` instead.**

## Critical Requirements

**MANDATORY**: Throughout the ENTIRE execution, you MUST maintain continuous usage of Archon for task management. DO NOT drop or skip Archon integration at any point.

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

**Skip this step only if:**
- Already on a feature branch
- Solo development without PR workflow

## Step 1: Read Plan and Update Status

Read the plan file specified in: $ARGUMENTS

**Update `.agents/STATUS.md`:**
- Find the matching feature row → set Status to `in-progress`, Updated to today's date
- Update "Current Focus" to this feature
- Add to "Recent Activity": `- [date]: [Feature name] execution started`

The plan file will contain:
- A list of tasks to implement
- References to existing codebase components and integration points
- Context about where to look in the codebase for implementation

## Step 2: Project Setup in Archon

1. Check if a project ID is specified in CLAUDE.md for this feature
   - Look for any Archon project references in CLAUDE.md
   - If found, use that project ID

2. If no project exists:
   - Create a new project in Archon using `mcp__archon__manage_project`
   - Use a descriptive title based on the plan's objectives
   - Store the project ID for use throughout execution

## Step 3: Create All Tasks in Archon

For EACH task identified in the plan:
1. Create a corresponding task in Archon using `mcp__archon__manage_task("create", ...)`
2. Set initial status as "todo"
3. Include detailed descriptions from the plan
4. Maintain the task order/priority from the plan

**IMPORTANT**: Create ALL tasks in Archon upfront before starting implementation.

## Step 4: Codebase Analysis

Before implementation begins:
1. Analyze ALL integration points mentioned in the plan
2. Use Grep and Glob tools to:
   - Understand existing code patterns
   - Identify where changes need to be made
   - Find similar implementations for reference
3. Read all referenced files and components
4. Build a comprehensive understanding of the codebase context

## Step 5: Implementation Cycle

For EACH task in sequence:

### 5.1 Start Task
- Move the current task to "doing" status in Archon: `mcp__archon__manage_task("update", task_id=..., status="doing")`
- Break down into sub-tasks in Archon if needed

### 5.2 Implement
- Execute the implementation based on:
  - The task requirements from the plan
  - Your codebase analysis findings
  - Best practices and existing patterns
- Make all necessary code changes
- **Write tests alongside implementation:**
  - Discover existing test framework and patterns first (jest.config, vitest.config, pytest.ini, existing test files)
  - Follow existing test naming conventions and structure
  - Cover: happy path, edge cases (boundaries, empty/null), error handling
  - Test behavior and contracts, not implementation details
  - Critical business logic MUST have tests
  - Use descriptive test names: `should [expected behavior] when [condition]`

### 5.3 Review & Simplify
- Before marking as "review", review your own code:
  - Remove unnecessary complexity and nesting
  - Eliminate redundant code and abstractions
  - Ensure clear variable and function names
  - Avoid nested ternaries — prefer if/else or switch
  - Check that tests actually test something meaningful
- Once clean, move task to "review" status: `mcp__archon__manage_task("update", task_id=..., status="review")`
- DO NOT mark as "done" yet - this comes after validation

### 5.4 Proceed to Next
- Move to the next task in the list
- Repeat steps 5.1-5.3

**CRITICAL**: Only ONE task should be in "doing" status at any time.

## Step 6: Validation Phase

After ALL tasks are in "review" status:

Run `/validate` to perform automated validation appropriate for this codebase. The validate command will auto-detect the stack and run the right checks.

Additional validation you should perform:
- Check for integration issues between components
- Ensure all acceptance criteria from the plan are met
- Verify test coverage for new functionality — critical paths must have tests
- If tests are missing for key business logic, write them before proceeding

## Step 7: Finalize Tasks in Archon

After successful validation:

1. For each task that passes validation:
   - Move from "review" to "done" status: `mcp__archon__manage_task("update", task_id=..., status="done")`

2. For any tasks with issues:
   - Leave in "review" status
   - Document what needs attention

## Step 8: Update Status and Final Report

**Update `.agents/STATUS.md`:**
- Find the matching feature row → set Status to `done`, Updated to today's date
- Update "Current Focus" to next planned feature (or "No features in progress")
- Add to "Recent Activity": `- [date]: [Feature name] implementation completed`

**Provide a summary including:**
- Total tasks created and completed
- Any tasks remaining in review and why
- Key features implemented
- Any issues encountered and how they were resolved

### Ready for Commit
- Confirm all changes are complete
- Confirm all validations pass
- Ready for `/commit` command

## Workflow Rules

1. **NEVER** skip Archon task management at any point
2. **ALWAYS** create all tasks in Archon before starting implementation
3. **MAINTAIN** one task in "doing" status at a time
4. **VALIDATE** all work before marking tasks as "done"
5. **TRACK** progress continuously through Archon status updates

## Error Handling

If at any point Archon operations fail:
1. Retry the operation
2. If persistent failures, document the issue but continue tracking locally
3. Never abandon the Archon integration - find workarounds if needed
