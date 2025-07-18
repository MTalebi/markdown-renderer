// --- Enhanced Markdown Renderer Configuration ---
class MarkdownRenderer {
  constructor() {
    this.figureCount = 0;
    this.tableCount = 0;
    this.setupMarked();
  }

  setupMarked() {
    marked.setOptions({
      breaks: true,
      gfm: true,
      headerIds: true,
      mangle: false,
      sanitize: false,
      smartLists: true,
      smartypants: true,
      xhtml: false
    });
    if (typeof hljs !== 'undefined') {
      marked.setOptions({
        highlight: function(code, lang) {
          let codeText = code;
          if (typeof code === 'object' && code.text) {
            codeText = code.text;
          } else if (typeof code !== 'string') {
            codeText = String(code || '');
          }
          try {
            if (lang && hljs.getLanguage(lang)) {
              return hljs.highlight(codeText, { language: lang }).value;
            }
            return hljs.highlightAuto(codeText).value;
          } catch (err) {
            return codeText;
          }
        },
        langPrefix: 'hljs language-'
      });
    }
    const self = this;
    const renderer = new marked.Renderer();
    renderer.image = function(href, title, text) {
      try {
        let hrefStr, titleStr, textStr;
        if (typeof href === 'object' && href !== null) {
          hrefStr = href.href || '';
          titleStr = href.title || title || '';
          textStr = href.text || text || '';
        } else {
          hrefStr = typeof href === 'string' ? href : String(href || '');
          titleStr = typeof title === 'string' ? title : String(title || '');
          textStr = typeof text === 'string' ? text : String(text || '');
        }
        const imgSrc = hrefStr;
        const imgTitle = titleStr || textStr;
        let width = '85%';
        let cleanTitle = imgTitle;
        if (imgTitle && imgTitle.includes('{width=')) {
          const widthMatch = imgTitle.match(/\{width=([^}]+)\}/);
          if (widthMatch) {
            width = widthMatch[1];
            cleanTitle = imgTitle.replace(/\{width=[^}]+\}/, '').trim();
          }
        }
        self.figureCount++;
        const figureLabel = `Figure ${self.figureCount}.`;
        const figureHtml = `
          <div class="markdown-image" style="text-align: center;">
            <img src="${imgSrc}" alt="${textStr}" title="${cleanTitle}" loading="lazy" style="width: ${width}; height: auto; display: block; margin: 0 auto;" />
          </div>
          ${cleanTitle ? `<div class="figure-caption" style="text-align: center; margin-top: 0.5rem; font-size: 0.95em;"><strong>${figureLabel}</strong> ${cleanTitle}</div>` : ''}
        `;
        return figureHtml;
      } catch (error) {
        const hrefStr = typeof href === 'object' ? (href.href || '') : String(href || '');
        const textStr = typeof href === 'object' ? (href.text || '') : String(text || '');
        return `<img src="${hrefStr}" alt="${textStr}" />`;
      }
    };
    renderer.link = function(href, title, text) {
      try {
        let hrefStr, titleStr, textStr;
        if (typeof href === 'object' && href !== null) {
          hrefStr = href.href || '';
          titleStr = href.title || title || '';
          textStr = href.text || text || '';
        } else {
          hrefStr = typeof href === 'string' ? href : String(href || '');
          titleStr = typeof title === 'string' ? title : String(title || '');
          textStr = typeof text === 'string' ? text : String(text || '');
        }
        const isExternal = hrefStr.startsWith('http');
        const target = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
        const icon = isExternal ? '<i class="fas fa-external-link-alt"></i>' : '';
        return `<a href="${hrefStr}" title="${titleStr}"${target}>${textStr}${icon}</a>`;
      } catch (error) {
        const hrefStr = typeof href === 'object' ? (href.href || '') : String(href || '');
        const textStr = typeof href === 'object' ? (href.text || '') : String(text || '');
        return `<a href="${hrefStr}">${textStr}</a>`;
      }
    };
    renderer.blockquote = function(quote) {
      if (typeof quote === 'object' && quote !== null && 'text' in quote) {
        quote = quote.text;
      }
      if (typeof quote !== 'string') {
        quote = String(quote);
      }
      const trimmed = quote.trimStart();
      if (!/^([\u231A-\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD-\u25FE\u2600-\u27BF\u2B50\u2B55\u2934-\u2935\u3030\u303D\u3297\u3299\uD83C\uD83D\uD83E]|<i|<svg|<img|<span|<strong|<b|<em|<u|<a|<code|<sup|<sub|<small|<big|<font|<br|<hr|<input|<button|<label|<div|<p|<figure|<figcaption|<audio|<video|<canvas|<iframe|<object|<embed|<math|<table|<tr|<td|<th|<ul|<ol|<li|<dl|<dt|<dd|<blockquote|<pre|<h[1-6])/.test(trimmed)) {
        quote = '💡 ' + quote;
      }
      const parsedContent = marked.parseInline(quote);
      return `<blockquote class=\"markdown-blockquote\">${parsedContent}</blockquote>`;
    };
    const defaultTable = renderer.table;
    renderer.table = function(...args) {
      const html = defaultTable.apply(this, args);
      return html.replace('<table', '<table class="markdown-table"');
    };
    marked.use({ renderer });
  }

  async renderMarkdown(content) {
    this.figureCount = 0;
    this.tableCount = 0;
    return marked.parse(content);
  }

  enhanceCodeBlocks(container) {
    // Add copy button to code blocks
    container.querySelectorAll('pre > code').forEach(codeBlock => {
      if (codeBlock.parentElement.querySelector('.copy-btn')) return;
      const button = document.createElement('button');
      button.className = 'copy-btn';
      button.innerHTML = '<i class="fas fa-copy"></i>';
      button.title = 'Copy code';
      button.onclick = () => {
        navigator.clipboard.writeText(codeBlock.textContent);
        button.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => {
          button.innerHTML = '<i class="fas fa-copy"></i>';
        }, 1200);
      };
      codeBlock.parentElement.style.position = 'relative';
      codeBlock.parentElement.appendChild(button);
    });
  }

  enhanceTables(container) {
    container.querySelectorAll('table').forEach(table => {
      table.classList.add('markdown-table');
    });
  }

  enhanceHtmlBlocks(container) {
    // No-op for now, can be extended for custom HTML blocks
  }

  enhanceMermaidBlocks(container) {
    if (typeof mermaid !== 'undefined') {
      mermaid.run({ nodes: [container] });
    }
  }

  enhanceSvgBlocks(container) {
    // No-op for now, can be extended for SVG blocks
  }
}

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
    const markdownRenderer = new MarkdownRenderer();
    const rendered = await markdownRenderer.renderMarkdown(markdown);
    let processedContent = rendered.replace(/<p>\s*(\${2}[\s\S]*?\${2})\s*<\/p>/g, (match, math) => math);
    processedContent = processedContent.replace(/(^|<br>)(\\begin\{(align\*|equation\*)\}[\s\S]*?\\end\{(align\*|equation\*)\})(?=<br>|$)/gm, (match, before, math) => `${before}<div class=\"math-block math-block-unnumbered\">${math}</div>`);
    processedContent = processedContent.replace(/<div class=\"math-block\">(\\begin\{(align\*|equation\*)\}[\s\S]*?\\end\{(align\*|equation\*)\})<\/div>/g, '<div class="math-block math-block-unnumbered">$1</div>');
    processedContent = processedContent.replace(/(^|<br>)(\${2}[\s\S]*?\${2})(?=<br>|$)/gm, (match, before, math) => {
      if (!/class=\"math-block/.test(match)) {
        return `${before}<div class=\"math-block\">${math}</div>`;
      }
      return match;
    });
    contentDiv.innerHTML = postHeader + processedContent;
    contentDiv.querySelectorAll('.math-block').forEach(el => {
      el.innerHTML = el.innerHTML.replace(/<br\s*\/??\s*>/gi, '');
    });
    if (typeof hljs !== 'undefined') hljs.highlightAll();
    markdownRenderer.enhanceCodeBlocks(contentDiv);
    markdownRenderer.enhanceTables(contentDiv);
    markdownRenderer.enhanceHtmlBlocks(contentDiv);
    markdownRenderer.enhanceMermaidBlocks(contentDiv);
    markdownRenderer.enhanceSvgBlocks(contentDiv);
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise([contentDiv]);
    }
  } catch (e) {
    contentDiv.innerHTML = `<div class=\"error\">Failed to load markdown: ${e.message}</div>`;
  }
}
document.addEventListener('DOMContentLoaded', renderMarkdownFromUrl); 