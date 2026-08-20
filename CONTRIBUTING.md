# Contributing to URL Shortener

Thank you for your interest in contributing! This document provides guidelines and requirements for contributing to this project.

## Azure Task ID Requirement

**All pull requests must be linked to an Azure DevOps Task ID.** This is a mandatory requirement for this Syncfusion Gitea repository.

### Why Azure Task IDs?

Azure Task IDs provide:
- **Traceability**: Link code changes to business requirements
- **Project Management**: Integration with Azure DevOps for sprint tracking
- **Accountability**: Clear ownership and context for changes
- **Audit Trail**: Complete history of what was changed and why

## Creating a Pull Request

### Step 1: Create or Link to an Azure Task

1. Go to [Azure DevOps](https://dev.azure.com)
2. Navigate to your project
3. Go to Backlogs → Create a new Task (or use an existing Task)
4. Note your Task ID (e.g., `Task-1234` or `AB#5678`)

### Step 2: Include Azure Task ID in Your PR

You **must** include the Azure Task ID in your PR title or description.

#### Supported Task ID Formats

- **Standard Format**: `Task-12345` or `task-12345`
- **Azure Format**: `AB#12345` (where AB is your project prefix)
- **Any Format**: As long as it contains the Azure Task ID identifier

#### PR Title Examples

✅ **Valid PR Titles:**
```
Add URL validation feature (Task-1234)
Fix redirect bug - AB#5678
Implement analytics tracking (TASK-9012)
Improve performance Task-4567
```

❌ **Invalid PR Titles (without Task ID):**
```
Add new feature
Fix bug
Update documentation
Improve performance
```

### Step 3: Use the PR Template

When you create a PR on GitHub, a template will automatically appear. Fill in all required fields, especially the **Azure Task ID** field.

## Setting Up Local Git Hooks (Optional)

To enable automatic reminders about including Azure Task IDs in commit messages:

```bash
npm run setup-hooks
```

This will:
- Configure git to use `.githooks/` directory
- Make hooks executable
- Add prepare-commit-msg hook for reminders

### What the Hooks Do

- **prepare-commit-msg**: Adds a reminder comment if your commit message doesn't include an Azure Task ID
  - This is a **warning only** and won't prevent commits
  - Useful for developers to remember to add Task IDs to PR descriptions

## Validation Process

### Local Validation (Optional)

After running `npm run setup-hooks`, you'll see reminders in your commit editor if a Task ID is missing.

### Automated PR Validation

When you create or update a PR, GitHub Actions automatically runs a workflow that:

1. Checks for Azure Task ID in PR title
2. Checks for Azure Task ID in PR description
3. **Fails the check if no Task ID is found**
4. Provides helpful error message with supported formats

**The PR must pass validation before it can be merged.**

## Troubleshooting

### "PR validation failed: Azure Task ID not found"

**Solution:** Update your PR title or description to include the Azure Task ID.

**Examples:**
- Edit PR title to: "Feature name (Task-1234)"
- Or add to PR description: "**Task ID:** AB#5678"

### "I don't have an Azure Task ID yet"

**Steps to create one:**

1. Open [Azure DevOps](https://dev.azure.com)
2. Select your project
3. Go to **Backlogs** section
4. Click **+ New item** or use the context menu
5. Create a new **Task** with details about your work
6. Copy the Task ID (e.g., "Task-1234")
7. Add it to your PR title or description

### "The task ID format isn't recognized"

The workflow validates these patterns:
- `Task-XXXXX` or `TASK-XXXXX` (where X = digits)
- `[PREFIX]#XXXXX` (e.g., `AB#5678`)
- Azure DevOps task identifiers

If your Task ID still isn't recognized, contact the team lead or open an issue.

## Development Workflow

1. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Create or identify an Azure Task ID**

3. **Make your changes and commit**:
   ```bash
   git add .
   git commit -m "Your descriptive message"
   ```

4. **Push your branch**:
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request** including the Task ID:
   - In PR title: `Feature description (Task-1234)`
   - Or in PR description: Include the Task ID in the template field

6. **Wait for validation**:
   - GitHub Actions will check for Azure Task ID
   - Address any validation failures
   - Proceed with code review once validation passes

## Code Quality Standards

- Follow existing code style and conventions
- Write clear, descriptive commit messages
- Include comments for complex logic
- Add tests for new features
- Update documentation as needed

## Questions?

If you have questions about:
- **Azure Task IDs**: Contact your project manager or team lead
- **Repository contribution**: Open an issue or ask in the project chat
- **Technical setup**: Check the main README.md

## Gitea-Specific Notes

This is a Syncfusion Gitea repository with Azure DevOps integration. The Azure Task ID requirement ensures:
- Compliance with Syncfusion project management standards
- Traceability for quality assurance
- Better integration between code repositories and project management tools

Thank you for following these guidelines! Your contributions are valuable to the project.
