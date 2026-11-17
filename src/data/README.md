# Quy ước tổ chức Data (`src/data/`)

Toàn bộ file `.json` trong các thư mục con được gom tự động qua [`registry.ts`](./registry.ts) bằng `import.meta.glob` — chỉ cần tạo file mới đúng thư mục là game tự nhận.

## Quy ước 3 lớp cho Events (`events/tho_au/`, `events/dong_au/`, `events/truong_thanh/`)

1. **`common.json`** — Sự kiện dùng chung cho mọi xuất thân (thời tiết, ốm đau, lễ hội, hôn nhân, bạn bè...). Có thể dùng `weight.modifiers` để chỉnh xác suất theo hoàn cảnh.
2. **`tier_*.json`** — Sự kiện dùng chung theo nhóm tầng lớp:
   - `tier_binh_dan.json` (`ban_nong`, `thu_cong`)
   - `tier_trung_luu.json` (`thu_cong`, `dia_chu`)
   - `tier_thuong_luu.json` (`dia_chu`, `quan_lai`, `hoang_toc`)
   - `tier_cung_dinh.json` (`quan_lai`, `hoang_toc`)
3. **`origin_*.json`** — Sự kiện đặc thù của từng gia thế (`origin_ban_nong.json`, `origin_thu_cong.json`, `origin_dia_chu.json`, `origin_quan_lai.json`, `origin_hoang_toc.json`).
4. **`circ_*.json`** — Sự kiện kích hoạt theo hoàn cảnh / biến cố (`mac_no`, `gia_toc_sa_sut`, `mo_coi_cha`, ra ở riêng, flag từ sự kiện trước...).
5. **`loc_*.json`** — Sự kiện theo nơi ở / địa điểm (làng quê, kinh thành...).
6. **`events/chains/`** — Chuỗi sự kiện có cốt truyện nối tiếp nhiều bước (tự phân vào `childhood` hoặc `adulthood` theo trường `stage`).

## Kiểm tra dữ liệu
Chạy `npm test` để [dataIntegrity.test.ts](./__tests__/dataIntegrity.test.ts) tự động kiểm tra trùng `id`, cấu trúc `choices`/`outcomes`, `origin_in` hợp lệ và tham chiếu `schedule_delayed`.
