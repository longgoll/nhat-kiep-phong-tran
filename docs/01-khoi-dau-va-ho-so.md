# 01 — Khởi Đầu, Xuất Thân, Đồng Niên & Hồ Sơ Cá Nhân

---

## 1. Màn Hình Khởi Đầu (`StartScreen`) & Cảnh Báo Save (`#guard`)

- **Tùy chọn khởi tạo:**
  - Nhập `Seed` tùy chỉnh (số hoặc chuỗi ký tự băm FNV-1a thành uint32) hoặc bỏ trống để gieo ngẫu nhiên.
  - Xem bảng tỷ lệ **5 tầng lớp xuất thân** (chỉ mang tính minh bạch, không cho chọn trước để giữ đúng tinh thần Gacha công bằng).
  - Truy cập **Tàng Kinh Các** (`LegacyArchiveModal`) hoặc **Nhập file Save (`.json`)**.
- **Bảo vệ dữ liệu (`#guard`):**
  - Nếu `localStorage` đang lưu một kiếp chưa kết thúc (`life !== null && life.isAlive`), màn hình khởi đầu hoặc nút "Bỏ kiếp / Khởi kiếp mới" phải yêu cầu xác nhận rõ ràng trước khi ghi đè.

---

## 2. Gacha Xuất Thân 5 Tầng Lớp & Gia Cảnh

Mỗi kiếp mới gieo ngẫu nhiên:
- **Giới tính:** `50%` Nam / `50%` Nữ.
- **Xuất thân (`originClass`):**

| Tầng lớp | Tỷ lệ | Hoàn cảnh gia đình (`1/5–5/5`) | Tiền khởi đầu | Điểm tựa & Áp lực đặc thù |
| :--- | :---: | :---: | :--- | :--- |
| **Bần nông** (`ban_nong`) | `60%` | `1/5` (Túng thiếu) | `0–20 Đồng` | Tự lập từ nhỏ, dễ phải đi ở đợ, tuổi thọ nền thấp hơn nhưng sức bền tốt. |
| **Thợ thủ công · Tiểu thương** (`thu_cong`) | `20%` | `2/5` (Đủ ăn) | `50–200 Đồng` | Có nền tảng `Thương tài`, gia đình hỗ trợ cơm rau tới 20 tuổi nếu không sa sút. |
| **Địa chủ · Hào phú** (`dia_chu`) | `10%` | `3/5` (Khá giả) | `500–2.000 Đồng` | Có điền sản gia đình, được ăn học sớm, dễ gặp biến cố chia gia tài hoặc kiện tụng. |
| **Quan lại thế gia** (`quan_lai`) | `7%` | `4/5` (Sung túc) | `2.000–5.000 Đồng` | Nền `Học thức` và `Quan hệ` cao, dễ vào trường huyện/Quốc Tử Giám, áp lực giữ thanh danh. |
| **Hoàng tộc · Tôn thất** (`hoang_toc`) | `3%` | `5/5` (Hoàng gia) | `8.000–20.000 Đồng` | Giàu sang tột bậc lúc đầu, nhưng dính rủi ro chính biến cung đình (`that_sung_cung_dinh`). |

- **Suy giảm gia cảnh động:** Nếu xảy ra sự kiện `gia_toc_sa_sut` hoặc `that_sung_cung_dinh`, mức `Hoàn cảnh gia đình` trên Hồ sơ tụt trực tiếp (ví dụ `4/5 → 2/5`) và cắt chu cấp gia đình.

---

## 3. Giấy Khai Sinh (`BirthCertificateView`) & 4 Người Đồng Niên

Ngay sau khi quay số, hiển thị **Giấy Khai Sinh** trang trọng:
1. **Thông tin định danh:** Mã số `NK-<seed>`, họ tên, giới tính, quê quán (phủ/huyện/làng), thứ bậc trong nhà (`Con một`, `Con trưởng`, `Con thứ`, `Con út`), triều đại & niên hiệu.
2. **Gia cảnh:** Nghề nghiệp cha/mẹ, mức sống gia đình (`1/5–5/5`), tóm tắt điền sản/gia sản gốc.
3. **4 Người Đồng Niên (`cohortPeers`):**
   - Sinh ra cùng ngày với nhân vật chính (đại diện cho 4 tầng lớp khác nhau trong thiên hạ).
   - Mỗi người có tên, quê quán, xuất thân và **tuổi thọ dự kiến (`deathAge`)**.
   - Trong suốt cuộc đời, danh sách đồng niên ở cột phải cập nhật song song: hiển thị tuổi hiện tại, thân phận ước lượng theo độ tuổi (ví dụ: *Đang học chữ*, *Làm ăn tự lập*, *Thành gia lập thất*, hoặc *Mất năm X tuổi*).

---

## 4. Tính Khí, Năng Khiếu & Ước Mơ Thuở Nhỏ

Học theo cơ chế `1in8b`:
- **Tính khí (`traits`):** Hình thành trong giai đoạn `0–5 tuổi` qua các lựa chọn đầu đời và sự kiện tuổi thơ (ví dụ: *Hiếu kỳ*, *Năng động*, *Ấm áp*, *Kiên trì*).
- **Năng khiếu (`interests` & `hobbyLevels`):** Bộc lộ dần từ `3–12 tuổi` (tối đa 2–3 năng khiếu/sở thích nổi bật như *Đọc sách*, *Võ nghệ*, *Thương buôn*, *Cầm kỳ*, *Thủ công*). Luyện tập sở thích qua Trọng tâm hoặc hành động giúp tăng `Lv.1 → Lv.5`.

---

## 5. Thẻ "Hồ Sơ Cá Nhân" (Sổ Bộ Phong Kiến)

Luôn cố định ở đầu Cột Trái trong cả `ChildhoodView` (`0–12t`) và `AdultDashboard` (`13+t`), đảm bảo **không bao giờ bắt người chơi đoán trạng thái**:
- **Nhận diện:** Chân dung phong kiến (`FeudalPortrait` thay đổi theo tuổi, giới tính, xuất thân, phẩm hàm), Họ tên, Giới tính, Tuổi, Quê quán, Thứ bậc.
- **Trạng thái động (cập nhật tức thì):**
  - `Hoàn cảnh gia đình`: Hiển thị 5 vạch (`1/5 – 5/5`) kèm nhãn.
  - `Học vấn`: Nhãn bậc học hiện tại (từ *Chưa biết chữ* → *Vỡ lòng* → *Tú tài / Cử nhân / Tiến sĩ / Trạng nguyên*).
  - `Nghề nghiệp / Sinh kế`: Nhãn rõ ràng — tên nghề đang làm, phẩm hàm quan trường, hoặc trạng thái **`Đang tìm việc`**, **`Đang đi học`**, **`Nghỉ hưu`**, **`Gia nô trừ nợ`**, **`Tại ngũ`**.
- **Tính cách & Sở thích:** Các thẻ tag gọn gàng kèm cấp độ `Lv.X`.
