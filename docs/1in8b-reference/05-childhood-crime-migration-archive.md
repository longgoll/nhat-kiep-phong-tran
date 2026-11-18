# 05 — Tuổi Thơ Sớm, Tội Phạm & Tù Tội, Di Cư & Kho Lưu Trữ (`knowYear`, `goPrison`, `savePast`)

---

## 1. Tuổi Thơ Sớm (0–5 Tuổi) & Công Thức `Kiến Thức` (`knowYear`)

### Tính khí (`S.trait`) — 4 loại
- `cur` (*Tò mò*): `+0.005` tăng trưởng kiến thức mỗi năm.
- `act` (*Năng động*): `+1.5` vào mức nền `Sức khỏe`.
- `warm` (*Ấm áp*): `+2` vào mức nền `Quan hệ`.
- `grit` (*Kiên trì*): tăng sức bền vượt khó.
- **Cách hình thành:** Từ 2–4 tuổi qua các lựa chọn đầu đời (`DEC.temper`, đồ chơi, thói quen) + tung xúc xắc hàng năm `tmprYear` (85% ở tuổi 3–4) cộng điểm vào `S.flags.tmp[type]`. Sang tuổi 5, loại cao điểm nhất trở thành `S.trait` cố định.

### Năng khiếu bẩm sinh (`S.tal` & `talK`)
- Sinh ngẫu nhiên lúc chào đời theo phân phối chuẩn z-score cho 6 nhóm (`TAL_K`):
  - `st` (học thuật/logic), `bd` (thể chất), `ar` (mỹ thuật), `mu` (âm nhạc), `hd` (khéo tay), `wd` (ngôn ngữ).
- Giữa tuổi 3–12, `talYear` hé lộ tối đa 2 năng khiếu nổi bật nhất (`>= 1.0`) lên nhật ký và thẻ Hồ sơ (`Năng khiếu`).
- Hệ số tăng kỹ năng sở thích/thể thao: `talK = clamp(1 + 0.35 * tal(t), 0.4, 1.9)`.

### Ước mơ thuở nhỏ (`S.flags.kidDream`)
- Hình thành quanh tuổi 7–10 qua sự kiện tuổi thơ (ví dụ: *Y tá*, *Thầy cô giáo*). Nếu trưởng thành làm đúng nghề ước mơ (hoặc nghề khớp sở thích), được cộng vĩnh viễn `+3` vào mức nền `Hạnh phúc`.

### Công thức `Kiến thức` (`S.st.sm` via `knowYear` & `knowD`)
- `Kiến thức` là **phân vị tương đối so với bạn đồng trang lứa**:
  `100 * normCdf(talW(age - 1) * tal("st") + S.kE + S.kS)` (kẹp `[0.5, 99.9]`).
- Biến nỗ lực tích lũy `S.kE` giảm nhẹ mỗi năm (`× 0.97` nếu `< 25` tuổi, `× 0.985` nếu `≥ 25` tuổi) và cộng thêm `knowD`:
  `0.075 * (sum(KNOW_EFF[f] * focusW[f]) - KNOW_W0(age))`
  *(Vì bạn đồng trang lứa cũng đi học, nên không học gì sẽ khiến phân vị tụt lại).*
- **Các khoản cộng thêm:** `+0.005 * hobby.sm` (đọc sách), `+0.02` khi đang học ĐH / cao học / ĐH mở, `+0.06` khi đỗ bằng bổ túc (`GED`), `+0.005` nếu `trait === "cur"`, `+0.05` khi gặp thầy giỏi, và `-0.02 * (1 - mindKeep)` sau tuổi 72.

---

## 2. Tội Phạm, Tù Tội & Di Cư (`goPrison`, `DEC.parole`, `moveplan`)

### Bị bắt & Ở tù (`goPrison(years, kind)`)
- Kích hoạt từ các sự kiện phạm pháp, lái xe say, gian lận hoặc án oan.
- Tác động tức thì: giải thể doanh nghiệp đang làm chủ (`bizExit`), tạm dừng/buộc thôi học (`prStudyStop`), đặt `S.job = "prison"`, `S.flags.prisonUntil = S.age + years`, `Hạnh phúc -15`, `Quan hệ -10`, `yearMark = "loss"`.
- Trong tù: `Chi tiêu · đầu tư` chỉ hiện `PRISON_SHOP` (`parents`, `willwrite`), ẩn hoàn toàn mục `Lối sống` / đầu tư.

### Ân xá & Tiền án (`DEC.parole`, `S.flags.record`)
- Khi đi qua nửa bản án (`prisonUntil - age`), bật **`DEC.parole`** cho phép xin ân xá sớm (tỷ lệ thành công phụ thuộc thái độ cải tạo & gia đình bảo lãnh).
- Ra tù (trừ án oan) để lại tiền án (`S.flags.record`, `shame`), khóa nhiều nghề chính thức/nhà nước trong `jobOffers` cho tới khi làm lại cuộc đời (`DEC.atone`).

### Di cư trong nước & Ra nước ngoài (`moveplan`, `DEC.city`, `DEC.abroad`)
- **Nông thôn → Thành thị (`S.urban = true`):** Mở rộng danh sách nghề ngoài nông nghiệp (`agr`), đồng thời tăng chi phí sinh hoạt & nhà ở.
- **Di cư quốc tế (`S.mig`, `migPen`):** Đổi quốc gia hiện tại `S.cur`, áp dụng mức phạt thu nhập/nghề nghiệp ban đầu (`S.migPen`) và giảm dần `-0.015/năm` khi học tiếng bản địa & tích lũy kinh nghiệm. Lao động thu nhập thấp ở một số nước còn có rủi ro bị giữ hộ chiếu (`ppHeld`) hoặc cư trú bất hợp pháp (`irreg`).

---

## 3. Kho Lưu Trữ "Các Kiếp Trước" (`localStorage` & Ngôi Làng)

- **Lưu trữ (`savePast`):** Lưu trong `localStorage` với key `one8b.vi.past.v1` (kèm IndexedDB `pdbPut`; bản đang chơi lưu ở `one8b.vi.save.v3`).
- **Dữ liệu mỗi kiếp:** Snapshot đầy đủ của nhân vật (xuất thân, tính khí, năng khiếu, học vấn, nghề nghiệp, cây gia đình), mảng `years[]` từng năm (`{a, h, hl, so, sm, nw, inc, mk, cur...}`), `strip[]` cho bản đồ cuộc đời, lời trăn trối (`last`), văn bia (`epi[]`), người dự đám tang (`mourners`, `attend`).
- **Hiển thị:**
  - **Kệ trưng bày:** Thẻ avatar pixel, tên, tuổi thọ, quốc gia, tóm tắt 1 dòng, cho phép bấm **Xem lại** toàn bộ nhật ký & bản đồ cuộc đời của kiếp đó.
  - **Ngôi làng (`Village`):** Bản đồ pixel 2D nơi các nhân vật từ các kiếp trước đi lại quanh nhà và chào hỏi nhau.
