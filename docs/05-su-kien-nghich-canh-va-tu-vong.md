# 05 — Sự Kiện, Tù Tội (`goPrison`), Gia Đình & Tử Vong (`deathProb`)

> Áp dụng 100% cơ chế Sự kiện năm, Tù tội, Gia đình và Tử vong của `1in8b.life/vi`.

---

## 1. Lịch Sự Kiện & Decision Modal (`Tạm gác lại`)

- Mỗi năm tung ra `2–3 sự kiện đời sống` ghi vào Nhật ký (xen kẽ ghi chú bối cảnh `contextNote`) và tối đa `1–2 quyết định lớn` (`EventModal`) để không dồn dập.
- `EventModal` tự tạm dừng thời gian, có nút **`Tạm gác lại ▾`** (thu gọn thành thanh nổi để xem lại Hồ sơ/Tài sản/Nhật ký trước khi chọn) và **`Từ giờ để tự động quyết định`**.

---

## 2. Tội Phạm, Tù Tội & Ân Xá (`goPrison`, `DEC.parole`)

- Kích hoạt khi `Tai tiếng (infamy)` quá cao hoặc phạm tội/dính án oan trong sự kiện:
  - Giải thể cơ sở kinh doanh đang làm chủ, tạm dừng học/việc, chuyển trạng thái sang **`Trong tù`**, đặt `prisonUntil = age + years`, `Hạnh phúc -15`, `Quan hệ -10`.
  - Khi đi qua nửa bản án, tự bật **`DEC.parole`** cho phép xin ân xá sớm (tỷ lệ thành công phụ thuộc cải tạo & gia đình bảo lãnh).
  - Ra tù (trừ án oan) để lại tiền án (`record`), khóa một số nghề quan trường/chính thức cho tới khi chuộc lỗi (`atone`).

---

## 3. Gia Đình, Hôn Nhân & Tài Chính Hộ

- Vợ/chồng còn sống đóng góp thu nhập hằng năm (giúp người chọn `Nội trợ` vẫn có nguồn sống).
- Con nhỏ (`< 18t`) tốn chi phí nuôi ăn học hằng năm; con trưởng thành (`>= 22t`) gửi tiền phụng dưỡng cha mẹ già (`>= 60t`, đặc biệt khi không có lương hưu).
- Tuổi của mọi NPC tự tăng mỗi năm cùng nhân vật chính.

---

## 4. Tử Vong (`deathProb`), Đường Cong Sống Sót & Tàng Kinh Các

- **Xác suất tử vong (`deathProb`):**
  - Lấy xác suất nền theo tuổi (`LT().q[age]`: thấp ở tuổi trẻ, tăng dần từ 55+, giới hạn tối đa 120–122 tuổi).
  - Nhân với chênh lệch sức khỏe: `max(0.5, exp((expectedHealth - health) * 0.025))` và rủi ro thời cuộc (`Chiến tranh`, `Dịch bệnh`, `Mất mùa`).
- **Màn hình qua đời (`TombstoneView`):**
  - Hiển thị nguyên nhân mất, văn bia, toàn bộ **Bản đồ cuộc đời (`LifeGrid`)**, các cột mốc lớn và lưu vào **Tàng Kinh Các** (`Pure Cosmetic`, Zero Meta-Buff).
