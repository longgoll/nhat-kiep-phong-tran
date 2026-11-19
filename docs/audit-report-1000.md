# Báo Cáo Kiểm Định 1.000 Cuộc Đời (Monte Carlo + Narrative Audit)

- **Tổng số kiếp:** 200 (5 Xuất thân × 10 Archetype | Thời gian chạy song song: 138.1s)
- **Tuổi thọ trung bình:** 65.6 tuổi | **Tử vong sớm (<20 tuổi):** 12/200 (6.0%)
- **Lỗi logic/NaN phát hiện:** 0

## 1. Thống Kê Theo Xuất Thân (`OriginClass`)
| Xuất thân | Tuổi TB | Tài sản TB (đ) | Học thức TB | Thanh danh TB | Quan hàm >0 | Triggers/kiếp |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| ban_nong | 67.2 | 801280 | 58.5 | 1404.2 | 10.0% | 58.8 |
| dia_chu | 69.4 | 2181684 | 88.1 | 2352.9 | 17.5% | 64.7 |
| hoang_toc | 71.4 | 1191328 | 80.4 | 1704.4 | 20.0% | 75.6 |
| quan_lai | 61.0 | 1313714 | 91.8 | 1795.5 | 15.0% | 53.2 |
| thu_cong | 58.9 | 959392 | 54.2 | 1159.3 | 0.0% | 50.6 |

## 2. Thống Kê Theo Trọng Tâm & Chiến Lược (`Archetype`)
| Archetype (Focus) | Tuổi TB | Tài sản TB (đ) | Học thức TB | Kết hôn | Khởi nghiệp | Điền sản TB |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| cong_danh_exam (cong_danh) | 71.2 | 1016116 | 88.7 | 95% | 0% | 4.0 |
| gia_dinh_marriage (gia_dinh) | 50.6 | 842856 | 70.3 | 65% | 0% | 5.5 |
| thuong_buon_venture (lam_them) | 74.4 | 3471947 | 76.8 | 95% | 95% | 8.8 |
| dien_san_gold (can_bang) | 73.5 | 2750897 | 70.6 | 100% | 0% | 9.6 |
| suc_khoe_longevity (suc_khoe) | 48.0 | 162 | 56.0 | 0% | 0% | 0.1 |
| tu_than_moral (tu_than) | 62.0 | 732439 | 80.2 | 0% | 0% | 0.0 |
| so_thich_hobby (so_thich) | 69.9 | 328952 | 82.8 | 95% | 0% | 0.0 |
| nghi_ngoi_chill (nghi_ngoi) | 71.5 | 483767 | 81.1 | 0% | 0% | 0.1 |
| hanh_thien_fame (hanh_thien) | 64.7 | 1582119 | 74.0 | 85% | 0% | 7.8 |
| risk_debt_hardship (lam_them) | 69.9 | 1685541 | 65.6 | 0% | 100% | 0.0 |

## 2b. Thống Kê Theo Giới Tính (`Gender`)
| Giới tính | Số kiếp | Tuổi TB | Tài sản TB (đ) | Quan hàm >0 | Kết hôn |
| :--- | ---: | ---: | ---: | ---: | ---: |
| male | 124 | 66.0 | 1253266 | 17.7% | 53% |
| female | 76 | 64.8 | 1348565 | 3.9% | 54% |

## 3. Tần Suất Quyết Định & Nguyên Nhân Tử Vong
- **Decision Hits:** `{"dec_job_offers":274,"dec_rankup":214,"dec_college_18":179,"dec_retire_60":168,"dec_exam_prompt":1533,"dec_official_family_move":38,"dec_official_promote":229,"dec_biz_offers":39,"dec_official_appoint":34}`
- **Top Nguyên nhân kết thúc:** Sức khỏe suy kiệt qua đời (86) · Tuổi cao sức yếu, an nhiên qua đời (70) · Chết đói vì hết lương thực và tiền bạc (26) · Sống qua 80 tuổi (11) · Bị xử trảm vì tội Khi quân (Nữ cải nam trang bại lộ) (7)

## 4. Độ Phủ Sự Kiện
- **Top 12 sự kiện nổ nhiều nhất:** `evt_jianghu_river_convoy_storm` (467), `evt_physician_noble_poison` (332), `evt_hermit_mountain_retreat` (296), `evt_physician_plague_outbreak` (289), `evt_estate_tenant_revolt_mediation` (281), `evt_wealth_imperial_relief_fund` (194), `evt_biz_caravan_venture` (183), `evt_wealth_sponsor_academy` (174), `evt_chain_bao_hieu_me_1` (135), `evt_tier_binh_dan_seasonal_fair` (134), `evt_adult_martial_bandit_ambush` (131), `evt_biz_property_tenant_crisis` (131)
- **Dead Major Events (0% sau 200 kiếp — 19/202):** `evt_female_royal_title_grant`, `evt_rebellion_people_support`, `evt_rebellion_amnesty_offer`, `evt_official_proxy_biz_leak`, `evt_official_court_purge`, `evt_official_faction_scholar_support`, `evt_official_peasant_protest`, `evt_official_vo_border_defense`, `evt_official_vo_troop_mutiny`, `evt_adult_hoang_toc_border_pacification`, `evt_adult_hoang_toc_teen_palace_library`, `evt_adult_hoang_toc_teen_royal_hunt`, `evt_rebellion_recruit_bandits`, `evt_scholar_poor_copy_books`, `evt_harem_elder_eunuch_alliance`, `evt_servitude_secret_ledger`, `evt_fate_eunuch_or_palace_maid`, `evt_fate_eunuch_promotion`, `evt_adult_exp_world_war_conscription`

## 5. Các Ca Mẫu & Bất Thường (Outliers để Agent Soi Mạch Truyện)
### Chết sớm nhất #1: `hoang_toc` / `suc_khoe_longevity` (seed=7314, tuổi=18, tiền=0đ, quan hàm=0, lý do="Chết đói vì hết lương thực và tiền bạc")
- [Tuổi 13] dec_job_offers (Tìm kiếm sinh kế: 3 lời mời việc làm phù hợp) -> #0
- [Tuổi 14] evt_tier_binh_dan_seasonal_fair (Hội Vật & Phiên Chợ Đầu Xuân) -> #1
- [Tuổi 16] evt_chain_ra_o_rieng_1 (Thưa Chuyện Ra Ở Riêng) -> #0
- [Tuổi 16] evt_chain_ra_o_rieng_2 (Ngày Dựng Mái Nhà Riêng) -> #1
- [Tuổi 17] evt_biz_scribe_secret_letter (Lá Thư Nhờ Viết Hộ Đầy Bí Ẩn) -> #1
- [Tuổi 17] dec_rankup (Cơ hội thăng tiến: Thư lại giữ sổ sách) -> #0
- [Tuổi 18] evt_scholar_poor_exam_fail (Lỡ Hẹn Bảng Vàng Khoa Đầu) -> #1
- [Tuổi 18] dec_college_18 (Ngã rẽ tuổi 18: Nhập học Quốc Tử Giám hay Ra đời lập nghiệp?) -> #2
- [Tuổi 18] dec_exam_prompt (Khoa cử: Kỳ Thi Hương Mùa Thu) -> #1

### Chết sớm nhất #2: `quan_lai` / `gia_dinh_marriage` (seed=6625, tuổi=18, tiền=3đ, quan hàm=0, lý do="Chết đói vì hết lương thực và tiền bạc")
- [Tuổi 13] dec_job_offers (Tìm kiếm sinh kế: 3 lời mời việc làm phù hợp) -> #0
- [Tuổi 14] evt_adult_major_desperate_theft (Cơn Quẫn Bách Đêm Khuya) -> #1
- [Tuổi 15] evt_adult_major_noble_patron (Gặp Quý Nhân Giữa Chợ Phiên) -> #0
- [Tuổi 16] dec_rankup (Cơ hội thăng tiến: Thư lại giữ sổ sách) -> #0
- [Tuổi 17] evt_military_enlist (Đầu Quân Nhập Ngũ Lập Công Danh) -> #2
- [Tuổi 18] dec_college_18 (Ngã rẽ tuổi 18: Nhập học Quốc Tử Giám hay Ra đời lập nghiệp?) -> #1

### Giàu nhất #1: `dia_chu` / `thuong_buon_venture` (seed=6196, tuổi=76, tiền=6985572đ, quan hàm=0, lý do="Sức khỏe suy kiệt qua đời")
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

### Nợ nặng nhất #1: `thu_cong` / `suc_khoe_longevity` (seed=5780, tuổi=21, tiền=0đ, quan hàm=0, lý do="Chết đói vì hết lương thực và tiền bạc")
- [Tuổi 13] dec_job_offers (Tìm kiếm sinh kế: 3 lời mời việc làm phù hợp) -> #0
- [Tuổi 14] evt_scholar_poor_mentor (Thầy Đồ Già Nhận Làm Môn Sinh) -> #0
- [Tuổi 16] evt_adult_burnout_melancholy (Lòng Ngổn Ngang Trăm Mối) -> #1
- [Tuổi 16] dec_rankup (Cơ hội thăng tiến: Thợ cả · Đốc công phường hội) -> #0
- [Tuổi 17] evt_adult_exp_thu_cong_merchant_order (Thương Nhân Phương Xa Đặt Lô Hàng Lớn) -> #2
- [Tuổi 18] dec_college_18 (Ngã rẽ tuổi 18: Nhập học Quốc Tử Giám hay Ra đời lập nghiệp?) -> #2
- [Tuổi 18] evt_adult_exp_thu_cong_guild (Lập Phường Hội Thợ Nghề) -> #1
- [Tuổi 19] evt_scholar_poor_matchmaker (Phú Hộ Kén Dâu Rể Hiếu Học) -> #0
- [Tuổi 20] evt_chain_len_kinh_1 (Khăn Gói Lên Kinh Thành) -> #3

### Thọ nhất #1: `thu_cong` / `thuong_buon_venture` (seed=5676, tuổi=80, tiền=2307103đ, quan hàm=0, lý do="Sống qua 80 tuổi")
- [Tuổi 13] dec_job_offers (Tìm kiếm sinh kế: 3 lời mời việc làm phù hợp) -> #0
- [Tuổi 14] evt_tier_binh_dan_seasonal_fair (Hội Vật & Phiên Chợ Đầu Xuân) -> #0
- [Tuổi 15] evt_youth_family_sibling_crisis_common (Anh Chị Em Gặp Khó Nơi Xứ Người) -> #1
- [Tuổi 16] dec_rankup (Cơ hội thăng tiến: Thợ cả · Đốc công phường hội) -> #0
- [Tuổi 16] evt_scholar_poor_mentor (Thầy Đồ Già Nhận Làm Môn Sinh) -> #1
- [Tuổi 17] evt_chain_len_kinh_1 (Khăn Gói Lên Kinh Thành) -> #2
- [Tuổi 17] evt_chain_len_kinh_2 (Những Ngày Đầu Nơi Kinh Kỳ) -> #1
- [Tuổi 17] evt_chain_len_kinh_3 (Ánh Mắt Của Quý Nhân Nơi Phồn Hoa) -> #1
- [Tuổi 18] evt_adult_exp_thu_cong_magistrate_repair (Lên Phủ Huyện Sửa Đồ Quý Cho Quan Lớn) -> #1
- [Tuổi 18] dec_college_18 (Ngã rẽ tuổi 18: Nhập học Quốc Tử Giám hay Ra đời lập nghiệp?) -> #1
- [Tuổi 18] dec_exam_prompt (Khoa cử: Kỳ Thi Hương Mùa Thu) -> #1
- [Tuổi 19] evt_adult_exp_thu_cong_merchant_order (Thương Nhân Phương Xa Đặt Lô Hàng Lớn) -> #0
- [Tuổi 20] evt_adult_exp_thu_cong_guild (Lập Phường Hội Thợ Nghề) -> #2
- [Tuổi 21] evt_chain_ra_o_rieng_1 (Thưa Chuyện Ra Ở Riêng) -> #0
- ... *(còn 78 sự kiện nữa)*

### Mẫu Gia đình: `ban_nong` / `gia_dinh_marriage` (seed=5065, tuổi=61, tiền=1385đ, quan hàm=0, lý do="Tuổi cao sức yếu, an nhiên qua đời")
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
- ... *(còn 50 sự kiện nữa)*

### Mẫu Thương buôn: `ban_nong` / `thuong_buon_venture` (seed=5117, tuổi=44, tiền=7514đ, quan hàm=0, lý do="Bị xử trảm vì tội Khi quân (Nữ cải nam trang bại lộ)")
- [Tuổi 13] dec_job_offers (Tìm kiếm sinh kế: 3 lời mời việc làm phù hợp) -> #0
- [Tuổi 14] evt_adult_burnout_melancholy (Lòng Ngổn Ngang Trăm Mối) -> #1
- [Tuổi 14] dec_rankup (Cơ hội thăng tiến: Chạy mối buôn · Giao nhận hàng) -> #0
- [Tuổi 15] evt_tier_binh_dan_seasonal_fair (Hội Vật & Phiên Chợ Đầu Xuân) -> #0
- [Tuổi 16] evt_chain_ra_o_rieng_1 (Thưa Chuyện Ra Ở Riêng) -> #1
- [Tuổi 17] evt_chain_len_kinh_1 (Khăn Gói Lên Kinh Thành) -> #1
- [Tuổi 17] evt_chain_len_kinh_2 (Những Ngày Đầu Nơi Kinh Kỳ) -> #0
- [Tuổi 17] evt_chain_len_kinh_3 (Ánh Mắt Của Quý Nhân Nơi Phồn Hoa) -> #0
- [Tuổi 18] dec_college_18 (Ngã rẽ tuổi 18: Học Y dược · Thương toán hay Ra đời tự lập?) -> #1
- [Tuổi 18] evt_world_bumper_harvest_edict (Chiếu Khuyến Nông & Hội Chợ Thái Bình) -> #2
- [Tuổi 19] evt_female_crossdress_crossroads (Ngã Rẽ Nữ Nhi: An Phận Khuê Các Hay Cải Nam Trang Ứng Thí?) -> #0
- [Tuổi 21] evt_biz_craft_guild_order (Đơn Hàng Lớn Từ Thương Đoàn Kinh Kỳ) -> #0
- [Tuổi 21] dec_exam_prompt (Khoa cử: Kỳ Thi Hương Mùa Thu) -> #1
- [Tuổi 22] dec_biz_offers (Cơ hội lập nghiệp: 3 mô hình kinh doanh khả thi) -> #0
- ... *(còn 26 sự kiện nữa)*

### Mẫu Công danh: `ban_nong` / `cong_danh_exam` (seed=5026, tuổi=76, tiền=1130133đ, quan hàm=5, lý do="Tuổi cao sức yếu, an nhiên qua đời")
- [Tuổi 13] dec_job_offers (Tìm kiếm sinh kế: 3 lời mời việc làm phù hợp) -> #0
- [Tuổi 14] evt_scholar_poor_mentor (Thầy Đồ Già Nhận Làm Môn Sinh) -> #0
- [Tuổi 16] dec_rankup (Cơ hội thăng tiến: Thợ cả · Đốc công phường hội) -> #0
- [Tuổi 16] evt_chain_ra_o_rieng_1 (Thưa Chuyện Ra Ở Riêng) -> #1
- [Tuổi 17] evt_adult_major_corvee (Trát Bắt Đi Phu Đắp Đê) -> #0
- [Tuổi 18] dec_college_18 (Ngã rẽ tuổi 18: Nhập học Quốc Tử Giám hay Ra đời lập nghiệp?) -> #0
- [Tuổi 18] dec_exam_prompt (Khoa cử: Kỳ Thi Hương Mùa Thu) -> #0
- [Tuổi 18] evt_adult_reunion_best_friend (Tái Ngộ Bạn Nối Khố Năm Xưa) -> #0
- [Tuổi 19] evt_biz_craft_guild_order (Đơn Hàng Lớn Từ Thương Đoàn Kinh Kỳ) -> #1
- [Tuổi 20] evt_jianghu_river_convoy_storm (Thuyền Buôn Gặp Giông Lớn Trên Sông Cái) -> #0
- [Tuổi 21] evt_scholar_local_exam_temptation (Cám Dỗ Mua Đề Trước Trường Thi) -> #1
- [Tuổi 21] dec_exam_prompt (Khoa cử: Kỳ Thi Hương Mùa Thu) -> #0
- [Tuổi 22] dec_exam_prompt (Khoa cử: Kỳ Thi Hội Kinh Đô) -> #0
- [Tuổi 22] evt_scholar_road_to_capital (Sĩ Tử Lều Chõng Lên Kinh Ứng Thí) -> #2
- ... *(còn 50 sự kiện nữa)*
