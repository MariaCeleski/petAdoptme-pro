# Contributing Guide

## Development Workflow

1. **Create feature branch**
\`\`\`bash
git checkout -b feature/your-feature-name
\`\`\`

2. **Make changes**
- Follow existing code style
- Write tests for new features
- Update documentation

3. **Commit**
\`\`\`bash
git commit -m "feat: description of change"
\`\`\`

Use conventional commits:
- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation
- `refactor:` code refactoring
- `test:` adding tests
- `chore:` maintenance

4. **Push**
\`\`\`bash
git push origin feature/your-feature-name
\`\`\`

5. **Open Pull Request**
- Write clear PR description
- Link related issues
- Wait for review

6. **Merge**
After approval:
\`\`\`bash
git checkout main
git pull origin main
git merge feature/your-feature-name
\`\`\`

## Code Style

- TypeScript for type safety
- ESLint for linting
- Prettier for formatting

\`\`\`bash
pnpm lint
pnpm format
\`\`\`

## Testing

Write tests for:
- New features
- Bug fixes
- Critical paths

\`\`\`bash
pnpm test
pnpm test:watch
\`\`\`

## Documentation

Update docs when:
- Adding new endpoints
- Changing data models
- Modifying configuration
- Adding new dependencies

## Code Review

- Be respectful and constructive
- Ask questions to understand changes
- Suggest improvements
- Approve when satisfied

## Project Structure

- `apps/web/` - Frontend application
- `apps/api/` - Backend API
- `packages/` - Shared code
- `docs/` - Documentation

## Questions?

- Check existing issues/discussions
- Ask in GitHub Discussions
- Review similar implementations

## License

By contributing, you agree your code will be MIT licensed.
