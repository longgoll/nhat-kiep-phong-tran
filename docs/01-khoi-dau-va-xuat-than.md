# 01 — Khởi Đầu Ngẫu Nhiên, Xuất Thân & Giới Tính

## 1. Bộ Sinh Số Ngẫu Nhiên Có Hạt Giống (Seeded PRNG)

Mỗi kiếp mới khởi tạo một `seed: number` (32-bit unsigned integer, mặc định lấy từ `crypto.getRandomValues` hoặc người chơi tự nhập Seed để chơi lại cùng một kịch bản).

- **Thuật toán:** `mulberry32`
- **Lưu trạng thái:** `prngState: number` được cập nhật sau mỗi lần gọi `nextRandom()` và lưu trực tiếp trong `ActiveLifeState` để đảm bảo Save/Load giữa chừng vẫn giữ nguyên chuỗi kết quả.

```ts
export function mulberry32Next(state: number): { value: number; nextState: number } {
  let t = (state + 0x6d2b79f5) | 0;
  const nextState = t;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return { value, nextState };
}
```

---

## 2. Gacha Xuất Thân (5 Tầng Lớp) & Chỉ Số Khởi Đầu

Khi tạo kiếp mới, hệ thống quay `nextRandom()` theo bảng trọng số tích lũy sau:

| `originClass` | Tên hiển thị | Tỷ lệ | `wealthCopper` khởi đầu | `rice` (đấu) | `housing` | Chỉ số cộng thêm lúc 0 tuổi |
| :--- | :--- | :---: | :---: | :---: | :--- | :--- |
| `ban_nong` | Bần nông / Dân đen | **70.0%** | `20` – `80` đồng | `3` – `8` | `nha_tranh` | `health: 75`, `maxStamina: 100` |
| `thu_cong` | Thợ thủ công / Tiểu thương | **18.0%** | `300` – `800` đồng | `15` – `30` | `nha_tranh` | `health: 70`, `craftTrade: 5` |
| `dia_chu` | Địa chủ / Cự phú | **8.0%** | `5.000` – `15.000` đồng | `100` – `250` | `nha_gach` | `health: 75`, `education: 5`, `fame: 5` |
| `quan_lai` | Quan lại | **3.5%** | `15.000` – `40.000` đồng | `200` – `500` | `phu_de` | `health: 72`, `education: 10`, `fame: 15` |
| `hoang_toc` | Hoàng tộc | **0.5%** | `80.000` – `200.000` đồng | `1.000` | `phu_de` | `health: 62` *(thể trạng cung đình yếu)*, `education: 12`, `fame: 30` |

### Chỉ số mặc định chung lúc mới sinh (trước khi cộng modifier xuất thân)
- `health`: `70` (hoặc theo bảng trên)
- `happiness`: `70`
- `relationships`: `60`
- `education`: `0`
- `martial`: `0`, `craftTrade`: `0`, `fame`: `0`, `infamy`: `0`
- `stamina`: `100`, `maxStamina`: `100`

> **Lưu ý về tài sản tuổi thơ (0–12 tuổi):** Số `wealthCopper` và `rice` ở bảng trên là **tài sản hộ gia đình** trong giai đoạn cha mẹ nuôi dưỡng. Khi bước sang tuổi 13 (tự lập), nhân vật không tự động hưởng toàn bộ gia sản:
> - `ban_nong` / `thu_cong`: Chỉ mang theo `10%`–`20%` tiền mặt gia đình hoặc tự lập từ tay trắng nếu nhà nghèo.
> - `dia_chu` / `quan_lai` / `hoang_toc`: Được chia vốn tự lập (`30%`–`50%` tài sản gia đình) nếu `relationships >= 40`, hoặc bị cắt viện trợ nếu bất hòa với cha mẹ.

---

## 3. Quy Tắc Giới Tính & Phân Nhánh Tả Thực

- **Tỷ lệ:** 50% `male` (Nam) / 50% `female` (Nữ).
- **Nam giới (`male`):** Mở toàn bộ lộ trình truyền thống (Khoa cử chính thống, Tòng quân, Thương nghiệp, Khởi nghĩa).
- **Nữ giới (`female`):**
  - Mở các nhánh đặc trưng: **Y thuật dân gian**, **Quản lý gia tộc / Thương hội**, **Tuyển tú / Cung đấu** (nếu xuất thân `quan_lai` hoặc `dia_chu` có `fame >= 30`).
  - **Cơ chế Nữ cải nam trang:** Từ 13 tuổi trở lên, nhân vật nữ có `education >= 15` có thể chọn kích hoạt flag `nu_cai_nam_trang` để tham gia Khoa cử & Làm quan.
    - **Rủi ro bại lộ (`exposureRisk`, từ 0–100):** Tăng `+0.5` mỗi năm khi đi học, `+2` mỗi lần thi đỗ, `+5` mỗi năm khi làm quan ở triều đình.
    - **Xử lý khi bại lộ:** Nếu kiểm tra ngẫu nhiên kích hoạt sự kiện bại lộ:
      - Mặc định: Tội **Khi quân** (bị cách chức, tịch biên gia sản hoặc xử trảm).
      - Nếu `fame >= 75` hoặc có ân huệ Hoàng tộc (`flag: an_hue_hoang_thuong`): Mở lựa chọn **Quỳ xin Hoàng thượng đặc xá** (tỷ lệ thành công theo `fame`).

---

## 4. Khởi Tạo Gia Đình & NPC Ban Đầu (0 Tuổi)

Khi bắt đầu kiếp mới, hệ thống sinh tối thiểu 2 NPC trong mảng `npcs`:
1. **Cha (`relation: 'parent'`, `gender: 'male'`):** Có `affinity` khởi đầu từ `40` đến `80` (tùy xuất thân).
2. **Mẹ (`relation: 'parent'`, `gender: 'female'`):** Có `affinity` khởi đầu từ `50` đến `85`.
3. **Anh/Chị/Em (tùy chọn 0–2 NPC):** Sinh ngẫu nhiên với `relation: 'sibling'` (hoặc `'friend'`/`'rival'` ở tuổi đồng ấu) để tạo bối cảnh tranh đoạt gia sản (nhất là với `dia_chu`, `quan_lai`, `hoang_toc`).

> **Quy tắc Hoàng tộc (`hoang_toc`):** Luôn sinh ít nhất 1 Hoàng huynh/Hoàng đệ có `affinity` thấp (`-10` đến `20`) để kích hoạt các sự kiện âm mưu cung đình ("Cửu tử đoạt đích").
