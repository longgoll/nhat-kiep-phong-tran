# 05 — Hệ Thống Sự Kiện 2 Tầng, Condition DSL & Effect DSL

## 1. Kiến Trúc Sự Kiện 2 Tầng (2-Tier Event Engine)

Để tránh mệt mỏi vì sự kiện (Event Fatigue) trong vòng đời 20.000+ ngày:

| Cấp độ (`severity`) | Đặc điểm | Cách xử lý trong `simulation.worker.ts` |
| :--- | :--- | :--- |
| **`minor`** (Tin vặt đời thường) | Nhặt vài đồng xu, cảm lạnh nhẹ, hàng xóm cho củ khoai, tin đồn giá gạo... | Tự động tính kết quả theo `weight` + `prng`, áp dụng `effects`, ghi 1 dòng vào `logs[]`. **KHÔNG ngắt tua nhanh.** |
| **`major`** (Biến cố lớn) | Gặp quý nhân, bị bắt đi phu, lễ thôi nôi, thi cử, cưới hỏi, quan tham vòi tiền, bạo bệnh, khởi nghĩa... | Kích hoạt **Auto-Pause ngay lập tức**, trả về Main Thread để mở thẻ Modal cho người chơi ra quyết định. |

### Cơ chế Kiểm soát Tần suất & Nhân quả
1. **Event Cooldown (`eventCooldowns`):**
   - Lưu `Record<string, number>` ánh xạ `eventId` $\rightarrow$ `totalDays` lần gần nhất sự kiện đó kích hoạt.
   - Sự kiện chỉ hợp lệ khi `totalDays - (eventCooldowns[event.id] ?? -99999) >= event.cooldownDays`.
2. **Global Pacing Cap:**
   - Trong chế độ tua nhanh (13+ tuổi), tối đa mỗi **7 ngày** mới roll sự kiện ngẫu nhiên `major` 1 lần (trừ các sự kiện theo lịch cố định hoặc `delayedEvents`).
3. **Hàng đợi Sự kiện Trễ (`delayedEvents`):**
   - Mảng `{ eventId: string; triggerDay: number }`.
   - Đầu mỗi ngày, Worker kiểm tra những item có `triggerDay <= totalDays` để kích hoạt ngay và xóa khỏi hàng đợi.

---

## 2. Quy Chuẩn Condition DSL (Không dùng `eval()`)

Mọi trường `conditions` trong `actions.json` và `events_*.json` đều dùng một **Condition Evaluator** thống nhất. Tất cả điều kiện trong cùng một object `conditions` mặc định kết hợp theo phép **AND**.

### Danh sách Key hợp lệ trong `ConditionSpec`
```ts
export interface ConditionSpec {
  // Tuổi & Thời gian
  min_age?: number;
  max_age?: number;
  season_in?: Array<'spring' | 'summer' | 'autumn' | 'winter'>;

  // Nhân thân & Giai đoạn
  gender?: 'male' | 'female';
  origin_in?: OriginClass[];
  childhood_focus?: string;
  housing_in?: Array<'gam_cau' | 'nha_tranh' | 'nha_gach' | 'phu_de'>;
  world_state_in?: Array<'binh_on' | 'mat_mua' | 'chien_tranh' | 'dich_benh'>;

  // Chỉ số (tối thiểu / tối đa)
  min_health?: number;     max_health?: number;
  min_happiness?: number;  max_happiness?: number;
  min_relationships?: number;
  min_education?: number;  max_education?: number;
  min_stamina?: number;
  min_martial?: number;
  min_craft_trade?: number;
  min_fame?: number;
  min_infamy?: number;

  // Tài sản (đã quy về SSOT wealthCopper & rice)
  min_copper?: number;     max_copper?: number;
  min_rice?: number;       max_rice?: number;

  // Cờ trạng thái & Bất động sản
  has_flags?: string[];       // Phải có TẤT CẢ các flag này
  missing_flags?: string[];   // Không được có BẤT KỲ flag nào trong đây
  has_any_flag?: string[];    // Có ít nhất 1 flag trong danh sách
  has_property?: string;
}
```

---

## 3. Quy Chuẩn Effect DSL

Mọi thay đổi trạng thái từ `actions.json` (trường `rewards`/`costs`) và `events_*.json` (trường `effects`) đều đi qua **Effect Applier** thống nhất:

```ts
export interface EffectSpec {
  // Thay đổi chỉ số (số dương hoặc âm, tự động clamp theo giới hạn)
  health?: number;
  happiness?: number;
  relationships?: number;
  education?: number;
  stamina?: number;
  martial?: number;
  craft_trade?: number;
  fame?: number;
  infamy?: number;

  // Thay đổi tài sản (SSOT)
  copper?: number;
  rice?: number;
  set_housing?: 'gam_cau' | 'nha_tranh' | 'nha_gach' | 'phu_de';
  add_property?: string;

  // Thao tác Cờ trạng thái
  add_flags?: string[];
  remove_flags?: string[];

  // Tương tác NPC & Nhân quả
  npc_affinity?: Array<{
    relation?: 'parent' | 'spouse' | 'child' | 'friend' | 'rival' | 'mentor';
    npc_id?: string;
    delta: number;
  }>;
  schedule_delayed?: Array<{
    event_id: string;
    delay_days: number;
  }>;

  // Ghi nhận Sử ký / Tử vong
  milestone_title?: string;
  kill_reason?: string; // Nếu có, nhân vật tử vong ngay (health = 0)
}
```

---

## 4. Schema Chuẩn Cho `actions.json` & `events_*.json`

### A. Chuẩn `actions.json`
```json
[
  {
    "id": "act_study_doc_sach_den_dau",
    "name": "Đọc sách bên đèn dầu",
    "category": "study",
    "allowedSlots": ["evening", "night"],
    "description": "Tận dụng đêm khuya dùi mài kinh sử. Tốn nhiều thể lực và tiền mua dầu thắp.",
    "conditions": {
      "min_age": 13,
      "min_education": 5,
      "min_copper": 5
    },
    "costs": {
      "stamina": 20,
      "copper": 5
    },
    "rewards": {
      "education": 1.5,
      "health": -0.5
    }
  }
]
```

### B. Chuẩn `events_*.json` (Thống nhất mọi `choice` đều dùng `outcomes[]`)
> **Quy tắc bắt buộc:** Không viết `effects` trực tiếp dưới `choice`. Mọi `choice` đều chứa mảng `outcomes[]` (nếu chắc chắn 100% xảy ra thì dùng mảng 1 phần tử với `weight.base = 100`).

```json
[
  {
    "id": "evt_child_eavesdrop_01",
    "stage": "childhood",
    "severity": "major",
    "cooldownDays": 360,
    "title": "Nghe lỏm ngoài cửa lớp thầy đồ",
    "conditions": {
      "min_age": 7,
      "max_age": 12,
      "origin_in": ["ban_nong"],
      "childhood_focus": "hoc_lom"
    },
    "weight": {
      "base": 40,
      "modifiers": [
        { "conditions": { "has_flags": ["thien_huong_but_long"] }, "addWeight": 25 }
      ]
    },
    "description": "Trời mưa phùn, bạn trốn việc chăn trâu, nép bên hiên nhà thầy đồ nghe tiếng ê a đọc Tam Tự Kinh. Thầy đồ vô tình nhìn ra bắt gặp ánh mắt ham học của bạn.",
    "choices": [
      {
        "label": "Mạnh dạn quỳ xuống xin thầy cho nghe ké",
        "conditions": {},
        "outcomes": [
          {
            "weight": { "base": 60, "modifiers": [] },
            "resultText": "Thầy đồ cảm động trước tấm lòng hiếu học, tặng cho bạn một cây bút cùn và dạy cho vài chữ vỡ lòng.",
            "effects": {
              "education": 6,
              "happiness": 15,
              "relationships": 5,
              "add_flags": ["duoc_thay_do_quy"]
            }
          },
          {
            "weight": { "base": 40, "modifiers": [] },
            "resultText": "Thầy đồ sợ mang tiếng với nhà giàu nên xua đuổi bạn về. Về nhà bạn lại bị cha mắng vì bỏ bê đàn trâu.",
            "effects": {
              "happiness": -10,
              "relationships": -3
            }
          }
        ]
      },
      {
        "label": "Sợ hãi bỏ chạy về đồng",
        "outcomes": [
          {
            "weight": { "base": 100, "modifiers": [] },
            "resultText": "Bạn vội vàng chạy biến về bãi cỏ, nhưng vẫn kịp nhớ mặt hai chữ thầy vừa giảng.",
            "effects": {
              "education": 2,
              "happiness": -2
            }
          }
        ]
      }
    ]
  }
]
```
