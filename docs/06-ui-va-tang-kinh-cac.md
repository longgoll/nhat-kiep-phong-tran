# 06 — Thiết Kế Giao Diện Dashboard, Bia Mộ & Tàng Kinh Các

## 1. Bố Cục Dashboard 3 Cột (Modular UI)

- **Desktop (`>= 1024px`):** Hiển thị song song 3 cột.
- **Mobile / Tablet (`< 1024px`):** Tự động chuyển thành thanh Tab cố định dưới đáy màn hình (`Hồ sơ` | `Điều hành` | `Nhật ký`), giữ nguyên thanh 4 chỉ số cơ bản ghim trên cùng.

### Cột Trái — Hồ Sơ & Chỉ Số
1. **Thẻ Nhân vật:** Chân dung SVG/minh họa thay đổi theo *Độ tuổi (Thơ ấu / Thiếu niên / Trung niên / Lão niên) + Giới tính + Trang phục chức tước*, Tên, Tuổi, Xuất thân, Danh phận hiện tại.
2. **4 Thanh Chỉ Số Cơ Bản (`0–100%`):** `Sức khỏe`, `Hạnh phúc`, `Quan hệ` (nhấn vào để mở Modal danh sách chi tiết từng `NPC`), `Học thức`.
3. **Nhóm Chỉ Số Chuyên Sâu:** `Võ nghệ`, `Thương tài`, `Thanh danh`, `Uy thế` (chỉ hiện các chỉ số đã mở khóa hoặc `> 0` để giao diện gọn gàng).
4. **Kho Tài Sản:** Hiển thị `wealthCopper` quy đổi thành `Vàng / Bạc / Đồng`, số đấu `Lúa gạo`, chỗ ở (`housing`) và danh sách điền sản (`properties`).

### Cột Giữa — Bảng Điều Hành (Action Planner)
1. **Lưới Thời Khóa Biểu 4 Buổi:** `Sáng` – `Chiều` – `Tối` – `Đêm`, kèm thanh **Thể lực (`stamina / maxStamina`)** ngay bên dưới.
2. **Cấu hình Tự động:** Chọn *Mức sống (`LifestyleTier`)*, *Trọng tâm sống*, và nút mở bảng cài đặt *Quy tắc dự phòng (`FallbackRules`)*.
3. **Cụm nút Tua Thời Gian:** `[+1 Ngày]` `[+1 Tuần]` `[+1 Tháng]` `[+1 Mùa]`.
4. **Các Thẻ Chức Năng Mở Khóa Động:**
   - *Khoa cử & Thư viện:* Mở khi `education >= 10` hoặc có flag `duoc_thay_do_quy`.
   - *Thương hội & Giá cả:* Mở khi `craftTrade >= 10` hoặc `wealthCopper >= 1.000`.
   - *Công đường & Phe phái:* Mở khi nhân vật làm quan (có chức tước).
   - *Mật thất Khởi nghĩa:* Mở khi `fame >= 70` hoặc `infamy >= 70`.

### Cột Phải — Thời Cuộc & Nhật Ký
1. **Bảng Tin Thời Cuộc:** Niên hiệu triều đại, Mùa hiện tại, Trạng thái xã hội (`worldState`), Giá lúa gạo (`ricePriceInCopper` kèm mũi tên tăng/giảm).
2. **Nhật Ký Đời Người (Life Feed):** Hiển thị tối đa **150 dòng** gần nhất (Rolling Buffer), phân màu theo `category` (`survival`, `study`, `event`, `warning`).
3. **Thẻ Sự Kiện Tương Tác (Modal):** Bật lên chính giữa màn hình khi có biến cố `severity: "major"` hoặc Auto-Pause.

---

## 2. Màn Hình Kết Thúc: Bia Mộ & Sử Ký Một Đời

Khi `isAlive === false`:
1. **Hiển thị Bia Mộ:** Tên nhân vật, Xuất thân, Giới tính, Thọ `X` tuổi, Nguyên nhân tử vong (`deathReason`), và **Danh hiệu tổng kết** (VD: *"Bần nông chết cóng mùa đông"*, *"Thần đồng đỗ đạt"*, *"Khai quốc Hoàng đế"*).
2. **Biểu đồ Sử Ký (`Recharts`):** Vẽ đường biến động tài sản (`netWorthInCopper`) và danh vọng (`fame`) qua các mốc `milestones[]` (tối đa 30 mốc cả đời).
3. **Nút "Ghi Sử & Đầu Thai Kiếp Mới":**
   - Lưu bản tóm tắt vào `useLegacyArchiveStore`.
   - **Xóa trắng 100%** dữ liệu `useActiveLifeStore` (`active_life`) để đảm bảo kiếp sau hoàn toàn độc lập.

---

## 3. Tàng Kinh Các (`legacy_archive` — Pure Cosmetic Meta)

> **Quy tắc tuyệt đối:** Không có bất kỳ vật phẩm, điểm cộng hay đặc quyền nào trong Tàng Kinh Các được phép tác động vào chỉ số hay tỷ lệ RNG của kiếp chơi mới.

Các hạng mục lưu trữ trong `useLegacyArchiveStore`:
1. **Bách Khoa Kết Cục (Codex):** Bộ sưu tập các Kết cục hiếm, Bệnh tật đã gặp, Sự kiện ẩn đã mở khóa (hiển thị dạng thẻ đã mở / chưa mở `???`).
2. **Giao Diện & Trang Trí (Cosmetics):** Mở khóa khi đạt các cột mốc kết cục:
   - Chủ đề giao diện Dashboard: *Mặc định*, *Giấy Dó Cổ*, *Mực Tàu Thủy Mặc*, *Son Thếp Hoàng Gia*.
   - Khung Bia Mộ đặc biệt & Nhạc nền cổ phong.
3. **Thống Kê Cá Nhân:** Tổng số kiếp đã sống, Tuổi thọ trung bình, Tuổi thọ cao nhất, Bảng tỷ lệ xuất thân thực tế đã quay trúng, Danh sách tối đa 50 Bia Mộ gần nhất (tránh phình dung lượng `localStorage`).
