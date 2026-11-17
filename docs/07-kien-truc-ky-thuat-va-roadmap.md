# 07 — Kiến Trúc Kỹ Thuật, TypeScript Schema & Lộ Trình Triển Khai

## 1. Tech Stack "0 Đồng" (Local-First)

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS + Lucide Icons + Recharts.
- **State Management & Persistence:**
  - `zustand` + `persist` middleware lưu vào `localStorage` (có `schemaVersion: 1` để hỗ trợ migrate khi nâng cấp phiên bản).
  - Tách 2 Store độc lập:
    1. `useActiveLifeStore` (key: `nkpt_active_life_v1`): Lưu `ActiveLifeState | null`, xóa sạch khi Game Over.
    2. `useLegacyArchiveStore` (key: `nkpt_legacy_archive_v1`): Lưu Codex, Cosmetics, Thống kê và tối đa 50 Bia Mộ gần nhất.
- **Tối ưu bộ nhớ:**
  - `logs[]`: Rolling Buffer giữ tối đa **150 dòng** gần nhất.
  - `milestones[]`: Lưu tối đa **30 mốc** quan trọng cả đời.
- **Simulation Engine:** Chạy trong **Web Worker** (`src/workers/simulation.worker.ts`) trên RAM thuần túy khi tua nhanh, chỉ gửi `State` cập nhật về Main Thread khi hoàn tất số ngày yêu cầu hoặc gặp điều kiện Auto-Pause.
- **Hosting:** Build tĩnh hoàn toàn, deploy lên Cloudflare Pages hoặc GitHub Pages.
- **Sao lưu:** Hỗ trợ Export / Import Save File (`.json`) kèm kiểm tra `schemaVersion`.

---

## 2. Cấu Trúc Thư Mục Mã Nguồn Đề Xuất

```text
src/
├── data/                    # Kho dữ liệu JSON (Lazy Load theo giai đoạn)
│   ├── actions.json
│   ├── events_thoi_noi.json
│   ├── events_dong_au.json
│   ├── events_ban_nong.json
│   └── ...
├── engine/                  # Logic thuần túy (dùng chung cho Worker & Unit Test)
│   ├── prng.ts              # mulberry32
│   ├── conditionEvaluator.ts
│   ├── effectApplier.ts
│   ├── economy.ts           # Giá lúa, LifestyleTier, quy đổi tiền
│   └── daySimulator.ts      # Vòng lặp 1 ngày (4 khung giờ + Fallback + Events)
├── workers/
│   └── simulation.worker.ts
├── stores/
│   ├── useActiveLifeStore.ts
│   └── useLegacyArchiveStore.ts
├── types/
│   ├── activeLife.ts
│   ├── dsl.ts
│   └── legacy.ts
└── components/              # UI 3 cột, Modal sự kiện, Bia mộ, Tàng Kinh Các
```

---

## 3. TypeScript Schema Chuẩn (`src/types/activeLife.ts`)

```ts
export type OriginClass = 'ban_nong' | 'thu_cong' | 'dia_chu' | 'quan_lai' | 'hoang_toc';
export type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'night';
export type LifestyleTier = 'nhin_doi' | 'chao_loang' | 'com_rau' | 'thit_ca';
export type HousingTier = 'gam_cau' | 'nha_tranh' | 'nha_gach' | 'phu_de';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type WorldState = 'binh_on' | 'mat_mua' | 'chien_tranh' | 'dich_benh';

export interface NPC {
  id: string;
  name: string;
  gender: 'male' | 'female';
  relation: 'parent' | 'sibling' | 'spouse' | 'child' | 'friend' | 'rival' | 'mentor';
  affinity: number; // -100 đến +100
  isAlive: boolean;
  role: string;
}

export interface FallbackRule {
  id: string;
  stat: 'health' | 'happiness' | 'stamina' | 'rice' | 'wealthCopper';
  operator: '<' | '<=';
  threshold: number;
  targetSlot: TimeSlot;
  fallbackActionId: string;
}

export interface MilestoneRecord {
  totalDays: number;
  ageYears: number;
  title: string;
  netWorthInCopper: number;
  fame: number;
}

export interface ActiveLifeState {
  schemaVersion: number;
  seed: number;
  prngState: number;
  isAlive: boolean;
  deathReason?: string;

  profile: {
    fullName: string;
    gender: 'male' | 'female';
    originClass: OriginClass;
    currentRole: string;
    totalDays: number; // Single Source of Truth: 1 năm = 360 ngày
  };

  stats: {
    health: number;        // 0 - 100
    happiness: number;     // 0 - 100
    relationships: number; // 0 - 100
    education: number;     // 0 - 100
    stamina: number;       // 0 - maxStamina
    maxStamina: number;
    martial: number;
    craftTrade: number;
    fame: number;
    infamy: number;
  };

  assets: {
    wealthCopper: number;  // Single Source of Truth (1 Bạc = 1.000, 1 Vàng = 10.000)
    rice: number;          // Đơn vị: đấu (10 đấu = 1 thạch)
    housing: HousingTier;
    properties: string[];
  };

  world: {
    dynastyName: string;
    yearInEra: number;
    season: Season;
    ricePriceInCopper: number;
    worldState: WorldState;
  };

  schedule: {
    childhoodFocus?: string; // Dùng cho 6 - 12 tuổi
    morning: string;
    afternoon: string;
    evening: string;
    night: string;
    lifestyle: LifestyleTier;
    lifeFocus: string;
    fallbackRules: FallbackRule[];
    autoBuyRice: boolean;
  };

  npcs: NPC[];
  flags: string[];
  delayedEvents: Array<{ eventId: string; triggerDay: number }>;
  eventCooldowns: Record<string, number>;
  milestones: MilestoneRecord[]; // Tối đa 30 mốc
  logs: Array<{ day: number; category: string; text: string }>; // Rolling buffer tối đa 150 dòng
}
```

---

## 4. Giao Thức Web Worker (`simulation.worker.ts`)

- **Main Thread $\rightarrow$ Worker:**
  - `ADVANCE_DAYS`: `{ state: ActiveLifeState, days: number, autoPauseConfig: AutoPauseConfig }`
  - `RESOLVE_EVENT_CHOICE`: `{ state: ActiveLifeState, eventId: string, choiceIndex: number }`
- **Worker $\rightarrow$ Main Thread:**
  - `SIMULATION_DONE`: `{ state: ActiveLifeState, pausedReason?: 'major_event' | 'dead' | 'birthday' | 'exam' | 'low_stat' | 'no_food', pendingEvent?: EventDef }`

---

## 5. Lộ Trình Triển Khai & Tiêu Chí Nghiệm Thu (4 MVP)

### Giai đoạn 1 — Core Engine & Tuổi Thơ Tương Phản (MVP 1)
- **Kỹ thuật:** Khởi tạo Vite + React 19 + TS + Tailwind + Zustand; hoàn thiện `mulberry32`, `ConditionEvaluator`, `EffectApplier`, và Unit Test cho core engine.
- **Nội dung:** Màn hình Gacha Xuất Thân (5 tầng lớp + Giới tính) + Hoàn thiện giai đoạn `0–12 tuổi` (Lễ Thôi Nôi + Hoạt động đồng ấu, ưu tiên làm sắc nét 2 thái cực *Bần nông* vs *Quan lại*).

### Giai đoạn 2 — Vòng Lặp Trưởng Thành, Web Worker & Van Xả Áp (MVP 2)
- **Kỹ thuật:** Dashboard 3 cột, tích hợp `simulation.worker.ts`, tua `+1 Ngày / Tuần / Tháng / Mùa`, `FallbackRules`, `Auto-Pause`, Rolling Buffer 150 logs.
- **Nội dung:** Vòng đời `13+ tuổi` đến tử vong cho nhánh Bần nông & Sinh tồn (Mót lúa, Xin cháo thí, Vay nóng 180 ngày) + Màn hình Bia Mộ kèm biểu đồ `Recharts`.

### Giai đoạn 3 — Mở Rộng Đa Nghề & Sự Kiện Ngữ Cảnh (MVP 3)
- **Nội dung:** Nạp đầy đủ JSON cho 4 xuất thân còn lại; mở khóa module *Khoa cử & Quan trường* (kèm `nu_cai_nam_trang`), *Thương hội & Đầu cơ giá gạo*, và *Mật thất Khởi nghĩa*.

### Giai đoạn 4 — Tàng Kinh Các, Âm Thanh & Phát Hành (MVP 4)
- **Nội dung:** Hoàn thiện `useLegacyArchiveStore` (Codex, giao diện Giấy Dó / Mực Tàu / Son Thếp), Export/Import `.json`, tối ưu Mobile Tabs, nhạc nền cổ phong và deploy Cloudflare Pages.
