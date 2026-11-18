# 06 — Đặc Tả UI / UX & Trải Nghiệm Người Dùng

---

## 1. Luồng 5 Màn Hình Thống Nhất

```text
[StartScreen: Khởi đầu & Cảnh báo #guard]
   │
   ▼
[BirthCertificateView: Giấy khai sinh + 4 Người đồng niên]
   │
   ▼
[ChildhoodView (0–12t)] ──(Tự chuyển mượt khi 13t)──► [AdultDashboard (13+t)]
   │                                                          │
   └──────────────► [EventModal (Tạm gác lại)] ◄──────────────┘
                    [Chi tiêu · Đầu tư (3 tầng)]
                    [CareerModal (Nghề & Khởi nghiệp)]
   │
   ▼
[TombstoneView: Bia Mộ Tổng Kết] ──► [LegacyArchiveModal: Tàng Kinh Các]
```

---

## 2. Thanh Điều Khiển Trên Cùng (`LifeTopBar`) — Đồng Nhất Tuyệt Đối

Cả `ChildhoodView` (`0–12t`) và `AdultDashboard` (`13+t`) dùng chung **1 chuẩn điều khiển và 1 chuẩn tốc độ**:
- **Thông tin:** Tên game, Tuổi hiện tại, `Tháng X/12`, Niên hiệu triều đại, Mùa, Mã số `NK-<seed>`, nút chuyển Sáng/Tối (`ColorModeToggle`).
- **Điều khiển tốc độ:**
  - Nút bước đơn (`+1 Tháng`, và `+4 Tháng` / `+1 Năm` ở tuổi trưởng thành).
  - `Tạm dừng` (phím `Space`) và tốc độ `1×`, `2×`, `4×`, `8×` (phím `1–4`).
  - **Đồng bộ nhịp chạy:** `1×` = `900ms/tháng` (~10.8s/năm) ở cả Tuổi thơ và Trưởng thành (loại bỏ sự chênh lệch 52s/năm ở tuổi thơ trước đây).
- **Nút thông minh:**
  - **`Tới quyết định tiếp theo`:** Tua nhanh qua các tháng bình lặng cho tới khi gặp `EventModal` hoặc mốc chuyển giai đoạn.
  - **`Tự động quyết định`:** Bật/tắt tự chọn phương án tối ưu.
  - **`Ghi suy nghĩ`:** Viết nhật ký cá nhân gắn sao trực tiếp vào dòng thời gian.

---

## 3. Bố Cục Dashboard 3 Cột Nhất Quán

### Cột Trái (3/12): Hồ Sơ, Chỉ Số & Tài Chính
1. **Thẻ Hồ Sơ Cá Nhân:** Chân dung, tên, giới tính, tuổi, quê quán, thứ bậc, `Hoàn cảnh gia đình (1/5–5/5)`, `Học vấn`, `Nghề nghiệp / Sinh kế`, Tính cách & Sở thích.
2. **Thẻ Trạng Thái:** 4 thanh `0–100` (`Sức khỏe`, `Hạnh phúc`, `Học thức`, `Quan hệ`) + 4 chỉ số phụ (`Võ nghệ`, `Thương tài`, `Thanh danh`, `Tai tiếng`) + `StatExplainer`.
3. **Thẻ Tài Chính:** `Tài sản ròng`, `Thu nhập hằng năm`, mục **`Nợ`** (hiện đỏ khi âm tiền hoặc mắc nợ địa chủ), tóm tắt thu chi năm, điền sản đang có, nơi ở & nếp sống, nút **`Chi tiêu · Đầu tư`**.

### Cột Giữa (5/12): Bối Cảnh, Trọng Tâm & Nhật Ký
1. **Diorama Bối Cảnh (`FeudalSceneBanner`):** Tranh minh họa thay đổi theo nơi ở, mùa, thời cuộc và gia đình.
2. **Trọng Tâm Hiện Tại (`LifeFocus`):** Các nút pills tự đổi theo ngữ cảnh (`Tuổi thơ` / `Đang đi làm` / `Đang tìm việc` / `Tuổi già`) + nút mở nhanh **`Chi tiêu · Đầu tư`**.
3. **Nhật Ký Cuộc Đời (`LifeTimeline`):** Dòng thời gian ngược (mới nhất lên trên), có nút gắn sao (`☆`) kỷ niệm và thẻ bối cảnh.

### Cột Phải (4/12): Gia Đình, Đồng Niên, Bản Đồ & Thời Cuộc
1. **Gia đình & Cuộc đời (`FamilyLifeCard`):** Danh sách người thân sống/mất.
2. **Người Đồng Niên (`CohortPeers`):** 4 người sinh cùng giây, cập nhật trạng thái/tuổi thọ song song.
3. **Bản Đồ Cuộc Đời (`LifeGrid`):** Lưới `1 ô = 1 năm`, tô màu theo hạnh phúc từng năm, đánh dấu cột mốc và tuổi thọ kỳ vọng.
4. **Thời Cuộc & Tiện Ích:** Niên hiệu, Thời cuộc, Giá lúa, Tàng Kinh Các, Xuất Save, Bỏ kiếp.
