# 03 — Vòng Đời, Nhịp Độ Thời Gian & Cơ Chế Tự Động Hóa

## 1. Quy Chuẩn Thời Gian (`totalDays`)

- **1 năm** = `360 ngày`, chia làm **4 mùa**, mỗi mùa **90 ngày**:
  - Ngày `0 – 89` trong năm: **Xuân (`spring`)**
  - Ngày `90 – 179` trong năm: **Hạ (`summer`)**
  - Ngày `180 – 269` trong năm: **Thu (`autumn`)**
  - Ngày `270 – 359` trong năm: **Đông (`winter`)**
- **Công thức suy xuất từ `totalDays`:**
  - `ageYears = Math.floor(totalDays / 360)`
  - `dayOfYear = totalDays % 360`
  - `seasonIndex = Math.floor(dayOfYear / 90)` (`0`: Xuân, `1`: Hạ, `2`: Thu, `3`: Đông)
  - `dayInSeason = (dayOfYear % 90) + 1` (từ ngày 1 đến ngày 90)

---

## 2. Giai Đoạn 1: Thơ Ấu (`0 – 5 tuổi`)

- **Nhịp độ:** Tua nhanh theo từng năm (`+360 ngày` / bước).
- **Cân bằng Anti-Frustration (Tránh chết oan do Pure RNG):**
  - Tỷ lệ bệnh tật/tai nạn thời thơ ấu vẫn tồn tại (đậu mùa, sởi, phong hàn, thiếu ăn), nhưng **không tử vong tức thì chỉ sau 1 cú tung xúc xắc**.
  - Khi gặp biến cố bệnh nặng ở giai đoạn 0–5 tuổi, game kích hoạt `major` event cho phép cha mẹ phản ứng:
    - *Bần nông:* Xin thuốc nam dân gian (miễn phí, rủi ro cao hơn) hoặc vay mượn hàng xóm mua thuốc (`-100 copper`, tăng mạnh tỷ lệ qua khỏi).
    - *Giàu có / Hoàng tộc:* Mời danh y / thái y (`-500 copper`, gần như chắc chắn qua khỏi, nhưng vẫn có tỷ lệ nhỏ trúng độc cung đình ở `hoang_toc`).
- **Mốc 1 tuổi — Lễ Thôi Nôi (`evt_milestone_thoi_noi`):**
  - Hiển thị mâm đồ vật theo xuất thân (Bút lông, Thỏi bạc, Thanh gươm gỗ, Nắm xôi, Bàn tính...).
  - Vật phẩm được chọn cộng ngay `+5` điểm chỉ số tương ứng (`education`, `craftTrade`, `martial`, `health`) và gắn `flag` thiên hướng đầu đời.

---

## 3. Giai Đoạn 2: Đồng Ấu (`6 – 12 tuổi`)

- **Nhịp độ:** Từng năm một (`+360 ngày` / bước). Mỗi năm người chơi chọn **1 Hoạt động chủ đạo (`childhoodFocus`)** được mở khóa dựa trên `originClass` và `wealthCopper` của gia đình:

| `originClass` | Các lựa chọn `childhoodFocus` tiêu biểu | Hiệu ứng chính mỗi năm |
| :--- | :--- | :--- |
| `ban_nong` | `chan_trau` (Chăn trâu, mót lúa phụ nhà) | `health +3`, `relationships +3`, `rice +10` |
| `ban_nong` | `o_do` (Đi ở đợ cho nhà địa chủ) | `wealthCopper +180`, `happiness -5` |
| `ban_nong` | `hoc_lom` (Trốn việc nghe lỏm lớp thầy đồ) | Cơ hội kích hoạt `evt_child_eavesdrop_01`, `education +3` |
| `thu_cong` | `phu_xuong` (Phụ xưởng / Gảy bàn tính) | `craftTrade +5`, `wealthCopper +250` |
| `thu_cong` | `xin_hoc_chu` (Xin cha mẹ cho đi học chữ) | Tốn `300 copper/năm`, `education +6` |
| `dia_chu` / `quan_lai` / `hoang_toc` | `hoc_truong` (Học trường làng / Quốc Tử Giám) | Tốn `600 copper/năm`, `education +9` |
| `dia_chu` / `quan_lai` / `hoang_toc` | `luyen_vo` (Luyện võ / Cưỡi ngựa bắn cung) | `martial +8`, `health +4` |
| *Tất cả* | `ket_giao` (Kết giao bạn nối khố / Dạo chơi) | `happiness +8`, `relationships +6`, mở khóa NPC `friend` |

- **Mốc 13 tuổi:** Tổng kết toàn bộ giai đoạn 0–12 tuổi thành **Hồ sơ Thiếu niên** (tặng 1 `milestone` mở đầu và chia vốn tự lập từ gia đình), sau đó mở khóa Dashboard 3 cột.

---

## 4. Giai Đoạn 3: Trưởng Thành & Lão Hóa (`13+ tuổi`)

### Bảng Thời Khóa Biểu 4 Khung Giờ (`TimeSlot`)
1. `morning` (Sáng — khung giờ chính)
2. `afternoon` (Chiều — khung giờ chính)
3. `evening` (Tối — khung giờ phụ: đọc sách đèn dầu, làm thêm, tửu lầu, đút lót, nghỉ ngơi)
4. `night` (Đêm — mặc định `act_ngu`; có thể đổi sang `act_thuc_trang_dem` để nhân đôi tiến độ học/mưu sự nhưng trừ `health -3` và `happiness -3` mỗi đêm).

### Quy Tắc Dự Phòng (`FallbackRules`) & Thứ Tự Ưu Tiên
Để tránh vòng lặp vô hạn hoặc xung đột khi tua nhanh, `FallbackRules` được đánh giá theo **thứ tự ưu tiên từ trên xuống dưới** (mảng `fallbackRules` có thể kéo thả sắp xếp trên UI):
1. Trong mỗi ngày, **trước khi thực thi từng `TimeSlot`**, Worker quét danh sách `fallbackRules` từ index `0` đến hết.
2. Nếu một rule khớp điều kiện (`stat < threshold` hoặc `<=`) **và** `targetSlot` trùng với khung giờ sắp chạy **và** nhân vật đủ điều kiện thực hiện `fallbackActionId`, hệ thống **tạm thời thay thế** hành động của khung giờ đó trong ngày hôm nay (không ghi đè lịch mẫu gốc của người chơi).
3. Nếu không có rule nào khớp nhưng hành động gốc không đủ `stamina` hoặc điều kiện, hệ thống tự động fallback về `act_nghi_ngoi` (nếu là `morning`/`afternoon`/`evening`) hoặc `act_ngu` (nếu là `night`).

### Tua Nhanh & Cơ Chế Phanh Gấp (`Auto-Pause`)
- **4 nút tua:** `+1 Ngày`, `+1 Tuần (7 ngày)`, `+1 Tháng (30 ngày)`, `+1 Mùa (90 ngày)`.
- **Điều kiện ngắt tua bắt buộc (Hard Auto-Pause):**
  1. Nhân vật tử vong (`health <= 0` hoặc bị xử trảm).
  2. Gặp sự kiện `severity === "major"` cần người chơi chọn phương án.
  3. Bước sang tuổi mới (`totalDays % 360 === 0`) hoặc đến kỳ mở **Khoa thi** (nếu nhân vật đủ điều kiện thi và bật theo dõi).
- **Điều kiện ngắt tua tùy chỉnh (Soft Auto-Pause — mặc định BẬT, cho phép người chơi tắt bớt trong Cài đặt để tua `+1 Mùa` mượt hơn):**
  - `health < 20` (nguy hiểm tính mạng).
  - `happiness < 20` (tuyệt vọng).
  - `rice === 0 && wealthCopper < ricePriceInCopper` (cạn lương thực và hết tiền mua gạo).
  - *Lưu ý:* Không Auto-Pause chỉ vì `stamina < 20` để tránh ngắt liên tục; `stamina` nên được xử lý êm qua `FallbackRules`.
