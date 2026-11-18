import fs from 'node:fs';
import path from 'node:path';
import type { AuditShardOutput, LifeAuditRecord } from './auditRunner';

const SHARDS_DIR = path.resolve(process.cwd(), 'docs', '.audit-shards');
const META_FILE = '_meta.json';

function percentile(sortedAsc: number[], p: number): number {
  if (sortedAsc.length === 0) return 0;
  const idx = Math.min(sortedAsc.length - 1, Math.max(0, Math.floor((sortedAsc.length - 1) * p)));
  return sortedAsc[idx];
}

export async function setup(): Promise<void> {
  if (fs.existsSync(SHARDS_DIR)) {
    fs.rmSync(SHARDS_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(SHARDS_DIR, { recursive: true });
  fs.writeFileSync(path.join(SHARDS_DIR, META_FILE), JSON.stringify({ startedAt: Date.now() }), 'utf8');
}

export async function teardown(): Promise<void> {
  if (!fs.existsSync(SHARDS_DIR)) return;

  let startedAt = Date.now();
  const metaPath = path.join(SHARDS_DIR, META_FILE);
  if (fs.existsSync(metaPath)) {
    try {
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8')) as { startedAt?: number };
      if (typeof meta.startedAt === 'number') startedAt = meta.startedAt;
    } catch {
      // ignore meta read error
    }
  }

  const shardFiles = fs
    .readdirSync(SHARDS_DIR)
    .filter((f) => f.endsWith('.json') && f !== META_FILE)
    .sort();

  const records: LifeAuditRecord[] = [];
  let majorEventIds: string[] = [];

  for (const file of shardFiles) {
    const raw = fs.readFileSync(path.join(SHARDS_DIR, file), 'utf8');
    const parsed = JSON.parse(raw) as AuditShardOutput;
    records.push(...parsed.records);
    if (parsed.majorEventIds.length > majorEventIds.length) {
      majorEventIds = parsed.majorEventIds;
    }
  }

  fs.rmSync(SHARDS_DIR, { recursive: true, force: true });

  if (records.length === 0) {
    console.warn('No audit records produced (check AUDIT_ORIGINS / AUDIT_ARCHS filters).');
    return;
  }

  const elapsedSec = ((Date.now() - startedAt) / 1000).toFixed(1);
  const eventHits = new Map<string, number>();
  const decisionHits = new Map<string, number>();
  const deathReasons = new Map<string, number>();

  for (const rec of records) {
    for (const id of rec.eventsFired) eventHits.set(id, (eventHits.get(id) ?? 0) + 1);
    for (const id of rec.decisionsFired) decisionHits.set(id, (decisionHits.get(id) ?? 0) + 1);
    deathReasons.set(rec.deathReason, (deathReasons.get(rec.deathReason) ?? 0) + 1);
  }

  const allAnomalies = records.flatMap((r) =>
    r.anomalies.map((a) => `${r.origin}/${r.archetype}#${r.seed}: ${a}`),
  );
  const avgAgeAll = records.reduce((a, r) => a + r.finalAge, 0) / records.length;
  const earlyDeaths = records.filter((r) => !r.isAlive && r.finalAge < 20).length;

  const originsPresent = [...new Set(records.map((r) => r.origin))];
  const archsPresent = [...new Set(records.map((r) => r.archetype))];

  const byOrigin = originsPresent.map((orig) => {
    const sub = records.filter((r) => r.origin === orig);
    return {
      origin: orig,
      count: sub.length,
      avgAge: Number((sub.reduce((a, r) => a + r.finalAge, 0) / sub.length).toFixed(1)),
      avgCopper: Math.round(sub.reduce((a, r) => a + r.finalCopper, 0) / sub.length),
      avgEducation: Number((sub.reduce((a, r) => a + r.finalEducation, 0) / sub.length).toFixed(1)),
      avgFame: Number((sub.reduce((a, r) => a + r.finalFame, 0) / sub.length).toFixed(1)),
      officialRankPct: Number(((sub.filter((r) => r.officialRank > 0).length / sub.length) * 100).toFixed(1)),
      avgTriggers: Number(
        (sub.reduce((a, r) => a + r.eventsFired.length + r.decisionsFired.length, 0) / sub.length).toFixed(1),
      ),
    };
  });

  const byArchetype = archsPresent.map((archId) => {
    const sub = records.filter((r) => r.archetype === archId);
    return {
      archetype: archId,
      focus: sub[0].focus,
      count: sub.length,
      avgAge: Number((sub.reduce((a, r) => a + r.finalAge, 0) / sub.length).toFixed(1)),
      avgCopper: Math.round(sub.reduce((a, r) => a + r.finalCopper, 0) / sub.length),
      avgEducation: Number((sub.reduce((a, r) => a + r.finalEducation, 0) / sub.length).toFixed(1)),
      spousePct: Number(((sub.filter((r) => r.hadSpouse).length / sub.length) * 100).toFixed(0)),
      venturePct: Number(((sub.filter((r) => r.hadVenture).length / sub.length) * 100).toFixed(0)),
      avgProperties: Number((sub.reduce((a, r) => a + r.propertiesCount, 0) / sub.length).toFixed(1)),
    };
  });

  const deadMajors = majorEventIds.filter((id) => !eventHits.has(id));
  const topEvents = [...eventHits.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);
  const topDeaths = [...deathReasons.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);

  const lines: string[] = [];
  lines.push('# Báo Cáo Kiểm Định 1.000 Cuộc Đời (Monte Carlo + Narrative Audit)');
  lines.push('');
  lines.push(
    `- **Tổng số kiếp:** ${records.length} (${originsPresent.length} Xuất thân × ${archsPresent.length} Archetype | Thời gian chạy song song: ${elapsedSec}s)`,
  );
  if (process.env.AUDIT_ORIGINS || process.env.AUDIT_ARCHS) {
    lines.push(
      `- **Bộ lọc đang bật:** \`AUDIT_ORIGINS=${process.env.AUDIT_ORIGINS ?? 'ALL'}\` · \`AUDIT_ARCHS=${process.env.AUDIT_ARCHS ?? 'ALL'}\``,
    );
  }
  lines.push(
    `- **Tuổi thọ trung bình:** ${avgAgeAll.toFixed(1)} tuổi | **Tử vong sớm (<20 tuổi):** ${earlyDeaths}/${records.length} (${((earlyDeaths / records.length) * 100).toFixed(1)}%)`,
  );
  lines.push(`- **Lỗi logic/NaN phát hiện:** ${allAnomalies.length}`);
  lines.push('');

  lines.push('## 1. Thống Kê Theo Xuất Thân (`OriginClass`)');
  lines.push('| Xuất thân | Tuổi TB | Tài sản TB (đ) | Học thức TB | Thanh danh TB | Quan hàm >0 | Triggers/kiếp |');
  lines.push('| :--- | ---: | ---: | ---: | ---: | ---: | ---: |');
  for (const row of byOrigin) {
    lines.push(
      `| ${row.origin} | ${row.avgAge.toFixed(1)} | ${row.avgCopper} | ${row.avgEducation.toFixed(1)} | ${row.avgFame.toFixed(1)} | ${row.officialRankPct.toFixed(1)}% | ${row.avgTriggers.toFixed(1)} |`,
    );
  }
  lines.push('');

  lines.push('## 2. Thống Kê Theo Trọng Tâm & Chiến Lược (`Archetype`)');
  lines.push('| Archetype (Focus) | Tuổi TB | Tài sản TB (đ) | Học thức TB | Kết hôn | Khởi nghiệp | Điền sản TB |');
  lines.push('| :--- | ---: | ---: | ---: | ---: | ---: | ---: |');
  for (const row of byArchetype) {
    lines.push(
      `| ${row.archetype} (${row.focus}) | ${row.avgAge.toFixed(1)} | ${row.avgCopper} | ${row.avgEducation.toFixed(1)} | ${row.spousePct}% | ${row.venturePct}% | ${row.avgProperties.toFixed(1)} |`,
    );
  }
  lines.push('');

  lines.push('## 3. Tần Suất Quyết Định & Nguyên Nhân Tử Vong');
  lines.push(`- **Decision Hits:** \`${JSON.stringify(Object.fromEntries(decisionHits.entries()))}\``);
  lines.push(`- **Top Nguyên nhân kết thúc:** ${topDeaths.map(([k, v]) => `${k} (${v})`).join(' · ')}`);
  lines.push('');

  lines.push('## 4. Độ Phủ Sự Kiện');
  lines.push(`- **Top 12 sự kiện nổ nhiều nhất:** ${topEvents.map(([k, v]) => `\`${k}\` (${v})`).join(', ')}`);
  lines.push(
    `- **Dead Major Events (0% sau ${records.length} kiếp — ${deadMajors.length}/${majorEventIds.length}):** ${deadMajors.length === 0 ? 'Không có!' : deadMajors.map((id) => `\`${id}\``).join(', ')}`,
  );
  lines.push('');

  const sortedByAge = [...records].sort((a, b) => a.finalAge - b.finalAge);
  const sortedByWealth = [...records].sort((a, b) => b.finalCopper - a.finalCopper);
  const outliers: Array<{ label: string; rec: LifeAuditRecord }> = [
    { label: 'Chết sớm nhất #1', rec: sortedByAge[0] },
    ...(sortedByAge.length > 1 ? [{ label: 'Chết sớm nhất #2', rec: sortedByAge[1] }] : []),
    { label: 'Giàu nhất #1', rec: sortedByWealth[0] },
    { label: 'Nợ nặng nhất #1', rec: sortedByWealth[sortedByWealth.length - 1] },
    { label: 'Thọ nhất #1', rec: sortedByAge[sortedByAge.length - 1] },
    {
      label: 'Mẫu Gia đình',
      rec: records.find((r) => r.archetype === 'gia_dinh_marriage' && r.finalAge >= 45) ?? records[0],
    },
    {
      label: 'Mẫu Thương buôn',
      rec: records.find((r) => r.archetype === 'thuong_buon_venture' && r.hadVenture) ?? records[0],
    },
    {
      label: 'Mẫu Công danh',
      rec: records.find((r) => r.archetype === 'cong_danh_exam' && r.officialRank > 0) ?? records[0],
    },
  ];

  lines.push('## 5. Các Ca Mẫu & Bất Thường (Outliers để Agent Soi Mạch Truyện)');
  for (const { label, rec } of outliers) {
    lines.push(
      `### ${label}: \`${rec.origin}\` / \`${rec.archetype}\` (seed=${rec.seed}, tuổi=${rec.finalAge}, tiền=${rec.finalCopper}đ, quan hàm=${rec.officialRank}, lý do="${rec.deathReason}")`,
    );
    for (const t of rec.timeline.slice(0, 14)) {
      lines.push(`- ${t}`);
    }
    if (rec.timeline.length > 14) {
      lines.push(`- ... *(còn ${rec.timeline.length - 14} sự kiện nữa)*`);
    }
    lines.push('');
  }

  const outMdPath = path.resolve(process.cwd(), 'docs', 'audit-report-1000.md');
  fs.writeFileSync(outMdPath, lines.join('\n'), 'utf8');

  const agesAsc = sortedByAge.map((r) => r.finalAge);
  const wealthAsc = [...records].map((r) => r.finalCopper).sort((a, b) => a - b);
  const summary = {
    generatedAt: new Date().toISOString(),
    elapsedSec: Number(elapsedSec),
    totalLives: records.length,
    filters: {
      seedsPerCombo: Number(process.env.AUDIT_SEEDS ?? '4'),
      origins: process.env.AUDIT_ORIGINS ?? null,
      archetypes: process.env.AUDIT_ARCHS ?? null,
    },
    avgAge: Number(avgAgeAll.toFixed(1)),
    agePercentiles: { p10: percentile(agesAsc, 0.1), p50: percentile(agesAsc, 0.5), p90: percentile(agesAsc, 0.9) },
    wealthPercentiles: { p10: percentile(wealthAsc, 0.1), p50: percentile(wealthAsc, 0.5), p90: percentile(wealthAsc, 0.9) },
    earlyDeaths,
    anomaliesCount: allAnomalies.length,
    anomalies: allAnomalies,
    byOrigin,
    byArchetype,
    decisionHits: Object.fromEntries(decisionHits.entries()),
    topDeathReasons: topDeaths.map(([reason, count]) => ({ reason, count })),
    deadMajorEventsCount: deadMajors.length,
    totalMajorEventsPool: majorEventIds.length,
    deadMajorEvents: deadMajors,
    topEvents: topEvents.map(([id, count]) => ({ id, count })),
  };

  const outJsonPath = path.resolve(process.cwd(), 'docs', 'audit-summary.json');
  fs.writeFileSync(outJsonPath, JSON.stringify(summary, null, 2), 'utf8');

  console.info(`Wrote audit report (${records.length} lives in ${elapsedSec}s) to ${outMdPath} & ${outJsonPath}`);
}
