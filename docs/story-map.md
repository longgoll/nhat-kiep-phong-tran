# Bản Đồ Cốt Truyện & Quy Chuẩn Xung Đột Thân Phận (`Story Map`)

> Tài liệu tổng hợp toàn bộ mạch cốt truyện từ `0` đến `80+` tuổi, ma trận xung đột thân phận và lộ trình mở rộng chuẩn cho **Nhất Kiếp Phong Trần**.
> Kết hợp tra cứu chi tiết ID & Flags tại [`event-index.md`](./event-index.md).

---

## 1. Dòng Chảy Vòng Đời Chuẩn (`planYear` + Milestones)

```
[0–12 tuổi: tho_au / dong_au]
  ├── Xuất thân (5 tầng lớp) & Thiên hướng thôi nôi (`thien_huong_*`)
  ├── Hạt giống nhân vật: `duoc_thay_do_quy`, `co_ban_noi_kho`, `co_ban_tri_ky`
  └── Biến cố gia đạo: `gia_dinh_mac_no`, `mo_coi_cha`, `tung_o_do`, `gia_toc_sa_sut`
        │
        ▼
[13–22 tuổi: Ngã rẽ bước vào đời]
  ├── `dec_college_18` (Quốc Tử Giám / Võ học đường / Tự lập)
  ├── Chuỗi chuyển tiếp: `arc_len_kinh_thanh`, `arc_ra_o_rieng`, `arc_phuc_hung_gia_toc`
  └── Ngã rẽ số phận: `trong_hau_cung`, `thai_giam`, `nghe_ky_thanh_lau`, `bao_ke_giang_ho`, `trong_quan_ngu`, `bi_ep_lam_gia_no`
        │
        ▼
[22–60+ tuổi: 3 Trụ cột Trưởng thành — `planYear` (tối đa 2 Quyết định + 2–3 Feed/năm)]
  ├── TRỤ CỘT VĂN (Khoa cử & Quan trường)  <-- ĐANG ƯU TIÊN MỞ RỘNG
  ├── TRỤ CỘT THƯƠNG (Nghề, Khởi nghiệp, Điền sản) <-- Đã đầy đặn
  └── TRỤ CỘT VÕ / GIANG HỒ (Quân ngũ, Tù tội, Khởi nghĩa) <-- Mở rộng sau
        │
        ▼
[60+ tuổi: Tuổi xế chiều]
  └── `dec_retire_60`, `evt_official_retire_gracefully`, `elder_life.json`, Tử vong & Tàng Kinh Các
```

---

## 2. Ma Trận Xung Đột Thân Phận (Bắt Buộc Kiểm Tra Khi Viết Event)

Mọi sự kiện mới **phải** kiểm tra các trạng thái khóa dưới đây để không bị lỗi nhân quả (VD: đang ở trong cung lại đi thi hay cưới vợ bên ngoài):

| Trạng thái / Flag đang có | Các loại sự kiện BỊ CẤM (`missing_flags` / guard) |
| :--- | :--- |
| `trong_hau_cung` | `dec_college_18`, `dec_job_offers`, `dec_biz_offers`, kết hôn bên ngoài, đi lính, cướp đường, buôn bán tự do |
| `thai_giam` | Kết hôn, sinh con, tập ấm thế gia, đi lính, tuyển tú |
| `dang_lam_quan` (`officialRank > 0`) | Buôn chuyến/thầu phủ nha tư nhân (`evt_biz_caravan_venture`, `evt_biz_supply_contract`), đi lính binh nhì (`evt_military_enlist`), hành nghề tự do cấp thấp |
| `livelihoodStatus === 'prison'` | Mọi quyết định học hành (`dec_college_18`), tìm việc (`dec_job_offers`), khởi nghiệp (`dec_biz_offers`), vinh quy/bổ nhiệm |
| `da_ket_hon` | Sự kiện ép gả / tuyển tú (`evt_fate_tuyen_tu_palace`, `evt_adult_quan_lai_marriage_alliance`) |
| `bi_ep_lam_gia_no` | Đi lính (`evt_military_enlist`), khởi nghiệp tự do (trước khi chuộc thân) |

---

## 3. Thiết Kế Mở Rộng Tiếp Theo (2 Đợt)

### Đợt 1 — Nhánh Học Trò Nghèo vs. Học Trò Giàu
- **File 1 (`src/data/events/truong_thanh/scholar_poor.json` — 5–6 events):**
  - Đối tượng: `ban_nong`, `thu_cong`, `min_education >= 12`, `missing_flags: ["trong_hau_cung", "dang_lam_quan"]`.
  - Mạch nội dung: *Chép sách thuê / dạy trẻ đầu làng* (kiếm tiền ăn học), *Thầy đồ nhận làm môn sinh* (mở đường thi Hương), *Phú hộ kén rể hiếu học* (ngã rẽ nhận chu cấp đèn sách vs. rẽ sang thương buôn), *Đèn sách dưới ánh trăng / Thi trượt lần đầu* (kiên trì hay bỏ cuộc).
- **File 2 (`src/data/events/truong_thanh/scholar_rich.json` — 5–6 events):**
  - Đối tượng: `dia_chu`, `quan_lai`, `hoang_toc`, `min_education >= 12`, `missing_flags: ["trong_hau_cung", "thai_giam"]`.
  - Mạch nội dung: *Hội văn thơ Tràng An* (kết giao sĩ tử tăng `fame` & `relationships`), *Bạn giàu rủ rê tửu sắc / trường bạc* (giữ tiết tháo vs. sa ngã), *Cám dỗ chạy cửa sau / mua danh* (tiền đổi học vị giả, tăng `infamy`), *Áp lực gia phong kỳ vọng đỗ đạt*.

### Đợt 2 — Nhánh Quan Trường (Thanh Quan vs. Tham Quan)
- **Mở thông cổ chai vào quan trường (`src/engine/decisionGenerator.ts`):**
  - Thêm quyết định động `dec_official_appoint` (khi đã có `do_cu_nhan` hoặc `do_tien_si` mà `officialRank === 0`, hỏi người chơi có muốn *Nhận chức Tri huyện / Hàn Lâm* không) để tỷ lệ vào quan trường không bị kẹt ở `0–5%`.
- **File 3 (`src/data/events/truong_thanh/official_clean.json` — 5–6 events):**
  - Đối tượng: `has_flags: ["dang_lam_quan"]`, `max_infamy: 20`.
  - Mạch nội dung: *Xử án oan cho dân nghèo*, *Tuần tra đê điều mùa lũ*, *Từ chối lễ vật của hào cường*, *Được Ngự sử khen ngợi tấu trình* (tăng `fame` để thăng phẩm hàm).
- **File 4 (`src/data/events/truong_thanh/official_corrupt.json` — 5–6 events):**
  - Đối tượng: `has_flags: ["dang_lam_quan"]`.
  - Mạch nội dung: *Móc ngoặc lái buôn chia phần*, *Nhận hối lộ chạy án*, *Kết bè đảng triều đình*, *Đoàn thanh tra Ngự sử ập tới* (rủi ro mất chức/tịch thu gia sản/vào tù nếu `infamy` quá cao).

---

## 4. Quy Trình Kiểm Chứng Sau Mỗi Đợt
1. `npm run gen:index` → Cập nhật `docs/event-index.md`.
2. `npm run build` → 0 lỗi TypeScript & Vite build.
3. `npm test` → Pass 100% unit test & `dataIntegrity.test.ts`.
4. `npm run audit:1000` (200 kiếp) → Kiểm tra trong `docs/audit-report-1000.md`:
   - Các sự kiện mới **đều xuất hiện** (không nằm trong `Dead Major Events 0%`).
   - Tỷ lệ `Quan hàm > 0` của nhóm `cong_danh` tăng từ `0–5%` lên mức lành mạnh (`15–30%`).
   - Không phát sinh `anomalies` xung đột thân phận.
