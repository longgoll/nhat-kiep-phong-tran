---
name: add-story-branch
description: Quy trình chuẩn để thiết kế, thêm mới hoặc mở rộng một nhánh cốt truyện / nhóm sự kiện (VD Học trò nghèo-giàu, Quan trường, Võ tướng) tiết kiệm token và kiểm chứng tự động bằng Monte Carlo Audit.
---

# Quy Trình Thêm Nhánh Cốt Truyện Mới (`add-story-branch`)

Thực hiện đúng 4 bước sau khi người dùng yêu cầu thêm nhánh sự kiện hoặc cốt truyện mới:

## Bước 1: Tra cứu nhanh (Không đọc tràn lan)
1. Đọc `docs/event-index.md` để kiểm tra:
   - Các `flags` đã có sẵn (tái sử dụng đúng tên, tránh tạo flag trùng nghĩa hoặc sai chính tả).
   - Các event hiện có trong cùng chủ đề để không trùng lặp nội dung.
2. Nếu cần xem schema `ConditionSpec` / `EffectSpec`, chỉ đọc `src/types/dsl.ts` (176 dòng).

## Bước 2: Thiết kế & Ghi file JSON nhỏ gọn
1. Tạo file mới trong `src/data/events/<stage>/<ten_nhanh_nho>.json` (giữ `<= 8` sự kiện / file, `< 350` dòng).
2. Đặt điều kiện rõ ràng:
   - Kiểm tra xung đột thân phận (`missing_flags`: `["trong_hau_cung"]` nếu là sự kiện tự do bên ngoài, `["dang_lam_quan"]` nếu là sự kiện dân thường/buôn bán...).
   - Đặt `cooldownDays >= 1080` (hoặc `oncePerLife: true`) cho sự kiện `major` để tránh lặp vô lý; đặt `cooldownDays: 0` cho các bước sau trong chuỗi `schedule_delayed`.
3. Nếu nhánh cần một ngã rẽ chủ động theo năm (kiểu `DEC.*`), thêm vào `DYNAMIC_DECISION_PRIORITIES` và `generateDynamicDecisionInternal` trong `src/engine/decisionGenerator.ts`.

## Bước 3: Cập nhật Index & Kiểm tra Tính toàn vẹn
Chạy tuần tự:
```bash
npm run gen:index
npm run build
npm test
```
Đảm bảo `dataIntegrity.test.ts` (trùng ID, sai `origin_in`, gãy link `schedule_delayed`) và `lifeAuditSimulation.test.ts` pass 100%.

## Bước 4: Kiểm chứng Thực tế bằng Giả lập (`audit:1000`)
1. Nếu nhánh mới cần điều kiện đặc thù từ Bot (VD: hành động bổ nhiệm quan, chọn lối sống cụ thể), cập nhật thêm logic cho Bot Archetype tương ứng trong `src/engine/__tests__/audit1000.audit.ts`.
2. Chạy `npm run audit:1000` (200 kiếp mặc định).
3. Đọc `docs/audit-report-1000.md`:
   - Kiểm tra các event mới **không nằm trong danh sách Dead Major Events (0%)**.
   - Soi phần **Outliers / Sample Chronicles** để đảm bảo không có lỗi nhân quả (VD: đang ở tù/hậu cung mà vẫn nổ sự kiện bên ngoài).
   - Kiểm tra tuổi thọ TB và tài sản TB giữ được sự phân hóa hợp lý.
