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
  ├── TRỤ CỘT VĂN (Học trò Nghèo/Giàu → Khoa cử → Quan trường → Cung đình nội đấu) [Đã hoàn thiện]
  ├── TRỤ CỘT THƯƠNG (Nghề, Khởi nghiệp, Điền sản) [Đã hoàn thiện]
  └── TRỤ CỘT VÕ / GIANG HỒ (Võ tướng Biên ải, Khởi nghĩa, Giang hồ) [Đã hoàn thiện]
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

## 3. Các Nhánh Đã Triển Khai & Kiểm Chứng (95.0% Coverage · 268 Events)

### Đợt 1 — Nhánh Học Trò Nghèo vs. Học Trò Giàu (Đã xong)
- `src/data/events/truong_thanh/scholar_poor.json` (5 sự kiện: chép sách thuê, thầy đồ nhận môn sinh, phú hộ kén dâu rể, thi trượt, quỹ nghĩa học).
- `src/data/events/truong_thanh/scholar_rich.json` (5 sự kiện: hội văn thơ, rủ rê tửu sắc, chạy cửa sau, áp lực gia phong, giúp sĩ tử nghèo).

### Đợt 2 — Nhánh Quan Trường, Phe Phái & Cung Đình Nội Đấu (Đã xong)
- Engine: `official_rank_delta` (`dsl.ts` / `effectApplier.ts`), `dec_official_appoint` & `dec_official_promote` (`decisionGenerator.ts`).
- `src/data/events/truong_thanh/official_clean.json` (4 sự kiện Thanh quan).
- `src/data/events/truong_thanh/official_corrupt.json` (4 sự kiện Tham quan & thanh tra).
- `src/data/events/truong_thanh/official_factions.json` (5 sự kiện: 3 phe `phe_thanh_luu` / `phe_quyen_than` / `phe_hoang_tu`, đại án, liên lụy & phục chức).
- `src/data/events/truong_thanh/official_intrigue.json` (4 sự kiện: vu khống, đàn hặc đối thủ, biên viễn, khâm sai).
- `src/data/events/truong_thanh/court_succession.json` (4 sự kiện: Trữ vị, Tân Hoàng đăng cơ, mật chỉ binh biến, liên minh hậu cung).

### Đợt 3 — Nhánh Võ Tướng Biên Ải & Khởi Nghĩa (Đã xong)
- `src/data/events/truong_thanh/martial_general.json` (5 sự kiện: xuất chinh, tử thủ thành trì, văn-võ bất hòa, quân công phong võ quan, mở võ quán).
- `src/data/events/truong_thanh/rebellion_arc.json` (4 sự kiện: ngọn lửa khởi nghĩa, chiêu mộ thảo khấu, trận quyết chiến kinh thành, kết nghĩa giang hồ).

---

## 4. Quy Trình Kiểm Chứng Sau Mỗi Đợt
1. `npm run gen:index` → Cập nhật `docs/event-index.md`.
2. `npm run build` → 0 lỗi TypeScript & Vite build.
3. `npm test` → Pass 100% unit test & `dataIntegrity.test.ts`.
4. `npm run audit:1000` (200 kiếp) → Kiểm tra trong `docs/audit-report-1000.md`:
   - Các sự kiện mới **đều xuất hiện** (không nằm trong `Dead Major Events 0%`).
   - Tỷ lệ `Quan hàm > 0` của nhóm `cong_danh` tăng từ `0–5%` lên mức lành mạnh (`15–30%`).
   - Không phát sinh `anomalies` xung đột thân phận.
