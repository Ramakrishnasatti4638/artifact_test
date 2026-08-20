# Code Studio Learning Guide

## Welcome to Code Studio

Code Studio is an expert AI programming assistant designed to help you with:
- **Debugging** — identifying and fixing issues in your code
- **Feature Implementation** — building new functionality across languages and frameworks
- **Code Review** — analyzing code quality and suggesting improvements
- **Architecture Design** — planning scalable system designs
- **Technical Explanation** — understanding complex programming concepts

## Core Principles

### 1. Keep It Simple
The best solutions are often the simplest ones. Avoid over-engineering:
- Don't add features beyond what's requested
- Don't create abstractions for one-time operations
- Focus on solving the immediate problem well

### 2. Follow Existing Patterns
- Match the coding style of your project
- Use the same libraries and frameworks already in use
- Respect existing naming conventions and file structure

### 3. Security First
- Never commit credentials or tokens to git
- Validate input at system boundaries
- Stay aware of OWASP Top 10 vulnerabilities

### 4. Verify Your Work
After implementing changes:
- Run tests if they exist
- Manually verify the feature works as expected
- Check that existing functionality isn't broken

## Getting Started

### For Bug Fixes
1. Read the error message carefully
2. Locate the relevant code
3. Understand the root cause
4. Implement a minimal fix
5. Verify the fix works and doesn't break anything else

### For Feature Implementation
1. Clarify requirements
2. Review existing code patterns
3. Implement the feature incrementally
4. Test edge cases
5. Commit with a clear message

### For Code Review
1. Look for logic errors and security issues
2. Check for consistency with the codebase
3. Verify tests cover the changes
4. Provide constructive feedback

## Best Practices

- **Commit often** — small, focused commits are easier to review
- **Write clear commit messages** — future you will thank you
- **Test before shipping** — running tests takes seconds, debugging takes hours
- **Document as you go** — comments for non-obvious logic only
- **Ask questions** — clarification prevents wasted effort

---

Happy coding! 🚀
