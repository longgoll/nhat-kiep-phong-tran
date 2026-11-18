# Báo Cáo Kiểm Định 1.000 Cuộc Đời (Monte Carlo + Narrative Audit)

- **Tổng số kiếp:** 200 (5 Xuất thân × 10 Archetype × 20 Seeds)
- **Tuổi thọ trung bình:** 68.8 tuổi | **Tử vong sớm (<20 tuổi):** 17/200 (8.5%)
- **Lỗi logic/NaN phát hiện:** 0

## 1. Thống Kê Theo Xuất Thân (`OriginClass`)
| Xuất thân | Tuổi TB | Tài sản TB (đ) | Học thức TB | Thanh danh TB | Quan hàm >0 | Triggers/kiếp |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| ban_nong | 61.2 | 4500870 | 69.9 | 1276.7 | 2.5% | 73.8 |
| thu_cong | 72.0 | 6004562 | 72.4 | 1546.6 | 7.5% | 97.4 |
| dia_chu | 71.2 | 7263865 | 91.0 | 2011.3 | 12.5% | 100.8 |
| quan_lai | 67.0 | 7270657 | 90.6 | 1955.5 | 12.5% | 88.3 |
| hoang_toc | 72.7 | 6644641 | 88.5 | 2001.0 | 20.0% | 106.0 |

## 2. Thống Kê Theo Trọng Tâm & Chiến Lược (`Archetype`)
| Archetype (Focus) | Tuổi TB | Tài sản TB (đ) | Học thức TB | Kết hôn | Khởi nghiệp | Điền sản TB |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| cong_danh_exam (cong_danh) | 49.8 | 7798423 | 92.2 | 55% | 0% | 6.3 |
| gia_dinh_marriage (gia_dinh) | 72.5 | 8604400 | 87.7 | 100% | 0% | 11.6 |
| thuong_buon_venture (lam_them) | 72.8 | 14530466 | 81.4 | 100% | 100% | 11.7 |
| dien_san_gold (can_bang) | 74.0 | 11207583 | 85.2 | 100% | 0% | 11.6 |
| suc_khoe_longevity (suc_khoe) | 76.9 | 573778 | 82.2 | 0% | 0% | 0.3 |
| tu_than_moral (tu_than) | 56.0 | 2407845 | 74.7 | 0% | 0% | 0.3 |
| so_thich_hobby (so_thich) | 76.0 | 1722211 | 84.4 | 85% | 0% | 0.3 |
| nghi_ngoi_chill (nghi_ngoi) | 62.6 | 1334472 | 75.4 | 0% | 0% | 0.1 |
| hanh_thien_fame (hanh_thien) | 77.3 | 11057328 | 84.1 | 100% | 0% | 12.0 |
| risk_debt_hardship (lam_them) | 70.2 | 4132686 | 77.6 | 0% | 100% | 0.0 |

## 3. Tần Suất Quyết Định & Nguyên Nhân Tử Vong
- **Decision Hits:** `{"dec_loan_heavy":13,"dec_college_18":145,"dec_retire_60":176,"dec_job_offers":131,"dec_biz_offers":40,"dec_official_appoint":57,"dec_official_promote":435}`
- **Top Nguyên nhân kết thúc:** Sức khỏe suy kiệt qua đời (86) · Tuổi cao sức yếu, an nhiên qua đời (77) · Sống qua 80 tuổi (37)

## 4. Độ Phủ Sự Kiện
- **Top 12 sự kiện nổ nhiều nhất:** `evt_biz_caravan_venture` (664), `evt_biz_supply_contract` (540), `evt_adult_infamy_bounty` (507), `evt_adult_major_noble_patron` (502), `evt_adult_martial_bandit_ambush` (496), `evt_biz_apothecary_rare_herb` (495), `evt_life_midlife_illness` (460), `evt_biz_craft_guild_order` (459), `evt_biz_property_tenant_crisis` (456), `evt_world_bumper_harvest_edict` (424), `evt_life_marriage_harmony` (378), `evt_martial_border_campaign` (370)
- **Dead Major Events (0% sau 1.000 kiếp — 3/140):** `evt_servitude_opportunity`, `evt_adult_major_desperate_theft`, `evt_adult_hoang_toc_teen_royal_hunt`

## 5. Các Ca Mẫu & Bất Thường (Outliers để Agent Soi Mạch Truyện)
### Chết sớm nhất #1: `quan_lai` / `cong_danh_exam` (seed=6586, tuổi=13, tiền=2đ, quan hàm=0, lý do="Sức khỏe suy kiệt qua đời")

### Chết sớm nhất #2: `quan_lai` / `cong_danh_exam` (seed=6599, tuổi=13, tiền=2đ, quan hàm=0, lý do="Sức khỏe suy kiệt qua đời")

### Giàu nhất #1: `quan_lai` / `thuong_buon_venture` (seed=6690, tuổi=77, tiền=20730296đ, quan hàm=0, lý do="Tuổi cao sức yếu, an nhiên qua đời")
- [Tuổi 15] evt_youth_family_sibling_court_rivalry (Sóng Gió Huynh Đệ Nơi Phủ Đệ) -> #0
- [Tuổi 15] evt_scholar_rich_poetry_club (Hội Văn Thơ Tao Nhân Chốn Kinh Kỳ) -> #0
- [Tuổi 17] evt_military_enlist (Đầu Quân Nhập Ngũ Lập Công Danh) -> #1
- [Tuổi 18] evt_martial_border_campaign (Xuất Chinh Bình Định Giặc Biên Ải) -> #0
- [Tuổi 19] evt_adult_exp_world_famine_rice (Nạn Đói Hoành Hành, Giá Gạo Tăng Vọt) -> #0
- [Tuổi 19] evt_biz_property_tenant_crisis (Khách Thuê & Tá Điền Khất Nợ Giữa Mùa Khó) -> #2
- [Tuổi 20] evt_adult_martial_bandit_ambush (Thảo Khấu Chặn Đường) -> #1
- [Tuổi 20] evt_scholar_rich_temptation (Bạn Giàu Rủ Rê Tửu Sắc & Trường Bạc) -> #2
- [Tuổi 20] dec_official_appoint (Triều đình bổ nhiệm: Nhậm chức Tri huyện) -> #0
- [Tuổi 21] evt_official_clean_unjust_case (Xử Án Oan Cho Dân Nghèo) -> #0
- [Tuổi 21] dec_official_promote (Thăng tiến quan trường: Đề bạt chức Tri phủ) -> #0
- [Tuổi 22] evt_official_famine_granary (Dân Đói Vây Nha Môn — Mở Kho Hay Chờ Lệnh?) -> #0
- [Tuổi 22] evt_martial_border_campaign (Xuất Chinh Bình Định Giặc Biên Ải) -> #0
- [Tuổi 23] evt_official_intrigue_border_exile (Bị Điều Đi Trấn Nhậm Vùng Biên Viễn) -> #0
- ... *(còn 101 sự kiện nữa)*

### Nợ nặng nhất #1: `hoang_toc` / `suc_khoe_longevity` (seed=7301, tuổi=72, tiền=0đ, quan hàm=0, lý do="Sức khỏe suy kiệt qua đời")
- [Tuổi 15] evt_adult_major_noble_patron (Gặp Quý Nhân Giữa Chợ Phiên) -> #0
- [Tuổi 15] evt_scholar_rich_poetry_club (Hội Văn Thơ Tao Nhân Chốn Kinh Kỳ) -> #1
- [Tuổi 16] evt_scholar_rich_temptation (Bạn Giàu Rủ Rê Tửu Sắc & Trường Bạc) -> #2
- [Tuổi 16] evt_adult_exp_dia_chu_bribe_corvee (Chạy Chọt Miễn Sưu Dịch Cho Điền Trang) -> #2
- [Tuổi 17] evt_chain_ra_o_rieng_1 (Thưa Chuyện Ra Ở Riêng) -> #0
- [Tuổi 17] evt_chain_ra_o_rieng_2 (Ngày Dựng Mái Nhà Riêng) -> #0
- [Tuổi 17] evt_chain_len_kinh_1 (Khăn Gói Lên Kinh Thành) -> #1
- [Tuổi 17] evt_chain_len_kinh_2 (Những Ngày Đầu Nơi Kinh Kỳ) -> #0
- [Tuổi 17] evt_chain_len_kinh_3 (Ánh Mắt Của Quý Nhân Nơi Phồn Hoa) -> #0
- [Tuổi 17] evt_chain_ra_o_rieng_3 (Anh Chị Em Ghé Thăm Nhà Mới) -> #0
- [Tuổi 18] dec_college_18 (Ngã rẽ tuổi 18: Nhập học Quốc Tử Giám hay Ra đời lập nghiệp?) -> #2
- [Tuổi 19] evt_world_bumper_harvest_edict (Chiếu Khuyến Nông & Hội Chợ Thái Bình) -> #0
- [Tuổi 19] evt_adult_exp_dia_chu_tenant_rent (Tá Điền Kéo Đến Xin Khất Tô) -> #0
- [Tuổi 20] evt_adult_family_sibling_wedding (Hỷ Sự Của Anh Chị Em Trong Nhà) -> #0
- ... *(còn 98 sự kiện nữa)*

### Thọ nhất #1: `hoang_toc` / `so_thich_hobby` (seed=7444, tuổi=80, tiền=2220476đ, quan hàm=0, lý do="Sống qua 80 tuổi")
- [Tuổi 14] evt_adult_hoang_toc_teen_empress_dowager (Thỉnh An Thái Hậu Nơi Cung Từ Ninh) -> #1
- [Tuổi 14] evt_adult_hoang_toc_teen_palace_library (Đọc Mật Sử Nơi Tàng Kinh Các) -> #1
- [Tuổi 16] evt_adult_exp_hoang_toc_vindication (Minh Oan Cho Mẫu Phi Nơi Triều Đường) -> #0
- [Tuổi 16] evt_world_bumper_harvest_edict (Chiếu Khuyến Nông & Hội Chợ Thái Bình) -> #0
- [Tuổi 17] evt_adult_exp_hoang_toc_slander (Bị Kẻ Tiểu Nhân Gièm Pha Trước Ngai Vàng) -> #1
- [Tuổi 17] evt_military_enlist (Đầu Quân Nhập Ngũ Lập Công Danh) -> #0
- [Tuổi 18] evt_adult_exp_hoang_toc_royal_marriage (Thánh Chỉ Ban Hôn Hoàng Gia) -> #1
- [Tuổi 18] evt_scholar_rich_poetry_club (Hội Văn Thơ Tao Nhân Chốn Kinh Kỳ) -> #0
- [Tuổi 19] evt_military_promotion_1 (Lập Công Trận Tiền, Thăng Chức Hiệu Úy) -> #0
- [Tuổi 19] evt_biz_caravan_venture (Cơ Hội Chung Vốn Buôn Chuyến Liên Trấn) -> #2
- [Tuổi 20] dec_official_appoint (Triều đình bổ nhiệm: Nhậm chức Tri huyện) -> #0
- [Tuổi 20] evt_martial_border_campaign (Xuất Chinh Bình Định Giặc Biên Ải) -> #1
- [Tuổi 20] evt_adult_exp_hoang_toc_succession (Vòng Xoáy Tranh Đoạt Trữ Vị) -> #0
- [Tuổi 21] dec_official_promote (Thăng tiến quan trường: Đề bạt chức Tri phủ) -> #0
- ... *(còn 112 sự kiện nữa)*

### Mẫu Gia đình: `ban_nong` / `gia_dinh_marriage` (seed=5065, tuổi=67, tiền=5485028đ, quan hàm=0, lý do="Tuổi cao sức yếu, an nhiên qua đời")
- [Tuổi 14] evt_youth_family_father_injury_common (Phụ Thân Gặp Nạn Khi Mưu Sinh) -> #1
- [Tuổi 16] evt_chain_len_kinh_1 (Khăn Gói Lên Kinh Thành) -> #0
- [Tuổi 16] evt_chain_len_kinh_2 (Những Ngày Đầu Nơi Kinh Kỳ) -> #1
- [Tuổi 16] evt_chain_ra_o_rieng_1 (Thưa Chuyện Ra Ở Riêng) -> #1
- [Tuổi 16] evt_chain_len_kinh_3 (Ánh Mắt Của Quý Nhân Nơi Phồn Hoa) -> #1
- [Tuổi 17] evt_fate_brothel_or_bodyguard (Ánh Đèn Thanh Lâu & Bến Bãi Giang Hồ) -> #1
- [Tuổi 18] dec_college_18 (Ngã rẽ tuổi 18: Nhập học Quốc Tử Giám hay Ra đời lập nghiệp?) -> #1
- [Tuổi 18] evt_adult_martial_bandit_ambush (Thảo Khấu Chặn Đường) -> #0
- [Tuổi 18] evt_world_imperial_tax_levy (Triều Đình Ban Lệnh Tăng Thuế Thời Loạn) -> #0
- [Tuổi 19] evt_military_enlist (Đầu Quân Nhập Ngũ Lập Công Danh) -> #1
- [Tuổi 20] evt_martial_siege_defense (Tử Thủ Thành Trì Trước Vòng Vây Địch) -> #0
- [Tuổi 20] evt_scholar_poor_village_fund (Quỹ Nghĩa Học Của Làng Xã) -> #0
- [Tuổi 22] evt_adult_major_corvee (Trát Bắt Đi Phu Đắp Đê) -> #0
- [Tuổi 22] evt_martial_court_rivalry (Văn Quan Dèm Pha Công Trận Của Võ Tướng) -> #0
- ... *(còn 76 sự kiện nữa)*

### Mẫu Thương buôn: `ban_nong` / `thuong_buon_venture` (seed=5117, tuổi=55, tiền=7765978đ, quan hàm=0, lý do="Tuổi cao sức yếu, an nhiên qua đời")
- [Tuổi 14] evt_youth_family_father_injury_common (Phụ Thân Gặp Nạn Khi Mưu Sinh) -> #0
- [Tuổi 15] evt_adult_exp_world_famine_rice (Nạn Đói Hoành Hành, Giá Gạo Tăng Vọt) -> #0
- [Tuổi 15] evt_youth_family_sibling_crisis_common (Anh Chị Em Gặp Khó Nơi Xứ Người) -> #1
- [Tuổi 16] evt_fate_brothel_or_bodyguard (Ánh Đèn Thanh Lâu & Bến Bãi Giang Hồ) -> #2
- [Tuổi 17] evt_chain_len_kinh_1 (Khăn Gói Lên Kinh Thành) -> #0
- [Tuổi 17] evt_chain_len_kinh_2 (Những Ngày Đầu Nơi Kinh Kỳ) -> #1
- [Tuổi 17] evt_chain_len_kinh_3 (Ánh Mắt Của Quý Nhân Nơi Phồn Hoa) -> #1
- [Tuổi 17] evt_chain_ra_o_rieng_1 (Thưa Chuyện Ra Ở Riêng) -> #1
- [Tuổi 18] dec_college_18 (Ngã rẽ tuổi 18: Nhập học Quốc Tử Giám hay Ra đời lập nghiệp?) -> #1
- [Tuổi 18] evt_adult_martial_bandit_ambush (Thảo Khấu Chặn Đường) -> #0
- [Tuổi 19] evt_biz_property_tenant_crisis (Khách Thuê & Tá Điền Khất Nợ Giữa Mùa Khó) -> #1
- [Tuổi 20] evt_adult_family_sibling_wedding (Hỷ Sự Của Anh Chị Em Trong Nhà) -> #1
- [Tuổi 20] evt_scholar_poor_exam_fail (Lỡ Hẹn Bảng Vàng Khoa Đầu) -> #0
- [Tuổi 21] evt_scholar_poor_copy_books (Chép Sách Thuê & Dạy Trẻ Đầu Làng) -> #0
- ... *(còn 55 sự kiện nữa)*

### Mẫu Công danh: `thu_cong` / `cong_danh_exam` (seed=5533, tuổi=74, tiền=13962891đ, quan hàm=5, lý do="Sức khỏe suy kiệt qua đời")
- [Tuổi 14] evt_scholar_poor_mentor (Thầy Đồ Già Nhận Làm Môn Sinh) -> #1
- [Tuổi 14] evt_scholar_poor_copy_books (Chép Sách Thuê & Dạy Trẻ Đầu Làng) -> #0
- [Tuổi 15] evt_youth_family_sibling_crisis_common (Anh Chị Em Gặp Khó Nơi Xứ Người) -> #0
- [Tuổi 15] evt_scholar_local_exam_temptation (Cám Dỗ Mua Đề Trước Trường Thi) -> #1
- [Tuổi 16] evt_chain_len_kinh_1 (Khăn Gói Lên Kinh Thành) -> #2
- [Tuổi 16] evt_fate_brothel_or_bodyguard (Ánh Đèn Thanh Lâu & Bến Bãi Giang Hồ) -> #1
- [Tuổi 16] evt_chain_len_kinh_2 (Những Ngày Đầu Nơi Kinh Kỳ) -> #1
- [Tuổi 16] evt_chain_len_kinh_3 (Ánh Mắt Của Quý Nhân Nơi Phồn Hoa) -> #1
- [Tuổi 17] evt_adult_exp_thu_cong_merchant_order (Thương Nhân Phương Xa Đặt Lô Hàng Lớn) -> #2
- [Tuổi 17] evt_biz_tea_cart_rumor (Khách Quán Nước Đồn Chuyện Lạ) -> #0
- [Tuổi 18] evt_adult_reunion_best_friend (Tái Ngộ Bạn Nối Khố Năm Xưa) -> #0
- [Tuổi 18] evt_adult_exp_thu_cong_guild (Lập Phường Hội Thợ Nghề) -> #0
- [Tuổi 18] dec_college_18 (Ngã rẽ tuổi 18: Nhập học Quốc Tử Giám hay Ra đời lập nghiệp?) -> #0
- [Tuổi 19] evt_scholar_poor_village_fund (Quỹ Nghĩa Học Của Làng Xã) -> #0
- ... *(còn 100 sự kiện nữa)*
