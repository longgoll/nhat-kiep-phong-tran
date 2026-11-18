# 02 — Nghề Nghiệp, Lương, Thăng Tiến & Kinh Doanh (`JOBS`, `BIZ_K`)

---

## 1. Hệ Thống Nghề Nghiệp (`JOBS`, `DEC.job`, `DEC.rankup`, `DEC.jobchange`)

### Dữ liệu nghề (`JOBS` — 82+ nghề)
Mỗi nghề gồm:
- Nhóm ngành (`agr` nông nghiệp / `ind` công nghiệp / `ser` dịch vụ),
- Học vấn tối thiểu (`e: 0–5`) và chuyên ngành yêu cầu (`MAJOR_REQ` / `MAJOR_MOST`),
- Dải phân vị thu nhập `[lo, hi]` trong quốc gia,
- Cờ chính thức / phi chính thức, và rủi ro tai nạn (`fall`, `inj`, `drown`).

### Xin việc qua Decision Card (`DEC.job` & `jobOffers(3)`)
- Khi `S.job === "seeking"` (không đi học, chưa nghỉ hưu), hệ thống tự bật Decision Card đưa ra **3 lời mời việc làm** phù hợp với học vấn, chuyên ngành, thành thị/nông thôn và cơ cấu ngành của quốc gia.
- Mỗi lời mời ghi rõ: thu nhập năm, chính thức hay thời vụ, có phải qua kỳ thi công chức/giáo viên (`exam: 1`) hay **do bạn bè/người quen giới thiệu** (`viaDraw`).
- Kèm 2 lựa chọn phụ: *Chờ một công việc tốt hơn* (đợi 1 năm) hoặc *Ở nhà lo việc nhà* (`homemaker`, thu nhập `0`).

### Thuật toán lương & Tăng bậc hàng năm (`incomeAt`, `S.pct`)
- Thu nhập năm tính theo phân phối log-normal của quốc gia tại phân vị `S.pct` (kẹp trong `[lo, hi]` của nghề).
- Mỗi năm làm việc, `S.pct` tự dịch chuyển:
  - **Kinh nghiệm:** Tăng nhanh trong 10 năm đầu, chậm dần năm 11–20, chững lại sau 20 năm.
  - **Kiến thức:** `(S.st.sm - 50) / 50 * 0.003`.
  - **Trọng tâm năm:** `work` (`+0.012`), `learn` (`+0.006`), `family` (`-0.003`).
  - **Tuổi cao (`> 55`):** `-0.004`.

### Thăng tiến, Nhảy việc & Nghỉ hưu
- **Thăng tiến (`DEC.rankup`):** Các nghề có nấc thang (`ladder`: giảng viên → giáo sư, luật sư, bác sĩ, quân đội, công chức...) tự bật Decision Card thăng chức khi đủ thâm niên.
- **Đổi việc (`DEC.jobchange`):** Kích hoạt bởi trọng tâm `Phát triển bản thân` (`learn`) hoặc chủ động tìm việc, đề xuất công việc mới trả `≥ 1.05×` (cùng nghề) hoặc `≥ 0.98×` (đổi nghề).
- **Nghỉ hưu (`DEC.retire` & `pensionAmount`):** Quanh tuổi `60–65`, chuyển `S.job = "retired"`. Nếu đủ số năm làm chính thức (`formalY >= 10`) hoặc là công chức/quân nhân sẽ nhận lương hưu tính theo tỷ lệ thu nhập nền và thâm niên.

---

## 2. Kinh Doanh / Khởi Nghiệp & Nhà Cho Thuê (`BIZ_K`, `DEC.biz`, `rentDeal`)

### Khởi nghiệp (`BIZ_K` — 21 loại hình)
- Chia thành nhóm phổ thông (quán ăn, tiệm buôn, bán hàng online, xưởng, vận tải, nông trại, quán rượu...) và nhóm chuyên môn (văn phòng luật, phòng khám, phần mềm, học viện...).
- **Vốn mở:** `max(1.5 * medianIncome, S.income) * bizCostK` (hệ số `0.5–3.0×`). Nếu trước đó từng làm nghề liên quan (`fit`), tỷ lệ thành công và tăng trưởng cao hơn.
- **Biến động & Phá sản (`bizCloseYear`):**
  - Thu nhập chủ doanh nghiệp dao động mạnh mỗi năm (`(rnd() - 0.5) * 0.1` + suy thoái).
  - Hàng năm đều kiểm tra xác suất đóng cửa (`BIZ_K[k].close`: `2.5%` với phòng khám đến `13–15%` với quán bar/phần mềm). Phá sản thì quay về `seeking` và `Hạnh phúc -8`.
  - Có thể nhận đối tác góp vốn (`bizPt`: chia 80% thu nhập, rủi ro bị mua lại cổ phần 4%/năm) hoặc tự bán/đóng cửa qua bảng *Chi tiêu · đầu tư*.

### Bất động sản cho thuê (`rentDeal`)
- Mua nhà nhỏ (`0.55×` giá nhà), nhà lớn (`1.0×`), hoặc khu 4 phòng.
- Bắt buộc trả trước bằng tiền mặt (`cash: 1`, không cho vay tiêu dùng) và kiểm tra tổng nghĩa vụ trả nợ `≤ 40%` thu nhập.
- Sinh lời ròng hàng năm khoảng `70%` giá thuê thị trường (`houseValue * rentY`).
