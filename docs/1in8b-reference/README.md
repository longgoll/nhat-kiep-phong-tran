# Tham Khảo Thiết Kế & Thuật Toán: `1in8b.life/vi`

> Thư mục lưu trữ toàn bộ kết quả chơi thử trực tiếp và phân tích mã nguồn client-side JS của **1 trong 8 tỷ (`https://1in8b.life/vi/`)**, tách riêng theo từng phân hệ để đối chiếu và áp dụng cho **Nhất Kiếp Phong Trần**.

---

## Mục Lục Phân Hệ

| File | Nội dung chi tiết |
| :--- | :--- |
| [01-education-and-focus.md](./01-education-and-focus.md) | Hệ thống Học vấn (`S.edu`, `eduModel`, `DEC.college / retake / adultedu`) & Trọng tâm năm (`S.fT`, hồi quy chỉ số `endYear`) |
| [02-career-and-business.md](./02-career-and-business.md) | Nghề nghiệp (`JOBS`, `incomeAt`, `S.pct`, `DEC.job / rankup / jobchange / retire`) & Khởi nghiệp / Cho thuê (`BIZ_K`, `rentDeal`) |
| [03-spend-and-invest-dialog.md](./03-spend-and-invest-dialog.md) | Hộp thoại **"Chi tiêu · đầu tư"** (`openShop`, `shopTop`, `shopRank`, `ITEMS`, 74 `SHOP`, `INV_KS`, `creditOK`, `Lối sống`) |
| [04-events-hardships-mortality.md](./04-events-hardships-mortality.md) | Lịch sự kiện năm (`planYear`), Nghịch cảnh (`Nợ`, `Đang tìm việc`, tụt gia cảnh), Gia đình (`finances`) & Tử vong (`deathProb`, `die`) |
| [05-childhood-crime-migration-archive.md](./05-childhood-crime-migration-archive.md) | Tuổi thơ sớm (`Tính khí`, `Năng khiếu`, `knowYear`), Tù tội (`goPrison`, `parole`), Di cư & Kho lưu trữ *Các kiếp trước* |
| [06-ui-ux-and-interactions.md](./06-ui-ux-and-interactions.md) | Đặc tả chi tiết UI/UX: Luồng 5 màn hình, Hộ chiếu, Diorama, Bản đồ cuộc đời, Decision Modal (`Tạm gác lại`) & nguyên tắc UX |

---

## Tổng Quan UI & Điều Khiển Chính (`#intro` & `#lifeview`)

### 1. Màn hình Khởi đầu & Khai sinh
- **Cấu hình:** Thời đại (`Quá khứ`, `Hôm nay`, `Tương lai`, `Thế giới bất kỳ`), Chế độ (`Em bé chào đời lúc này` vs `8 tỷ người đang sống`), Tốc độ (`~30 phút`, `~1 giờ`, `~1 giờ 30 phút`).
- **Giấy khai sinh:** Mã hồ sơ, tiểu sử khởi đầu, phân vị thu nhập gia đình (`1/5–5/5`), bản đồ nơi sinh, và **4 người đồng niên** (*"Những người sinh ra trong cùng một giây"*) lớn lên song song.

### 2. Thanh điều khiển trên cùng
- `Tạm dừng` (`Space`), tốc độ `1×`, `2×`, `4×`, `8×`, `12×`, `16×` (phím `1–6`).
- **`Tới quyết định tiếp theo`:** Tua nhanh qua các năm bình thường cho tới khi gặp Decision Card.
- **`Tự động quyết định`:** Tự chọn phương án và trọng tâm sau đếm ngược ngắn.
- **`Ghi suy nghĩ`:** Nhật ký cá nhân + bật/tắt tự dừng tại các mốc tuổi `5, 15, 30, 50, 70`.

### 3. Thẻ "Hồ sơ cá nhân" (Kiểu hộ chiếu)
- Hiển thị: Tên, giới tính, ngày/nơi sinh, nơi ở hiện tại, tôn giáo, **`Hoàn cảnh gia đình`** (`1/5–5/5`), **`Học vấn`**, **`Nghề nghiệp`** (hoặc `Đang tìm việc` / `Nội trợ` / `Nghỉ hưu` / `Trong tù`), `Tính khí`, `Năng khiếu`, `Ước mơ thuở nhỏ`, và mã MRZ cập nhật tuổi mỗi năm.
- **4 thanh chỉ số `0–100`:** `Sức khỏe`, `Hạnh phúc`, `Kiến thức`, `Quan hệ`.
- **Tài chính:** `Tài sản ròng`, `Thu nhập hằng năm`, `Nợ` (hiện màu đỏ khi `S.money < 0`), tài sản đang có, phương tiện đi lại, nút **`Chi tiêu · đầu tư`**.
- **Phân tích bên dưới/cạnh:** Gia đình & cuộc đời, 4 người đồng niên, **Bản đồ cuộc đời** (`1 ô = 1 năm` tô màu theo hạnh phúc), Đường cong sống sót.
