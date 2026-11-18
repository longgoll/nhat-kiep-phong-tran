---
trigger: always_on
---

# Quy Chuẩn Phát Triển & Tiết Kiệm Token (Nhất Kiếp Phong Trần)

1. **Tra cứu trước khi đọc JSON lớn:**
   - Khi cần biết danh sách sự kiện hoặc tên `flags`, đọc `docs/event-index.md` thay vì mở nhiều file trong `src/data/events/`.
   - Chỉ đọc đúng file JSON nhỏ cần sửa.

2. **Quy chuẩn chia file Event JSON (`src/data/events/`):**
   - Mỗi file JSON mới chỉ chứa **5–8 sự kiện** (~10–15 KB / `< 350` dòng), tách theo chủ đề con (VD: `scholar_poor.json`, `official_clean.json`).
   - `registry.ts` tự quét `*.json` bằng `import.meta.glob`, không sửa `registry.ts` khi thêm file cùng thư mục.
   - Quy tắc `cooldownDays`:
     - `0`: Chỉ dùng cho bước tiếp theo của chuỗi `schedule_delayed`.
     - `>= 1080` (hoặc `oncePerLife: true`): Dùng cho sự kiện `major` lặp lại hoặc cột mốc định hình nhân vật để tránh spam.
   - Luôn kiểm tra xung đột thân phận (`trong_hau_cung`, `thai_giam`, `dang_lam_quan`, `livelihoodStatus === 'prison'`).

3. **Kiến trúc `planYear` (`src/engine/yearPlanner.ts`):**
   - Không thêm cơ chế roll random từng ngày vào `daySimulator.ts`.
   - Quyết định lớn theo vòng đời/ngã rẽ đặt vào `src/engine/decisionGenerator.ts` với `priority` rõ ràng để `planYear` điều phối tối đa 2/năm.

4. **Quy trình kiểm chứng bắt buộc sau khi sửa:**
   - Nếu có thêm/sửa event JSON: chạy `npm run gen:index` để cập nhật `docs/event-index.md`.
   - Luôn chạy `npm run build` (`tsc -b && vite build`) và `npm test` (`vitest run`).
   - Nếu thêm nhánh truyện mới hoặc sửa cân bằng: chạy `npm run audit:1000` (mặc định 200 kiếp, ~2 phút) và đọc `docs/audit-report-1000.md` để đảm bảo nhánh mới không bị `0%` Dead Event và không phá cân bằng tuổi thọ/tài sản.
