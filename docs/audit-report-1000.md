# Báo Cáo Kiểm Định 1.000 Cuộc Đời (Monte Carlo + Narrative Audit)

- **Tổng số kiếp:** 200 (5 Xuất thân × 10 Archetype | Thời gian chạy song song: 109.8s)
- **Tuổi thọ trung bình:** 64.0 tuổi | **Tử vong sớm (<20 tuổi):** 15/200 (7.5%)
- **Lỗi logic/NaN phát hiện:** 0

## 1. Thống Kê Theo Xuất Thân (`OriginClass`)
| Xuất thân | Tuổi TB | Tài sản TB (đ) | Học thức TB | Thanh danh TB | Quan hàm >0 | Triggers/kiếp |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| ban_nong | 66.3 | 812736 | 55.8 | 1367.1 | 10.0% | 57.7 |
| dia_chu | 67.3 | 1862787 | 83.5 | 2212.5 | 15.0% | 62.5 |
| hoang_toc | 70.0 | 1013809 | 75.7 | 1684.9 | 17.5% | 70.2 |
| quan_lai | 55.6 | 1142470 | 87.5 | 1523.9 | 5.0% | 47.0 |
| thu_cong | 60.5 | 999365 | 51.6 | 1212.3 | 0.0% | 51.3 |

## 2. Thống Kê Theo Trọng Tâm & Chiến Lược (`Archetype`)
| Archetype (Focus) | Tuổi TB | Tài sản TB (đ) | Học thức TB | Kết hôn | Khởi nghiệp | Điền sản TB |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| cong_danh_exam (cong_danh) | 58.0 | 634281 | 71.7 | 80% | 0% | 4.0 |
| gia_dinh_marriage (gia_dinh) | 50.0 | 884044 | 68.8 | 60% | 0% | 6.0 |
| thuong_buon_venture (lam_them) | 71.0 | 2840628 | 71.9 | 95% | 100% | 8.3 |
| dien_san_gold (can_bang) | 71.3 | 2662110 | 65.6 | 100% | 0% | 9.6 |
| suc_khoe_longevity (suc_khoe) | 46.7 | 171 | 50.2 | 0% | 0% | 0.1 |
| tu_than_moral (tu_than) | 65.1 | 644772 | 77.3 | 0% | 0% | 0.0 |
| so_thich_hobby (so_thich) | 72.8 | 476266 | 83.4 | 100% | 0% | 0.1 |
| nghi_ngoi_chill (nghi_ngoi) | 71.0 | 464162 | 81.1 | 0% | 0% | 0.1 |
| hanh_thien_fame (hanh_thien) | 66.2 | 1663202 | 75.4 | 85% | 0% | 7.9 |
| risk_debt_hardship (lam_them) | 67.5 | 1392696 | 62.8 | 0% | 100% | 0.0 |

## 2b. Thống Kê Theo Giới Tính (`Gender`)
| Giới tính | Số kiếp | Tuổi TB | Tài sản TB (đ) | Quan hàm >0 | Kết hôn |
| :--- | ---: | ---: | ---: | ---: | ---: |
| male | 124 | 63.9 | 1124346 | 12.9% | 51% |
| female | 76 | 64.1 | 1234576 | 3.9% | 54% |

## 3. Tần Suất Quyết Định & Nguyên Nhân Tử Vong
- **Decision Hits:** `{"dec_job_offers":282,"dec_rankup":216,"dec_college_18":181,"dec_retire_60":165,"dec_exam_prompt":1257,"dec_official_family_move":32,"dec_biz_offers":40,"dec_official_promote":217,"dec_official_appoint":35}`
- **Top Nguyên nhân kết thúc:** Tuổi cao sức yếu, an nhiên qua đời (75) · Sức khỏe suy kiệt qua đời (73) · Chết đói vì hết lương thực và tiền bạc (32) · Sống qua 80 tuổi (14) · Bị xử trảm vì tội Khi quân (Nữ cải nam trang bại lộ) (6)

## 4. Độ Phủ Sự Kiện
- **Top 12 sự kiện nổ nhiều nhất:** `evt_jianghu_river_convoy_storm` (420), `evt_physician_noble_poison` (331), `evt_physician_plague_outbreak` (307), `evt_estate_tenant_revolt_mediation` (290), `evt_hermit_mountain_retreat` (267), `evt_biz_caravan_venture` (188), `evt_wealth_imperial_relief_fund` (179), `evt_wealth_sponsor_academy` (169), `evt_family_clan_dispute` (145), `evt_tier_binh_dan_seasonal_fair` (141), `evt_physician_imperial_summons` (139), `evt_chain_bao_hieu_me_1` (137)
- **Dead Major Events (0% sau 200 kiếp — 24/202):** `evt_female_royal_title_grant`, `evt_rebellion_people_support`, `evt_rebellion_amnesty_offer`, `evt_official_court_faction_choice`, `evt_official_emperor_audience`, `evt_official_proxy_biz_leak`, `evt_official_court_purge`, `evt_official_retire_with_honor`, `evt_official_faction_patron_fall`, `evt_official_peasant_protest`, `evt_official_vo_border_defense`, `evt_official_vo_troop_mutiny`, `evt_adult_hoang_toc_border_pacification`, `evt_adult_hoang_toc_teen_palace_library`, `evt_adult_hoang_toc_teen_royal_hunt`, `evt_adult_quan_lai_tap_am`, `evt_rebellion_decisive_battle`, `evt_scholar_vinh_quy_bai_to`, `evt_scholar_poor_copy_books`, `evt_harem_elder_eunuch_alliance`, `evt_servitude_secret_ledger`, `evt_fate_eunuch_or_palace_maid`, `evt_fate_eunuch_promotion`, `evt_fate_bodyguard_crossroads`

## 5. Các Ca Mẫu & Bất Thường (Outliers để Agent Soi Mạch Truyện)
### Chết sớm nhất #1: `quan_lai` / `cong_danh_exam` (seed=6586, tuổi=13, tiền=1đ, quan hàm=0, lý do="Chết đói vì hết lương thực và tiền bạc")

### Chết sớm nhất #2: `quan_lai` / `cong_danh_exam` (seed=6599, tuổi=13, tiền=1đ, quan hàm=0, lý do="Chết đói vì hết lương thực và tiền bạc")

### Giàu nhất #1: `dia_chu` / `thuong_buon_venture` (seed=6196, tuổi=76, tiền=6985591đ, quan hàm=0, lý do="Sức khỏe suy kiệt qua đời")
- [Tuổi 13] dec_job_offers (Tìm kiếm sinh kế: 3 lời mời việc làm phù hợp) -> #0
- [Tuổi 15] evt_scholar_rich_poetry_club (Hội Văn Thơ Tao Nhân Chốn Kinh Kỳ) -> #0
- [Tuổi 15] dec_exam_prompt (Khoa cử: Kỳ Thi Hương Mùa Thu) -> #1
- [Tuổi 16] evt_world_bumper_harvest_edict (Chiếu Khuyến Nông & Hội Chợ Thái Bình) -> #1
- [Tuổi 16] dec_rankup (Cơ hội thăng tiến: Thợ cả · Đốc công phường hội) -> #0
- [Tuổi 17] evt_chain_ra_o_rieng_1 (Thưa Chuyện Ra Ở Riêng) -> #1
- [Tuổi 18] dec_college_18 (Ngã rẽ tuổi 18: Nhập học Quốc Tử Giám hay Ra đời lập nghiệp?) -> #1
- [Tuổi 18] evt_adult_exp_dia_chu_tenant_rent (Tá Điền Kéo Đến Xin Khất Tô) -> #0
- [Tuổi 18] dec_exam_prompt (Khoa cử: Kỳ Thi Hương Mùa Thu) -> #1
- [Tuổi 19] evt_adult_exp_dia_chu_buy_land (Cơ Hội Mua Ruộng Tốt Giá Hời) -> #2
- [Tuổi 20] evt_adult_exp_dia_chu_bandit_raid (Thảo Khấu Đe Dọa Cướp Điền Trang) -> #1
- [Tuổi 21] evt_biz_craft_guild_order (Đơn Hàng Lớn Từ Thương Đoàn Kinh Kỳ) -> #0
- [Tuổi 21] dec_exam_prompt (Khoa cử: Kỳ Thi Hương Mùa Thu) -> #1
- [Tuổi 22] dec_biz_offers (Cơ hội lập nghiệp: 3 mô hình kinh doanh khả thi) -> #0
- ... *(còn 69 sự kiện nữa)*

### Nợ nặng nhất #1: `thu_cong` / `suc_khoe_longevity` (seed=5780, tuổi=20, tiền=0đ, quan hàm=0, lý do="Chết đói vì hết lương thực và tiền bạc")
- [Tuổi 13] dec_job_offers (Tìm kiếm sinh kế: 3 lời mời việc làm phù hợp) -> #0
- [Tuổi 14] evt_scholar_poor_mentor (Thầy Đồ Già Nhận Làm Môn Sinh) -> #0
- [Tuổi 16] evt_adult_burnout_melancholy (Lòng Ngổn Ngang Trăm Mối) -> #1
- [Tuổi 16] dec_rankup (Cơ hội thăng tiến: Thợ cả · Đốc công phường hội) -> #0
- [Tuổi 17] evt_adult_exp_thu_cong_merchant_order (Thương Nhân Phương Xa Đặt Lô Hàng Lớn) -> #2
- [Tuổi 18] dec_college_18 (Ngã rẽ tuổi 18: Nhập học Quốc Tử Giám hay Ra đời lập nghiệp?) -> #2
- [Tuổi 18] evt_adult_exp_thu_cong_guild (Lập Phường Hội Thợ Nghề) -> #1
- [Tuổi 19] evt_scholar_poor_matchmaker (Phú Hộ Kén Dâu Rể Hiếu Học) -> #0
- [Tuổi 20] evt_chain_len_kinh_1 (Khăn Gói Lên Kinh Thành) -> #3

### Thọ nhất #1: `thu_cong` / `hanh_thien_fame` (seed=5962, tuổi=80, tiền=1914531đ, quan hàm=0, lý do="Sống qua 80 tuổi")
- [Tuổi 13] dec_job_offers (Tìm kiếm sinh kế: 3 lời mời việc làm phù hợp) -> #0
- [Tuổi 14] evt_youth_family_father_injury_common (Phụ Thân Gặp Nạn Khi Mưu Sinh) -> #0
- [Tuổi 15] evt_tier_binh_dan_seasonal_fair (Hội Vật & Phiên Chợ Đầu Xuân) -> #0
- [Tuổi 16] dec_rankup (Cơ hội thăng tiến: Thợ cả · Đốc công phường hội) -> #0
- [Tuổi 16] evt_adult_exp_thu_cong_magistrate_repair (Lên Phủ Huyện Sửa Đồ Quý Cho Quan Lớn) -> #2
- [Tuổi 17] evt_military_enlist (Đầu Quân Nhập Ngũ Lập Công Danh) -> #2
- [Tuổi 18] dec_college_18 (Ngã rẽ tuổi 18: Nhập học Quốc Tử Giám hay Ra đời lập nghiệp?) -> #0
- [Tuổi 18] evt_romance_lantern_festival (Đêm Hội Hoa Đăng Gặp Người Tri Kỷ) -> #0
- [Tuổi 20] evt_adult_corrupt_official_bribe (Quan Phủ Vòi Tiền Bảo Kê) -> #1
- [Tuổi 21] evt_chain_ra_o_rieng_1 (Thưa Chuyện Ra Ở Riêng) -> #1
- [Tuổi 22] evt_biz_apothecary_rare_herb (Khách Quý Tìm Mua Vị Thuốc Hiếm) -> #1
- [Tuổi 22] dec_job_offers (Tìm kiếm sinh kế: 3 lời mời việc làm phù hợp) -> #0
- [Tuổi 23] evt_scholar_poor_exam_fail (Lỡ Hẹn Bảng Vàng Khoa Đầu) -> #2
- [Tuổi 24] evt_estate_tenant_revolt_mediation (Tá Điền Kéo Đến Trang Trại Xin Giảm Tô Mùa Hạn) -> #1
- ... *(còn 69 sự kiện nữa)*

### Mẫu Gia đình: `ban_nong` / `gia_dinh_marriage` (seed=5065, tuổi=45, tiền=3đ, quan hàm=0, lý do="Chết đói vì hết lương thực và tiền bạc")
- [Tuổi 13] dec_job_offers (Tìm kiếm sinh kế: 3 lời mời việc làm phù hợp) -> #0
- [Tuổi 14] evt_tier_binh_dan_seasonal_fair (Hội Vật & Phiên Chợ Đầu Xuân) -> #0
- [Tuổi 15] evt_youth_family_father_injury_common (Phụ Thân Gặp Nạn Khi Mưu Sinh) -> #0
- [Tuổi 15] dec_exam_prompt (Khoa cử: Kỳ Thi Hương Mùa Thu) -> #1
- [Tuổi 16] dec_rankup (Cơ hội thăng tiến: Hộ vệ thương đoàn · Bảo tiêu) -> #0
- [Tuổi 16] evt_fate_brothel_or_bodyguard (Ánh Đèn Thanh Lâu & Bến Bãi Giang Hồ) -> #2
- [Tuổi 17] evt_adult_burnout_melancholy (Lòng Ngổn Ngang Trăm Mối) -> #0
- [Tuổi 18] evt_chain_len_kinh_1 (Khăn Gói Lên Kinh Thành) -> #0
- [Tuổi 18] dec_college_18 (Ngã rẽ tuổi 18: Nhập học Quốc Tử Giám hay Ra đời lập nghiệp?) -> #1
- [Tuổi 18] evt_chain_len_kinh_2 (Những Ngày Đầu Nơi Kinh Kỳ) -> #1
- [Tuổi 18] dec_exam_prompt (Khoa cử: Kỳ Thi Hương Mùa Thu) -> #1
- [Tuổi 18] evt_chain_len_kinh_3 (Ánh Mắt Của Quý Nhân Nơi Phồn Hoa) -> #1
- [Tuổi 19] evt_military_enlist (Đầu Quân Nhập Ngũ Lập Công Danh) -> #0
- [Tuổi 20] evt_world_bumper_harvest_edict (Chiếu Khuyến Nông & Hội Chợ Thái Bình) -> #2
- ... *(còn 33 sự kiện nữa)*

### Mẫu Thương buôn: `ban_nong` / `thuong_buon_venture` (seed=5117, tuổi=70, tiền=4691đ, quan hàm=0, lý do="Tuổi cao sức yếu, an nhiên qua đời")
- [Tuổi 13] dec_job_offers (Tìm kiếm sinh kế: 3 lời mời việc làm phù hợp) -> #0
- [Tuổi 14] evt_youth_family_father_injury_common (Phụ Thân Gặp Nạn Khi Mưu Sinh) -> #1
- [Tuổi 14] dec_rankup (Cơ hội thăng tiến: Chạy mối buôn · Giao nhận hàng) -> #0
- [Tuổi 15] evt_tier_binh_dan_seasonal_fair (Hội Vật & Phiên Chợ Đầu Xuân) -> #0
- [Tuổi 16] evt_chain_ra_o_rieng_1 (Thưa Chuyện Ra Ở Riêng) -> #1
- [Tuổi 17] evt_chain_len_kinh_1 (Khăn Gói Lên Kinh Thành) -> #1
- [Tuổi 17] evt_chain_len_kinh_2 (Những Ngày Đầu Nơi Kinh Kỳ) -> #0
- [Tuổi 17] evt_chain_len_kinh_3 (Ánh Mắt Của Quý Nhân Nơi Phồn Hoa) -> #0
- [Tuổi 18] dec_college_18 (Ngã rẽ tuổi 18: Học Y dược · Thương toán hay Ra đời tự lập?) -> #1
- [Tuổi 18] evt_world_bumper_harvest_edict (Chiếu Khuyến Nông & Hội Chợ Thái Bình) -> #2
- [Tuổi 19] evt_romance_lantern_festival (Đêm Hội Hoa Đăng Gặp Người Tri Kỷ) -> #0
- [Tuổi 20] evt_scholar_poor_village_fund (Quỹ Nghĩa Học Của Làng Xã) -> #0
- [Tuổi 21] evt_estate_tenant_revolt_mediation (Tá Điền Kéo Đến Trang Trại Xin Giảm Tô Mùa Hạn) -> #1
- [Tuổi 22] dec_biz_offers (Cơ hội lập nghiệp: 3 mô hình kinh doanh khả thi) -> #0
- ... *(còn 39 sự kiện nữa)*

### Mẫu Công danh: `ban_nong` / `cong_danh_exam` (seed=5026, tuổi=77, tiền=802219đ, quan hàm=2, lý do="Sức khỏe suy kiệt qua đời")
- [Tuổi 13] dec_job_offers (Tìm kiếm sinh kế: 3 lời mời việc làm phù hợp) -> #0
- [Tuổi 14] evt_youth_family_father_injury_common (Phụ Thân Gặp Nạn Khi Mưu Sinh) -> #1
- [Tuổi 16] dec_rankup (Cơ hội thăng tiến: Thợ cả · Đốc công phường hội) -> #0
- [Tuổi 16] evt_chain_ra_o_rieng_1 (Thưa Chuyện Ra Ở Riêng) -> #1
- [Tuổi 17] evt_adult_major_corvee (Trát Bắt Đi Phu Đắp Đê) -> #0
- [Tuổi 18] dec_college_18 (Ngã rẽ tuổi 18: Nhập học Quốc Tử Giám hay Ra đời lập nghiệp?) -> #0
- [Tuổi 18] evt_adult_reunion_best_friend (Tái Ngộ Bạn Nối Khố Năm Xưa) -> #0
- [Tuổi 18] dec_exam_prompt (Khoa cử: Kỳ Thi Hương Mùa Thu) -> #0
- [Tuổi 19] evt_biz_apothecary_rare_herb (Khách Quý Tìm Mua Vị Thuốc Hiếm) -> #1
- [Tuổi 21] evt_chain_len_kinh_1 (Khăn Gói Lên Kinh Thành) -> #2
- [Tuổi 21] evt_chain_len_kinh_2 (Những Ngày Đầu Nơi Kinh Kỳ) -> #1
- [Tuổi 21] dec_exam_prompt (Khoa cử: Kỳ Thi Hương Mùa Thu) -> #0
- [Tuổi 21] evt_chain_len_kinh_3 (Ánh Mắt Của Quý Nhân Nơi Phồn Hoa) -> #1
- [Tuổi 22] evt_official_flood_dyke_relief (Thiên Tai Vỡ Đê & Tiền Cứu Tế Triều Đình) -> #2
- ... *(còn 53 sự kiện nữa)*
