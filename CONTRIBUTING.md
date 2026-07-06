# Contributing to Sabot Drug Lists

First off, thank you for considering contributing to Sabot Drug Lists! We appreciate your time and effort in helping to improve this project.

## How Can I Contribute?

### Reporting Bugs

If you find a bug, please open an issue in the GitHub repository. Include as much detail as possible: steps to reproduce, expected behavior, and actual behavior.

### Suggesting Enhancements

We welcome suggestions for new features or improvements. Please open an issue outlining your idea, why it would be useful, and any potential implementation details.

### Pull Requests

We gladly accept pull requests! If you're ready to contribute code, please follow these steps:

1. **Fork the repository** on GitHub.
2. **Clone your fork** locally:

   ```bash
   git clone https://github.com/suradet-ps/sabot-drug-lists.git
   cd sabot-drug-lists
   ```

3. **Create a new branch** for your feature or bug fix:

   ```bash
   git checkout -b feature/your-feature-name
   ```

   _Tip: Use descriptive branch names like `fix/login-bug` or `feat/export-csv`._

4. **Make your changes** and commit them with clear, descriptive messages.
5. **Push your branch** to your fork on GitHub:

   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request** against the `main` branch of the original repository.

## Local Development Setup

To test your changes locally, follow the setup instructions in the [README.md](README.md):

1. Install dependencies: `bun install`
2. Configure `.env` with your Supabase credentials.
3. Start the development server: `bun run dev`
4. Run ESLint to ensure code matches formatting guidelines: `bun run lint`

## Code Style Requirements

- We use **Vue 3 `<script setup>`** and **Composition API**.
- Styling is done via **Tailwind CSS**. Avoid using inline styles.
- State management uses **Pinia**.
- Make sure to review any linting errors before committing.

Thank you for your contributions!
