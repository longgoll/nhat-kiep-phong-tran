# 01 — Học Vấn & Trọng Tâm Năm (`S.edu`, `S.fT`, `endYear`)

---

## 1. Hệ Thống Học Vấn (`S.edu` 0–5 & `S.school`)

### Các bậc học theo tuổi
- **0–5 tuổi (`baby`):** Chưa đi học; hình thành tính khí quanh tuổi lên 5 qua các lựa chọn đầu đời (đồ chơi, tiền tiêu vặt).
- **6+ tuổi:**
  - `edu = 1`: Tiểu học (`prim`)
  - `edu = 2`: THCS (`lsec`)
  - `edu = 3`: THPT (`usec`) hoặc Đào tạo nghề (`voc`)
  - `edu = 4`: Đại học (`uni`, chọn chuyên ngành `S.major` từ ~13+ ngành như Sư phạm, KHTN, KHXH, Luật, Y khoa, Nghệ thuật, Báo chí, Kiến trúc, Du lịch, Quân sự...)
  - `edu = 5`: Cao học / Thạc sĩ (`grad`) → Tiến sĩ (`S.flags.dr`)

### Công thức xác suất lên lớp & đỗ đại học (`eduModel` & `eduProbs`)
- Tính xác suất nền theo chỉ số giáo dục quốc gia (`eys` — số năm đi học kỳ vọng, `ter` — tỷ lệ vào đại học):
  - Tiểu học: `1 / (1 + exp(-(eys - 7) / 1.3))`
  - THCS: `1 / (1 + exp(-(eys - 10) / 1.4))`
  - THPT: `1 / (1 + exp(-(eys - 12) / 1.5))`
- Nhân với **phân vị giàu nghèo gia đình (`S.q` 1–5)** qua `exp(f * (q - 3))` (`f = 0.6` ở nước thu nhập thấp `< $15k PPP`, `0.45` ở nước khác) và hệ số thành thị/nông thôn (`1.4` vs `0.75`).
- Cộng thêm rào cản đặc thù (giới tính ở một số nước, tảo hôn, lao động trẻ em, khuyết tật).

### Thi trượt, Thi lại & Học bổ túc khi trưởng thành
- **Thi đại học (`DEC.college`):** Tung xúc xắc dựa trên xác suất nền cộng thêm nỗ lực (`Kiến thức` + trọng tâm `Học tập`).
- **Thi lại (`DEC.retake`):** Nếu trượt, bật quyết định *"Thi lại?"* (tối đa 3 lần: ôn thêm 1 năm hoặc đi làm ngay).
- **Học bổ túc (`DEC.adultedu`):** Người từng bỏ học sớm (nghèo, tảo hôn, lao động sớm) có thể học lớp đêm / thi bằng tương đương (`S.flags.gedAt`), mở lại đường vào đại học mở (`openUni`) hoặc xin việc bậc cao hơn.

---

## 2. Cơ Chế Trọng Tâm Năm (`S.focus`, `S.fT`, `endYear`)

### Ngữ cảnh tự đổi danh sách Trọng tâm
- **Đang đi học:** `Học tập` (`Kiến thức↑ Hạnh phúc↓`), `Bạn bè·vui chơi`, `Giúp việc nhà`, `Thể thao`, `Sở thích` (đại học có thêm `Làm thêm` / `Chuẩn bị nghề nghiệp`).
- **Đang đi làm:** `Dồn sức cho công việc` (`Thu nhập·Thăng tiến↑ Sức khỏe·Quan hệ↓`), `Cân bằng`, `Gia đình·bạn bè`, `Chăm sóc sức khỏe`, `Phát triển bản thân` (`Kiến thức↑ Lời mời chuyển việc↑`), `Sở thích`.
- **Thất nghiệp (`seeking`) / Nghỉ hưu / Nội trợ:** `Nghỉ ngơi`, `Học hỏi·rèn trí não`, `Tôn giáo·tình nguyện`...

### Thuật toán chia tỷ lệ thời gian (`endYear`, `vi.84480ea9ca.js` v0.10.46)
- Trong suốt năm, mỗi `tick(n)` cộng dồn `t = n * S.speed / S.yearSec` vào `S.fT[S.focus]`.
- Cuối năm (`a = sum(S.fT)`):
  - Với mỗi trọng tâm `u`, tỷ trọng `p = S.fT[u] / a` (`S.focusW[u] = p`).
  - Cộng vào `hl`, `h`, `so` (riêng `sm` xử lý qua `knowYear`):
    `i[k] = clamp(i[k] + FOCUS[u].e[k] * p * (u === "health" && k === "hl" ? fitK(S.age) : 1), 0, 100)`
    với `fitK(n) = n < 50 ? 1 : n < 65 ? 0.8 : n < 75 ? 0.6 : n < 85 ? 0.45 : 0.3`.
  - Bảng `FOCUS[u].e`:
    - `study`: `{sm: 5, h: -1, so: -1}` | `play`: `{so: 4, h: 4}` | `help`: `{so: 2, sm: -1}` | `sport`: `{hl: 4, h: 2, so: 1}` | `hobby`: `{h: 4}`
    - `work`: `{hl: -3, h: -2, so: -2}` | `balance`: `{h: 1, hl: 1, so: 1}` | `family`: `{so: 5, h: 3}` | `health`: `{hl: 5, h: 1}` | `learn`: `{sm: 4, h: -1}`
    - `faith`: `{so: 4, h: 3}` | `rest`: `{hl: 2, h: 2, sm: -1}` | `mind`: `{sm: 3, h: 1, so: 1}` | `parttime`: `{sm: -1, h: -1, so: 1}` | `career`: `{sm: 2, h: -2}`
  - Trọng tâm `Sở thích` / `Thể thao` cộng thêm `+1.2 * p * talK(id)` vào kỹ năng sở thích, và mỗi sở thích cộng `d.h * 0.35 * p`, `d.hl * 0.3 * p`, `d.so * 0.3 * p`.

### Hồi quy về mức nền (Mean-reversion trong `endYear`)
Cuối năm, `Sức khỏe (hl)`, `Quan hệ (so)`, `Hạnh phúc (h)` kéo dần về mức nền thực tế (thay vì dùng diminishing returns thủ công):
- **Sức khỏe (`hl`):** Kéo **25%** (`i.hl + (c - i.hl) * 0.25`, kẹp `[1, 100]`) về mức nền `c` tính từ `expHealth(age + 1)` (`<1: 72`, `<5: 80`, `<30: 90`, `<60: 90 - (n-30)*0.6`, `>=60: max(15, 72 - (n-60)*0.95)`) + `bikeFit()` + `dietFit()` + `(act ? 1.5 : 0)` + `(q - 3)*1.5` + `(focusW.health * 6 * fitK)` - hút thuốc (`6`) - bệnh mãn tính (`5/bệnh`) - tị nạn (`6`) - nợ nặng (`2`).
- **Quan hệ (`so`):** Kéo **12%** (tăng tới `SO_UP = 0.25` khi giảm ở tuổi trưởng thành `s = clamp((t-14)/6, 0, 1)`) về mục tiêu `u = r - 8 * s`, với `r = 45 + (có vợ/chồng ? 12 : 0) + min(15, số_con * 4) + (mẹ còn sống ? 3 : 0) + (có sở thích ? 3 : 0) + (di cư ? -6 : 0) + (warm ? 2 : 0) + 1.5 * tal("wd")`.
- **Hạnh phúc (`h`):** Kéo **22%** (tới `H_UP = 0.35` khi giảm hoặc `H_DN = 0.2` khi tăng ở tuổi trưởng thành) về mục tiêu `u = m - 12 * s`, với `m` tính từ nền quốc gia `28 + wh * 5.5`, phân vị thu nhập/gia cảnh, đóng góp từ `(so - 50)*0.25 + (hl - expHealth)*0.2`, nghề mơ ước (`+3`), trừ nợ nặng (`-6`) và tị nạn (`-10`).
