# 05 — Sự Kiện, Nghịch Cảnh, Gia Đình & Tử Vong

---

## 1. Nhịp Độ Sự Kiện & Quyết Định (`EventModal`)

- **Tuổi thơ (`0–12 tuổi`):** Mỗi năm chọn ngẫu nhiên 1–2 sự kiện định hình tính khí, sở thích và biến cố gia đình; xen kẽ dòng nhật ký đời sống nhẹ nhàng theo tháng (`childhood_logs`).
- **Trưởng thành (`13+ tuổi`):**
  - Sự kiện thường nhật (`minor`) tự động xử lý và ghi vào Nhật ký.
  - Sự kiện lớn (`major` / `isMilestone`) tự động **tạm dừng thời gian** và bật `EventModal`, giới hạn giãn cách tối thiểu `25 ngày` giữa 2 quyết định lớn để tránh dồn dập.
- **Thao tác trên `EventModal` (Chuẩn `1in8b`):**
  - Hiển thị nhãn loại sự kiện (`Quyết định lớn` / `Bước ngoặt cuộc đời`), tuổi & niên hiệu hiện tại, nội dung, và hộp ghi chú bối cảnh (`contextNote`).
  - Lựa chọn đánh số `1, 2, 3...` kèm dòng gợi ý tác động hoặc lý do bị khóa rõ ràng.
  - **Nút `Tạm gác lại ▾`:** Thu gọn modal thành một thanh nổi gọn ở góc/trên màn hình, cho phép người chơi tự do xem lại **Hồ sơ**, **Tài sản**, **Nhật ký** trước khi bấm *"Mở lại quyết định"* để chọn.
  - **Nút `Tự động quyết định`:** Bật chế độ tự chọn phương án tối ưu ngay trên modal.

---

## 2. Nghịch Cảnh & Biến Cố Thời Cuộc

- **Thời cuộc (`worldState`):** Luân chuyển theo triều đại giữa `Thái bình ổn định`, `Mất mùa đói kém`, `Dịch bệnh hoành hành`, `Chiến tranh loạn lạc` — tác động trực tiếp đến giá lúa, sinh hoạt phí và lợi nhuận buôn bán.
- **Gia tộc sa sút / Thất sủng:** Tụt trực tiếp `Hoàn cảnh gia đình` trên Hồ sơ và cắt chu cấp.
- **Thân phận đặc biệt:** `Đi ở đợ`, `Gia nô trừ nợ`, `Tại ngũ`, `Cung nữ / Thái giám` được hiển thị rõ ràng ở dòng Sinh kế trên Hồ sơ.

---

## 3. Gia Đình, Hôn Nhân & Hậu Duệ

- Người chơi có thể `Thành gia lập thất` (khi đủ tuổi & điều kiện) và `Sinh con nối dõi`.
- Danh sách người thân (`FamilyLifeCard`) hiển thị quan hệ, tuổi tác (tự tăng theo năm), tình trạng sống/mất và độ thân thiết (`affinity`).
- Con cái trưởng thành hoặc vợ/chồng giúp nâng đỡ tinh thần (`Quan hệ` nền) và chia sẻ biến cố gia tộc.

---

## 4. Tử Vong, Bia Mộ & Tàng Kinh Các

- **Điều kiện kết thúc:** `health <= 0`, tuổi già kiệt sức, đói khát kéo dài hoặc bị xử tử trong sự kiện.
- **Màn hình Bia Mộ (`TombstoneView`):**
  - Hiển thị nguyên nhân qua đời, tuổi thọ, danh hiệu tổng kết cuối đời (`end_...`).
  - Toàn bộ **Bản đồ cuộc đời (`LifeGrid`)** và các cột mốc vàng son.
  - Lưu snapshot kiếp sống vào **Tàng Kinh Các (`useLegacyArchiveStore`)** — thuần túy lưu trữ kỷ niệm & giao diện trang trí (Zero Meta-Buff).
