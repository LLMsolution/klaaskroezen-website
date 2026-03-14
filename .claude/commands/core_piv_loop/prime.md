---
description: Prime agent with codebase understanding
---

# Prime: Load Project Context

## Objective

Build comprehensive understanding of the codebase by analyzing structure, documentation, key files, and leveraging Archon's knowledge base for research.

## CRITICAL: Archon Integration

**BEFORE starting analysis:**
1. Check for existing Archon projects: `mcp__archon__find_projects()`
2. If planning a new feature, consider creating an Archon project
3. Use Archon RAG for research throughout priming process

## Process

### 1. Check Archon Context

**List existing projects:**
```
mcp__archon__find_projects()
```

**If you're priming for a specific feature:**
- Check if project already exists for this feature
- If yes: Load project tasks and documents
- If no: Consider creating project after priming (optional)

### 2. Analyze Project Structure

List all tracked files:
!`git ls-files`

Show directory structure:
On Linux, run: `tree -L 3 -I 'node_modules|__pycache__|.git|dist|build'`

### 3. Read Core Documentation

- Read `.agents/STATUS.md` (if exists) — project dashboard with feature status
- Read PRD.md (if exists)
- Read CLAUDE.md or similar global rules file
- Read README files at project root and major directories
- Read any architecture documentation

### 3a. Adaptive Subagent Analysis

Detect the codebase type and call the appropriate analyst agents in parallel:

**Always call:**
- codebase-analyst (general codebase analysis)

**If frontend detected** (React, Next.js, Vue, Angular — check package.json):
- frontend-analyst

**If backend API detected** (Express, FastAPI, Django, API routes — check for server/API files):
- backend-api-analyst

**If AI/RAG detected** (PydanticAI, LangChain, vector DB — check dependencies):
- rag-pipeline-analyst

Run detected analysts in parallel using the Task tool. Each returns a concise summary.

### 4. Leverage Archon Knowledge Base

**Use Archon RAG for targeted research:**

```bash
# Search for relevant documentation (keep queries SHORT: 2-5 keywords!)
mcp__archon__rag_search_knowledge_base(query="authentication patterns", match_count=5)

# Find code examples
mcp__archon__rag_search_code_examples(query="React hooks", match_count=3)

# Search specific documentation source
# 1. Get available sources
mcp__archon__rag_get_available_sources()
# 2. Filter by source_id
mcp__archon__rag_search_knowledge_base(query="...", source_id="src_xxx")
```

**Research topics based on project type:**
- Next.js/React: Performance patterns, RSC boundaries, caching strategies
- Backend: Authentication, database patterns, API design
- DevOps: Deployment patterns, CI/CD workflows

### 5. Identify Key Files

Based on the structure, identify and read:
- Main entry points (main.py, index.ts, app.py, etc.)
- Core configuration files (pyproject.toml, package.json, tsconfig.json)
- Key model/schema definitions
- Important service or controller files

### 6. Understand Current State

Check recent activity:
!`git log -10 --oneline`

Check current branch and status:
!`git status`

**Check Archon state:**
- Active tasks: `mcp__archon__find_tasks(filter_by="status", filter_value="doing")`
- Recent tasks: `mcp__archon__find_tasks(filter_by="status", filter_value="review")`

## Output Report

Provide a concise summary covering:

### Project Dashboard (from STATUS.md)
- Features overview with current statuses
- Current focus / what's in progress
- Recent activity

### Archon Context
- Existing projects and their status
- Active tasks (if any)
- Relevant knowledge base sources discovered

### Project Overview
- Purpose and type of application
- Primary technologies and frameworks
- Current version/state

### Architecture
- Overall structure and organization
- Key architectural patterns identified
- Important directories and their purposes

### Tech Stack
- Languages and versions
- Frameworks and major libraries
- Build tools and package managers
- Testing frameworks

### Core Principles
- Code style and conventions observed
- Documentation standards
- Testing approach

### Current State
- Active branch
- Recent changes or development focus
- Any immediate observations or concerns

**Make this summary easy to scan - use bullet points and clear headers.**
