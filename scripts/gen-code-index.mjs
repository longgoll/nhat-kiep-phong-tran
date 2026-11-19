import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, 'src');
const OUT_FILE = path.join(ROOT, 'docs', 'code-index.md');
const WARN_LINE_THRESHOLD = 550;

function walkTsFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkTsFiles(full));
    } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name) && entry.name !== 'vite-env.d.ts') {
      results.push(full);
    }
  }
  return results.sort();
}

function extractExports(content) {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const exports = [];
  let isBarrel = false;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const m = line.match(
      /^export\s+(?:declare\s+)?(?:async\s+)?(function|const|let|class|interface|type|enum)\s+([A-Za-z0-9_]+)/,
    );
    if (m) {
      exports.push(`\`${m[2]}\` (L${i + 1})`);
      continue;
    }
    if (/^export\s+(?:type\s+)?\{/.test(line)) {
      isBarrel = true;
    } else if (/^export\s+\*\s+from\s+/.test(line)) {
      isBarrel = true;
    }
  }

  if (exports.length === 0 && isBarrel) {
    exports.push('*(barrel re-exports)*');
  }
  return exports;
}

function getGroupKey(relPath) {
  const parts = relPath.split('/');
  if (relPath.includes('__tests__/')) return '__tests__';
  if (parts.length >= 2) {
    if (parts[0] === 'engine' && parts.length >= 3) return `engine/${parts[1]}`;
    if (parts[0] === 'components' && parts.length >= 3) return `components/${parts[1]}`;
    return parts[0];
  }
  return 'root';
}

const files = walkTsFiles(SRC_DIR);
const groups = new Map();
let totalLines = 0;
let oversizedCount = 0;

for (const file of files) {
  const relPath = path.relative(SRC_DIR, file).replace(/\\/g, '/');
  const raw = fs.readFileSync(file, 'utf8');
  const lineCount = raw.replace(/\r\n/g, '\n').split('\n').length;
  const kb = (Buffer.byteLength(raw, 'utf8') / 1024).toFixed(1);
  const exports = extractExports(raw);
  const isTest = relPath.includes('__tests__/');
  const warn = !isTest && lineCount > WARN_LINE_THRESHOLD;
  if (warn) oversizedCount += 1;
  totalLines += lineCount;

  const group = getGroupKey(relPath);
  if (!groups.has(group)) groups.set(group, []);
  groups.get(group).push({ relPath, lineCount, kb, exports, warn });
}

const orderedGroups = [...groups.keys()].sort((a, b) => {
  if (a === '__tests__') return 1;
  if (b === '__tests__') return -1;
  return a.localeCompare(b);
});

const out = [];
out.push('# Source Code Index (Auto-Generated)');
out.push('');
out.push(
  '> File tự động sinh bởi `npm run gen:code-index` (hoặc `npm run gen:index`) từ `scripts/gen-code-index.mjs`.',
);
out.push(
  '> AI đọc file này trước khi tìm hoặc mở file trong `src/` để biết chính xác file con, số dòng (`L...`) và tránh đọc nhầm file lớn gây tốn token.',
);
out.push('');
out.push(
  `- **Tổng số file TS/TSX:** ${files.length} | **Tổng số dòng:** ${totalLines} | **File > ${WARN_LINE_THRESHOLD} dòng (ngoài tests):** ${oversizedCount}`,
);
out.push('');

for (const group of orderedGroups) {
  const items = groups.get(group);
  out.push(`## \`src/${group === 'root' ? '' : group}\``);
  out.push('| File | Dòng | KB | Exports chính |');
  out.push('| :--- | ---: | ---: | :--- |');
  for (const item of items) {
    const flag = item.warn ? ' ⚠️' : '';
    const expText = item.exports.length > 0 ? item.exports.slice(0, 12).join(', ') + (item.exports.length > 12 ? `, +${item.exports.length - 12} more` : '') : '—';
    out.push(`| \`src/${item.relPath}\` | ${item.lineCount}${flag} | ${item.kb} | ${expText} |`);
  }
  out.push('');
}

fs.writeFileSync(OUT_FILE, out.join('\n'), 'utf8');
console.log(`Generated ${OUT_FILE} (${files.length} files, ${totalLines} lines).`);
