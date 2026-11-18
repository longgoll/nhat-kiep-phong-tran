# 03 — Nghề Nghiệp, Khoa Cử, Quan Trường & Khởi Nghiệp

---

## 1. Hợp Nhất Hệ Thống Sinh Kế & Công Danh

Thay vì tách rời mơ hồ giữa `careerSystem` và `ProgressionModules`, toàn bộ sinh kế và con đường công danh được quy về **1 luồng thống nhất** hiển thị rõ trên Hồ sơ:

### Các nhánh nghề nghiệp (`CareerTrack`)
1. **Lao động (`labor`):** Phu khuân vác, tá điền, thợ cày, cai phu... (vào nghề không cần bằng cấp).
2. **Thủ công (`craft`):** Thợ mộc, thợ rèn, thợ dệt, thợ gốm, đốc công xưởng... (cần `Thương tài`).
3. **Thương nghiệp (`trade`):** Hàng rong, tiểu thương chợ huyện, thương nhân đường dài, đại thương...
4. **Nho học · Quan trường (`scholar`):** Thư đồng, thầy đồ làng, thư lại nha môn, **Quan viên triều đình** (`officialRank 1–6`).
5. **Võ bị · Quân ngũ (`martial`):** Tuần đinh, lính thú, đội trưởng, võ tướng...
6. **Giang hồ (`underworld`):** Tiêu cục, tay sai, đầu lĩnh thảo khấu...

---

## 2. Xin Việc, Thăng Tiến & Nghỉ Hưu (`CareerModal`)

- **Gợi ý việc làm phù hợp (`getRecommendedCareerOffers`):**
  - Tự động lọc và đề xuất **3–5 công việc** phù hợp nhất với Học vấn, Chỉ số chuyên môn và Xuất thân hiện tại (kèm mục *"Xem tất cả nghề"* cho người muốn tra cứu).
  - Nếu có `activeCareer` hoặc `activeVenture`: Hồ sơ hiển thị tên nghề + bậc hiện tại; nếu không có (và không phải Quan viên / Gia nô / Tại ngũ), Hồ sơ hiển thị rõ **`Đang tìm việc`** (hoặc **`Nghỉ hưu`** nếu `>= 60 tuổi` và đã từng làm việc).
- **Thu nhập & Thâm niên:**
  - Mỗi nghề có thu nhập cơ bản theo buổi/tháng, tăng theo thâm niên (`daysWorked`), `Học thức`/`Thương tài`, và Trọng tâm (`Dồn sức công danh` `+25%`).
  - **Thăng tiến tự nhiên cuối năm (`canPromoteCareer`):** Khi đủ số ngày làm việc và chỉ số yêu cầu, cuối năm tự động thăng bậc hoặc người chơi chủ động xin thăng chức trong `CareerModal`.

---

## 3. Khoa Cử, Quan Trường, Điền Sản & Khởi Nghiệp

- **Khoa cử (Đường học vấn lên Quan trường):**
  - Thi Hương (`Tú tài` / `Cử nhân`) → Thi Hội (`Cống sĩ` / `Tiến sĩ`) → Thi Đình (`Trạng nguyên`).
  - Đỗ đạt cập nhật trực tiếp **Học vấn** trên Hồ sơ và mở khóa **Bổ nhiệm Quan viên** (`officialRank`: `1 Tri huyện` → `2 Tri phủ` → `3 Tuần phủ` → `4 Thượng thư` → `5 Tể tướng` → `6 Khai quốc`).
  - Khi đã làm Quan (`officialRank >= 1`), Hồ sơ hiển thị chức quan là sinh kế chính và nhận bổng lộc triều đình.
- **Khởi nghiệp & Điền sản (`VENTURES` & `PROPERTY_CATALOG`):**
  - Mở tiệm buôn, xưởng thủ công, tửu lầu hoặc mua ruộng đất/nhà cho thuê (`Nhất mẫu ruộng tốt`, `Tiệm tạp hóa`, `Tửu lầu`, `Xưởng tơ lụa`...).
  - Sinh lời theo mùa phụ thuộc `Thương tài` và `Thời cuộc` (`binh_on` lời đủ, `chien_tranh`/`mat_mua` giảm mạnh).
  - Rủi ro phá sản hoặc biến cố kinh doanh khi gặp năm mất mùa/chiến tranh.
- **Khởi nghĩa (`Rebellion`):**
  - Khi `officialRank === 0` và đủ `Võ nghệ` + `Uy thế/Thanh danh`, có thể tụ nghĩa chiêu mộ binh mã, tích lũy quân lương để tranh đoạt thiên hạ (mục tiêu cuối game).
