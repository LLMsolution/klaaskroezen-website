# .claude Directory - LLM Development System

Universeel AI-development systeem dat werkt voor elke codebase — van simpele scripts tot complexe full-stack applicaties. Auto-detecteert je stack en past agents, skills en validatie automatisch aan.

---

## Hoe Het Werkt

### De Workflow (PIV Loop)

```
/prime → gesprek → /plan-feature → /execute-small of /execute-big → /validate → /commit
```

| Stap | Command | Wat het doet |
|------|---------|-------------|
| 1. Context laden | `/prime` | Analyseert codebase, detecteert stack, leest STATUS.md |
| 2. Sparring | (gesprek) | Bespreek requirements, gebruik Archon RAG voor research |
| 3. Plan maken | `/plan-feature <naam>` | Schrijft plan naar `.agents/plans/<naam>.md` |
| 4. Uitvoeren | `/execute-small <plan>` | Sequentieel, 1 agent, schrijft tests mee (1-5 taken) |
| | `/execute-big <plan>` | Parallel, multi-agent teams, elke agent test eigen domein (4+ taken) |
| 5. Valideren | `/validate` | Code-analyse: type/lint/test/build + agents (auto-detect) |
| | `/code-review-fix <rapport>` | Fix issues uit validatie-rapport, daarna re-validate |
| | `/test-frontend URL` | Browser-testen: visueel, functioneel, responsive, alle devices |
| 6. Committen | `/commit` of `/commit pr` | Git commit + push, optioneel PR aanmaken |

### Project Status Dashboard

`.agents/STATUS.md` wordt automatisch bijgehouden door alle commands:

| Command | Effect op STATUS.md |
|---------|---------------------|
| `/create-prd` | Maakt dashboard aan, features als `backlog` |
| `/plan-feature` | Feature → `planned` |
| `/execute-small` / `/execute-big` | Feature → `in-progress` → `done` |
| `/commit pr` | Voegt PR link toe |

**Statusflow:** `backlog` → `planned` → `in-progress` → `done`

---

## Workflows

### Nieuw Project

```bash
# 1. Brainstorm → PRD
/create-prd                    # Genereert PRD.md + STATUS.md

# 2. Nieuw gesprek per feature
/prime                         # Laad context + STATUS.md
# [bespreek feature]
/plan-feature <feature-naam>   # Plan naar .agents/plans/

# 3. Nieuw gesprek voor uitvoering
/execute-small <plan-file>     # Of /execute-big voor grote features
/validate                      # Code-analyse (auto-detect)
# Bij issues: /code-review-fix .agents/reviews/validate-YYYY-MM-DD.md
/test-frontend URL             # Browser-testen (optioneel, na UI wijzigingen)
/commit pr                     # Commit + PR
```

### Bestaand Project

```bash
/prime                         # Laad context, zie STATUS.md voor voortgang
# [bespreek feature]
/plan-feature <feature-naam>
# Nieuw gesprek →
/execute-small <plan-file>
/validate                      # Code-analyse
# Bij issues: /code-review-fix .agents/reviews/validate-YYYY-MM-DD.md
/test-frontend URL             # Browser-testen (optioneel)
/commit pr
```

### Bug Fix (GitHub)

```bash
/github_bug_fix:rca <issue>           # Root Cause Analysis
/github_bug_fix:implement-fix <issue> # Fix + PR automatisch
```

---

## Validatie

### Code-analyse (`/validate`)

Auto-detecteert je stack, draait juiste checks:

```bash
/validate                  # Default: --review (voor commit)
/validate --quick          # Alleen type/lint/test/build
/validate --full           # Alles (voor PR merge)
```

| Level | Checks | Wanneer |
|-------|--------|---------|
| `--quick` | TypeScript, ESLint, tests, build | Tijdens development |
| `--review` | + code-reviewer, silent-failure-hunter + frontend code skills (auto-detect) | Voor commit (default) |
| `--full` | + pr-test-analyzer, dependency-auditor, stack-specifieke validators | Voor PR merge |

Bij issues schrijft `/validate` een rapport naar `.agents/reviews/validate-YYYY-MM-DD.md`.
Fix met: `/code-review-fix .agents/reviews/validate-YYYY-MM-DD.md`

### Browser-testen (`/test-frontend`)

Runtime testing in een echte browser op alle devices:

```bash
/test-frontend URL                 # Test gewijzigde routes (default: --changes)
/test-frontend --full URL          # Test ALLE routes, ALLE features
```

| Mode | Wat het test | Wanneer |
|------|-------------|---------|
| `--changes` | Gewijzigde routes/features op desktop, tablet, mobiel | Na feature/bugfix (default) |
| `--full` | Alle routes, alle features, alle devices | Nieuw project, release check |

---

## Directorystructuur

```
.claude/
├── agents/                    # Gespecialiseerde review agents
│   ├── 01-discovery/         # Codebase exploratie (4 agents)
│   ├── 02-quality/           # Code quality & security (10 agents)
│   ├── 03-testing/           # Test coverage (1 agent)
│   ├── 04-refactoring/       # Code simplification (1 agent)
│   ├── 05-documentation/     # Docs impact (1 agent)
│   ├── 06-architecture/      # Architecture planning (2 agents)
│   ├── 07-codebase-analysts/ # Stack-specifieke analyse (4 agents)
│   └── 08-pydantic-ai/       # AI/ML integratie (4 agents)
│
├── commands/                  # Uitvoerbare workflows
│   ├── core_piv_loop/        # prime, plan-feature, execute-small, execute-big
│   ├── validation/           # validate, test-frontend, code-review-fix
│   ├── workflow/             # commit, create-prd
│   └── github_bug_fix/       # rca, implement-fix
│
└── skills/                    # Expert kennis (auto-geladen door commands)
    ├── next-best-practices/   # Next.js conventies
    ├── vercel-react-best-practices/ # React performance (57 regels)
    ├── vercel-composition-patterns/ # Component patronen
    ├── next-cache-components/ # Caching strategieën
    ├── web-design-guidelines/ # Accessibility, WCAG
    ├── agent-browser/         # Browser automatisering
    ├── build-with-agent-team/ # Multi-agent team builds (/execute-big)
    ├── audit-website/         # SEO, security audit
    ├── copywriting/           # Marketing copy
    ├── humanizer/             # AI-tekst natuurlijk maken
    ├── ast-grep/              # Structureel code zoeken
    └── find-skills/           # Skill discovery
```

---

## Hoe Agents en Skills Automatisch Gebruikt Worden

Je hoeft agents en skills niet handmatig aan te roepen. De commands doen dat automatisch:

| Command | Gebruikt automatisch |
|---------|---------------------|
| `/prime` | codebase-analyst + stack-specifieke analysts (frontend, backend, RAG) |
| `/plan-feature` | Discovery agents voor gaps + stack-specifieke skills (Next.js, React, etc.) |
| `/execute-big` | `build-with-agent-team` skill (multi-agent orchestratie) |
| `/validate --review` | code-reviewer + silent-failure-hunter + frontend code skills (auto-detect) + conditioneel: type-design-analyzer, security-auditor |
| `/validate --full` | + pr-test-analyzer + dependency-auditor + stack-specifieke validators |
| `/test-frontend` | agent-browser skill (visueel, functioneel, responsive, accessibility) |

---

## Task Management: Archon

Alle commands gebruiken Archon MCP voor task tracking:

```bash
# Status: todo → doing → review → done
# Queries kort houden: 2-5 keywords
rag_search_knowledge_base(query="auth JWT", match_count=5)
```

---

## Key Files

| File | Doel |
|------|------|
| `CLAUDE.md` | Uitgebreide project guidelines |
| `.claude/README.md` | Dit bestand (systeem overzicht) |
| `.agents/STATUS.md` | Project dashboard (auto-bijgehouden) |
| `.agents/plans/` | Feature implementatie plannen |
| `.agents/reviews/` | Validatie-rapporten (auto-gegenereerd door `/validate`) |
| `PRD.md` | Product Requirements Document |

---

**Last Updated:** 2026-02-12
