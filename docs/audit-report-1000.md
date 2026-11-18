# Báo Cáo Kiểm Định 1.000 Cuộc Đời (Monte Carlo + Narrative Audit)

- **Tổng số kiếp:** 200 (5 Xuất thân × 10 Archetype × 20 Seeds)
- **Tuổi thọ trung bình:** 68.6 tuổi | **Tử vong sớm (<20 tuổi):** 14/200 (7.0%)
- **Lỗi logic/NaN phát hiện:** 0

## 1. Thống Kê Theo Xuất Thân (`OriginClass`)
| Xuất thân | Tuổi TB | Tài sản TB (đ) | Học thức TB | Thanh danh TB | Quan hàm >0 | Triggers/kiếp |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| ban_nong | 66.2 | 6600131 | 69.1 | 1513.7 | 2.5% | 79.6 |
| thu_cong | 60.1 | 6199499 | 45.9 | 1480.9 | 5.0% | 78.2 |
| dia_chu | 73.8 | 8547315 | 61.1 | 1916.5 | 2.5% | 103.6 |
| quan_lai | 71.7 | 9229447 | 71.0 | 2146.2 | 30.0% | 100.6 |
| hoang_toc | 71.3 | 8361914 | 80.3 | 2414.5 | 35.0% | 119.9 |

## 2. Thống Kê Theo Trọng Tâm & Chiến Lược (`Archetype`)
| Archetype (Focus) | Tuổi TB | Tài sản TB (đ) | Học thức TB | Kết hôn | Khởi nghiệp | Điền sản TB |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| cong_danh_exam (cong_danh) | 60.5 | 8161546 | 64.5 | 50% | 0% | 9.3 |
| gia_dinh_marriage (gia_dinh) | 75.0 | 11981660 | 80.8 | 90% | 0% | 12.0 |
| thuong_buon_venture (lam_them) | 76.9 | 18155304 | 70.2 | 95% | 90% | 12.0 |
| dien_san_gold (can_bang) | 70.5 | 12282036 | 59.3 | 95% | 0% | 12.0 |
| suc_khoe_longevity (suc_khoe) | 75.5 | 2159538 | 74.0 | 0% | 0% | 0.3 |
| tu_than_moral (tu_than) | 62.9 | 2586859 | 68.2 | 0% | 0% | 0.3 |
| so_thich_hobby (so_thich) | 70.2 | 2671003 | 70.8 | 95% | 0% | 0.3 |
| nghi_ngoi_chill (nghi_ngoi) | 51.8 | 2083743 | 49.2 | 0% | 0% | 0.3 |
| hanh_thien_fame (hanh_thien) | 74.4 | 11800797 | 75.4 | 90% | 0% | 12.0 |
| risk_debt_hardship (lam_them) | 68.5 | 5994127 | 42.5 | 0% | 100% | 0.0 |

## 3. Tần Suất Quyết Định & Nguyên Nhân Tử Vong
- **Decision Hits:** `{"dec_retire_60":174,"dec_college_18":174,"dec_loan_heavy":23,"dec_job_offers":111,"dec_official_promote":718,"dec_biz_offers":38,"dec_official_appoint":277,"dec_rankup":1}`
- **Top Nguyên nhân kết thúc:** Tuổi cao sức yếu, an nhiên qua đời (90) · Sức khỏe suy kiệt qua đời (75) · Sống qua 80 tuổi (35)

## 4. Độ Phủ Sự Kiện
- **Top 12 sự kiện nổ nhiều nhất:** `evt_adult_martial_bandit_ambush` (684), `evt_biz_caravan_venture` (629), `evt_adult_major_noble_patron` (621), `evt_adult_infamy_bounty` (588), `evt_biz_property_tenant_crisis` (581), `evt_biz_supply_contract` (502), `evt_world_bumper_harvest_edict` (471), `evt_biz_craft_guild_order` (435), `evt_life_midlife_illness` (429), `evt_biz_apothecary_rare_herb` (393), `evt_life_marriage_harmony` (360), `evt_adult_court_faction_purge` (310)
- **Dead Major Events (0% sau 1.000 kiếp — 7/140):** `evt_servitude_opportunity`, `evt_adult_reunion_best_friend`, `evt_adult_major_desperate_theft`, `evt_adult_burnout_melancholy`, `evt_adult_exp_hoang_toc_vindication`, `evt_adult_hoang_toc_teen_cold_palace_ally`, `evt_scholar_road_to_capital`

## 5. Các Ca Mẫu & Bất Thường (Outliers để Agent Soi Mạch Truyện)
### Chết sớm nhất #1: `thu_cong` / `cong_danh_exam` (seed=5533, tuổi=13, tiền=1đ, quan hàm=0, lý do="Sức khỏe suy kiệt qua đời")

### Chết sớm nhất #2: `thu_cong` / `cong_danh_exam` (seed=5546, tuổi=13, tiền=1đ, quan hàm=0, lý do="Sức khỏe suy kiệt qua đời")

### Giàu nhất #1: `hoang_toc` / `thuong_buon_venture` (seed=7197, tuổi=80, tiền=24199307đ, quan hàm=0, lý do="Sống qua 80 tuổi")
- [Tuổi 13] evt_adult_hoang_toc_teen_empress_dowager (Thỉnh An Thái Hậu Nơi Cung Từ Ninh) -> #2
- [Tuổi 15] evt_adult_hoang_toc_teen_palace_library (Đọc Mật Sử Nơi Tàng Kinh Các) -> #0
- [Tuổi 16] evt_scholar_rich_temptation (Bạn Giàu Rủ Rê Tửu Sắc & Trường Bạc) -> #2
- [Tuổi 16] evt_adult_martial_bandit_ambush (Thảo Khấu Chặn Đường) -> #1
- [Tuổi 17] evt_adult_exp_hoang_toc_title_estate (Lễ Trưởng Thành & Khai Phủ Tôn Thất) -> #2
- [Tuổi 17] evt_adult_exp_hoang_toc_slander (Bị Kẻ Tiểu Nhân Gièm Pha Trước Ngai Vàng) -> #1
- [Tuổi 18] evt_adult_court_faction_purge (Sóng Gió Phe Cánh Triều Đình) -> #1
- [Tuổi 18] dec_college_18 (Ngã rẽ tuổi 18: Nhập học Quốc Tử Giám hay Ra đời lập nghiệp?) -> #1
- [Tuổi 19] evt_adult_exp_hoang_toc_royal_marriage (Thánh Chỉ Ban Hôn Hoàng Gia) -> #2
- [Tuổi 20] evt_adult_exp_world_famine_rice (Nạn Đói Hoành Hành, Giá Gạo Tăng Vọt) -> #1
- [Tuổi 21] evt_adult_hoang_toc_patron_arts (Mở Hội Bình Thơ & Bảo Trợ Tao Nhân) -> #0
- [Tuổi 22] evt_chain_bao_hieu_hoang_toc_1 (Mẫu Thân Lâm Trọng Bệnh Nơi Cung Cấm) -> #1
- [Tuổi 22] dec_biz_offers (Cơ hội lập nghiệp: 3 mô hình kinh doanh khả thi) -> #0
- [Tuổi 22] evt_chain_bao_hieu_hoang_toc_2_nguy (Đèn Lồng Trắng Trước Cửa Cung) -> #1
- ... *(còn 116 sự kiện nữa)*

### Nợ nặng nhất #1: `hoang_toc` / `tu_than_moral` (seed=7366, tuổi=63, tiền=0đ, quan hàm=0, lý do="Sức khỏe suy kiệt qua đời")
- [Tuổi 13] evt_adult_hoang_toc_teen_empress_dowager (Thỉnh An Thái Hậu Nơi Cung Từ Ninh) -> #1
- [Tuổi 14] evt_biz_tea_cart_rumor (Khách Quán Nước Đồn Chuyện Lạ) -> #0
- [Tuổi 14] evt_adult_hoang_toc_teen_palace_library (Đọc Mật Sử Nơi Tàng Kinh Các) -> #0
- [Tuổi 16] evt_adult_hoang_toc_patron_arts (Mở Hội Bình Thơ & Bảo Trợ Tao Nhân) -> #0
- [Tuổi 16] evt_adult_exp_hoang_toc_slander (Bị Kẻ Tiểu Nhân Gièm Pha Trước Ngai Vàng) -> #1
- [Tuổi 17] dec_loan_heavy (Nợ nần chồng chất!) -> #1
- [Tuổi 17] evt_adult_exp_hoang_toc_title_estate (Lễ Trưởng Thành & Khai Phủ Tôn Thất) -> #2
- [Tuổi 18] evt_scholar_rich_patron_poor (Gặp Sĩ Tử Nghèo Hết Tiền Lộ Phí) -> #1
- [Tuổi 18] dec_college_18 (Ngã rẽ tuổi 18: Nhập học Quốc Tử Giám hay Ra đời lập nghiệp?) -> #0
- [Tuổi 18] evt_adult_martial_bandit_ambush (Thảo Khấu Chặn Đường) -> #0
- [Tuổi 19] evt_military_enlist (Đầu Quân Nhập Ngũ Lập Công Danh) -> #2
- [Tuổi 19] evt_adult_exp_hoang_toc_royal_marriage (Thánh Chỉ Ban Hôn Hoàng Gia) -> #2
- [Tuổi 20] evt_chain_bao_hieu_hoang_toc_1 (Mẫu Thân Lâm Trọng Bệnh Nơi Cung Cấm) -> #1
- [Tuổi 20] evt_chain_bao_hieu_hoang_toc_2_nguy (Đèn Lồng Trắng Trước Cửa Cung) -> #1
- ... *(còn 96 sự kiện nữa)*

### Thọ nhất #1: `hoang_toc` / `hanh_thien_fame` (seed=7548, tuổi=80, tiền=11552650đ, quan hàm=0, lý do="Sống qua 80 tuổi")
- [Tuổi 13] evt_adult_hoang_toc_teen_palace_library (Đọc Mật Sử Nơi Tàng Kinh Các) -> #1
- [Tuổi 14] evt_adult_hoang_toc_teen_empress_dowager (Thỉnh An Thái Hậu Nơi Cung Từ Ninh) -> #2
- [Tuổi 14] evt_adult_hoang_toc_teen_royal_hunt (Cuộc Săn Mùa Thu Tại Lâm Uyển Hoàng Gia) -> #1
- [Tuổi 16] evt_adult_exp_hoang_toc_royal_marriage (Thánh Chỉ Ban Hôn Hoàng Gia) -> #0
- [Tuổi 16] evt_adult_martial_bandit_ambush (Thảo Khấu Chặn Đường) -> #0
- [Tuổi 17] evt_adult_exp_hoang_toc_succession (Vòng Xoáy Tranh Đoạt Trữ Vị) -> #1
- [Tuổi 17] evt_adult_hoang_toc_patron_arts (Mở Hội Bình Thơ & Bảo Trợ Tao Nhân) -> #1
- [Tuổi 18] dec_college_18 (Ngã rẽ tuổi 18: Nhập học Quốc Tử Giám hay Ra đời lập nghiệp?) -> #0
- [Tuổi 18] evt_adult_exp_hoang_toc_title_estate (Lễ Trưởng Thành & Khai Phủ Tôn Thất) -> #2
- [Tuổi 18] evt_military_enlist (Đầu Quân Nhập Ngũ Lập Công Danh) -> #1
- [Tuổi 19] evt_adult_exp_hoang_toc_slander (Bị Kẻ Tiểu Nhân Gièm Pha Trước Ngai Vàng) -> #1
- [Tuổi 19] evt_martial_border_campaign (Xuất Chinh Bình Định Giặc Biên Ải) -> #1
- [Tuổi 20] evt_world_rich_bandit_target (Giặc Cướp Dòm Ngó Phủ Giàu Giữa Thời Loạn) -> #3
- [Tuổi 20] evt_world_imperial_tax_levy (Triều Đình Ban Lệnh Tăng Thuế Thời Loạn) -> #2
- ... *(còn 129 sự kiện nữa)*

### Mẫu Gia đình: `ban_nong` / `gia_dinh_marriage` (seed=5065, tuổi=80, tiền=12122304đ, quan hàm=0, lý do="Sống qua 80 tuổi")
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
- [Tuổi 22] evt_chain_bao_hieu_me_1 (Mẫu Thân Đổ Bệnh Giữa Đêm Gió Lạnh) -> #0
- [Tuổi 22] evt_chain_bao_hieu_me_2_tot (Mẫu Thân Bình Phục An Khang) -> #0
- ... *(còn 98 sự kiện nữa)*

### Mẫu Thương buôn: `ban_nong` / `thuong_buon_venture` (seed=5117, tuổi=71, tiền=13937648đ, quan hàm=0, lý do="Tuổi cao sức yếu, an nhiên qua đời")
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

### Mẫu Công danh: `quan_lai` / `cong_danh_exam` (seed=6612, tuổi=73, tiền=11630438đ, quan hàm=5, lý do="Tuổi cao sức yếu, an nhiên qua đời")
- [Tuổi 15] evt_adult_martial_bandit_ambush (Thảo Khấu Chặn Đường) -> #1
- [Tuổi 16] evt_adult_exp_world_war_looting (Quân Lính Cướp Bóc Làng Xã) -> #1
- [Tuổi 16] evt_adult_exp_world_war_noble_duty (Chiếu Chỉ Quyên Lương & Hộ Quốc Thời Chiến) -> #2
- [Tuổi 17] evt_military_enlist (Đầu Quân Nhập Ngũ Lập Công Danh) -> #0
- [Tuổi 17] evt_youth_family_sibling_court_rivalry (Sóng Gió Huynh Đệ Nơi Phủ Đệ) -> #1
- [Tuổi 18] dec_college_18 (Ngã rẽ tuổi 18: Nhập học Quốc Tử Giám hay Ra đời lập nghiệp?) -> #0
- [Tuổi 19] evt_scholar_local_exam_temptation (Cám Dỗ Mua Đề Trước Trường Thi) -> #0
- [Tuổi 19] evt_adult_quan_lai_tap_am (Đặc Ân Tập Ấm Nơi Nha Môn) -> #0
- [Tuổi 20] evt_military_promotion_1 (Lập Công Trận Tiền, Thăng Chức Hiệu Úy) -> #0
- [Tuổi 20] evt_biz_property_tenant_crisis (Khách Thuê & Tá Điền Khất Nợ Giữa Mùa Khó) -> #1
- [Tuổi 20] dec_official_appoint (Triều đình bổ nhiệm: Nhậm chức Tri huyện) -> #0
- [Tuổi 21] evt_official_faction_choice (Ngã Rẽ Phe Phái Nơi Triều Đường) -> #3
- [Tuổi 21] dec_official_promote (Thăng tiến quan trường: Đề bạt chức Tuần phủ) -> #0
- [Tuổi 22] evt_adult_major_noble_patron (Gặp Quý Nhân Giữa Chợ Phiên) -> #0
- ... *(còn 100 sự kiện nữa)*
