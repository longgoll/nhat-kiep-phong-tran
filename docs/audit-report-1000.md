# Báo Cáo Kiểm Định 1.000 Cuộc Đời (Monte Carlo + Narrative Audit)

- **Tổng số kiếp:** 200 (5 Xuất thân × 10 Archetype | Thời gian chạy song song: 119.9s)
- **Tuổi thọ trung bình:** 71.1 tuổi | **Tử vong sớm (<20 tuổi):** 0/200 (0.0%)
- **Lỗi logic/NaN phát hiện:** 0

## 1. Thống Kê Theo Xuất Thân (`OriginClass`)
| Xuất thân | Tuổi TB | Tài sản TB (đ) | Học thức TB | Thanh danh TB | Quan hàm >0 | Triggers/kiếp |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| ban_nong | 70.4 | 3016007 | 61.4 | 1528.7 | 7.5% | 61.8 |
| dia_chu | 72.4 | 4422747 | 89.7 | 2461.3 | 17.5% | 68.3 |
| hoang_toc | 74.4 | 4027498 | 84.8 | 2017.2 | 30.0% | 79.5 |
| quan_lai | 68.8 | 3506335 | 96.1 | 2218.5 | 17.5% | 63.6 |
| thu_cong | 69.4 | 3438934 | 62.0 | 1584.6 | 2.5% | 62.1 |

## 2. Thống Kê Theo Trọng Tâm & Chiến Lược (`Archetype`)
| Archetype (Focus) | Tuổi TB | Tài sản TB (đ) | Học thức TB | Kết hôn | Khởi nghiệp | Điền sản TB |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| cong_danh_exam (cong_danh) | 73.7 | 7726257 | 92.6 | 100% | 0% | 5.2 |
| gia_dinh_marriage (gia_dinh) | 58.1 | 2152730 | 76.0 | 90% | 0% | 8.4 |
| thuong_buon_venture (lam_them) | 73.5 | 6939489 | 75.5 | 95% | 95% | 9.8 |
| dien_san_gold (can_bang) | 73.9 | 4748896 | 72.5 | 95% | 0% | 9.6 |
| suc_khoe_longevity (suc_khoe) | 77.0 | 732213 | 76.7 | 0% | 0% | 0.1 |
| tu_than_moral (tu_than) | 62.1 | 3764816 | 80.9 | 0% | 0% | 0.0 |
| so_thich_hobby (so_thich) | 72.9 | 1508111 | 85.0 | 100% | 0% | 0.0 |
| nghi_ngoi_chill (nghi_ngoi) | 73.5 | 1939254 | 81.8 | 0% | 0% | 0.1 |
| hanh_thien_fame (hanh_thien) | 76.3 | 3381630 | 81.2 | 100% | 0% | 10.4 |
| risk_debt_hardship (lam_them) | 69.7 | 3929647 | 65.7 | 0% | 100% | 0.0 |

## 2b. Thống Kê Theo Giới Tính (`Gender`)
| Giới tính | Số kiếp | Tuổi TB | Tài sản TB (đ) | Quan hàm >0 | Kết hôn |
| :--- | ---: | ---: | ---: | ---: | ---: |
| male | 124 | 71.8 | 4186972 | 22.6% | 60% |
| female | 76 | 69.9 | 2858899 | 2.6% | 55% |

## 3. Tần Suất Quyết Định & Nguyên Nhân Tử Vong
- **Decision Hits:** `{"dec_job_offers":294,"dec_rankup":212,"dec_college_18":182,"dec_retire_60":184,"dec_exam_prompt":1792,"dec_official_family_move":34,"dec_biz_offers":39,"dec_official_appoint":38,"dec_official_promote":171}`
- **Top Nguyên nhân kết thúc:** Tuổi cao sức yếu, an nhiên qua đời (86) · Sức khỏe suy kiệt qua đời (84) · Sống qua 80 tuổi (18) · Bị xử trảm vì tội Khi quân (Nữ cải nam trang bại lộ) (7) · Chết đói vì hết lương thực và tiền bạc (5)

## 4. Độ Phủ Sự Kiện
- **Top 12 sự kiện nổ nhiều nhất:** `evt_jianghu_river_convoy_storm` (580), `evt_physician_noble_poison` (384), `evt_physician_plague_outbreak` (339), `evt_estate_tenant_revolt_mediation` (318), `evt_hermit_mountain_retreat` (317), `evt_wealth_sponsor_academy` (217), `evt_wealth_imperial_relief_fund` (207), `evt_biz_caravan_venture` (207), `evt_wealth_royal_contribution_title` (195), `evt_physician_imperial_summons` (157), `evt_adult_martial_bandit_ambush` (157), `evt_chain_bao_hieu_me_1` (152)
- **Dead Major Events (0% sau 200 kiếp — 20/201):** `evt_biz_tea_cart_rumor`, `evt_biz_scribe_secret_letter`, `evt_servitude_opportunity`, `evt_adult_major_desperate_theft`, `evt_female_royal_title_grant`, `evt_rebellion_people_support`, `evt_rebellion_amnesty_offer`, `evt_official_proxy_biz_leak`, `evt_official_court_purge`, `evt_official_faction_patron_fall`, `evt_official_vo_border_defense`, `evt_official_vo_troop_mutiny`, `evt_adult_exp_hoang_toc_slander`, `evt_adult_hoang_toc_border_pacification`, `evt_adult_hoang_toc_famine_imperial_edict`, `evt_adult_hoang_toc_teen_palace_library`, `evt_adult_hoang_toc_teen_royal_hunt`, `evt_scholar_poor_copy_books`, `evt_debt_desperate_indenture`, `evt_servitude_secret_ledger`

## 5. Các Ca Mẫu & Bất Thường (Outliers để Agent Soi Mạch Truyện)
### Chết sớm nhất #1: `quan_lai` / `gia_dinh_marriage` (seed=6625, tuổi=20, tiền=1đ, quan hàm=0, lý do="Chết đói vì hết lương thực và tiền bạc")
- [Tuổi 13] dec_job_offers (Tìm kiếm sinh kế: 3 lời mời việc làm phù hợp) -> #0
- [Tuổi 14] evt_adult_burnout_melancholy (Lòng Ngổn Ngang Trăm Mối) -> #1
- [Tuổi 15] dec_exam_prompt (Khoa cử: Kỳ Thi Hương Mùa Thu) -> #1
- [Tuổi 16] evt_adult_major_noble_patron (Gặp Quý Nhân Giữa Chợ Phiên) -> #0
- [Tuổi 17] dec_rankup (Cơ hội thăng tiến: Thư lại giữ sổ sách) -> #0
- [Tuổi 17] evt_military_enlist (Đầu Quân Nhập Ngũ Lập Công Danh) -> #2
- [Tuổi 18] dec_college_18 (Ngã rẽ tuổi 18: Nhập học Quốc Tử Giám hay Ra đời lập nghiệp?) -> #1
- [Tuổi 18] evt_scholar_rich_patron_poor (Gặp Sĩ Tử Nghèo Hết Tiền Lộ Phí) -> #0
- [Tuổi 18] dec_exam_prompt (Khoa cử: Kỳ Thi Hương Mùa Thu) -> #1

### Chết sớm nhất #2: `quan_lai` / `gia_dinh_marriage` (seed=6638, tuổi=20, tiền=1đ, quan hàm=0, lý do="Chết đói vì hết lương thực và tiền bạc")
- [Tuổi 13] dec_job_offers (Tìm kiếm sinh kế: 3 lời mời việc làm phù hợp) -> #0
- [Tuổi 14] evt_adult_burnout_melancholy (Lòng Ngổn Ngang Trăm Mối) -> #1
- [Tuổi 15] dec_exam_prompt (Khoa cử: Kỳ Thi Hương Mùa Thu) -> #1
- [Tuổi 16] evt_adult_major_noble_patron (Gặp Quý Nhân Giữa Chợ Phiên) -> #0
- [Tuổi 17] dec_rankup (Cơ hội thăng tiến: Thư lại giữ sổ sách) -> #0
- [Tuổi 17] evt_military_enlist (Đầu Quân Nhập Ngũ Lập Công Danh) -> #2
- [Tuổi 18] dec_college_18 (Ngã rẽ tuổi 18: Nhập học Quốc Tử Giám hay Ra đời lập nghiệp?) -> #1
- [Tuổi 18] evt_scholar_rich_patron_poor (Gặp Sĩ Tử Nghèo Hết Tiền Lộ Phí) -> #0
- [Tuổi 18] dec_exam_prompt (Khoa cử: Kỳ Thi Hương Mùa Thu) -> #1

### Giàu nhất #1: `hoang_toc` / `cong_danh_exam` (seed=7106, tuổi=77, tiền=13662343đ, quan hàm=5, lý do="Sức khỏe suy kiệt qua đời")
- [Tuổi 13] dec_job_offers (Tìm kiếm sinh kế: 3 lời mời việc làm phù hợp) -> #0
- [Tuổi 14] evt_youth_family_father_injury_common (Phụ Thân Gặp Nạn Khi Mưu Sinh) -> #1
- [Tuổi 16] evt_scholar_poor_village_fund (Quỹ Nghĩa Học Của Làng Xã) -> #1
- [Tuổi 16] dec_rankup (Cơ hội thăng tiến: Thợ cả · Đốc công phường hội) -> #0
- [Tuổi 17] evt_scholar_poor_mentor (Thầy Đồ Già Nhận Làm Môn Sinh) -> #1
- [Tuổi 18] evt_ban_nong_land_reclaim (Khai Khẩn Đất Hoang Ven Bãi Bồi) -> #0
- [Tuổi 18] dec_college_18 (Ngã rẽ tuổi 18: Nhập học Quốc Tử Giám hay Ra đời lập nghiệp?) -> #0
- [Tuổi 18] dec_exam_prompt (Khoa cử: Kỳ Thi Hương Mùa Thu) -> #0
- [Tuổi 19] evt_chain_len_kinh_1 (Khăn Gói Lên Kinh Thành) -> #1
- [Tuổi 19] evt_chain_len_kinh_2 (Những Ngày Đầu Nơi Kinh Kỳ) -> #0
- [Tuổi 19] evt_chain_len_kinh_3 (Ánh Mắt Của Quý Nhân Nơi Phồn Hoa) -> #0
- [Tuổi 20] dec_official_appoint (Triều đình bổ nhiệm: Nhậm chức Điển sử / Thư lại huyện) -> #0
- [Tuổi 21] dec_official_family_move (Luật Hồi Tỵ: An bài Gia quyến khi Nhậm chức xa) -> #1
- [Tuổi 21] evt_craft_imperial_commission (Xưởng Nghề Nhận Đơn Chế Tác Đồ Ngự Dụng) -> #1
- ... *(còn 53 sự kiện nữa)*

### Nợ nặng nhất #1: `quan_lai` / `suc_khoe_longevity` (seed=6781, tuổi=76, tiền=0đ, quan hàm=0, lý do="Chết đói vì hết lương thực và tiền bạc")
- [Tuổi 13] dec_job_offers (Tìm kiếm sinh kế: 3 lời mời việc làm phù hợp) -> #0
- [Tuổi 15] dec_exam_prompt (Khoa cử: Kỳ Thi Hương Mùa Thu) -> #1
- [Tuổi 16] dec_rankup (Cơ hội thăng tiến: Thợ cả · Đốc công phường hội) -> #0
- [Tuổi 16] evt_scholar_rich_poetry_club (Hội Văn Thơ Tao Nhân Chốn Kinh Kỳ) -> #2
- [Tuổi 17] evt_adult_martial_bandit_ambush (Thảo Khấu Chặn Đường) -> #0
- [Tuổi 18] dec_college_18 (Ngã rẽ tuổi 18: Nhập học Quốc Tử Giám hay Ra đời lập nghiệp?) -> #2
- [Tuổi 18] dec_exam_prompt (Khoa cử: Kỳ Thi Hương Mùa Thu) -> #1
- [Tuổi 19] evt_scholar_rich_family_pressure (Áp Lực Gia Phong & Kỳ Vọng Của Tộc Trưởng) -> #0
- [Tuổi 20] evt_world_bumper_harvest_edict (Chiếu Khuyến Nông & Hội Chợ Thái Bình) -> #1
- [Tuổi 20] dec_official_appoint (Triều đình bổ nhiệm: Nhậm chức Điển sử / Thư lại huyện) -> #0
- [Tuổi 21] evt_adult_major_noble_patron (Gặp Quý Nhân Giữa Chợ Phiên) -> #0
- [Tuổi 21] dec_exam_prompt (Khoa cử: Kỳ Thi Hương Mùa Thu) -> #1
- [Tuổi 22] evt_official_faction_choice (Ngã Rẽ Phe Phái Nơi Triều Đường) -> #0
- [Tuổi 23] dec_official_promote (Kỳ Khảo khóa Triều đình: Xét thăng Bát phẩm · Huyện thừa / Huấn đạo) -> #0
- ... *(còn 70 sự kiện nữa)*

### Thọ nhất #1: `thu_cong` / `hanh_thien_fame` (seed=5988, tuổi=80, tiền=3558765đ, quan hàm=0, lý do="Tuổi cao sức yếu, an nhiên qua đời")
- [Tuổi 13] dec_job_offers (Tìm kiếm sinh kế: 3 lời mời việc làm phù hợp) -> #0
- [Tuổi 14] evt_youth_family_father_injury_common (Phụ Thân Gặp Nạn Khi Mưu Sinh) -> #0
- [Tuổi 16] dec_rankup (Cơ hội thăng tiến: Thợ cả · Đốc công phường hội) -> #0
- [Tuổi 16] evt_adult_major_corvee (Trát Bắt Đi Phu Đắp Đê) -> #0
- [Tuổi 18] evt_adult_exp_thu_cong_magistrate_repair (Lên Phủ Huyện Sửa Đồ Quý Cho Quan Lớn) -> #1
- [Tuổi 18] dec_college_18 (Ngã rẽ tuổi 18: Nhập học Quốc Tử Giám hay Ra đời lập nghiệp?) -> #0
- [Tuổi 19] evt_adult_exp_thu_cong_merchant_order (Thương Nhân Phương Xa Đặt Lô Hàng Lớn) -> #0
- [Tuổi 20] evt_tier_trung_luu_guild_banquet (Tiệc Trà Hội Thương & Giới Sĩ Phu) -> #0
- [Tuổi 21] evt_tier_binh_dan_seasonal_fair (Hội Vật & Phiên Chợ Đầu Xuân) -> #1
- [Tuổi 22] dec_job_offers (Tìm kiếm sinh kế: 3 lời mời việc làm phù hợp) -> #0
- [Tuổi 22] evt_jianghu_river_convoy_storm (Thuyền Buôn Gặp Giông Lớn Trên Sông Cái) -> #1
- [Tuổi 23] evt_estate_tenant_revolt_mediation (Tá Điền Kéo Đến Trang Trại Xin Giảm Tô Mùa Hạn) -> #1
- [Tuổi 24] evt_craft_imperial_commission (Xưởng Nghề Nhận Đơn Chế Tác Đồ Ngự Dụng) -> #0
- [Tuổi 25] evt_military_enlist (Đầu Quân Nhập Ngũ Lập Công Danh) -> #0
- ... *(còn 72 sự kiện nữa)*

### Mẫu Gia đình: `ban_nong` / `gia_dinh_marriage` (seed=5065, tuổi=65, tiền=1483572đ, quan hàm=0, lý do="Tuổi cao sức yếu, an nhiên qua đời")
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
- ... *(còn 54 sự kiện nữa)*

### Mẫu Thương buôn: `ban_nong` / `thuong_buon_venture` (seed=5117, tuổi=43, tiền=1834908đ, quan hàm=0, lý do="Bị xử trảm vì tội Khi quân (Nữ cải nam trang bại lộ)")
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
- [Tuổi 21] evt_biz_caravan_venture (Cơ Hội Chung Vốn Buôn Chuyến Liên Trấn) -> #0
- [Tuổi 21] dec_exam_prompt (Khoa cử: Kỳ Thi Hương Mùa Thu) -> #1
- [Tuổi 22] dec_biz_offers (Cơ hội lập nghiệp: 3 mô hình kinh doanh khả thi) -> #0
- ... *(còn 26 sự kiện nữa)*

### Mẫu Công danh: `ban_nong` / `cong_danh_exam` (seed=5026, tuổi=70, tiền=9719360đ, quan hàm=5, lý do="Tuổi cao sức yếu, an nhiên qua đời")
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
- ... *(còn 43 sự kiện nữa)*
