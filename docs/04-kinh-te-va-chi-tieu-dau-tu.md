# 04 — Kinh Tế & Hộp Thoại "Chi Tiêu · Đầu Tư" (`shopRank`)

---

## 1. Hệ Thống Tiền Tệ & Nợ (`wealthCopper < 0`)

- **Đơn vị chuẩn (SSOT):** `wealthCopper` (Tiền đồng).
  - Quy đổi hiển thị: `1 Vàng = 10.000 Đồng`, `1 Bạc = 1.000 Đồng`.
- **Hỗ trợ Nợ (Số âm) kiểu `1in8b`:**
  - `formatCopper` hỗ trợ đầy đủ số âm (ví dụ `-1 Bạc 200 Đồng`).
  - Khi `wealthCopper < 0` hoặc có cờ `dang_no_dia_chu`:
    - Thẻ Tài chính đổi màu đỏ, hiển thị rõ mục **`Nợ`** thay vì giấu sau dấu `0`.
    - Các phương án giải cứu (Tìm việc làm ngay, Bán điền sản, Vay nóng địa chủ) tự động được ưu tiên đẩy lên đầu bảng `Chi tiêu · Đầu tư`.
- **Tài sản trú ẩn (`goldReserveCopper` & `rice`):**
  - **Vàng tích trữ:** Không bị mất giá khi loạn lạc/mất mùa; có thể mua/bán quy đổi theo thời giá.
  - **Gạo (`rice`, đơn vị: đấu):** Dùng cho sinh hoạt hàng ngày; giá lúa biến động theo mùa (`Mùa Hạ` đắt nhất, `Mùa Thu` rẻ nhất) và theo thời cuộc (`Chiến tranh` `×2.2`).

---

## 2. Cấu Trúc 3 Tầng Của Hộp Thoại "Chi Tiêu · Đầu Tư"

Thay thế danh sách đổ tràn lan cũ bằng cấu trúc **3 tầng gọn gàng của `1in8b`**:
> Mở được từ 13+ tuổi (hoặc nút `Chi tiêu · Đầu tư` ở cột trái & trung tâm). **Thời gian tự động tạm dừng** khi mở hộp thoại.

### Tầng 1: Header Tài Chính
- Hiển thị rõ: `Tiền mặt` (hoặc `Đang nợ` màu đỏ nếu âm), `Lương thực (Gạo)`, và `Chi cố định mỗi ngày` (hoặc *"Được gia đình chu cấp"* nếu đang sống chung và đủ điều kiện).

### Tầng 2: `"Nên làm lúc này"` (`rankSpendActions` — Top 4–6 mục)
Hệ thống chấm điểm từng hành động theo hoàn cảnh thực tế (`shopRank`) để chỉ đưa **4–6 việc hợp cảnh nhất** lên trên:
- **Chưa có việc (`!activeCareer && !activeVenture && officialRank === 0`):** Đẩy **`Tìm chỗ làm mới`** lên hạng cao nhất.
- **Đang nợ hoặc cạn tiền/gạo:** Đẩy **`Tìm chỗ làm mới`**, **`Bán điền sản / Vàng`** (nếu có), **`Vay nóng địa chủ`** lên đầu; hạ điểm các mục ăn chơi/tiêu tiền xa xỉ.
- **Sức khỏe `< 55` hoặc Tuổi `≥ 50`:** Đẩy **`Khám thầy lang / Bốc thuốc bổ`** lên đầu.
- **Hạnh phúc `< 45`:** Đẩy các mục giải trí, thăm hỏi, dạo phố lên đầu.
- **Đủ học thức thi Khoa cử:** Đẩy lộ trình **`Ứng thí Khoa cử`** lên trên.
- **Đủ tuổi & chưa kết hôn:** Đẩy **`Thành gia lập thất`** lên trên.

### Tầng 3: `"Xem thêm (N)"` & `"Lối sống & Tự động"` (Thu gọn mặc định)
- **`Xem thêm (N)`:** Chứa toàn bộ các hành động còn lại (Xã giao, Tu luyện, Đời sống, Khoa cử, Quan trường, Điền sản, Khởi nghĩa) — bấm để mở rộng khi cần.
- **`Lối sống & Tự động`:** Chứa cài đặt Mức sống hàng ngày (`Nhịn đói` → `Sơn hào`), Tiền hiếu hỉ, Tự động mua gạo, Tự động dừng khi tua nhanh (`Sinh nhật`, `HP < 20%`, `Hết gạo`), và các hành động `Tự động hằng năm`.
