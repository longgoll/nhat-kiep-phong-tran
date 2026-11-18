# Nhất Kiếp Phong Trần — Tài Liệu Thiết Kế & Quy Chuẩn Kỹ Thuật (v4.0)

> Bộ tài liệu chuẩn hóa toàn diện cho **Nhất Kiếp Phong Trần**, được thiết kế lại dựa trên các nguyên tắc kiến trúc, cân bằng số học và trải nghiệm UX của [`1in8b.life/vi`](./1in8b-reference/README.md), kết hợp với bối cảnh phong kiến Đông Á.

---

## 1. Mục Lục Tài Liệu

| STT | Tài liệu | Nội dung chính |
| :--- | :--- | :--- |
| 00 | [README.md](./README.md) | Triết lý cốt lõi, quy ước kỹ thuật, bảng ánh xạ từ `1in8b.life/vi` |
| 01 | [01-khoi-dau-va-ho-so.md](./01-khoi-dau-va-ho-so.md) | Khởi đầu (`#intro`, `#guard`), Gacha 5 tầng lớp, Giấy khai sinh, 4 Đồng niên, Tính khí & Hồ sơ Sổ bộ |
| 02 | [02-chi-so-hoc-van-va-trong-tam.md](./02-chi-so-hoc-van-va-trong-tam.md) | 4 chỉ số cốt lõi (`0–100`), Học vấn 6 bậc, Trọng tâm năm động (`lifeFocus`), Lão hóa & Hồi quy |
| 03 | [03-nghe-nghiep-khoa-cu-va-kinh-doanh.md](./03-nghe-nghiep-khoa-cu-va-kinh-doanh.md) | Hệ thống Nghề nghiệp thống nhất, Khoa cử · Quan trường, Khởi nghiệp · Điền sản |
| 04 | [04-kinh-te-va-chi-tieu-dau-tu.md](./04-kinh-te-va-chi-tieu-dau-tu.md) | Tiền tệ (`wealthCopper` hỗ trợ âm = Nợ), Gạo & Vàng, Hộp thoại **"Chi tiêu · Đầu tư"** 3 tầng (`shopRank`) |
| 05 | [05-su-kien-nghich-canh-va-tu-vong.md](./05-su-kien-nghich-canh-va-tu-vong.md) | Nhịp độ sự kiện, Nghịch cảnh (Nợ, Thất nghiệp, Sa sút, Bệnh tật), Gia đình, Tử vong & Tàng Kinh Các |
| 06 | [06-dac-ta-ui-ux.md](./06-dac-ta-ui-ux.md) | Luồng màn hình, TopBar thống nhất, Dashboard 3 cột, Decision Modal (`Tạm gác lại`) & Bản đồ cuộc đời |
| 07 | [07-kien-truc-plan-year-va-auto-test.md](./07-kien-truc-plan-year-va-auto-test.md) | Kiến trúc `planYear` 2 kênh, bảng priority, cách mở rộng event/decision & quy chuẩn Auto-Test giả lập |
| 08 | [story-map.md](./story-map.md) | Bản đồ cốt truyện 0–80+ tuổi, Ma trận xung đột thân phận & lộ trình mở rộng Học trò / Quan trường |
| Index | [event-index.md](./event-index.md) | Từ điển tự sinh toàn bộ Event ID & Flags (`npm run gen:index`) |
| Ref | [1in8b-reference/README.md](./1in8b-reference/README.md) | Tài liệu nghiên cứu gốc từ `1in8b.life/vi` |

---

## 2. Triết Lý & 4 Nguyên Tắc Bất Biến

1. **Một kiếp trọn vẹn:** Bắt đầu từ 0 tuổi và kết thúc hoàn toàn khi nhân vật qua đời (`health <= 0`, tuổi già hoặc bị xử tử). Không truyền đời cho con cháu.
2. **Công bằng tuyệt đối (Zero Meta-Buff):** Xóa trắng `active_life` khi Game Over. `legacy_archive` (Tàng Kinh Các) chỉ lưu thành tích, văn bia và giao diện trang trí (Pure Cosmetic), tuyệt đối không cộng chỉ số cho kiếp sau.
3. **Xuất thân định điểm khởi đầu, không khóa tương lai:** Xuất thân quyết định tài nguyên ban đầu, gia cảnh và áp lực rủi ro; mọi con đường (Khoa cử, Thương nghiệp, Võ bị, Khởi nghĩa) đều mở nếu đủ nỗ lực và cơ duyên.
4. **Rõ ràng, nhất quán, không mơ hồ (Nguyên tắc `1in8b`):**
   - Người chơi **không bao giờ phải đoán** trạng thái hiện tại (nghề nghiệp, học vấn, nợ nần, gia cảnh đều hiển thị trực diện trên Hồ sơ).
   - Danh sách thao tác và Trọng tâm **tự động biến đổi theo giai đoạn & hoàn cảnh**, tách biệt "Việc nên làm lúc này" khỏi "Kho tùy chọn mở rộng".
   - Thời gian tự động tạm dừng khi mở Quyết định hoặc Chi tiêu · Đầu tư; cho phép **Tạm gác lại** để soi lại Hồ sơ trước khi chọn.

---

## 3. Bảng Ánh Xạ Thiết Kế (`1in8b.life/vi` → `Nhất Kiếp Phong Trần`)

| Phân hệ `1in8b` | Áp dụng vào `Nhất Kiếp Phong Trần` |
| :--- | :--- |
| `#intro` + `#guard` (Cảnh báo mất save) | `StartScreen`: Nếu đang có kiếp chơi dở, xác nhận trước khi mở kiếp mới hoặc cho phép tiếp tục ngay. |
| Giấy khai sinh + 4 Người đồng niên | `BirthCertificateView`: Mã số `NK-<seed>`, xuất thân 5 tầng lớp, hoàn cảnh gia đình (`1/5–5/5`), 4 đồng niên lớn lên song song. |
| Thẻ Hộ chiếu (`Hoàn cảnh`, `Học vấn`, `Nghề nghiệp`) | Thẻ **Hồ Sơ Cá Nhân** (dạng Sổ bộ phong kiến): hiển thị rõ bậc học vấn, nghề nghiệp / `Đang tìm việc` / `Nghỉ hưu`, hoàn cảnh gia đình `1/5–5/5`, tính khí & năng khiếu. |
| 4 thanh chỉ số `0–100` (`SK`, `HP`, `KT`, `QH`) | 4 thanh chính `0–100`: `Sức khỏe`, `Hạnh phúc`, `Học thức`, `Quan hệ`. Các chỉ số phụ (`Võ nghệ`, `Thương tài`, `Thanh danh`, `Tai tiếng`) hiển thị gọn ở hàng phụ. |
| Trọng tâm năm (`S.focus`) đổi theo ngữ cảnh | `LifeFocus` pills đổi linh hoạt theo 4 ngữ cảnh: `Tuổi thơ (0–12)`, `Đang đi làm / Quan trường`, `Đang tìm việc (Thất nghiệp)`, `Tuổi già (60+)`. |
| `Chi tiêu · đầu tư` 3 tầng (`shopRank`) | Modal **Chi tiêu · Đầu tư**: `Nên làm lúc này` (top 4–6 việc chấm điểm theo hoàn cảnh) → `Xem thêm (N)` (thu gọn) → `Lối sống & Tự động` (thu gọn). |
| Tiền âm = `Nợ` (màu đỏ) | `wealthCopper` cho phép âm (`< 0`), hiển thị chữ **Nợ** màu đỏ và đẩy các lựa chọn giải cứu (Tìm việc, Bán điền sản, Vay địa chủ) lên đầu. |
| Decision Modal có `Tạm gác lại` & `Tự động` | `EventModal`: Nút **`Tạm gác lại ▾`** thu gọn modal thành thanh bar nhỏ để người chơi xem lại Hồ sơ/Tài sản/Nhật ký trước khi chọn, kèm nút **`Tự động quyết định`**. |
| `LifeTopBar` + `Tới quyết định tiếp theo` | Đồng bộ 1 chuẩn tốc độ (`1×, 2×, 4×, 8×`) và nút `Tới quyết định tiếp theo` xuyên suốt từ 0 tuổi đến cuối đời. |

---

## 4. Quy Ước Kỹ Thuật & SSOT

- **Single Source of Truth (SSOT):**
  - Thời gian: Chỉ lưu `profile.totalDays` (`1 năm = 360 ngày`, `1 mùa = 90 ngày`, `1 tháng = 30 ngày`).
  - Tiền tệ: Chỉ lưu `assets.wealthCopper` (số nguyên, âm = nợ). Quy đổi UI: `1 Vàng = 10 Bạc = 10.000 Đồng`.
  - Ngẫu nhiên: Mọi tung xúc xắc đều dùng `mulberry32` với `prngState` trong `ActiveLifeState`. Tuyệt đối không dùng `Math.random()`.
  - Điều kiện JSON: Đi qua `ConditionEvaluator` thuần túy, không dùng `eval()`.
