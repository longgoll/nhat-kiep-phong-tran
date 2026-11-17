# Nhất Kiếp Phong Trần — Bộ Tài Liệu Thiết Kế & Quy Chuẩn Kỹ Thuật (v3.2)

> Tài liệu này được tách và chuẩn hóa từ bản gốc [main.md](file:///f:/Dev/product/game/pọ_01/desige/main.md) nhằm phục vụ triển khai trực tiếp (Production-Ready), bổ sung đầy đủ công thức cân bằng, quy tắc xử lý biên và chuẩn hóa Schema.

---

## 1. Mục Lục Tài Liệu

| STT | Tài liệu | Nội dung chính |
| :--- | :--- | :--- |
| 00 | [README.md](file:///f:/Dev/product/game/pọ_01/docs/README.md) | Triết lý cốt lõi, quy ước đặt tên, quy tắc chung của toàn dự án |
| 01 | [01-khoi-dau-va-xuat-than.md](file:///f:/Dev/product/game/pọ_01/docs/01-khoi-dau-va-xuat-than.md) | PRNG `mulberry32`, Gacha Xuất thân 5 tầng lớp, Giới tính & NPC khởi đầu |
| 02 | [02-chi-so-va-kinh-te.md](file:///f:/Dev/product/game/pọ_01/docs/02-chi-so-va-kinh-te.md) | Hệ thống chỉ số, Lão hóa, Kinh tế (`wealthCopper`, `rice`), Mức sống & Van xả áp |
| 03 | [03-vong-doi-va-thoi-gian.md](file:///f:/Dev/product/game/pọ_01/docs/03-vong-doi-va-thoi-gian.md) | Quy chuẩn `totalDays`, Giai đoạn 0–5, 6–12, 13+, Thời khóa biểu, Fallback & Auto-Pause |
| 04 | [04-lo-trinh-phat-trien.md](file:///f:/Dev/product/game/pọ_01/docs/04-lo-trinh-phat-trien.md) | 3 lộ trình Sandbox: Khoa cử & Quan trường, Thương nghiệp, Khởi nghĩa |
| 05 | [05-su-kien-va-dsl.md](file:///f:/Dev/product/game/pọ_01/docs/05-su-kien-va-dsl.md) | Event Engine 2 tầng, Condition DSL, Effect DSL & Schema chuẩn `actions`/`events` |
| 06 | [06-ui-va-tang-kinh-cac.md](file:///f:/Dev/product/game/pọ_01/docs/06-ui-va-tang-kinh-cac.md) | Dashboard 3 cột, Bia Mộ Tổng Kết, Tàng Kinh Các (`legacy_archive`) |
| 07 | [07-kien-truc-ky-thuat-va-roadmap.md](file:///f:/Dev/product/game/pọ_01/docs/07-kien-truc-ky-thuat-va-roadmap.md) | Tech Stack, TypeScript Interfaces chuẩn, Web Worker Protocol & Roadmap 4 MVP |

---

## 2. Triết Lý & 4 Nguyên Tắc Bất Biến (Core Pillars)

1. **Một kiếp trọn vẹn:** Bắt đầu từ 0 tuổi và kết thúc hoàn toàn khi nhân vật tử vong (`health <= 0` hoặc bị xử trảm). Không truyền đời cho con cháu.
2. **Công bằng tuyệt đối (Zero Meta-Buff):** Xóa trắng `active_life` khi Game Over. `legacy_archive` chỉ lưu thành tích, Codex và giao diện trang trí (Pure Cosmetic), tuyệt đối không cộng chỉ số cho kiếp sau.
3. **Xuất thân định điểm khởi đầu, không khóa tương lai:** Xuất thân chỉ quyết định tài nguyên ban đầu và áp lực rủi ro; mọi con đường đều mở nếu đạt đủ điều kiện.
4. **Chân thực phong kiến Á Đông:** Tái hiện nhịp sống xưa từ Lễ thôi nôi, đi ở đợ, học lỏm thầy đồ đến lều chõng đi thi, quyên quan hoặc phất cờ khởi nghĩa.

---

## 3. Quy Tắc & Quy Ước Chung (Global Rules)

### Quy tắc đặt tên (Naming Conventions)
- **TypeScript / State trong RAM:** Sử dụng `camelCase` cho thuộc tính (`wealthCopper`, `totalDays`, `originClass`), `PascalCase` cho Type/Interface/Component (`ActiveLifeState`, `ActionPlanner`).
- **Dữ liệu JSON & ID:** Sử dụng `snake_case` cho tất cả `id`, `flag`, `category`, `condition key` và `effect key`:
  - Hành động: `act_<nhom>_<ten>` (VD: `act_survival_mot_lua`, `act_study_doc_sach`).
  - Sự kiện: `evt_<giai_doan>_<ten>_<so>` (VD: `evt_child_eavesdrop_01`).
  - Cờ trạng thái (`flags`): `snake_case` không dấu (VD: `duoc_thay_do_quy`, `nu_cai_nam_trang`, `da_ket_hon`).
  - Kết cục / Danh hiệu: `end_<nhom>_<ten>` (VD: `end_ban_nong_chet_cong`).

### Quy tắc Single Source of Truth (SSOT)
1. **Thời gian:** Chỉ lưu `totalDays: number` (tổng số ngày đã sống từ 0 tuổi). Không lưu tách `ageYears`/`ageDays` làm biến độc lập để tránh lệch pha.
2. **Tiền tệ:** Chỉ lưu `wealthCopper: number` (tổng tài sản quy ra Tiền đồng). Mọi phép cộng/trừ/so sánh đều dùng `wealthCopper`; việc tách `Vàng / Bạc / Đồng` chỉ thực hiện ở tầng hiển thị UI.
3. **Ngẫu nhiên (PRNG):** Mọi phép tung xúc xắc trong simulation bắt buộc đi qua hàm `nextRandom()` sử dụng `mulberry32` gắn với `prngState` trong `ActiveLifeState`. Tuyệt đối **không** dùng `Math.random()` trong logic game.
4. **An toàn biểu thức:** Tuyệt đối **không** dùng `eval()` hay `new Function()` khi đọc dữ liệu JSON. Mọi điều kiện phải đi qua `ConditionEvaluator` thuần túy.
