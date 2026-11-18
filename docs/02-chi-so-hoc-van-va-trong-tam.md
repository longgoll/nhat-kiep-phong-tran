# 02 — Chỉ Số, Học Vấn & Trọng Tâm Năm (`LifeFocus`)

---

## 1. Hệ Thống Chỉ Số (4 Thanh Cốt Lõi + 4 Chỉ Số Chuyên Môn)

### A. 4 Thanh Chỉ Số Cốt Lõi (`0 – 100`)
Hiển thị đồng nhất ở cả Tuổi thơ (`0–12t`) và Trưởng thành (`13+t`):
1. **Sức khỏe (`health`):** Quyết định nguy cơ ốm đau, tai nạn và xác suất tử vong. Dưới `20%` kích hoạt cảnh báo nguy kịch.
2. **Hạnh phúc (`happiness`):** Phản ánh tinh thần; dưới `20%` làm giảm hiệu suất lao động/học tập (`-30%`). Được lưu lại cuối mỗi năm vào `yearlyHappiness` để tô màu **Bản đồ cuộc đời (`LifeGrid`)**.
3. **Học thức (`education`):** Thước đo tri thức kinh sử & hiểu biết, là điều kiện mở khóa bậc học và thi Khoa cử.
4. **Quan hệ (`relationships`):** Mạng lưới nhân mạch xã hội & gia đình; tăng cơ hội được tiến cử, giảm rủi ro bị chèn ép.

### B. 4 Chỉ Số Chuyên Môn (`0 – 100`, hiển thị gọn)
- **Võ nghệ (`martial`):** Phục vụ tòng quân, tự vệ, hành hiệp hoặc khởi nghĩa.
- **Thương tài (`craftTrade`):** Tăng hiệu quả nghề thủ công, buôn bán và lợi nhuận điền sản/cơ sở kinh doanh.
- **Thanh danh (`fame`):** Danh tiếng tốt trong vùng/triều đình, mở khóa kết giao danh sĩ và thăng quan.
- **Tai tiếng (`infamy`):** Danh tiếng xấu (trộm cướp, tham ô, phạm pháp); cao quá dễ bị quan phủ truy bắt.

---

## 2. Hệ Thống Học Vấn Thống Nhất

Thay thế việc đoán mò bằng thang bậc rõ ràng từ nhỏ đến lớn:

| Bậc | Nhãn hiển thị | Điều kiện / Cách đạt |
| :---: | :--- | :--- |
| `0` | **Chưa biết chữ** | Mặc định từ 0–5 tuổi hoặc chưa từng tiếp xúc sách vở (`education < 5`) |
| `1` | **Vỡ lòng · Học lỏm** | Tuổi `6–12` học lỏm / thầy đồ làng, hoặc `education >= 5` |
| `2` | **Biết chữ · Thư sinh** | Theo học trường làng / tư thục, hoặc `education >= 15` |
| `3` | **Thông hiểu kinh sử** | Nền tảng vững (`education >= 30`), đủ sức ứng thí Hương thí |
| `4` | **Tú tài / Cử nhân** | Đỗ kỳ **Thi Hương** (`do_tu_tai` / `do_cu_nhan`) |
| `5` | **Tiến sĩ / Trạng nguyên** | Đỗ kỳ **Thi Hội / Thi Đình** (`do_tien_si` / `do_trang_nguyen`) |

- **Học bổ túc khi trưởng thành:** Người xuất thân nghèo từng thất học vẫn có thể tự học ban đêm hoặc bái sư thông qua hành động trong **Chi tiêu · Đầu tư** để nâng `education` và dự thi Khoa cử khi đủ điều kiện.

---

## 3. Trọng Tâm Hiện Tại (`LifeFocus`) Tự Đổi Theo Ngữ Cảnh

Học trực tiếp từ cơ chế `S.focus` của `1in8b`: Người chơi chọn **1 Trọng tâm** dạng nút viên thuốc (pills) ngay trên màn hình chính và có thể đổi bất kỳ lúc nào. Danh sách Trọng tâm **tự động thay đổi theo hoàn cảnh thực tế**:

### A. Tuổi thơ (`0–12 tuổi`)
- **0–5 tuổi:** Chơi đùa tự nhiên, Nghe bà kể chuyện, Tập đi tập chạy (chủ yếu định hình Tính khí).
- **6–12 tuổi:** `Học chữ · Nghe giảng` (`Học thức↑ Hạnh phúc↓`), `Vui chơi · Bạn bè` (`Quan hệ↑ Hạnh phúc↑`), `Giúp việc nhà` (`Kinh tế gia đình↑`), `Rèn luyện thân thể` (`Sức khỏe↑ Võ nghệ↑`), `Sở thích riêng` (tăng `hobbyLevels`).

### B. Trưởng thành (`13+ tuổi`) — Tự đổi theo 3 trạng thái
1. **Đang đi làm / Làm quan / Tự doanh (`hasLivelihood`):**
   - `Dồn sức công danh` (`Thu nhập +25%`, thăng tiến nhanh hơn, `Hạnh phúc/Sức khỏe↓ nhẹ`)
   - `Cân bằng cuộc sống` (Ổn định không hao tổn)
   - `Chăm lo gia đình` (`Quan hệ↑`, `Thu nhập -10%`)
   - `Giữ gìn sức khỏe` (`Sức khỏe↑`, giảm nguy cơ bệnh tật)
   - `Tu thân · Đọc sách` (`Học thức/Võ/Thương↑ +25%`)
   - `Theo đuổi sở thích` (`Hạnh phúc↑`, tăng cấp `hobbyLevels`)
2. **Chưa có việc / Đang tìm việc (`!hasLivelihood && age < 60`):**
   - Ẩn nút `Dồn sức công danh` (vì không có việc để dồn sức!), thay bằng **`Chuyên tâm tìm việc / Ôn thi`** (`Học thức↑`, tăng cơ hội tìm việc/khoa cử), cùng `Giữ gìn sức khỏe`, `Giao du kết bạn`, `Theo đuổi sở thích`, `Cân bằng`.
3. **Tuổi già / Nghỉ hưu (`age >= 60 && !hasLivelihood`):**
   - `An dưỡng tuổi già` (`Sức khỏe↑`, `Hạnh phúc↑`)
   - `Vui vầy con cháu` (`Quan hệ↑`, `Hạnh phúc↑`)
   - `Đọc sách · Viết hồi ký` (`Học thức↑`, `Thanh danh↑`)
   - `Thú vui điền viên` (tăng `hobbyLevels`)

---

## 4. Lão Hóa & Hồi Quy Cuối Năm

- **Lão hóa tự nhiên:**
  - `<= 30 tuổi`: Thể lực tối đa `100`, không suy giảm sức khỏe theo tuổi.
  - `31–45 tuổi`: Thể lực tối đa `85`, hao mòn nhẹ.
  - `46–55 tuổi`: Thể lực tối đa `75`, hao mòn trung bình.
  - `56–70 tuổi`: Thể lực tối đa `60`, hao mòn rõ rệt.
  - `> 70 tuổi`: Thể lực tối đa `45`, suy giảm nhanh nếu không chọn trọng tâm `Giữ gìn sức khỏe` hoặc `An dưỡng tuổi già`.
- **Tổng kết cuối năm (mỗi 360 ngày):** Lưu `yearlyHappiness[age]`, chốt sổ thu chi năm (`lastYear`), kiểm tra thăng tiến tự nhiên và ghi log tổng kết tuổi.
