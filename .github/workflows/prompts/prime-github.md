# Prime: Load Project Context

## GitHub Context

- **Repository**: $REPOSITORY
- **Triggered By**: $TRIGGERED_BY

## Objective

Build comprehensive understanding of the codebase by analyzing structure, documentation, and key files.

## Process

### 1. Analyze Project Structure

List all tracked files:

```bash
git ls-files
```

Show directory structure:

```bash
# On Linux/Mac
tree -L 3 -I 'node_modules|__pycache__|.git|dist|build'

# On Windows or if tree not available
find . -type d -not -path '*/\.*' -not -path '*/node_modules/*' -not -path '*/__pycache__/*' | head -50
```

### 2. Read Core Documentation

Read these files to understand project standards:
- CLAUDE.md (or similar global rules file)
- README files at project root and major directories
- Any architecture documentation in docs/

### 3. Identify Key Files

Based on the structure, identify and read:
- Main entry points (main.py, index.ts, app.py, etc.)
- Core configuration files (pyproject.toml, package.json, tsconfig.json)
- Key model/schema definitions
- Important service or controller files

### 4. Learn Import & API Call Patterns

**CRITICAL**: Before writing ANY code, study how the existing codebase calls its backend, APIs, and external services. This prevents type errors and incorrect API usage.

Specifically, find and document:
- **How backend functions are called from the frontend** — Look at existing component files that make API calls (e.g., `useQuery`, `useMutation`, `fetch`, tRPC calls, Convex API references, etc.). Copy the exact import style and function reference pattern.
- **Generated type/API files** — Check for auto-generated files (`_generated/`, `__generated__/`, `.generated.`, etc.). Note what modules are registered in these files. New backend files may need codegen to appear.
- **Import conventions** — How are shared types, utilities, and API clients imported? Absolute paths (`@/...`) or relative?
- **Data fetching patterns** — Are there specific hooks, wrappers, or conventions for calling the backend? (e.g., `api.moduleName.functionName` vs string-based references)

**Rule**: When writing new code that calls backend functions, ALWAYS find 2-3 existing examples in the codebase and replicate their exact pattern. Never guess or use patterns from memory that might be outdated.

### 5. Understand Current State

Check recent activity:

```bash
git log -10 --oneline
```

Check current branch and status:

```bash
git status
```

## Output Report

Provide a concise summary:

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

### Import & API Patterns
- How backend/API functions are called (exact import + call syntax)
- Generated type files and what modules they include
- Data fetching hooks or wrappers used
- Example: show 1-2 actual code snippets of existing API calls to replicate

### Core Principles
- Code style and conventions observed
- Documentation standards
- Testing approach
- Logging patterns

### Current State
- Active branch
- Recent changes or development focus
- Any immediate observations or concerns

**Make this summary easy to scan - use bullet points and clear headers.**

## Priming Complete

Context loaded. Ready for planning or implementation tasks.
