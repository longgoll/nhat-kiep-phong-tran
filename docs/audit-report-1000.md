# Báo Cáo Kiểm Định 1.000 Cuộc Đời (Monte Carlo + Narrative Audit)

- **Tổng số kiếp:** 200 (5 Xuất thân × 10 Archetype | Thời gian chạy song song: 98.7s)
- **Tuổi thọ trung bình:** 63.5 tuổi | **Tử vong sớm (<20 tuổi):** 15/200 (7.5%)
- **Lỗi logic/NaN phát hiện:** 0

## 1. Thống Kê Theo Xuất Thân (`OriginClass`)
| Xuất thân | Tuổi TB | Tài sản TB (đ) | Học thức TB | Thanh danh TB | Quan hàm >0 | Triggers/kiếp |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| ban_nong | 64.9 | 683746 | 55.0 | 1315.2 | 10.0% | 58.1 |
| dia_chu | 68.5 | 1699851 | 86.2 | 2278.0 | 20.0% | 65.7 |
| hoang_toc | 71.7 | 1049939 | 82.2 | 1685.2 | 17.5% | 76.1 |
| quan_lai | 52.5 | 824599 | 80.3 | 1382.2 | 25.0% | 45.1 |
| thu_cong | 60.2 | 668333 | 50.9 | 1142.1 | 2.5% | 52.5 |

## 2. Thống Kê Theo Trọng Tâm & Chiến Lược (`Archetype`)
| Archetype (Focus) | Tuổi TB | Tài sản TB (đ) | Học thức TB | Kết hôn | Khởi nghiệp | Điền sản TB |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| cong_danh_exam (cong_danh) | 68.2 | 867658 | 85.7 | 85% | 0% | 3.9 |
| gia_dinh_marriage (gia_dinh) | 51.3 | 667818 | 56.7 | 70% | 0% | 5.3 |
| thuong_buon_venture (lam_them) | 72.2 | 2078113 | 74.2 | 95% | 80% | 7.7 |
| dien_san_gold (can_bang) | 65.5 | 1780302 | 67.4 | 80% | 0% | 8.4 |
| suc_khoe_longevity (suc_khoe) | 52.0 | 114 | 58.2 | 0% | 0% | 0.1 |
| tu_than_moral (tu_than) | 60.0 | 678924 | 74.2 | 0% | 0% | 0.1 |
| so_thich_hobby (so_thich) | 66.2 | 261004 | 80.8 | 95% | 0% | 0.0 |
| nghi_ngoi_chill (nghi_ngoi) | 68.2 | 425861 | 76.4 | 0% | 0% | 0.1 |
| hanh_thien_fame (hanh_thien) | 66.1 | 1533767 | 74.8 | 90% | 0% | 7.8 |
| risk_debt_hardship (lam_them) | 65.8 | 1559374 | 60.9 | 0% | 85% | 0.0 |

## 2b. Thống Kê Theo Giới Tính (`Gender`)
| Giới tính | Số kiếp | Tuổi TB | Tài sản TB (đ) | Quan hàm >0 | Kết hôn |
| :--- | ---: | ---: | ---: | ---: | ---: |
| male | 124 | 64.8 | 968647 | 18.5% | 52% |
| female | 76 | 61.5 | 1012453 | 9.2% | 50% |

## 3. Tần Suất Quyết Định & Nguyên Nhân Tử Vong
- **Decision Hits:** `{"dec_job_offers":269,"dec_rankup":226,"dec_college_18":174,"dec_retire_60":161,"dec_exam_prompt":1524,"dec_official_family_move":46,"dec_official_appoint":37,"dec_official_promote":369,"dec_biz_offers":33,"dec_loan_heavy":1}`
- **Top Nguyên nhân kết thúc:** Sức khỏe suy kiệt qua đời (81) · Tuổi cao sức yếu, an nhiên qua đời (63) · Chết đói vì hết lương thực và tiền bạc (35) · Bị xử trảm vì tội Khi quân (Nữ cải nam trang bại lộ) (11) · Sống qua 80 tuổi (10)

## 4. Độ Phủ Sự Kiện
- **Top 12 sự kiện nổ nhiều nhất:** `evt_jianghu_river_convoy_storm` (392), `evt_estate_tenant_revolt_mediation` (280), `evt_hermit_mountain_retreat` (262), `evt_physician_noble_poison` (253), `evt_physician_plague_outbreak` (212), `evt_biz_caravan_venture` (177), `evt_wealth_imperial_relief_fund` (161), `evt_jianghu_escort_ambush` (155), `evt_wealth_sponsor_academy` (152), `evt_tier_binh_dan_seasonal_fair` (139), `evt_chain_bao_hieu_me_1` (135), `evt_adult_martial_bandit_ambush` (125)
- **Dead Major Events (0% sau 200 kiếp — 14/202):** `evt_female_royal_title_grant`, `evt_official_emperor_audience`, `evt_official_proxy_biz_leak`, `evt_official_court_purge`, `evt_official_peasant_protest`, `evt_official_vo_border_defense`, `evt_official_vo_troop_mutiny`, `evt_adult_hoang_toc_border_pacification`, `evt_adult_hoang_toc_famine_imperial_edict`, `evt_adult_hoang_toc_teen_palace_library`, `evt_adult_hoang_toc_teen_royal_hunt`, `evt_rebellion_recruit_bandits`, `evt_servitude_secret_ledger`, `evt_adult_exp_world_war_conscription`

## 5. Các Ca Mẫu & Bất Thường (Outliers để Agent Soi Mạch Truyện)
### Chết sớm nhất #1: `quan_lai` / `nghi_ngoi_chill` (seed=6963, tuổi=13, tiền=5đ, quan hàm=0, lý do="Chết đói vì hết lương thực và tiền bạc")
- [Tuổi 13] dec_job_offers (Tìm kiếm sinh kế: 3 lời mời việc làm phù hợp) -> #0

### Chết sớm nhất #2: `quan_lai` / `risk_debt_hardship` (seed=7041, tuổi=14, tiền=7đ, quan hàm=0, lý do="Chết đói vì hết lương thực và tiền bạc")
- [Tuổi 13] dec_job_offers (Tìm kiếm sinh kế: 3 lời mời việc làm phù hợp) -> #0
- [Tuổi 14] evt_adult_major_desperate_theft (Cơn Quẫn Bách Đêm Khuya) -> #1

### Giàu nhất #1: `dia_chu` / `thuong_buon_venture` (seed=6196, tuổi=76, tiền=6938627đ, quan hàm=0, lý do="Sức khỏe suy kiệt qua đời")
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

### Nợ nặng nhất #1: `thu_cong` / `suc_khoe_longevity` (seed=5767, tuổi=60, tiền=0đ, quan hàm=0, lý do="Sức khỏe suy kiệt qua đời")
- [Tuổi 13] dec_job_offers (Tìm kiếm sinh kế: 3 lời mời việc làm phù hợp) -> #0
- [Tuổi 14] evt_tier_binh_dan_seasonal_fair (Hội Vật & Phiên Chợ Đầu Xuân) -> #0
- [Tuổi 15] evt_adult_exp_thu_cong_merchant_order (Thương Nhân Phương Xa Đặt Lô Hàng Lớn) -> #2
- [Tuổi 16] evt_adult_exp_thu_cong_workshop_fire (Hỏa Hoạn Tại Xưởng Nghề) -> #0
- [Tuổi 16] dec_rankup (Cơ hội thăng tiến: Thợ cả · Đốc công phường hội) -> #0
- [Tuổi 17] evt_adult_exp_thu_cong_guild (Lập Phường Hội Thợ Nghề) -> #2
- [Tuổi 18] evt_chain_ra_o_rieng_1 (Thưa Chuyện Ra Ở Riêng) -> #1
- [Tuổi 18] dec_college_18 (Ngã rẽ tuổi 18: Nhập học Quốc Tử Giám hay Ra đời lập nghiệp?) -> #2
- [Tuổi 19] evt_military_enlist (Đầu Quân Nhập Ngũ Lập Công Danh) -> #2
- [Tuổi 20] evt_adult_major_corvee (Trát Bắt Đi Phu Đắp Đê) -> #0
- [Tuổi 21] evt_adult_family_sibling_wedding (Hỷ Sự Của Anh Chị Em Trong Nhà) -> #1
- [Tuổi 22] evt_chain_len_kinh_1 (Khăn Gói Lên Kinh Thành) -> #3
- [Tuổi 22] dec_job_offers (Tìm kiếm sinh kế: 3 lời mời việc làm phù hợp) -> #0
- [Tuổi 23] evt_craft_imperial_commission (Xưởng Nghề Nhận Đơn Chế Tác Đồ Ngự Dụng) -> #0
- ... *(còn 28 sự kiện nữa)*

### Thọ nhất #1: `thu_cong` / `cong_danh_exam` (seed=5572, tuổi=80, tiền=1778743đ, quan hàm=0, lý do="Sống qua 80 tuổi")
- [Tuổi 13] dec_job_offers (Tìm kiếm sinh kế: 3 lời mời việc làm phù hợp) -> #0
- [Tuổi 14] evt_scholar_poor_mentor (Thầy Đồ Già Nhận Làm Môn Sinh) -> #0
- [Tuổi 15] evt_adult_exp_thu_cong_merchant_order (Thương Nhân Phương Xa Đặt Lô Hàng Lớn) -> #1
- [Tuổi 16] dec_rankup (Cơ hội thăng tiến: Thợ cả · Đốc công phường hội) -> #0
- [Tuổi 16] evt_adult_exp_thu_cong_guild (Lập Phường Hội Thợ Nghề) -> #0
- [Tuổi 17] evt_chain_len_kinh_1 (Khăn Gói Lên Kinh Thành) -> #2
- [Tuổi 17] evt_chain_len_kinh_2 (Những Ngày Đầu Nơi Kinh Kỳ) -> #1
- [Tuổi 17] evt_chain_len_kinh_3 (Ánh Mắt Của Quý Nhân Nơi Phồn Hoa) -> #1
- [Tuổi 18] evt_adult_reunion_best_friend (Tái Ngộ Bạn Nối Khố Năm Xưa) -> #0
- [Tuổi 18] dec_college_18 (Ngã rẽ tuổi 18: Học Y dược · Thương toán hay Ra đời tự lập?) -> #1
- [Tuổi 19] evt_adult_exp_thu_cong_merchant_order (Thương Nhân Phương Xa Đặt Lô Hàng Lớn) -> #0
- [Tuổi 20] evt_fate_brothel_or_bodyguard (Ánh Đèn Thanh Lâu & Bến Bãi Giang Hồ) -> #2
- [Tuổi 22] dec_job_offers (Tìm kiếm sinh kế: 3 lời mời việc làm phù hợp) -> #0
- [Tuổi 22] evt_adult_major_noble_patron (Gặp Quý Nhân Giữa Chợ Phiên) -> #0
- ... *(còn 59 sự kiện nữa)*

### Mẫu Gia đình: `ban_nong` / `gia_dinh_marriage` (seed=5078, tuổi=60, tiền=1đ, quan hàm=0, lý do="Chết đói vì hết lương thực và tiền bạc")
- [Tuổi 13] dec_job_offers (Tìm kiếm sinh kế: 3 lời mời việc làm phù hợp) -> #0
- [Tuổi 14] evt_youth_family_father_injury_common (Phụ Thân Gặp Nạn Khi Mưu Sinh) -> #1
- [Tuổi 15] evt_adult_burnout_melancholy (Lòng Ngổn Ngang Trăm Mối) -> #0
- [Tuổi 15] dec_exam_prompt (Khoa cử: Kỳ Thi Hương Mùa Thu) -> #1
- [Tuổi 16] dec_rankup (Cơ hội thăng tiến: Hộ vệ thương đoàn · Bảo tiêu) -> #0
- [Tuổi 16] evt_adult_martial_bandit_ambush (Thảo Khấu Chặn Đường) -> #1
- [Tuổi 17] evt_chain_ra_o_rieng_1 (Thưa Chuyện Ra Ở Riêng) -> #1
- [Tuổi 18] dec_college_18 (Ngã rẽ tuổi 18: Nhập học Quốc Tử Giám hay Ra đời lập nghiệp?) -> #1
- [Tuổi 18] evt_fate_brothel_or_bodyguard (Ánh Đèn Thanh Lâu & Bến Bãi Giang Hồ) -> #1
- [Tuổi 18] dec_exam_prompt (Khoa cử: Kỳ Thi Hương Mùa Thu) -> #1
- [Tuổi 19] evt_military_enlist (Đầu Quân Nhập Ngũ Lập Công Danh) -> #2
- [Tuổi 20] evt_jianghu_black_market_raid (Quan Sai Vây Bắt Phiên Chợ Đen Nửa Đêm) -> #0
- [Tuổi 21] evt_adult_family_pay_old_debt (Món Nợ Cũ Của Gia Đình Đến Hạn) -> #1
- [Tuổi 21] dec_exam_prompt (Khoa cử: Kỳ Thi Hương Mùa Thu) -> #1
- ... *(còn 47 sự kiện nữa)*

### Mẫu Thương buôn: `ban_nong` / `thuong_buon_venture` (seed=5117, tuổi=44, tiền=7504đ, quan hàm=0, lý do="Bị xử trảm vì tội Khi quân (Nữ cải nam trang bại lộ)")
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

### Mẫu Công danh: `ban_nong` / `cong_danh_exam` (seed=5026, tuổi=76, tiền=1297272đ, quan hàm=6, lý do="Tuổi cao sức yếu, an nhiên qua đời")
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
- [Tuổi 21] evt_tier_binh_dan_seasonal_fair (Hội Vật & Phiên Chợ Đầu Xuân) -> #1
- [Tuổi 21] dec_exam_prompt (Khoa cử: Kỳ Thi Hương Mùa Thu) -> #0
- [Tuổi 22] dec_exam_prompt (Khoa cử: Kỳ Thi Hội Kinh Đô) -> #0
- [Tuổi 22] evt_scholar_road_to_capital (Sĩ Tử Lều Chõng Lên Kinh Ứng Thí) -> #2
- ... *(còn 53 sự kiện nữa)*
