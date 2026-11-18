# 02 — Chỉ Số, Học Vấn (`eduLevel 0–5`) & Trọng Tâm Năm (`focusTime`, `endYear`)

> Áp dụng 100% cơ chế Học vấn & Trọng tâm năm của `1in8b.life/vi` trong bối cảnh cổ trang Đông Á.

---

## 1. Hệ Thống Chỉ Số (`0 – 100`)

### A. 4 Thanh Chỉ Số Cốt Lõi (`0 – 100`)
1. **Sức khỏe (`health`):** Ảnh hưởng nguy cơ đổ bệnh và xác suất tử vong (`deathProb`). Dưới `20%` cảnh báo nguy kịch.
2. **Hạnh phúc (`happiness`):** Lưu cuối mỗi năm vào `yearlyHappiness[age]` để tô màu **Bản đồ cuộc đời (`LifeGrid`)**.
3. **Kiến thức / Học thức (`education`):** Là **phân vị tương đối so với bạn đồng trang lứa** (`0.5 – 99.9%`). Nếu không học gì trong độ tuổi đi học, phân vị sẽ tụt nhẹ do bạn đồng trang lứa vẫn tiến bộ.
4. **Quan hệ (`relationships`):** Mạng lưới nhân mạch; có vợ/chồng còn sống cộng `+12` vào mức nền, mỗi con còn sống cộng `+4` (tối đa `+15`).

### B. 4 Chỉ Số Chuyên Môn (`0 – 100`)
- **Võ nghệ (`martial`)**, **Thương tài (`craftTrade`)**, **Thanh danh (`fame`)**, **Tai tiếng (`infamy`)**.

---

## 2. Hệ Thống Học Vấn 6 Bậc (`eduLevel: 0–5` & `isStudent`)

Thay vì đoán bậc học từ điểm số, nhân vật có **trạng thái học vấn rõ ràng** theo mô hình `S.edu` của `1in8b`:

| `eduLevel` | Bậc học (Cổ trang) | Độ tuổi chuẩn | Ghi chú |
| :---: | :--- | :---: | :--- |
| `0` | **Chưa đi học** | `0–5t` | Hình thành `Tính khí` (`trait`) quanh tuổi lên 5. |
| `1` | **Vỡ lòng (Thầy đồ làng)** | `6–11t` | Có thể gián đoạn nếu nhà quá nghèo phải đi ở đợ. |
| `2` | **Hương học (Trung học cơ sở)** | `12–14t` | Bị ảnh hưởng bởi `Hoàn cảnh gia đình (1/5–5/5)`. |
| `3` | **Huyện học / Học nghề** | `15–17t` | Đủ nền tảng ứng thí **Tú tài (Thi Hương sơ khảo)**. |
| `4` | **Quốc Tử Giám / Thư viện lớn** | `18–21t` | Chọn chuyên ngành (`major`): *Kinh sử · Chính trị*, *Y dược*, *Binh pháp*, *Thương toán*, *Luật hình*, *Văn chương*. |
| `5` | **Hàn Lâm Viện (Tiến sĩ / Trạng nguyên)** | `22+t` | Đỗ **Thi Hội / Thi Đình**, mở khóa hàm quan cao cấp. |

### Thi Quốc Tử Giám, Thi Lại & Học Bổ Túc (`DEC.college`, `DEC.retake`, `DEC.adultedu`)
- **Tuổi 18 (`DEC.college`):** Tự bật Decision Card xét tuyển/ứng thí vào Quốc Tử Giám hoặc Thư viện lớn dựa trên xác suất nền (`Hoàn cảnh gia đình` + `Kiến thức` + trọng tâm `Học tập`).
- **Thi trượt & Thi lại (`DEC.retake`):** Nếu trượt, bật Decision Card *"Ứng thí lại?"* (tối đa 3 lần: dùi mài thêm 1 năm hoặc ra đời kiếm sống ngay).
- **Học bổ túc khi trưởng thành (`ged` / `nightuni` / `openuni`):** Người bỏ học sớm (`eduLevel <= 2`) có thể mở `Chi tiêu · Đầu tư` chọn **Học lớp đêm thầy đồ** (`>= 16t`) để lấy bằng tương đương, mở lại đường lên Quốc Tử Giám hoặc xin việc bậc cao.

---

## 3. Cơ Chế Trọng Tâm Năm (`lifeFocus` & `focusTime`, `endYear`)

### Danh sách Trọng tâm tự đổi theo 4 ngữ cảnh:
1. **Đang đi học (`isStudent`):**
   - `Học tập` (`Kiến thức↑ Hạnh phúc↓`), `Bạn bè · vui chơi` (`Quan hệ↑ Hạnh phúc↑`), `Giúp việc nhà` (`Gia đình↑`), `Thể thao · võ nghệ` (`Sức khỏe↑ Võ nghệ↑`), `Sở thích` (Quốc Tử Giám có thêm `Làm thêm`).
2. **Đang đi làm / Làm quan / Tự doanh (`hasJob`):**
   - `Dồn sức cho công việc` (`Thu nhập↑ Thăng tiến↑ Sức khỏe·Quan hệ↓`), `Cân bằng`, `Gia đình · bằng hữu`, `Chăm sóc sức khỏe`, `Phát triển bản thân` (`Kiến thức↑ Cơ hội nhảy việc↑`), `Sở thích`.
3. **Đang tìm việc (`seeking`) / Nội trợ (`homemaker`):**
   - `Tìm việc · ôn luyện`, `Nghỉ ngơi · dưỡng sức`, `Học hỏi · rèn trí não`, `Giao du · kết bạn`, `Sở thích`.
4. **Nghỉ hưu (`retired`) / Trong tù (`prison`):**
   - `An dưỡng tuổi già`, `Vui vầy con cháu`, `Đọc sách · viết hồi ký`, `Thú vui điền viên` (trong tù: `Cải tạo tốt`, `Rèn luyện thân thể`, `Đọc sách`).

### Thuật toán tích lũy theo tỷ trọng & Hồi quy cuối năm (`endYear`)
- Trong suốt năm, mỗi tháng/ngày trôi qua cộng dồn thời gian vào `focusTime[lifeFocus]`.
- Cuối năm (`endYear`), tính tỷ trọng `p = focusTime[u] / sum(focusTime)` để cộng/trừ chỉ số tương ứng và tăng cấp `hobbyLevels`, sau đó reset `focusTime`.
- **Hồi quy về mức nền (Mean-reversion):** Kéo `Sức khỏe`, `Hạnh phúc`, `Quan hệ` `15%` về mức nền thực tế (tính từ tuổi tác, tài sản/nợ, vợ/chồng, con cái, bệnh mãn tính).
