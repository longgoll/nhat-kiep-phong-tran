import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const EVENTS_DIR = path.join(ROOT, 'src', 'data', 'events');
const OUT_FILE = path.join(ROOT, 'docs', 'event-index.md');

function walkJsonFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkJsonFiles(full));
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      results.push(full);
    }
  }
  return results.sort();
}

function addFlagRef(map, flag, ref) {
  if (!flag) return;
  if (!map.has(flag)) map.set(flag, new Set());
  map.get(flag).add(ref);
}

function collectFlagsFromCondition(cond, flagRefs, evtId) {
  if (!cond) return;
  for (const key of ['has_flags', 'missing_flags', 'has_any_flag']) {
    if (Array.isArray(cond[key])) {
      for (const f of cond[key]) addFlagRef(flagRefs, f, `${evtId}(${key})`);
    }
  }
}

const files = walkJsonFiles(EVENTS_DIR);
const events = [];
const flagSetters = new Map();
const flagReaders = new Map();

for (const file of files) {
  const relFile = path.relative(path.join(ROOT, 'src', 'data', 'events'), file).replace(/\\/g, '/');
  const raw = fs.readFileSync(file, 'utf8');
  const list = JSON.parse(raw);
  if (!Array.isArray(list)) continue;

  for (const evt of list) {
    events.push({ relFile, evt });
    collectFlagsFromCondition(evt.conditions, flagReaders, evt.id);

    for (const mod of evt.weight?.modifiers ?? []) {
      collectFlagsFromCondition(mod.conditions, flagReaders, evt.id);
    }
    for (const choice of evt.choices ?? []) {
      collectFlagsFromCondition(choice.conditions, flagReaders, evt.id);
      for (const out of choice.outcomes ?? []) {
        for (const f of out.effects?.add_flags ?? []) {
          addFlagRef(flagSetters, f, evt.id);
        }
        for (const f of out.effects?.remove_flags ?? []) {
          addFlagRef(flagSetters, f, `${evt.id}(-remove)`);
        }
      }
    }
  }
}

const allFlags = new Set([...flagSetters.keys(), ...flagReaders.keys()]);
const sortedFlags = [...allFlags].sort();

const lines = [];
lines.push('# Event & Flag Index (Auto-Generated)');
lines.push('');
lines.push('> File tự động sinh bởi `npm run gen:index` (`scripts/gen-event-index.mjs`). AI đọc file này để tra cứu toàn bộ ID, file, cờ (`flags`) và tránh đọc hàng chục file JSON lớn.');
lines.push('');
lines.push(`- **Tổng số file:** ${files.length} | **Tổng số sự kiện:** ${events.length} | **Tổng số flags:** ${sortedFlags.length}`);
lines.push('');
lines.push('## 1. Từ Điển Flags Đang Hoạt Động');
lines.push('| Flag | Được gắn/gỡ bởi | Được kiểm tra bởi (samples) |');
lines.push('| :--- | :--- | :--- |');
for (const flag of sortedFlags) {
  const setters = [...(flagSetters.get(flag) ?? [])].slice(0, 4).join(', ') || '*(engine/init)*';
  const readers = [...(flagReaders.get(flag) ?? [])].slice(0, 4).join(', ') || '—';
  lines.push(`| \`${flag}\` | ${setters} | ${readers} |`);
}
lines.push('');
lines.push('## 2. Danh Sách Sự Kiện Theo Thư Mục');
lines.push('| ID | Tiêu đề | Stage | Severity | Cooldown | Origin | File |');
lines.push('| :--- | :--- | :--- | :--- | ---: | :--- | :--- |');
for (const { relFile, evt } of events) {
  const origins = evt.conditions?.origin_in?.join(', ') || 'all';
  const title = String(evt.title ?? '').replace(/\|/g, '\\|');
  lines.push(
    `| \`${evt.id}\` | ${title} | ${evt.stage} | ${evt.severity}${evt.oncePerLife ? ' (1x)' : ''} | ${evt.cooldownDays} | ${origins} | \`${relFile}\` |`,
  );
}
lines.push('');

fs.writeFileSync(OUT_FILE, lines.join('\n'), 'utf8');
console.log(`Generated ${OUT_FILE} (${events.length} events, ${sortedFlags.length} flags across ${files.length} files).`);
