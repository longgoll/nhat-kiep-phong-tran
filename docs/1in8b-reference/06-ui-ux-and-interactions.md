# 06 — Đặc Tả UI / UX & Trải Nghiệm Người Dùng (`1in8b.life/vi`)

> Tài liệu chi tiết hóa toàn bộ giao diện, luồng màn hình, bố cục thành phần và cơ chế tương tác (UX) quan sát được khi chơi thử trực tiếp `https://1in8b.life/vi/`.

---

## 1. Luồng Màn Hình Tổng Thể (Screen Flow)

```text
[#intro: Cấu hình kiếp mới]
   │  (Bấm "Chào đời" -> kiểm tra #guard nếu đang có save dở)
   ▼
[#roll: Hoạt ảnh quay số quốc gia]
   ▼
[#cert: Giấy khai sinh — Birth Certificate]
   │  (Xem xuất thân, bản đồ, 4 người đồng niên -> Bấm bắt đầu sống)
   ▼
[#lifeview: Màn hình chơi chính] ◄──► [Modal: Quyết định (DEC)] / [Modal: Chi tiêu · đầu tư]
   │  (Tua 1×–16× hoặc "Tới quyết định tiếp theo")
   ▼
[#dead: Tổng kết cuộc đời & Văn bia]
   │
   └──► [Kệ trưng bày & Ngôi làng Các kiếp trước]
```

---

## 2. Chi Tiết Từng Màn Hình & Thành Phần UI

### A. Màn Hình Khởi Đầu (`#intro`) & Cảnh Báo (`#guard`)
- **Tùy chọn nhanh:** Thời đại (`Quá khứ`, `Hôm nay`, `Tương lai`, `Thế giới bất kỳ`), Chế độ (`Em bé chào đời lúc này` vs `8 tỷ người đang sống`), Nhịp độ (`~30 phút`, `~1 giờ`, `~1 giờ 30 phút`).
- **Cảnh báo mất save (`#guard`):** Nếu `localStorage` đang có kiếp chơi dở, bấm bắt đầu kiếp mới sẽ bật hộp thoại xác nhận tránh mất dữ liệu ngoài ý muốn.

### B. Hoạt Ảnh Quay Số (`#roll`) & Giấy Khai Sinh (`#cert`)
- **Hiệu ứng kịch tính:** Quay số chọn quốc gia theo đúng tỷ lệ dân số thực tế.
- **Giấy khai sinh:** Trình bày trang trọng như văn bản hành chính:
  - Mã số giấy khai sinh, tiểu sử ngắn, bảng 10+ chỉ số xuất thân (quốc gia, thành thị/nông thôn, phân vị giàu nghèo `1/5–5/5`, tuổi thọ kỳ vọng...).
  - Bản đồ thế giới đánh dấu nơi sinh + bảng so sánh nhanh với quê hương của người chơi.
  - Danh sách **4 người đồng niên** (*"Những người sinh ra trong cùng một giây"*).

### C. Thanh Điều Khiển Trên Cùng (`#lifeview` Top Bar)
- **Nhịp độ & Thời gian 1 năm (`S.yearSec`, `tick(n)`):**
  - Lúc sinh: `yearSec = clamp(paceMin * 60 / Math.max(D.e0, 60), 12, 120)` (`paceMin` = `30`, `60` mặc định, hoặc `90`). Với gói `1 giờ` và `e0 ≈ 69` → `S.yearSec ≈ 52 giây` (`1 năm ≈ 52 giây` ở `1×`).
  - **Nút nhịp độ (`SPEEDS = [1, 2, 4, 8, 12, 16]`):** `Tạm dừng` (phím `Space`), các mức tốc độ `1×–16×` (phím tắt `1–6`). Dòng hiển thị `#ageYear` tính `Math.round(S.yearSec / S.speed)` (ví dụ `52 giây` ở `1×`, `3 giây` ở `16×`).
  - Thanh tiến trình năm `#prog` lượng tử hóa 500 bước bằng `scaleX(round(t * 500) / 500)`.
- **Nút tua thông minh:**
  - **`Tới quyết định tiếp theo`:** Nhảy thẳng qua các năm bình lặng đến Decision Card tiếp theo (giảm cảm giác chờ đợi).
  - **`Tự động quyết định`:** Tự động chọn phương án & trọng tâm sau đếm ngược ngắn.
- **Tiện ích:** `♪ Nhạc`, `✎ Ghi suy nghĩ` (viết nhật ký cá nhân + bật/tắt tự dừng ở các mốc tuổi `5, 15, 30, 50, 70`).

### D. Thẻ "Hồ Sơ Cá Nhân" (Kiểu Hộ Chiếu)
- Thiết kế như một trang **hộ chiếu cá nhân**, luôn dễ nhìn nhất:
  - **Nhận diện:** Mã quốc gia, năm sinh, họ tên, giới tính, ngày/nơi sinh, nơi ở hiện tại, tôn giáo.
  - **Trạng thái động (cập nhật ngay khi đổi):**
    - `Hoàn cảnh gia đình`: 5 vạch phân vị `1/5–5/5` (tụt trực tiếp nếu gia đình phá sản/nợ nần).
    - `Học vấn`: Chưa đi học / Tiểu học / THCS / THPT / Đại học (chuyên ngành) / Cao học / Tiến sĩ / Bằng tương đương.
    - `Nghề nghiệp`: Tên nghề hiện tại, hoặc **`Đang tìm việc`**, **`Nội trợ`**, **`Nghỉ hưu`**, **`Trong tù`**.
    - `Tính khí`, `Năng khiếu` (tối đa 2), `Ước mơ thuở nhỏ`.
  - **Chân thẻ:** Dòng mã MRZ kiểu hộ chiếu tự động cập nhật tuổi mỗi năm.

### E. Chỉ Số, Tài Chính & Diorama Hộ Gia Đình
- **4 thanh chỉ số `0–100`:** `Sức khỏe`, `Hạnh phúc`, `Kiến thức`, `Quan hệ`.
- **Khối Tài chính:**
  - `Tài sản ròng` (đổi màu đỏ và thêm dòng **`Nợ`** khi âm tiền), `Thu nhập hằng năm` (hiện *"Không có thu nhập"* khi thất nghiệp), `Những thứ bạn có`, `Phương tiện đi lại`.
  - Nút **`Chi tiêu · đầu tư`** và mục giải thích có thể mở rộng *"Số tiền được tính thế nào?"*.
  - Mọi giá tiền đều quy đổi theo sức mua tương đương (*"quy theo giá Việt Nam"*).
- **Diorama Hộ Gia Đình:** Tranh minh họa pixel thành phố hiện tại, loại nhà (`nhà thuê` / `nhà riêng` / `căn hộ`), và các thành viên đang sống chung (bật/tắt xem tuổi & tên).

### F. Trọng Tâm Năm Nay (`Annual Focus`)
- Dạng các **nút viên thuốc (pills)** nằm ngay vùng thao tác chính, đổi màu trạng thái đang chọn, bấm đổi bất kỳ lúc nào mà không cần mở modal.
- Danh sách nút tự động thay đổi theo giai đoạn (`Đi học` / `Đi làm` / `Đang tìm việc` / `Tuổi già`).

### G. Nhật Ký Cuộc Đời (`Life Log`) & Thống Kê Bổ Trợ
- **Nhật ký ngược thời gian** (mới nhất lên đầu):
  - Có nút gắn sao (`☆`) để đánh dấu kỷ niệm.
  - Gắn nhãn tuổi của người thân trong sự kiện.
  - Chèn thẻ **`Dữ liệu ... (Nguồn)`** giải thích bối cảnh thực tế ngay dưới biến cố.
- **Khối phân tích bên dưới/cạnh:**
  - `Gia đình và cuộc đời` (cây quan hệ sống/chết).
  - `Những người sinh ra trong cùng một giây` (4 người đồng niên cập nhật song song).
  - **`Bản đồ cuộc đời`:** Lưới ô vuông `1 ô = 1 năm`, tô màu theo mức độ hạnh phúc, có viền đánh dấu tuổi thọ kỳ vọng.
  - `Đường cong sống sót` (so sánh với trung bình thế giới).

### H. Modal Quyết Định (`DEC`) & Modal "Chi Tiêu · Đầu Tư"
- **Decision Modal (`Quyết định lớn` / `Một lựa chọn nhỏ`):**
  - Tự động **tạm dừng thời gian** khi bật lên.
  - Có nút **`Tạm gác lại ▾`** để thu gọn tạm thời, cho phép người chơi liếc lại Hồ sơ / Tài sản / Nhật ký trước khi chọn.
  - Có nút **`Từ giờ để tự động quyết định`** ngay trên modal.
- **Modal `Chi tiêu · đầu tư`:**
  - Tự động **tạm dừng thời gian** khi mở.
  - Chia 3 tầng gọn gàng: `Nên làm lúc này` (top gợi ý theo hoàn cảnh) → `Xem thêm (N)` (thu gọn mặc định) → `Lối sống` (thu gọn mặc định).

---

## 3. Nguyên Tắc UX Đáng Học Hỏi Nhất

1. **Không bao giờ bắt người chơi đoán trạng thái hiện tại:** Mọi thay đổi về nghề, thất nghiệp, nợ nần, gia cảnh đều hiện ngay bằng nhãn rõ ràng trên Hồ sơ và đổi danh sách nút tương ứng.
2. **Tách "Việc khẩn cấp/hợp cảnh" khỏi "Kho tùy chọn":** Dùng `shopRank` để chỉ đưa 3–6 việc đáng làm nhất lên `Nên làm lúc này`, giấu phần còn lại vào `Xem thêm (N)`.
3. **Cho phép xem bối cảnh trước khi quyết định:** Nút `Tạm gác lại` trên Decision Modal giúp người chơi không bị "mù thông tin" khi phải chọn giữa các phương án tài chính/gia đình.
4. **Nhịp độ linh hoạt:** Kết hợp `1×–16×` + `Tới quyết định tiếp theo` + `Tự động quyết định` để chơi nhanh hay chậm đều mượt.
