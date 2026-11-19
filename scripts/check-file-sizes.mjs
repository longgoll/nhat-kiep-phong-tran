import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, 'src');
const EVENTS_DIR = path.join(SRC_DIR, 'data', 'events');

const TS_SOFT_LIMIT = 450;
const TS_HARD_LIMIT = 575;
const JSON_SOFT_LIMIT = 450;
const JSON_HARD_LIMIT = 900;

function walkFiles(dir, extRegex) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkFiles(full, extRegex));
    } else if (entry.isFile() && extRegex.test(entry.name)) {
      results.push(full);
    }
  }
  return results.sort();
}

function countLines(filePath) {
  return fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n').split('\n').length;
}

const tsWarnings = [];
const tsErrors = [];

for (const file of walkFiles(SRC_DIR, /\.(ts|tsx)$/)) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  if (rel.includes('__tests__/') || rel.endsWith('vite-env.d.ts')) continue;
  const lines = countLines(file);
  if (lines > TS_HARD_LIMIT) {
    tsErrors.push({ rel, lines });
  } else if (lines > TS_SOFT_LIMIT) {
    tsWarnings.push({ rel, lines });
  }
}

const jsonWarnings = [];
const jsonErrors = [];

for (const file of walkFiles(EVENTS_DIR, /\.json$/)) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  const lines = countLines(file);
  if (lines > JSON_HARD_LIMIT) {
    jsonErrors.push({ rel, lines });
  } else if (lines > JSON_SOFT_LIMIT) {
    jsonWarnings.push({ rel, lines });
  }
}

console.log('=== File Size Guard Report ===');
if (tsWarnings.length > 0) {
  console.log(`\n[WARN] TS/TSX > ${TS_SOFT_LIMIT} lines (cân nhắc tách nếu thêm code mới):`);
  for (const w of tsWarnings) console.log(`  - ${w.rel}: ${w.lines} lines`);
}
if (jsonWarnings.length > 0) {
  console.log(`\n[WARN] Event JSON > ${JSON_SOFT_LIMIT} lines (không thêm event vào file này, hãy tạo file mới):`);
  for (const w of jsonWarnings) console.log(`  - ${w.rel}: ${w.lines} lines`);
}

if (tsErrors.length > 0 || jsonErrors.length > 0) {
  console.error('\n[FAIL] Các file sau vượt ngưỡng cứng (Hard Limit):');
  for (const e of tsErrors) console.error(`  - ${e.rel}: ${e.lines} lines (limit ${TS_HARD_LIMIT})`);
  for (const e of jsonErrors) console.error(`  - ${e.rel}: ${e.lines} lines (limit ${JSON_HARD_LIMIT})`);
  process.exit(1);
}

console.log('\n[PASS] Không có file nào vượt Hard Limit.');
