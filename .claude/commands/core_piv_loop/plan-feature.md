---
description: "Create comprehensive feature plan from conversation context (optimized for conversational workflow)"
---

# Plan Feature v2: Conversation-Driven Planning

## Feature: $ARGUMENTS

## Mission

Transform the conversation context and /prime output into a comprehensive implementation plan.

**Core Principle**: You are primarily a SCRIBE and SYNTHESIZER, but also a SMART RESEARCHER.

**Primary job:** CAPTURE and STRUCTURE the conversation and /prime findings
**Secondary job:** Use agents to fill gaps or resolve uncertainties from the conversation

**Output Constraint**: Plan must be **500-650 lines** (HARD LIMIT: never exceed 700 lines). Be concise, actionable, scannable.

**What you have:**
- ✅ /prime output (already executed by user - in context)
- ✅ Full conversation history (requirements, decisions, nuances)
- ✅ Agent outputs used during conversation (if any)
- ✅ User's explicit preferences and constraints

**What you do:**
- ✅ Synthesize all available context into structured plan
- ✅ Capture conversational decisions and WHY
- ✅ Preserve nuances (now vs later, rejected alternatives)
- ✅ Use agents to fill gaps when conversation didn't provide enough detail
- ❌ Don't re-research what's already clear from conversation
- ❌ Don't call /prime (user already did this)

## Planning Process

### Phase 1: Context Synthesis

Review and extract from available context:

**1.1 /prime Output (Already in Context)**
- Project structure, tech stack, existing patterns
- Current codebase state, conventions, standards
- Architectural constraints, file locations

**1.2 Conversation History**
Extract:
- **Requirements**: What feature, problem, value, scope
- **Decisions**: Architectural choices, options selected, WHY chosen, alternatives rejected
- **Phasing**: NOW vs LATER, MVP vs post-MVP, priorities
- **Preferences**: Technical choices, quality expectations, constraints
- **Edge Cases**: Error scenarios, validation requirements

**1.3 Agent Research (From Conversation)**
If agents were used during conversation, extract their findings:
- codebase-locator: File locations, directory structure
- codebase-analyzer: Implementation details, data flows
- codebase-pattern-finder: Code patterns, conventions
- web-search-researcher: Best practices, security considerations

**1.4 Nuances & Context**
Capture:
- **WHY Decisions**: Rationale, trade-offs considered
- **Rejected Alternatives**: What wasn't chosen and why
- **Assumptions & Constraints**: Dependencies, limitations
- **Questions Answered**: Clarifications provided

### Phase 2: Smart Gap Filling

**Self-Assessment:**
1. Is there enough detail from conversation to implement?
2. Are there ambiguities that could lead to wrong implementation?
3. Am I 100% certain about the approach?

**Decision Tree:**
- **User requirements unclear** → Use AskUserQuestion
- **Insufficient technical detail** → Use agents to fill gaps
- **Approach uncertain** → Research and recommend
- **Conversation comprehensive** → Skip to Phase 3

**Agent Research Guidelines:**

✅ **Use agents when:**
- Missing implementation details (conversation: "We need caching" but no tech chosen)
- Technical uncertainty (WebSocket vs SSE not discussed)
- Security/best practices not covered (JWT expiration not mentioned)
- Pattern verification needed (patterns weren't shown during conversation)
- Codebase understanding gaps (User model not explored in conversation)
- Finding relevant files (auth files not located during conversation)

❌ **Don't use agents when:**
- Already clear from conversation ("Use JWT, 15 min expiry like API auth")
- Already shown in conversation (Pattern-finder showed JWT at src/api/auth.ts:56)
- User made explicit choice ("I prefer bcrypt over argon2")
- Explicitly deferred ("Password reset later, not now")

**Research Execution:**
1. Be specific: "Find JWT token generation pattern" not "Find auth stuff"
2. One agent per gap: Use appropriate agent for each specific need
3. Parallel when possible: Independent gaps → parallel; dependent → sequential
4. Document why: Note "Used [agent] because [gap]" in plan

**Clarify vs Research:**
- **Ask user**: Requirements ambiguity, business logic choices, priorities
- **Use agents**: Technical details, best practices, codebase exploration

**Specialized Planning Agents (Use During Planning When Applicable):**

Use these Task tool agents for quality analysis during planning:

✅ **type-design-analyzer:**
- When: Planning new types/models in the feature
- Why: Ensure strong invariants and encapsulation before implementation
- Example: `Task(subagent_type="type-design-analyzer", prompt="Review UserAccount type design for invariant strength")`

✅ **docs-impact-agent:**
- When: Feature affects user-facing behavior, APIs, or workflows
- Why: Identify documentation that needs updating as part of the plan
- Example: `Task(subagent_type="docs-impact-agent", prompt="Identify docs needing updates for new authentication flow")`

✅ **silent-failure-hunter:**
- When: Planning error handling strategy or using try-catch patterns
- Why: Prevent silent failures in design phase
- Example: `Task(subagent_type="silent-failure-hunter", prompt="Review planned error handling for silent failures")`

These agents help ensure quality BEFORE implementation starts. Include their findings in the plan under "Key Findings from Agent Research."

### Phase 2b: Auto-Load Relevant Skills

Based on the detected stack (from /prime output or conversation context), automatically read and reference the relevant skills. This ensures the plan captures best practices without the user needing to manually mention them.

**If Next.js detected:**
- Read: `.claude/skills/next-best-practices/SKILL.md` — file conventions, RSC boundaries, async patterns
- Read: `.claude/skills/next-cache-components/SKILL.md` — caching strategies

**If React detected:**
- Read: `.claude/skills/vercel-react-best-practices/SKILL.md` — 57 performance rules
- Read: `.claude/skills/vercel-composition-patterns/SKILL.md` — component design patterns

**If frontend detected (any):**
- Read: `.claude/skills/web-design-guidelines/SKILL.md` — accessibility, WCAG compliance

Include relevant patterns and rules from these skills in the plan's "Patterns to Follow" section. Don't dump entire skill contents — extract only what's relevant to this feature.

### Phase 3: Plan Structure Generation

Structure synthesized context into comprehensive plan:

```markdown
# Feature: <feature-name>

## Context Note

This plan is based on:
- /prime output from [codebase analysis]
- Conversation with user on [date]
- Ad-hoc agent research during discussion
- Decisions and requirements clarified collaboratively

## Feature Description

<Detailed description synthesized from conversation>

From conversation: [Reference specific parts]

## User Story

As a <type of user>
I want to <action/goal>
So that <benefit/value>

## Problem Statement

<What problem this solves>

## Solution Statement

<How we agreed to solve it>

## Feature Metadata

**Feature Type**: [New Capability/Enhancement/Refactor/Bug Fix]
**Estimated Complexity**: [Low/Medium/High]
**Primary Systems Affected**: [List of main components]
**Dependencies**: [External libraries/services required]

## Execution Strategy

**Recommended**: `/execute-small` or `/execute-big`

**Analysis:**
- Total tasks: [count]
- Independent workstreams: [yes/no — can tasks run in parallel?]
- Same-file conflicts: [yes/no — do tasks touch the same files?]

**Recommendation rationale:** [Why this execution mode fits]

> Use `/execute-small` for 1-5 sequential tasks or tasks touching same files.
> Use `/execute-big` for 4+ tasks with independent workstreams (e.g., backend + frontend + tests).

---

## DECISIONS FROM CONVERSATION

### Architecture Choices

**[Decision 1]:**
- What: [What was decided]
- Why: [Rationale from conversation]
- Context: [Relevant discussion points]

### Phased Approach

**Phase 1 (NOW - In Scope):**
- [Feature/functionality to implement now]
- Why now: [Reason discussed]

**Phase 2 (LATER - Deferred):**
- [Feature/functionality to defer]
- Why later: [Reason for deferral]

### Rejected Alternatives

**[Alternative]:**
- What: [What was considered]
- Why rejected: [Reason from discussion]

### User Preferences & Constraints

**Technical Preferences:**
- [Library/framework preference] - Why: [User's reasoning]

**Constraints:**
- [Constraint] - Impact: [How it affects implementation]

**Quality Expectations:**
- [Test coverage, performance, security requirements]

### Edge Cases & Error Scenarios

- **[Edge Case]:** [Description] - Solution: [Agreed approach]

---

## CONTEXT REFERENCES

### Relevant Codebase Files (From /prime + Conversation)

IMPORTANT: READ THESE FILES BEFORE IMPLEMENTING!

- `path/to/file.ts` (lines X-Y)
  - Why relevant: [From conversation/agent research]
  - Pattern to follow: [Specific pattern discussed]

### New Files to Create

- `path/to/new_service.ts` - [Purpose from conversation]
- `tests/path/to/test_service.ts` - [Test strategy discussed]

### Relevant Documentation (From web-researcher)

YOU SHOULD READ THESE BEFORE IMPLEMENTING!

- [Documentation Link](https://example.com/doc#section)
  - Specific section: [What to focus on]
  - Why: [Reason from conversation]
  - Researched because: [Context from discussion]

### Patterns to Follow

**Pattern: [Pattern Name]**

From: `existing/file.ts:123-145`

```typescript
// Actual code example from codebase
[Include relevant snippet]
```

**Why this pattern:** [Reason discussed]
**Apply to:** [Which part of new implementation]

### Key Findings from Agent Research

**From codebase-locator:** [Finding] - Relevance: [Why matters]
**From codebase-analyzer:** [Finding] - Implication: [How affects plan]
**From pattern-finder:** [Finding] - Application: [How we'll use]
**From web-researcher:** [Finding] - Action: [What we'll do]

**From Specialized Planning Agents (if used):**
**From type-design-analyzer:** [Type design assessment] - Quality: [Encapsulation/invariant ratings]
**From docs-impact-agent:** [Docs requiring updates] - Action: [What to update]
**From silent-failure-hunter:** [Error handling issues] - Fix: [How to address]

---

## IMPLEMENTATION PLAN

### Phase 1: Foundation

<Describe foundational work from conversation>

**Tasks:**
- [Task aligned with discussed approach]

**Why this order:** [Rationale from conversation]

### Phase 2: Core Implementation

<Describe main implementation from conversation>

**Tasks:**
- [Implementation task]

**Pattern to follow:** [Reference to conversation/agent findings]

### Phase 3: Integration

<Describe integration approach from conversation>

**Tasks:**
- [Integration task]

**Existing integration points:** [From /prime + conversation]

### Phase 4: Testing & Validation

<Describe testing approach from conversation>

**Tasks:**
- [Test implementation]

**Quality bar:** [From user's expectations]

---

## STEP-BY-STEP TASKS

IMPORTANT: Execute every task in order. Each task is atomic and independently testable.

### {ACTION} {target_file}

- **IMPLEMENT**: {Specific implementation detail from conversation}
- **PATTERN**: {Reference to existing pattern - file:line from agent research}
- **IMPORTS**: {Required imports and dependencies}
- **WHY**: {Reason from conversation}
- **VALIDATE**: `{executable validation command}`

Example:

### CREATE src/auth/login.ts

- **IMPLEMENT**: Email/password login with JWT generation
- **PATTERN**: Follow JWT pattern from src/api/auth.ts:56-72
- **IMPORTS**: bcrypt, jsonwebtoken
- **WHY**: User wants traditional login, reusing JWT pattern for consistency
- **VALIDATE**: `npm test src/auth/login.test.ts`

### UPDATE src/models/user.ts

- **IMPLEMENT**: Add password hash field to User model
- **PATTERN**: Field definition style from existing User model
- **IMPORTS**: None (model extension)
- **WHY**: Store hashed passwords for authentication (discussed in conversation)
- **VALIDATE**: `npm run type-check`

[Continue with all tasks in dependency order...]

---

## TESTING STRATEGY

### Unit Tests

Scope: [From discussion]

- Test [functionality] because [reason from conversation]
- Test [edge case] because [discussed concern]
- Follow existing test patterns in [location from /prime]

### Integration Tests

Scope: [From discussion of integration points]

- Test [integration scenario] because [reason from conversation]
- Validate [workflow] end-to-end

### Edge Cases (From Conversation)

These specific edge cases MUST be tested:

- **[Edge Case]:** [Test approach]

### Test Patterns to Follow

From /prime and existing codebase:
- [Test framework]: [Location of examples]
- [Assertion style]: [Reference to existing tests]
- [Mock strategy]: [Pattern from codebase]

---

## VALIDATION COMMANDS

Execute every command to ensure zero regressions and 100% feature correctness.

### Level 1: Syntax & Style

```bash
# TypeScript type checking
[command from /prime or conversation]

# Linting
[command from project]

# Formatting
[command from project]
```

**Expected**: All commands pass with exit code 0

### Level 2: Unit Tests

```bash
# Run all tests
[test command from conversation/prime]

# Run with coverage
[coverage command if discussed]
```

**Expected**: [Coverage target from conversation]

### Level 3: Integration Tests

```bash
# Integration test command
[command from project]
```

**Expected**: [Pass criteria from conversation]

### Level 4: Manual Validation

1. [Manual test step from discussion]
2. [Manual verification step]
3. [Acceptance criteria check]

---

## ACCEPTANCE CRITERIA

From conversation - these define "done":

- [ ] [Criterion 1 from user's requirements]
- [ ] [Criterion 2 from user's requirements]
- [ ] All validation commands pass with zero errors
- [ ] Tests cover edge cases discussed in conversation
- [ ] Code follows patterns from /prime and agent research
- [ ] No regressions in existing functionality
- [ ] [Quality bar from conversation]

---

## DEFERRED ITEMS

### Phase 2 Features
- **[Feature]**: [Why deferred - from conversation]

### Future Enhancements
- **[Enhancement]**: [Context from conversation]

### Known Limitations
- **[Limitation]**: [Accepted trade-off from discussion]

---

## NOTES & CONTEXT

### Conversation Summary

Key points from planning discussion:
- [Important point 1]
- [Important point 2]

### Design Rationale

Why we chose this approach:
- [Reason 1 from conversation]
- [Reason 2 from conversation]

### Assumptions Made

- [Assumption] - Based on: [Conversation context]

### Questions Answered

- Q: [Question raised] → A: [Answer/decision]

### For Future Reference

Important context for anyone reading this plan later:
- [Context that explains WHY not just WHAT]
- [Background that motivated decisions]
- [Constraints that shaped the approach]
```

## Output Format

**Filename**: `.agents/plans/{kebab-case-descriptive-name}.md`

Replace `{kebab-case-descriptive-name}` with short, descriptive feature name (e.g., `user-authentication.md`, `real-time-notifications.md`)

**Directory**: Create `.agents/plans/` if it doesn't exist

## Update Project Status

After saving the plan, update `.agents/STATUS.md`:

1. Find the matching feature row in the Features table
2. Update: Status → `planned`, Plan → link to plan file, Updated → today's date
3. If no matching row exists (feature not in PRD), add a new row
4. Update "Current Focus" if this is the next feature to implement
5. Add entry to "Recent Activity": `- [date]: [Feature name] plan created`

## Quality Criteria

### Length & Conciseness ✓
- [ ] **Total plan: 500-650 lines maximum** (HARD LIMIT: never exceed 700 lines)
- [ ] Concise but comprehensive - every line adds value
- [ ] Verbose explanations avoided - focus on actionable details
- [ ] Code examples minimal - only when clarifying complex patterns
- [ ] Tasks described efficiently without unnecessary elaboration

**Why this matters**: Plans over 700 lines become unwieldy and hard to maintain. Keep it actionable and scannable.

### Conversation Fidelity ✓
- [ ] Plan reads like: "Based on our conversation, here's the structured plan"
- [ ] Decisions traceable to conversation points
- [ ] Nuances preserved (now vs later, why choices, rejected alternatives)
- [ ] User's voice and preferences evident

### Context Integration ✓
- [ ] /prime findings referenced and used
- [ ] Agent outputs from conversation integrated
- [ ] Existing patterns from codebase incorporated

### Implementation Readiness ✓
- [ ] Another developer could execute without additional context
- [ ] Tasks ordered by dependency
- [ ] Each task has WHY from conversation
- [ ] Validation commands are executable

### Scribe Quality ✓
- [ ] Plan CAPTURES conversation, doesn't INVENT
- [ ] Reads naturally, not robotically
- [ ] Would make sense to user reading it 6 months later

## Final Validation

Before saving the plan, verify:

1. **Length check**: Is the plan 500-650 lines? (NEVER exceed 700 lines - if over, condense)
2. **As the user**: Does it capture what you discussed? Are your decisions clear?
3. **As implementation agent**: Is there enough context? Are the WHYs clear?
4. **Conversation alignment**: Every major decision documented? Deferred items noted? Edge cases captured?

**If plan exceeds 650 lines:**
- Remove verbose explanations
- Condense task descriptions
- Reduce code examples to minimal references
- Focus on actionable details only

## Report

After creating the plan, provide:

```markdown
## Plan Created: [feature-name]

**File**: `.agents/plans/{feature-name}.md`

**Based On:**
- /prime output: [Brief summary]
- Conversation: [Key requirements and decisions]
- Agents used: [List agents and contributions]

**Key Decisions Captured:**
1. [Decision 1]
2. [Decision 2]
3. [Decision 3]

**Scope:**
- NOW: [What's in Phase 1]
- LATER: [What's deferred]

**Confidence**: [Score]/10 for one-pass implementation

**Recommendations:**
- [Any suggestions for user to review/confirm]
- [Any remaining uncertainties to clarify]
```
