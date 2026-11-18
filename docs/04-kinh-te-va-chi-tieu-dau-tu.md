# 04 — Kinh Tế, Đầu Tư & Hộp Thoại "Chi Tiêu · Đầu Tư" (`shopRank`)

> Áp dụng 100% mô hình Tài chính & Hộp thoại 3 tầng của `1in8b.life/vi`.

---

## 1. Tài Chính Cuối Năm & Cơ Chế Nợ (`wealthCopper < 0`)

- **Không trừ cơm áo từng ngày:** Bỏ việc trừ gạo/tiền lắt nhắt từng ngày gây kẹt vòng lặp `no_food`. Cuối mỗi năm tính gọn:
  `Thu nhập năm (Lao động/Bổng lộc + Kinh doanh + Điền sản + Vợ/chồng + Con phụng dưỡng) − Sưu thuế − Sinh hoạt phí (theo mức sống & gia đình) → cộng/trừ vào wealthCopper`.
- **Nợ (`wealthCopper < 0`):**
  - `Tài sản ròng` và `Tiền mặt` đổi màu đỏ, hiển thị rõ mục **`Nợ`** (ví dụ `-1 Bạc 200 Đồng`).
  - Khi nợ phình to, tự bật **`DEC.loan`** (*"Nợ đã phình to"*): xin gia đình cứu trợ (`Quan hệ↓`), bán điền sản/tài sản trả nợ, hoặc vay nặng lãi địa chủ.

---

## 2. Cấu Trúc 3 Tầng Của Hộp Thoại "Chi Tiêu · Đầu Tư"

Mở được từ **6 tuổi trở lên** (tuổi `6–12` chỉ hiện các mục hợp tuổi như tặng quà cha mẹ, mua sách/đồ chơi sở thích; ẩn hoàn toàn mục `Lối sống` & `Đầu tư`). Thời gian tự động **tạm dừng** khi mở bảng này.

1. **Header Tài Chính:** Hiển thị `Tiền tiết kiệm` (hoặc `Nợ` màu đỏ nếu âm), `Thu nhập năm`, `Gạo dự trữ` và giải thích tài sản thanh khoản vs điền sản cố định.
2. **`"Nên làm lúc này"` (`rankSpendActions` — Top 4–6 mục):**
   - Chấm điểm từng mục theo hoàn cảnh thực tế:
     - Đang `seeking` hoặc `Nợ`: đẩy **Tìm chỗ làm mới**, **Bán điền sản / Đổi vàng** lên đầu; trừ điểm các mục ăn chơi tốn kém.
     - `Sức khỏe < 55` hoặc `Tuổi >= 50`: đẩy **Khám thầy lang / Bốc thuốc bổ** lên đầu.
     - Đủ tuổi & chưa học xong: đẩy **Học lớp đêm thầy đồ (`ged`)** / **Thi Khoa cử** lên đầu.
3. **`"Xem thêm (N)"` (Thu gọn mặc định):**
   - **Tài sản sở hữu 1 lần (`ITEMS` cổ trang):** *Bút nghiên tốt*, *Áo gấm*, *Xe ngựa*, *Thư phòng*, *Nhà tranh / Nhà gạch / Phủ đệ*.
   - **Các hành động khác:** Xã giao, Tu luyện, Gia thất/Con cái, Khoa cử/Quan trường, Mua bán Gạo/Vàng, Khởi nghiệp/Điền sản.
4. **`"Lối sống & Đầu tư"` (Thu gọn mặc định, ẩn khi `< 15 tuổi`):**
   - **Đầu tư tiền nhàn rỗi (`INV_KS` cổ trang):** *Giữ tiền mặt (0%)*, *Gửi tiền trang (~1.5%/năm)*, *Hùn vốn thương hội (~3.5%/năm)*, *Buôn chuyến đường dài (~5%/năm)*, *Quỹ điền sản (~4%/năm)*.
   - **Lối sống:** Mức sống (`Nhịn đói` → `Sơn hào`), Tiền hiếu hỉ, Auto-Pause (Sinh nhật / Mốc tuổi `5, 15, 30, 50, 70` / HP `< 20%`), Tự động hằng năm.
   - *(Khi ở trong tù: chỉ hiện `Gửi thư thăm gia đình` và `Viết di chúc`.)*
