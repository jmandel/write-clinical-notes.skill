# Installing the FHIR Connectathon Notes Testing Skill

## What This Skill Does

The `write-clinical-notes` skill is a comprehensive testing toolkit for the **FHIR Writing Clinical Notes specification**. It helps test DocumentReference write operations at connectathons and in development environments, with support for:

- Multiple authentication modes (OAuth, manual tokens, open servers)
- Document template localization (text/plain, PDF, CDA, XHTML, HTML)
- Automated test scenarios (create, conditional create, status correction, replacement)
- Debug logging and request/response tracking
- Both provider-authored and patient-asserted notes

## Prerequisites

- Claude Code CLI installed and opened in your project directory
- Git installed
- Bun runtime (for running the setup and test scripts)

## Quick Installation

If you're a Claude agent installing this skill in the current project:

```bash
mkdir -p .claude/skills && \
cd .claude/skills && \
git clone https://github.com/jmandel/write-clinical-notes.skill.git write-clinical-notes && \
cd ../..
```

The skill is now installed and will be automatically used when working on FHIR clinical notes testing tasks.

## Detailed Installation Steps

### 1. Navigate to Your Project Directory

```bash
cd ~/your-project
pwd  # Verify you're in the correct location
```

### 2. Create Skills Directory

```bash
mkdir -p .claude/skills
```

### 3. Clone the Skill

```bash
cd .claude/skills
git clone https://github.com/jmandel/write-clinical-notes.skill.git write-clinical-notes
cd ../..
```

### 4. Verify Installation

```bash
ls -la .claude/skills/write-clinical-notes
```

You should see `SKILL.md` and supporting files (assets/, references/).

## Project Structure After Installation

```
your-project/
├── .claude/
│   └── skills/
│       └── write-clinical-notes/
│           ├── SKILL.md                    # Main skill documentation
│           ├── references/                 # Spec and test scenarios
│           └── assets/                     # Templates, scripts, samples
├── [your other project files]
└── [your other project folders]
```

## Using the Skill

Once installed, Claude Code CLI automatically detects and uses this skill when you:
- Set up FHIR server connections for testing
- Localize DocumentReference templates
- Execute connectathon test scenarios
- Debug FHIR API requests/responses

No additional commands needed - Claude reads the skill documentation when relevant.

## Getting Started with Testing

The skill includes an interactive setup wizard to configure FHIR server connections:

```bash
bun .claude/skills/write-clinical-notes/assets/config/setup.ts
```

This launches a web interface at http://localhost:3456 where you can:
- Configure OAuth authentication
- Enter manual access tokens
- Set up open server connections
- Save multiple server configurations

For complete testing workflows, template usage, and test scenarios, refer to the skill's `SKILL.md` documentation.

## Updating the Skill

```bash
cd .claude/skills/write-clinical-notes
git pull origin main
cd ../../..
```

## Uninstalling

```bash
rm -rf .claude/skills/write-clinical-notes
```

## About Project-Level vs Global Installation

This guide uses **project-level installation** (`.claude/skills/` within your project):
- ✅ Version control with your project
- ✅ Easy team sharing
- ✅ Different skills per project
- ✅ No home directory clutter

You can also install globally in `~/.claude/skills/` for use across all projects, but project-level is recommended.

## Resources

- **Skill Repository**: https://github.com/jmandel/write-clinical-notes.skill
- **Claude Code Documentation**: https://docs.claude.com/en/docs/claude-code
- **Report Issues**: Visit the GitHub repository

## Security Note

Skills provide instructions that Claude follows. Only install skills from trusted sources and review the `SKILL.md` file to understand what the skill does.
