# Contributing to Buddhist Quotes Platform

Thank you for your interest in contributing to the Buddhist Quotes Platform! This document provides guidelines and instructions for contributing to this project.

## 🌟 Ways to Contribute

- Report bugs and issues
- Suggest new features or improvements
- Submit quotes, proverbs, or folk songs
- Improve documentation
- Fix bugs or implement features
- Improve code quality and performance

## 🐛 Reporting Issues

When reporting issues, please include:

1. **Clear title**: Describe the issue concisely
2. **Description**: Provide detailed information about the problem
3. **Steps to reproduce**: List exact steps to reproduce the issue
4. **Expected behavior**: What you expected to happen
5. **Actual behavior**: What actually happened
6. **Environment**: Browser, OS, screen size (if relevant)
7. **Screenshots**: Visual evidence (if applicable)

## 💡 Suggesting Features

Feature requests are welcome! Please provide:

1. **Clear title**: Concise feature description
2. **Use case**: Why this feature would be useful
3. **Proposed solution**: How you envision it working
4. **Alternatives**: Any alternative solutions you've considered
5. **Buddhist context**: How it aligns with the project's spiritual theme

## 📝 Submitting Quotes

To add new Buddhist quotes, Vietnamese proverbs, or Ca Dao:

1. Fork the repository
2. Edit `public/data/quotes.json`
3. Add your entry following this format:

```json
{
  "id": "q999",
  "content": "Your quote text in Vietnamese or English",
  "author": "Author name or 'Unknown'",
  "category": "quote",
  "type": "Quote"
}
```

**Categories**:
- `quote`: Buddhist teachings (Lời Phật Dạy)
- `proverb`: Vietnamese proverbs (Tục Ngữ)
- `cadao`: Vietnamese folk songs (Ca Dao)

**Guidelines**:
- Ensure proper Vietnamese diacritics (ắ, ằ, ẳ, ẵ, ặ)
- Use UTF-8 encoding
- Verify quotes are accurate and properly attributed
- Prefer public domain or freely licensed content
- Keep content appropriate and aligned with Buddhist values

## 🔧 Development Workflow

### Setup

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/Quotes-Platform.git
cd Quotes-Platform/quotes-platform

# Install dependencies
npm install

# Start development server
ng serve
```

### Branching Strategy

- `main`: Production-ready code
- `develop`: Integration branch for features
- Feature branches: `feature/your-feature-name`
- Bug fixes: `fix/issue-description`

### Making Changes

1. **Create a branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**:
   - Follow the coding standards (see below)
   - Write clear, descriptive commit messages
   - Test your changes thoroughly

3. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

4. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Submit a Pull Request**:
   - Provide a clear title and description
   - Reference any related issues
   - Explain what you changed and why
   - Include screenshots for UI changes

## 📐 Coding Standards

### TypeScript

- Use TypeScript strict mode
- Prefer `const` over `let`, avoid `var`
- Use meaningful variable names: `displayCount` not `dc`
- Add type annotations for function parameters and returns
- Use interfaces for complex object shapes

```typescript
// ✅ Good
function getQuoteById(id: string): Quote | undefined {
  return quotes.find(q => q.id === id);
}

// ❌ Bad
function getQ(i) {
  return quotes.find(q => q.id === i);
}
```

### Angular

- Use Angular 18+ standalone components
- Prefer signals over traditional change detection
- Use dependency injection for services
- Follow Angular style guide naming conventions:
  - Components: `quote-card.component.ts`
  - Services: `rotation.service.ts`
  - Models: `quote.model.ts`

```typescript
// ✅ Good
export class QuoteCardComponent {
  quote = input.required<Quote>();
  displayText = computed(() => this.quote().content);
}

// ❌ Bad
export class QuoteCard {
  @Input() q: any;
}
```

### SCSS

- Use BEM naming convention: `.quote-card__title`
- Use CSS custom properties for theming
- Mobile-first responsive design
- Keep selectors shallow (max 3 levels deep)

```scss
// ✅ Good
.quote-card {
  background: var(--bg-card);
  
  &__title {
    color: var(--primary-gold);
  }
}

// ❌ Bad
#container .quote .card .title {
  color: #D4AF37;
}
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code formatting (no logic change)
- `refactor`: Code restructuring (no behavior change)
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat: add font selection dropdown to quote grid
fix: quote font not persisting after page reload
docs: update README with deployment instructions
refactor: extract quote filtering logic to service
```

## 🧪 Testing

Before submitting a PR:

1. **Manual testing**:
   - Test on desktop (Chrome, Firefox, Safari)
   - Test on mobile (iOS Safari, Chrome Mobile)
   - Verify all features work as expected
   - Check responsive layout (320px to 4K)

2. **Unit tests** (if applicable):
   ```bash
   npm test
   ```

3. **Build verification**:
   ```bash
   ng build --configuration production
   ```

## ♿ Accessibility

Ensure your changes meet accessibility standards:

- Use semantic HTML (`<button>` not `<div onclick>`)
- Add ARIA labels for screen readers
- Maintain keyboard navigation
- Ensure minimum 44x44px touch targets
- Maintain readable contrast ratios
- Test with screen readers (NVDA, VoiceOver)

## 🎨 Design Guidelines

Follow the Buddhist-inspired design theme:

- **Colors**: Warm browns, golds (#D4AF37), cornsilk backgrounds
- **Typography**: Serif fonts (Noto Serif, Georgia, Merriweather)
- **Spacing**: Generous whitespace for peaceful aesthetics
- **Animations**: Smooth, gentle transitions (no jarring effects)
- **Language**: Respectful tone aligned with Buddhist values

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## ❓ Questions?

- Open an issue for general questions
- Tag maintainers for urgent matters
- Check existing issues before creating new ones

## 🙏 Code of Conduct

- Be respectful and considerate
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Maintain a peaceful, mindful environment
- Uphold Buddhist values of compassion and wisdom

---

Thank you for contributing to the Buddhist Quotes Platform! May your code bring wisdom and peace to all users. 🙏

_Sādhu! Sādhu! Sādhu!_ (Well done! Well done! Well done!)
