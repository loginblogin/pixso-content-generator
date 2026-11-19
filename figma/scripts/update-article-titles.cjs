const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const entries = JSON.parse(fs.readFileSync(path.join(root, 'articles_titles_subtitles_updated.json'), 'utf8'));
if (!Array.isArray(entries) || !entries.length) throw new Error('Article list must be a non-empty array');
const pairs = entries.map((entry, index) => {
  if (!entry || typeof entry.title !== 'string' || !entry.title.trim() || typeof entry.subtitle !== 'string' || !entry.subtitle.trim()) {
    throw new Error(`Article ${index + 1} must contain non-empty title and subtitle`);
  }
  return [entry.title, entry.subtitle];
});
const file = path.join(root, 'code.ts');
const source = fs.readFileSync(file, 'utf8');
const pattern = /const ARTICLE_TITLES: \[string, string\]\[\] = \[[\s\S]*?\n\](?=\n)/;
if (!pattern.test(source)) throw new Error('Article data declaration not found');
const updated = source.replace(pattern, () => 'const ARTICLE_TITLES: [string, string][] = ' + JSON.stringify(pairs, null, 2));
if (updated !== source) fs.writeFileSync(file, updated);
console.log(`Loaded ${pairs.length} article title/subtitle pairs`);
