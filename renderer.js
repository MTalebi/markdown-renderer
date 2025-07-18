function getMarkdownUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('link');
}
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}
function parseFrontMatter(content) {
  content = content.replace(/^\uFEFF?/, '').trimStart();
  const frontMatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
  const match = content.match(frontMatterRegex);
  if (match) {
    let frontMatter = {};
    let frontMatterContent = match[1];
    let markdownContent = content.slice(match[0].length);
    try {
      frontMatterContent = frontMatterContent
        .replace(/: \[(.*?)\]/g, ': [$1]')
        .replace(/: "(.*?)"/g, ': "$1"')
        .replace(/: '(.*?)'/g, ': "$1"');
      frontMatter = (0, eval)(`({${frontMatterContent.replace(/\r?\n/g, ',')}})`);
    } catch (e) {
      frontMatter = {};
      frontMatterContent.split(/\r?\n/).forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
          const key = line.substring(0, colonIndex).trim();
          let value = line.substring(colonIndex + 1).trim();
          if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          frontMatter[key] = value;
        }
      });
    }
    return { frontMatter, markdownContent };
  }
  return { frontMatter: {}, markdownContent: content };
}
async function fetchMarkdown(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  return await response.text();
}
async function renderMarkdownFromUrl() {
  const url = getMarkdownUrl();
  const contentDiv = document.getElementById('blog-post-content');
  if (!url) {
    contentDiv.innerHTML = '<div class="error">No markdown URL provided. Use ?link=URL</div>';
    return;
  }
  contentDiv.innerHTML = '<div class="loading">Loading markdown...</div>';
  try {
    const md = await fetchMarkdown(url);
    const { frontMatter, markdownContent: originalMarkdownContent } = parseFrontMatter(md);
    let markdown = originalMarkdownContent.replace(/^---[\s\S]*?---\s*/, '');
    let post = frontMatter;
    if (!post || Object.keys(post).length === 0) {
      post = {
        title: url.split('/').pop().replace(/\.md$/, ''),
        author: 'Unknown Author',
        readTime: '2 min read',
        date: '',
        tags: ['sample', 'markdown'],
        description: 'No description available.',
        category: 'general'
      };
    }
    // Post header
    const postHeader = `
      <header class="post-header">
        <h1 class="post-title">${post.title}</h1>
        <div class="post-meta">
          <span class="post-author"><i class="fas fa-user"></i> ${post.author || ''}</span>
          <span class="post-read-time"><i class="fas fa-clock"></i> ${post.readTime || ''}</span>
          <span class="post-date"><i class="fas fa-calendar"></i> ${post.date ? formatDate(post.date) : ''}</span>
        </div>
        <div class="post-tags">
          ${(post.tags || []).map(tag => `<span class="post-tag">${tag}</span>`).join('')}
        </div>
      </header>
    `;
    // Markdown renderer setup
    marked.setOptions({
      breaks: true,
      gfm: true,
      headerIds: true,
      mangle: false,
      sanitize: false,
      smartLists: true,
      smartypants: true,
      xhtml: false,
      highlight: function(code, lang) {
        if (lang && hljs.getLanguage(lang)) {
          return hljs.highlight(code, { language: lang }).value;
        }
        return hljs.highlightAuto(code).value;
      },
      langPrefix: 'hljs language-'
    });
    // Render markdown
    let rendered = marked.parse(markdown);
    // Preprocess for math blocks
    let processedContent = rendered.replace(/<p>\s*(\${2}[\s\S]*?\${2})\s*<\/p>/g, (match, math) => math);
    processedContent = processedContent.replace(/(^|<br>)(\\begin\{(align\*|equation\*)\}[\s\S]*?\\end\{(align\*|equation\*)\})(?=<br>|$)/gm, (match, before, math) => `${before}<div class="math-block math-block-unnumbered">${math}</div>`);
    processedContent = processedContent.replace(/<div class=\"math-block\">(\\begin\{(align\*|equation\*)\}[\s\S]*?\\end\{(align\*|equation\*)\})<\/div>/g, '<div class="math-block math-block-unnumbered">$1</div>');
    processedContent = processedContent.replace(/(^|<br>)(\${2}[\s\S]*?\${2})(?=<br>|$)/gm, (match, before, math) => {
      if (!/class=\"math-block/.test(match)) {
        return `${before}<div class=\"math-block\">${math}</div>`;
      }
      return match;
    });
    contentDiv.innerHTML = postHeader + processedContent;
    // Remove <br> tags inside .math-block
    contentDiv.querySelectorAll('.math-block').forEach(el => {
      el.innerHTML = el.innerHTML.replace(/<br\s*\/??\s*>/gi, '');
    });
    if (typeof hljs !== 'undefined') hljs.highlightAll();
    // Mermaid diagrams
    if (typeof mermaid !== 'undefined') {
      mermaid.run({ nodes: [contentDiv] });
    }
    // MathJax
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise([contentDiv]);
    }
  } catch (e) {
    contentDiv.innerHTML = `<div class="error">Failed to load markdown: ${e.message}</div>`;
  }
}
document.addEventListener('DOMContentLoaded', renderMarkdownFromUrl); 