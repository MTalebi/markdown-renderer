# Markdown Renderer App

A simple, self-contained web app to render any remote Markdown file with advanced features (math, code, diagrams, front matter, etc.) in a beautiful, blog-like format.

## Features
- Renders any Markdown file from a public URL (GitHub, GitLab, etc.)
- Supports YAML front matter for title, author, date, tags, etc.
- MathJax for LaTeX math (with equation numbering)
- Syntax highlighting for code blocks
- Mermaid diagrams
- GitHub-style markdown styling
- No navigation, header, or footer—just the content

## Usage
1. **Deploy the app** (copy the folder to your web server or static site hosting)
2. **Link to any markdown file** by prepending the app's URL and using the `?link=` parameter:

```
https://mtalebi.github.io/markdown-renderer/?link=https://raw.githubusercontent.com/user/repo/main/file.md
```

- You can share this link or use it as a quick preview for any markdown file.
- The app will display the post title, author, date, and tags if present in the markdown's front matter.

## Example
```
https://mtalebi.github.io/markdown-renderer/?link=https://raw.githubusercontent.com/MTalebi/WebSite-Bloges/main/sample.md
```

## Customization
- Edit `style.css` for appearance.
- The app uses CDN links for all dependencies for easy portability.
- You can add this as a subfolder to any static site or deploy as a standalone app.

## Security
- Only fetches and renders public markdown files.
- Sanitizes HTML output with DOMPurify.

## License
MIT or public domain. Use freely. 