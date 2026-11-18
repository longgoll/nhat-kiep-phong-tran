# 03 — Nghề Nghiệp (`JOBS`), Thăng Tiến, Hưu Trí & Kinh Doanh (`BIZ_K`)

> Áp dụng 100% vòng đời nghề nghiệp và khởi nghiệp của `1in8b.life/vi` trong bối cảnh cổ trang.

---

## 1. Trạng Thái Thân Phận Rõ Ràng (`livelihoodStatus`)

Hồ sơ luôn hiển thị chính xác 1 trong các trạng thái:
- **`student` (*Đang theo học*):** Khi đang học Tiểu học / Hương học / Huyện học / Quốc Tử Giám.
- **`employed` (*Tên nghề / Phẩm hàm quan*):** Đang làm nghề hoặc làm quan triều đình (`officialRank 1–6`).
- **`venture` (*Chủ cơ sở kinh doanh*):** Đang tự làm chủ tiệm/xưởng/tửu lầu.
- **`seeking` (*Đang tìm việc*):** Khi chưa có việc, chưa nghỉ hưu, không đi học.
- **`homemaker` (*Nội trợ · Lo việc nhà*):** Thu nhập `0`, sống nhờ thu nhập vợ/chồng hoặc gia sản.
- **`retired` (*Nghỉ hưu*):** Quanh tuổi `60–65` trở đi, nhận bổng lộc hưu trí nếu đủ thâm niên.
- **`prison` (*Trong tù*):** Tạm dừng học/việc cho tới khi mãn hạn hoặc được ân xá.

---

## 2. Xin Việc, Lương, Thăng Tiến & Nghỉ Hưu qua Decision Card

### Xin việc (`DEC.job` & `jobOffers(3)`)
- Khi nhân vật ở trạng thái `seeking` (vừa tốt nghiệp, vừa thôi việc, vừa ra tù, hoặc đủ tuổi lao động chưa có việc), hệ thống **tự bật Decision Card** đưa ra **3 lời mời việc làm** phù hợp với `eduLevel`, chuyên ngành (`major`), xuất thân và **người quen/đồng niên giới thiệu** (`viaDraw`).
- Kèm 2 lựa chọn phụ: *Chờ công việc tốt hơn* (đợi 1 năm) hoặc *Ở nhà lo việc nhà* (`homemaker`).

### Thuật toán lương & Thăng bậc hàng năm
- Lương/thu nhập năm phụ thuộc bậc nghề, thâm niên (`daysWorked`, tăng nhanh 10 năm đầu, chậm dần năm 11–20), `Kiến thức`, và Trọng tâm năm (`Dồn sức` `+20%`, `Gia đình` `-10%`).

### Thăng tiến (`DEC.rankup`), Nhảy việc (`DEC.jobchange`) & Nghỉ hưu (`DEC.retire`)
- **Thăng tiến (`DEC.rankup`):** Khi đủ thâm niên và điều kiện ở nghề có nấc thang hoặc quan trường, tự bật Decision Card mời thăng chức.
- **Nhảy việc (`DEC.jobchange`):** Kích hoạt bởi trọng tâm `Phát triển bản thân`, đề xuất việc mới thu nhập cao hơn (`≥ 1.05×`).
- **Nghỉ hưu (`DEC.retire`):** Ở tuổi `60–65`, tự bật Decision Card *Nghỉ hưu*. Nếu từng làm quan hoặc nghề chính thức `≥ 10 năm`, nhận **lương hưu hằng năm** dựa trên thâm niên và mức thu nhập nền.

---

## 3. Kinh Doanh / Khởi Nghiệp (`BIZ_K`) & Điền Sản Cho Thuê

- **Khởi nghiệp (`VENTURES`):** Quán trà, sạp chợ, thư quán, xưởng thủ công, y quán, tửu lầu... Nếu từng làm nghề liên quan (`relatedCareerIds`), được giảm `30%` vốn mở và tăng tỷ lệ thành công.
- **Biến động & Phá sản hàng năm:** Thu nhập tự doanh dao động mỗi năm theo thị trường & thời cuộc (`±10%`); hàng năm kiểm tra xác suất phá sản (`2.5%–15%` tùy loại hình). Phá sản thì đóng cửa cơ sở, quay về `Đang tìm việc` và `Hạnh phúc -8`.
- **Điền sản cho thuê (`PROPERTY_CATALOG`):** Ruộng tốt, sạp chợ, nhà cho thuê, tửu lầu... Bắt buộc trả tiền mặt, sinh lời ròng theo mùa/năm.
