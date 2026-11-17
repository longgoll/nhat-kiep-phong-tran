# 02 — Hệ Thống Chỉ Số, Lão Hóa, Kinh Tế & Van Xả Áp

## 1. Hệ Thống Chỉ Số (4 Tầng)

### Tầng 1: 4 Thanh Chỉ Số Cơ Bản (Thang `0` – `100`, luôn ghim trên cùng UI)
1. **Sức khỏe (`health`):**
   - Về `0` (`health <= 0`) $\rightarrow$ **Tử vong ngay lập tức**, kích hoạt Game Over.
   - Dưới `20`: Trạng thái *Ốm yếu*, giảm 25% hiệu quả mọi hành động lao động và học tập.
2. **Hạnh phúc (`happiness`):**
   - Dưới `20`: Rơi vào trạng thái **U uất / Tuyệt vọng**:
     - Giảm **30%** hiệu suất học tập & làm việc thông thường.
     - **Mở khóa** các hành động/sự kiện liều lĩnh: trộm cắp, gia nhập thảo khấu, đánh bạc, bán thân làm gia nô (thay vì đẩy người chơi vào ngõ cụt).
3. **Quan hệ (`relationships`):**
   - **Quy tắc đồng bộ với `npcs`:** `stats.relationships` là chỉ số **uy tín giao tiếp xã hội tổng quát** (`0–100`), dùng để check điều kiện sự kiện cộng đồng/người lạ.
   - Khi một hành động/sự kiện tác động lên 1 NPC cụ thể (`npcAffinity`), hệ thống cập nhật `npc.affinity` (`-100` đến `+100`) **và** cộng/trừ `20%` lượng thay đổi đó vào `stats.relationships` (làm tròn, kẹp trong `[0, 100]`).
4. **Học thức (`education`):**
   - `0`: Mù chữ hoàn toàn.
   - `1–19`: Biết đọc viết cơ bản.
   - `20–49`: Đủ trình độ dự **Thi Hương**.
   - `50–74`: Đủ trình độ dự **Thi Hội**.
   - `75–100`: Bậc đại nho thông kim bác cổ, đủ sức tranh **Trạng nguyên** ở **Thi Đình**.

### Tầng 2: Năng Lượng Hàng Ngày (`stamina`) & Đường Cong Lão Hóa
- `stamina` dao động từ `0` đến `maxStamina`.
- Nếu hành động yêu cầu `stamina` lớn hơn `stamina` hiện có, hành động đó **không thể thực hiện** (nếu nằm trong lịch tự động và không có Fallback Rule, nhân vật sẽ tự chuyển sang `act_nghi_ngoi` và ghi log cảnh báo).
- **Quy tắc `maxStamina` & Suy giảm Sức khỏe theo tuổi:**

| Độ tuổi | Giai đoạn | `maxStamina` | Tác động Lão hóa (mỗi mùa = 90 ngày) | Tốc độ tăng Học thức/Võ nghệ |
| :--- | :--- | :---: | :--- | :---: |
| `13 – 30` | Thanh niên | `100` | Không suy giảm tự nhiên | **100%** (chuẩn) |
| `31 – 45` | Trung niên sớm | `85` | `health - 0.5` / mùa | **85%** |
| `46 – 55` | Trung niên muộn | `75` | `health - 1.5` / mùa | **70%** |
| `56 – 70` | Tuổi già | `60` | `health - 3.5` / mùa, tăng tỷ lệ bệnh tật | **50%** |
| `71+` | Thượng thọ | `45` | `health - 6.0` / mùa | **30%** |

### Tầng 3: Năng Lực Chuyên Sâu & Địa Vị (Thang `0` – `100`+)
- `martial` (Võ nghệ): Quyết định tỷ lệ thắng khi tòng quân, đánh cướp, thi Võ cử.
- `craftTrade` (Thương tài / Tay nghề): Nhân hệ số lợi nhuận khi làm thủ công và buôn bán (`profitMultiplier = 1 + craftTrade * 0.015`).
- `fame` (Thanh danh chính thống): Uy tín với triều đình & sĩ phu. Cần để thăng quan, bái danh sư, xin đặc xá.
- `infamy` (Uy thế / Tai tiếng): Quyền lực ngầm. Giúp ép nợ, thao túng giá, chiêu mộ tử sĩ, nhưng nếu `infamy >= 60` và không có chức tước bảo kê sẽ dễ kích hoạt flag `bi_truy_na`.

---

## 2. Hệ Thống Kinh Tế (`wealthCopper` & `rice`)

### Quy đổi Tiền tệ (Hiển thị UI từ `wealthCopper`)
- **1 Lượng bạc (`silver`)** = `1.000` Tiền đồng (`copper`)
- **1 Nén vàng (`gold`)** = `10` Lượng bạc = `10.000` Tiền đồng (`copper`)
- *Ví dụ:* `wealthCopper = 12350` hiển thị trên UI là **1 Vàng, 2 Bạc, 350 Đồng**.

### Lương thực (`rice`) & Giá Lúa Biến Động
- Đơn vị: **Đấu** (`10 đấu = 1 thạch`).
- **Giá lúa cơ sở (`baseRicePrice`):** `12` đồng / 1 đấu.
- **Công thức giá lúa theo Mùa & Thời cuộc (`ricePriceInCopper`):**
  - Theo mùa: Xuân (`×1.1`), Hạ (`×1.25` — mùa giáp hạt), Thu (`×0.85` — mùa gặt), Đông (`×1.0`).
  - Theo `worldState`: `binh_on` (`×1.0`), `mat_mua` (`×1.8`), `chien_tranh` (`×2.2`), `dich_benh` (`×1.5`).

---

## 3. Bảng Chi Tiêu & Hồi Phục Hàng Ngày (`LifestyleTier`)

Áp dụng tự động vào **cuối mỗi ngày** (từ 13 tuổi trở lên). Người chơi có thể đổi mức sống bất kỳ lúc nào:

| `LifestyleTier` | Tên gọi | Tiêu hao mỗi ngày | Hồi phục `stamina` (cộng thêm ngoài Ngủ) | Tác động `health` / ngày | Tác động `happiness` / ngày |
| :--- | :--- | :--- | :---: | :---: | :---: |
| `nhin_doi` | Nhịn đói | `0` đấu gạo, `0` đồng | `+0` | `-3.0` | `-2.0` |
| `chao_loang` | Cháo loãng qua ngày | `0.5` đấu gạo | `+5` | `-0.5` | `-0.5` |
| `com_rau` | Cơm rau đạm bạc | `1.0` đấu gạo + `5` đồng | `+15` | `+0.2` | `0` |
| `thit_ca` | Thịt cá đủ đầy | `1.5` đấu gạo + `30` đồng | `+30` | `+1.0` | `+1.5` |

> **Quy tắc tự động khi thiếu gạo/tiền cuối ngày:**
> 1. Nếu chọn `com_rau` hoặc `thit_ca` mà thiếu gạo (`rice`) nhưng đủ tiền (`wealthCopper`), hệ thống **tự động trích tiền mua đúng số đấu gạo còn thiếu** theo `ricePriceInCopper` hiện tại (hoặc người chơi có thể tắt tùy chọn "Tự động mua gạo" trong Cài đặt).
> 2. Nếu không đủ cả gạo lẫn tiền để đáp ứng mức sống đang chọn, hệ thống tự động hạ bậc xuống mức tối đa có thể chi trả (thấp nhất là `nhin_doi`) và ghi 1 dòng log cảnh báo.

### Hồi phục từ Giấc ngủ (Khung giờ `night` — Mặc định `act_ngu`)
- `gam_cau` (Gầm cầu / Ở nhờ): `+35 stamina`, `-0.5 health` (lạnh/ẩm).
- `nha_tranh` (Nhà tranh): `+50 stamina`, `+0 health`.
- `nha_gach` (Nhà gạch): `+65 stamina`, `+0.5 health`.
- `phu_de` (Phủ đệ): `+80 stamina`, `+1.0 health`, `+0.5 happiness`.

---

## 4. Van Xả Áp Sinh Tồn (Chống Death Spiral)

Khi nhân vật rơi vào cảnh `rice === 0` và `wealthCopper < ricePriceInCopper`, các hành động sau **luôn mở khóa không điều kiện vốn**:

1. **Mót lúa / Đào củ rừng (`act_survival_mot_lua`):**
   - Khung giờ: `morning`, `afternoon`.
   - Chi phí: `15 stamina`.
   - Kết quả: `+1.5 rice`, `-1 health`, `-0.2 fame`.
2. **Xin cháo thí ở đình/chùa (`act_survival_xin_chao`):**
   - Khung giờ: `morning`, `afternoon`.
   - Chi phí: `5 stamina`.
   - Kết quả: `+1.0 rice`, `+10 stamina` (ăn tại chỗ), `-1.5 fame`, `-1 happiness`.
3. **Vay nóng địa chủ (`act_survival_vay_nong`):**
   - Thực hiện tức thời (không tốn khung giờ, giới hạn tối đa 1 khoản nợ đang hoạt động thông qua flag `dang_no_dia_chu`).
   - Kết quả ngay lập tức: `+500 wealthCopper`, `+5 rice`, thêm flag `dang_no_dia_chu`.
   - Đẩy sự kiện `evt_debt_collection_01` vào `delayedEvents` với `triggerDay = totalDays + 180`.
   - **Sau 180 ngày:** Nếu đủ `800 wealthCopper` (gốc + lãi 60%) để trả $\rightarrow$ xóa flag `dang_no_dia_chu`. Nếu không đủ $\rightarrow$ bị đánh đập (`health - 30`), mất ruộng/tài sản hoặc ép làm gia nô (khóa khung giờ Sáng/Chiều trong 1 năm).
