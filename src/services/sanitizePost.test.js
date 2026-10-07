import { sanitizePostHtml } from './sanitizePost';

test('keeps regular post markup', () => {
  const html = '<h2>Title</h2><p>Some <strong>text</strong> and <code>code</code>.</p>';

  expect(sanitizePostHtml(html)).toBe(html);
});

test('drops scripts, event handlers and inline styles', () => {
  const html = '<p style="position:fixed" onclick="steal()">hi</p><script>steal()</script><img src="x" onerror="steal()">';

  expect(sanitizePostHtml(html)).toBe('<p>hi</p><img src="x">');
});

test('drops javascript: links', () => {
  expect(sanitizePostHtml('<a href="javascript:steal()">click</a>')).toBe('<a>click</a>');
});

test('opens links in a new tab', () => {
  expect(sanitizePostHtml('<a href="https://example.com">site</a>')).toBe(
    '<a href="https://example.com" target="_blank" rel="noopener noreferrer">site</a>'
  );
});

test('points relative links at dev.to', () => {
  expect(sanitizePostHtml('<a href="/meteor/a-post">post</a>')).toBe(
    '<a href="https://dev.to/meteor/a-post" target="_blank" rel="noopener noreferrer">post</a>'
  );
});

test('disables heading anchors, which only work on dev.to', () => {
  expect(sanitizePostHtml('<h2><a name="intro" href="#intro"></a>Intro</h2>')).toBe('<h2><a></a>Intro</h2>');
});

test('replaces YouTube embeds with a link and drops other iframes', () => {
  const html = '<iframe src="https://www.youtube.com/embed/abc_-123"></iframe><iframe src="https://example.com/embed/1"></iframe>';

  expect(sanitizePostHtml(html)).toBe(
    '<a href="https://www.youtube.com/watch?v=abc_-123" target="_blank" rel="noopener noreferrer">Watch the video on YouTube</a>'
  );
});

test('removes the code block toolbar that dev.to adds', () => {
  const html = '<div class="highlight"><pre><code>let a = 1;</code></pre><div class="highlight__panel"><svg><path d="M0 0"></path></svg></div></div>';

  expect(sanitizePostHtml(html)).toBe('<div class="highlight"><pre><code>let a = 1;</code></pre></div>');
});
