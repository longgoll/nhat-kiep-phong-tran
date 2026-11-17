# 04 — Lộ Trình Phát Triển Tự Do (Sandbox Progression)

Nhân vật **không bị khóa vào Class cố định**. Người chơi có thể chuyển hướng hoặc kết hợp nhiều con đường (ví dụ: Thương nhân quyên quan, hoặc Võ tướng mưu phản).

---

## 1. Con Đường Khoa Cử & Quan Trường (Ngạch Sĩ / Võ Cử)

### Chu kỳ mở Khoa thi
- **Thi Hương:** Mở **3 năm / 1 lần** vào **Mùa Thu** (`ageYears % 3 === 0`, ngày đầu mùa Thu).
- **Thi Hội & Thi Đình:** Mở vào **Mùa Xuân** năm kế tiếp sau kỳ Thi Hương cho những người đã đỗ Cử nhân.

### Điều kiện & Cấp bậc Khoa cử
| Kỳ thi | Điều kiện dự thi | Lệ phí / Chuẩn bị | Kết quả / Danh hiệu (`flags`) |
| :--- | :--- | :--- | :--- |
| **Thi Hương** | `education >= 25` (Văn) hoặc `martial >= 30` (Võ), không bị `bi_truy_na`, Nam hoặc có `nu_cai_nam_trang` | `200` đồng (lều chõng, lộ phí) | Đỗ thấp: `do_tu_tai` (**Tú tài**)<br>Đỗ cao (`education >= 45`): `do_cu_nhan` (**Cử nhân**) |
| **Thi Hội** | Có flag `do_cu_nhan`, `education >= 55` | `1.000` đồng (lên kinh ứng thí) | `do_cong_si` (**Cống sĩ**, đủ điều kiện vào Thi Đình) |
| **Thi Đình** | Có flag `do_cong_si`, `education >= 75` | Triều đình triệu kiến | `do_tien_si` (**Tiến sĩ**), hoặc top 3: **Thám hoa / Bảng nhãn / Trạng nguyên** (dựa trên `education` + `fame` + `prng`) |

### Thăng tiến Quan trường (Module *Công đường & Phe phái*)
- Bổ nhiệm khởi đầu:
  - Đỗ Cử nhân (xin bổ dụng) $\rightarrow$ **Tri huyện**
  - Đỗ Tiến sĩ / Trạng nguyên $\rightarrow$ **Tri phủ** hoặc **Hàn lâm viện**
- Nấc thang quan lộ: `Tri huyện` $\rightarrow$ `Tri phủ` $\rightarrow$ `Tuần phủ` $\rightarrow$ `Thượng thư` $\rightarrow$ `Tể tướng` (hoặc `Đại tướng quân` nếu đi ngạch Võ cử / Tòng quân).
- **Gameplay Công đường:** Thực hiện các hành động xử án, thu thuế, đắp đê trị thủy. Mỗi quyết định tăng/giảm giữa **Thanh liêm** (`fame+`, dân quý, ít bạc) hoặc **Tham nhũng / Phe phái** (`wealthCopper++`, `infamy+`, rủi ro bị Ngự sử đàn hặc).

---

## 2. Con Đường Thương Nghiệp & Thủ Công (Ngạch Công – Thương)

Mở khóa Module *Thương hội & Giá cả* khi `craftTrade >= 10` hoặc `wealthCopper >= 1.000`:

1. **Làm thuê tích vốn:** Làm thợ phụ, khuân vác, gảy bàn tính thuê.
2. **Mở xưởng / Cửa hiệu:** Mua bất động sản (`properties.push('cua_hieu_gao')` hoặc `'xuong_gom'`). Tạo thu nhập thụ động mỗi mùa tỷ lệ với `craftTrade`.
3. **Đầu cơ & Lũng đoạn thị trường:**
   - Mua lúa gạo (`rice`) giá rẻ vào **Mùa Thu** (`binh_on`, hệ số `×0.85`).
   - Găm hàng chờ **Mùa Hạ** (giáp hạt `×1.25`) hoặc khi `worldState` chuyển sang `mat_mua` (`×1.8`) / `chien_tranh` (`×2.2`) để bán tháo kiếm siêu lợi nhuận.
   - *Rủi ro:* Găm quá nhiều gạo khi `infamy` cao dễ bị quan phủ kiểm tra kho hoặc dân đói cướp phá.
4. **Quyên quan (Mua chức tước):**
   - Dùng `wealthCopper` (từ `50.000` đồng = `5 Vàng` trở lên) để mua hàm quan nhỏ (như Tri huyện) mà không cần thi Khoa cử, mở đường bước chân vào chính trường.

---

## 3. Con Đường Đảo Chính & Khởi Nghĩa (End-Game)

Mở khóa Module *Mật thất Khởi nghĩa* khi nhân vật đạt **một trong hai** điều kiện:
- `fame >= 70` (Uy tín hiệu triệu thiên hạ), HOẶC
- `infamy >= 70` (Thế lực ngầm khuynh đảo).

Để phát động khởi nghĩa lật đổ triều đại cũ, người chơi cần bí mật tích lũy **3 trụ cột** (lưu trong `rebellion` hoặc `flags`/chỉ số phụ):

1. **Ngân khố riêng:** Tối thiểu `100.000` đồng (`10 Vàng`) để nuôi quân và mua vũ khí.
2. **Binh quyền & Tử sĩ:** Có `martial >= 50` (hoặc chiêu mộ được tướng lĩnh NPC) và tích lũy điểm `armyPower >= 100` thông qua các hành động *Chiêu mộ tử sĩ* / *Luyện binh mật*.
3. **Thời cơ (`worldState`):**
   - Triều đình ổn định (`binh_on`): Tỷ lệ thành công khởi nghĩa bị trừ `-40%`.
   - Mất mùa / Dịch bệnh / Chiến tranh (`mat_mua`, `dich_benh`, `chien_tranh`): Tỷ lệ thành công được cộng `+25%` đến `+40%`.

- **Kết cục:**
  - **Thành công:** Lật đổ triều đại cũ, đăng cơ **Khai quốc Hoàng đế**, ghi nhận vào Bách khoa Kết cục (Codex) ở thứ hạng cao nhất.
  - **Thất bại:** Bị xử trảm vì tội mưu phản (`health = 0`, `deathReason = "Bại trận khởi nghĩa, bị xử trảm nơi pháp trường"`).
