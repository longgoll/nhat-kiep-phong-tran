# 03 — Hộp Thoại "Chi Tiêu · Đầu Tư" (`openShop`, `shopTop`, `shopRank`)

> Mở được từ **6 tuổi trở lên** (khi `focusOptions().length > 0`). Thời gian tự động **tạm dừng** trong lúc người chơi xem bảng này.

---

## 1. Cấu Trúc 3 Tầng Của Giao Diện

1. **Header Tài chính:**
   - Hiển thị `Tiền tiết kiệm {S.money}` (hoặc `Nợ {-S.money}` màu đỏ nếu âm tiền), kèm thu nhập hằng năm.
   - Giải thích rõ sự khác biệt giữa tiền mặt tiêu được và tài sản cố định (nhà ở, đất đai, nhà cho thuê, cổ phần).
2. **`"Nên làm lúc này"` (`shopTop` + `shopRank`):**
   - Không đổ toàn bộ ~74 mục ra ngoài. Hệ thống chấm điểm từng mục theo hoàn cảnh (`shopRank`) rồi chỉ đẩy **những việc hợp cảnh nhất** lên trên:
     - Đang nợ (`S.money + potV() < 0`): các mục giải trí & mua sắm bị trừ `-3` điểm; các mục **bán nhà / bán xe / thu nhỏ nhà / ngưng sở thích** nhảy lên đầu.
     - Đủ tuổi & đúng học vấn: đẩy `ged`, `nightuni`, `openuni` lên trên.
     - Sức khỏe `< 55` hoặc tuổi `≥ 50`: đẩy `checkup` (khám tổng quát) lên trên.
3. **`"Xem thêm (N)"` & `"Lối sống"` (thu gọn mặc định):**
   - **`ITEMS` (8 tài sản sở hữu 1 lần trong `S.owns`):** Điện thoại (`≥13t`), Xe đạp (`≥12t`), PC/Laptop (`≥15t`, mở khóa tự học lập trình), TV & tủ lạnh (`≥18t`), Xe máy (`≥18t`), Ô tô (`≥20t`), Nhà riêng (`≥26t`, tự tính vay trả góp 20% vốn đối ứng).
   - **74 mục `SHOP` có cooldown (`cd`) hoặc công tắc (`set`):** Xã giao/gia đình, Du lịch, Sức khỏe/Sở thích, Giáo dục/Nghề nghiệp, Nhà ở/Di cư/Bán tài sản, Hôn nhân/Con cái.
   - **`Lối sống` (ẩn khi `< 15 tuổi`):** Đầu tư tiền nhàn rỗi (`INV_KS`), Tiền hiếu hỉ (`≥18t`), Họ của con, Bảo hiểm (`≥18t`), Chế độ ăn uống (`≥18t`), và các công tắc **Tự động hằng năm**.

---

## 2. Quy Tắc Biến Đổi Theo Học Vấn, Tuổi & Tài Chính

### Theo Học vấn (`S.edu`)
- `S.edu <= 2` (16–84 tuổi, đã nghỉ học): mở **`Học lớp đêm / Thi bằng tương đương`** (`ged`).
- `S.edu === 3` (20–49 tuổi): mở **`Vừa đi làm vừa học đại học`** (`nightuni`).
- `S.edu === 4` (24–69 tuổi): mở **`Học cao học 2 năm`** (`nightgrad`).
- `50–75 tuổi`: mở **`Đại học mở`** (`openuni`).
- Sở hữu PC (`ITEMS`): mở khóa tự học lập trình (`selfcode`), giúp bỏ qua yêu cầu bằng đại học khi xin việc IT.

### Theo Giai đoạn cuộc đời
- **0–5 tuổi:** Không mở được hộp thoại.
- **6–14 tuổi:** Chỉ thấy vài mục hợp tuổi (`đi ăn/tặng quà`, `dụng cụ sở thích`, `xe đạp ≥12t`, `điện thoại ≥13t`); ẩn hoàn toàn mục `Lối sống`.
- **15–17 tuổi:** Mở `PC` (15t), `du lịch trong nước` (16t), `học lớp đêm` (16t), và mục **`Đầu tư tiền nhàn rỗi`** trong `Lối sống`.
- **18+ tuổi:** Mở đủ kết hôn, sự nghiệp, khởi nghiệp, nhà cửa, bảo hiểm, ăn uống, hiếu hỉ.
- **50+ / Nghỉ hưu:** Mở `viết di chúc` (50+), `đổi nhà nhỏ hơn` (45+), `đi làm lại` (<75t), `nghỉ hưu`. (Ở trong tù chỉ hiện danh sách `PRISON_SHOP`).

### Theo Tài chính, Tín dụng & Đầu tư (`creditOK`, `INV_KS`)
- **Giá cả tự co giãn:** Mọi mức giá nhân theo thu nhập trung vị (`med()`) hoặc `usd2ppp` của quốc gia.
- **Mua chịu (`creditOK`):** Các món không bắt buộc tiền mặt (`!cash`) có thể mua khi thiếu tiền nếu nằm trong hạn mức tín dụng (hiển thị nhãn *"vay để mua"*). Bất động sản cho thuê (`cash: 1`) và tiền đặt cọc nhà không cho vay tiêu dùng.
- **Đầu tư tiền nhàn rỗi (`INV_KS`):** Tiền mặt/gửi ngân hàng (`0–1.5%/năm`), Trái phiếu (`~2%`), Quỹ 50/50 (`~3.5%`), Cổ phiếu chỉ số (`~5%`), Quỹ toàn cầu (`~5%`), Quỹ BĐS (`~3.5%`), Tự giao dịch cổ phiếu (`trade`). Đổi kênh đầu tư chịu phí + thuế lãi vốn; đang âm tiền thì ưu tiên trả nợ trước.
