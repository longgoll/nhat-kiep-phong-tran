# Báo Cáo Kiểm Định 1.000 Cuộc Đời (Monte Carlo + Narrative Audit)

- **Tổng số kiếp:** 200 (5 Xuất thân × 10 Archetype × 20 Seeds)
- **Tuổi thọ trung bình:** 69.2 tuổi | **Tử vong sớm (<20 tuổi):** 14/200 (7.0%)
- **Lỗi logic/NaN phát hiện:** 0

## 1. Thống Kê Theo Xuất Thân (`OriginClass`)
| Xuất thân | Tuổi TB | Tài sản TB (đ) | Học thức TB | Thanh danh TB | Quan hàm >0 | Triggers/kiếp |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| ban_nong | 67.3 | 6771843 | 61.8 | 1562.5 | 0.0% | 77.8 |
| thu_cong | 60.7 | 6305842 | 44.9 | 1530.9 | 7.5% | 77.7 |
| dia_chu | 73.7 | 8376665 | 58.6 | 1965.0 | 7.5% | 103.2 |
| quan_lai | 73.0 | 9198639 | 70.7 | 2190.5 | 27.5% | 101.0 |
| hoang_toc | 71.5 | 8708860 | 79.1 | 2455.9 | 22.5% | 119.9 |

## 2. Thống Kê Theo Trọng Tâm & Chiến Lược (`Archetype`)
| Archetype (Focus) | Tuổi TB | Tài sản TB (đ) | Học thức TB | Kết hôn | Khởi nghiệp | Điền sản TB |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| cong_danh_exam (cong_danh) | 58.9 | 7744119 | 62.5 | 55% | 0% | 9.3 |
| gia_dinh_marriage (gia_dinh) | 75.2 | 11887399 | 75.8 | 85% | 0% | 12.0 |
| thuong_buon_venture (lam_them) | 75.5 | 17535451 | 68.0 | 100% | 90% | 12.0 |
| dien_san_gold (can_bang) | 74.3 | 13275566 | 62.4 | 100% | 0% | 12.0 |
| suc_khoe_longevity (suc_khoe) | 76.8 | 2314218 | 68.3 | 0% | 0% | 0.3 |
| tu_than_moral (tu_than) | 62.7 | 2329060 | 67.4 | 0% | 0% | 0.2 |
| so_thich_hobby (so_thich) | 72.3 | 2937070 | 65.7 | 90% | 0% | 0.2 |
| nghi_ngoi_chill (nghi_ngoi) | 53.0 | 2134489 | 52.1 | 0% | 0% | 0.3 |
| hanh_thien_fame (hanh_thien) | 74.6 | 12328933 | 74.1 | 85% | 0% | 12.0 |
| risk_debt_hardship (lam_them) | 69.3 | 6237396 | 33.9 | 0% | 100% | 0.0 |

## 3. Tần Suất Quyết Định & Nguyên Nhân Tử Vong
- **Decision Hits:** `{"dec_college_18":141,"dec_job_offers":112,"dec_retire_60":179,"dec_loan_heavy":28,"dec_biz_offers":38,"dec_official_promote":763,"dec_official_appoint":274,"dec_rankup":1}`
- **Top Nguyên nhân kết thúc:** Sức khỏe suy kiệt qua đời (91) · Tuổi cao sức yếu, an nhiên qua đời (82) · Sống qua 80 tuổi (27)

## 4. Độ Phủ Sự Kiện
- **Top 12 sự kiện nổ nhiều nhất:** `evt_biz_caravan_venture` (581), `evt_adult_martial_bandit_ambush` (537), `evt_biz_property_tenant_crisis` (505), `evt_adult_infamy_bounty` (494), `evt_world_bumper_harvest_edict` (488), `evt_biz_supply_contract` (465), `evt_life_midlife_illness` (447), `evt_biz_craft_guild_order` (383), `evt_life_marriage_harmony` (382), `evt_biz_apothecary_rare_herb` (353), `evt_adult_major_noble_patron` (341), `evt_martial_border_campaign` (340)
- **Dead Major Events (0% sau 1.000 kiếp — 7/140):** `evt_servitude_opportunity`, `evt_adult_reunion_best_friend`, `evt_adult_major_desperate_theft`, `evt_adult_exp_hoang_toc_vindication`, `evt_adult_hoang_toc_teen_cold_palace_ally`, `evt_scholar_road_to_capital`, `evt_scholar_vinh_quy_bai_to`

## 5. Các Ca Mẫu & Bất Thường (Outliers để Agent Soi Mạch Truyện)
### Chết sớm nhất #1: `thu_cong` / `cong_danh_exam` (seed=5533, tuổi=13, tiền=1đ, quan hàm=0, lý do="Sức khỏe suy kiệt qua đời")

### Chết sớm nhất #2: `thu_cong` / `cong_danh_exam` (seed=5546, tuổi=13, tiền=1đ, quan hàm=0, lý do="Sức khỏe suy kiệt qua đời")

### Giàu nhất #1: `hoang_toc` / `thuong_buon_venture` (seed=7197, tuổi=80, tiền=23114998đ, quan hàm=0, lý do="Sống qua 80 tuổi")
- [Tuổi 13] evt_adult_hoang_toc_teen_empress_dowager (Thỉnh An Thái Hậu Nơi Cung Từ Ninh) -> #2
- [Tuổi 15] evt_adult_hoang_toc_teen_palace_library (Đọc Mật Sử Nơi Tàng Kinh Các) -> #0
- [Tuổi 16] evt_scholar_rich_temptation (Bạn Giàu Rủ Rê Tửu Sắc & Trường Bạc) -> #2
- [Tuổi 16] evt_youth_family_sibling_court_rivalry (Sóng Gió Huynh Đệ Nơi Phủ Đệ) -> #1
- [Tuổi 17] evt_adult_martial_bandit_ambush (Thảo Khấu Chặn Đường) -> #0
- [Tuổi 17] evt_adult_exp_hoang_toc_succession (Vòng Xoáy Tranh Đoạt Trữ Vị) -> #1
- [Tuổi 18] evt_adult_court_faction_purge (Sóng Gió Phe Cánh Triều Đình) -> #1
- [Tuổi 18] dec_college_18 (Ngã rẽ tuổi 18: Nhập học Quốc Tử Giám hay Ra đời lập nghiệp?) -> #1
- [Tuổi 19] evt_adult_exp_hoang_toc_title_estate (Lễ Trưởng Thành & Khai Phủ Tôn Thất) -> #0
- [Tuổi 19] evt_adult_exp_hoang_toc_slander (Bị Kẻ Tiểu Nhân Gièm Pha Trước Ngai Vàng) -> #2
- [Tuổi 20] evt_biz_property_tenant_crisis (Khách Thuê & Tá Điền Khất Nợ Giữa Mùa Khó) -> #1
- [Tuổi 21] evt_adult_family_spouse_hardship (Vợ Chồng Đồng Cam Cộng Khổ) -> #1
- [Tuổi 21] evt_adult_exp_hoang_toc_royal_marriage (Thánh Chỉ Ban Hôn Hoàng Gia) -> #1
- [Tuổi 22] dec_job_offers (Tìm kiếm sinh kế: 3 lời mời việc làm phù hợp) -> #0
- ... *(còn 119 sự kiện nữa)*

### Nợ nặng nhất #1: `hoang_toc` / `tu_than_moral` (seed=7392, tuổi=53, tiền=0đ, quan hàm=5, lý do="Sức khỏe suy kiệt qua đời")
- [Tuổi 13] evt_adult_hoang_toc_teen_palace_library (Đọc Mật Sử Nơi Tàng Kinh Các) -> #0
- [Tuổi 14] evt_adult_hoang_toc_teen_royal_hunt (Cuộc Săn Mùa Thu Tại Lâm Uyển Hoàng Gia) -> #0
- [Tuổi 14] evt_adult_hoang_toc_teen_empress_dowager (Thỉnh An Thái Hậu Nơi Cung Từ Ninh) -> #1
- [Tuổi 15] evt_youth_family_sibling_court_rivalry (Sóng Gió Huynh Đệ Nơi Phủ Đệ) -> #1
- [Tuổi 16] evt_adult_exp_hoang_toc_royal_marriage (Thánh Chỉ Ban Hôn Hoàng Gia) -> #2
- [Tuổi 16] evt_adult_hoang_toc_patron_arts (Mở Hội Bình Thơ & Bảo Trợ Tao Nhân) -> #1
- [Tuổi 17] evt_adult_exp_hoang_toc_slander (Bị Kẻ Tiểu Nhân Gièm Pha Trước Ngai Vàng) -> #2
- [Tuổi 17] evt_adult_exp_hoang_toc_succession (Vòng Xoáy Tranh Đoạt Trữ Vị) -> #2
- [Tuổi 18] evt_adult_exp_hoang_toc_title_estate (Lễ Trưởng Thành & Khai Phủ Tôn Thất) -> #0
- [Tuổi 18] dec_college_18 (Ngã rẽ tuổi 18: Nhập học Quốc Tử Giám hay Ra đời lập nghiệp?) -> #0
- [Tuổi 19] evt_scholar_rich_patron_poor (Gặp Sĩ Tử Nghèo Hết Tiền Lộ Phí) -> #2
- [Tuổi 19] evt_scholar_local_exam_temptation (Cám Dỗ Mua Đề Trước Trường Thi) -> #1
- [Tuổi 20] evt_adult_hoang_toc_diplomatic_envoy (Đón Tiếp Sứ Thần Ngoại Bang) -> #2
- [Tuổi 20] evt_scholar_rich_poetry_club (Hội Văn Thơ Tao Nhân Chốn Kinh Kỳ) -> #1
- ... *(còn 77 sự kiện nữa)*

### Thọ nhất #1: `hoang_toc` / `hanh_thien_fame` (seed=7522, tuổi=80, tiền=18122901đ, quan hàm=0, lý do="Sống qua 80 tuổi")
- [Tuổi 13] evt_adult_hoang_toc_teen_empress_dowager (Thỉnh An Thái Hậu Nơi Cung Từ Ninh) -> #1
- [Tuổi 14] evt_adult_exp_world_plague_quarantine (Dịch Bệnh Lan Tràn Khắp Phủ) -> #2
- [Tuổi 14] evt_adult_hoang_toc_teen_royal_hunt (Cuộc Săn Mùa Thu Tại Lâm Uyển Hoàng Gia) -> #0
- [Tuổi 15] evt_adult_hoang_toc_teen_palace_library (Đọc Mật Sử Nơi Tàng Kinh Các) -> #1
- [Tuổi 15] evt_youth_family_sibling_court_rivalry (Sóng Gió Huynh Đệ Nơi Phủ Đệ) -> #1
- [Tuổi 17] evt_adult_hoang_toc_patron_arts (Mở Hội Bình Thơ & Bảo Trợ Tao Nhân) -> #1
- [Tuổi 17] evt_adult_exp_hoang_toc_royal_marriage (Thánh Chỉ Ban Hôn Hoàng Gia) -> #1
- [Tuổi 18] dec_college_18 (Ngã rẽ tuổi 18: Nhập học Quốc Tử Giám hay Ra đời lập nghiệp?) -> #0
- [Tuổi 18] evt_adult_exp_hoang_toc_title_estate (Lễ Trưởng Thành & Khai Phủ Tôn Thất) -> #0
- [Tuổi 18] evt_adult_exp_hoang_toc_succession (Vòng Xoáy Tranh Đoạt Trữ Vị) -> #2
- [Tuổi 19] evt_adult_hoang_toc_patron_arts (Mở Hội Bình Thơ & Bảo Trợ Tao Nhân) -> #0
- [Tuổi 19] evt_adult_hoang_toc_famine_imperial_edict (Dâng Sớ Xin Mở Kho Ngự Khố Cứu Dân) -> #0
- [Tuổi 20] evt_adult_martial_bandit_ambush (Thảo Khấu Chặn Đường) -> #1
- [Tuổi 20] evt_adult_court_faction_purge (Sóng Gió Phe Cánh Triều Đình) -> #1
- ... *(còn 124 sự kiện nữa)*

### Mẫu Gia đình: `ban_nong` / `gia_dinh_marriage` (seed=5065, tuổi=80, tiền=12277802đ, quan hàm=0, lý do="Sống qua 80 tuổi")
- [Tuổi 14] evt_youth_family_father_injury_common (Phụ Thân Gặp Nạn Khi Mưu Sinh) -> #1
- [Tuổi 15] evt_adult_martial_bandit_ambush (Thảo Khấu Chặn Đường) -> #0
- [Tuổi 16] evt_military_enlist (Đầu Quân Nhập Ngũ Lập Công Danh) -> #2
- [Tuổi 16] evt_chain_ra_o_rieng_1 (Thưa Chuyện Ra Ở Riêng) -> #1
- [Tuổi 17] evt_fate_brothel_or_bodyguard (Ánh Đèn Thanh Lâu & Bến Bãi Giang Hồ) -> #1
- [Tuổi 18] dec_college_18 (Ngã rẽ tuổi 18: Nhập học Quốc Tử Giám hay Ra đời lập nghiệp?) -> #1
- [Tuổi 18] evt_chain_len_kinh_1 (Khăn Gói Lên Kinh Thành) -> #2
- [Tuổi 18] evt_chain_len_kinh_2 (Những Ngày Đầu Nơi Kinh Kỳ) -> #1
- [Tuổi 18] evt_chain_len_kinh_3 (Ánh Mắt Của Quý Nhân Nơi Phồn Hoa) -> #1
- [Tuổi 19] evt_adult_major_corvee (Trát Bắt Đi Phu Đắp Đê) -> #1
- [Tuổi 21] evt_adult_family_spouse_hardship (Vợ Chồng Đồng Cam Cộng Khổ) -> #0
- [Tuổi 21] evt_biz_property_tenant_crisis (Khách Thuê & Tá Điền Khất Nợ Giữa Mùa Khó) -> #1
- [Tuổi 22] dec_job_offers (Tìm kiếm sinh kế: 3 lời mời việc làm phù hợp) -> #0
- [Tuổi 22] evt_chain_bao_hieu_me_1 (Mẫu Thân Đổ Bệnh Giữa Đêm Gió Lạnh) -> #0
- ... *(còn 76 sự kiện nữa)*

### Mẫu Thương buôn: `ban_nong` / `thuong_buon_venture` (seed=5117, tuổi=73, tiền=15213861đ, quan hàm=0, lý do="Tuổi cao sức yếu, an nhiên qua đời")
- [Tuổi 14] evt_adult_exp_world_famine_rice (Nạn Đói Hoành Hành, Giá Gạo Tăng Vọt) -> #0
- [Tuổi 14] evt_youth_family_father_injury_common (Phụ Thân Gặp Nạn Khi Mưu Sinh) -> #1
- [Tuổi 15] evt_youth_family_sibling_crisis_common (Anh Chị Em Gặp Khó Nơi Xứ Người) -> #0
- [Tuổi 16] evt_adult_martial_bandit_ambush (Thảo Khấu Chặn Đường) -> #0
- [Tuổi 16] evt_chain_ra_o_rieng_1 (Thưa Chuyện Ra Ở Riêng) -> #0
- [Tuổi 16] evt_chain_ra_o_rieng_2 (Ngày Dựng Mái Nhà Riêng) -> #0
- [Tuổi 17] evt_chain_ra_o_rieng_3 (Anh Chị Em Ghé Thăm Nhà Mới) -> #0
- [Tuổi 17] evt_chain_len_kinh_1 (Khăn Gói Lên Kinh Thành) -> #0
- [Tuổi 17] evt_fate_brothel_or_bodyguard (Ánh Đèn Thanh Lâu & Bến Bãi Giang Hồ) -> #1
- [Tuổi 18] evt_chain_len_kinh_2 (Những Ngày Đầu Nơi Kinh Kỳ) -> #1
- [Tuổi 18] dec_college_18 (Ngã rẽ tuổi 18: Nhập học Quốc Tử Giám hay Ra đời lập nghiệp?) -> #1
- [Tuổi 18] evt_chain_len_kinh_3 (Ánh Mắt Của Quý Nhân Nơi Phồn Hoa) -> #1
- [Tuổi 19] evt_world_bumper_harvest_edict (Chiếu Khuyến Nông & Hội Chợ Thái Bình) -> #2
- [Tuổi 20] evt_scholar_local_exam_temptation (Cám Dỗ Mua Đề Trước Trường Thi) -> #0
- ... *(còn 87 sự kiện nữa)*

### Mẫu Công danh: `quan_lai` / `cong_danh_exam` (seed=6586, tuổi=75, tiền=16301151đ, quan hàm=5, lý do="Sức khỏe suy kiệt qua đời")
- [Tuổi 15] evt_youth_family_sibling_court_rivalry (Sóng Gió Huynh Đệ Nơi Phủ Đệ) -> #0
- [Tuổi 16] evt_adult_martial_bandit_ambush (Thảo Khấu Chặn Đường) -> #1
- [Tuổi 17] evt_fate_tuyen_tu_palace (Chiếu Chỉ Tuyển Tú Nữ Vào Hậu Cung) -> #1
- [Tuổi 18] evt_adult_court_faction_purge (Sóng Gió Phe Cánh Triều Đình) -> #0
- [Tuổi 18] evt_adult_quan_lai_tap_am (Đặc Ân Tập Ấm Nơi Nha Môn) -> #0
- [Tuổi 18] dec_loan_heavy (Nợ nần chồng chất!) -> #0
- [Tuổi 18] dec_college_18 (Ngã rẽ tuổi 18: Nhập học Quốc Tử Giám hay Ra đời lập nghiệp?) -> #0
- [Tuổi 20] dec_loan_heavy (Nợ nần chồng chất!) -> #1
- [Tuổi 20] evt_adult_family_sibling_wedding (Hỷ Sự Của Anh Chị Em Trong Nhà) -> #1
- [Tuổi 21] evt_adult_quan_lai_marriage_alliance (Nghị Hôn Môn Đăng Hộ Đối) -> #0
- [Tuổi 22] evt_scholar_rich_patron_poor (Gặp Sĩ Tử Nghèo Hết Tiền Lộ Phí) -> #0
- [Tuổi 22] evt_adult_family_spouse_hardship (Vợ Chồng Đồng Cam Cộng Khổ) -> #0
- [Tuổi 22] dec_job_offers (Tìm kiếm sinh kế: 3 lời mời việc làm phù hợp) -> #0
- [Tuổi 23] evt_adult_quan_lai_father_legacy (Thư Tiến Cử & Tâm Huyết Của Phụ Thân) -> #0
- ... *(còn 99 sự kiện nữa)*
