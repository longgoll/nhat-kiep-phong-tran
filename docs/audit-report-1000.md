# Báo Cáo Kiểm Định 1.000 Cuộc Đời (Monte Carlo + Narrative Audit)

- **Tổng số kiếp:** 200 (5 Xuất thân × 10 Archetype | Thời gian chạy song song: 111.6s)
- **Tuổi thọ trung bình:** 69.9 tuổi | **Tử vong sớm (<20 tuổi):** 0/200 (0.0%)
- **Lỗi logic/NaN phát hiện:** 0

## 1. Thống Kê Theo Xuất Thân (`OriginClass`)
| Xuất thân | Tuổi TB | Tài sản TB (đ) | Học thức TB | Thanh danh TB | Quan hàm >0 | Triggers/kiếp |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| ban_nong | 69.8 | 3153807 | 61.3 | 1514.1 | 10.0% | 61.6 |
| dia_chu | 72.1 | 5249517 | 88.4 | 2571.1 | 20.0% | 68.8 |
| hoang_toc | 73.7 | 4194209 | 84.7 | 1845.9 | 30.0% | 76.7 |
| quan_lai | 64.4 | 4095664 | 92.9 | 2141.1 | 22.5% | 58.6 |
| thu_cong | 69.5 | 3523145 | 62.3 | 1596.0 | 2.5% | 62.6 |

## 2. Thống Kê Theo Trọng Tâm & Chiến Lược (`Archetype`)
| Archetype (Focus) | Tuổi TB | Tài sản TB (đ) | Học thức TB | Kết hôn | Khởi nghiệp | Điền sản TB |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| cong_danh_exam (cong_danh) | 75.0 | 11773874 | 93.4 | 100% | 0% | 9.6 |
| gia_dinh_marriage (gia_dinh) | 58.5 | 2128859 | 75.5 | 90% | 0% | 8.4 |
| thuong_buon_venture (lam_them) | 71.7 | 6602696 | 74.9 | 95% | 90% | 9.8 |
| dien_san_gold (can_bang) | 73.3 | 4566278 | 72.7 | 95% | 0% | 9.6 |
| suc_khoe_longevity (suc_khoe) | 69.3 | 724523 | 72.2 | 0% | 0% | 0.1 |
| tu_than_moral (tu_than) | 62.2 | 4834789 | 80.6 | 0% | 0% | 0.0 |
| so_thich_hobby (so_thich) | 70.2 | 1264227 | 83.6 | 100% | 0% | 0.2 |
| nghi_ngoi_chill (nghi_ngoi) | 74.7 | 1853932 | 81.7 | 0% | 0% | 0.1 |
| hanh_thien_fame (hanh_thien) | 78.3 | 3308870 | 79.1 | 100% | 0% | 9.7 |
| risk_debt_hardship (lam_them) | 65.8 | 3374636 | 65.4 | 0% | 80% | 0.0 |

## 2b. Thống Kê Theo Giới Tính (`Gender`)
| Giới tính | Số kiếp | Tuổi TB | Tài sản TB (đ) | Quan hàm >0 | Kết hôn |
| :--- | ---: | ---: | ---: | ---: | ---: |
| male | 124 | 69.9 | 4764644 | 25.0% | 60% |
| female | 76 | 69.8 | 2866287 | 3.9% | 55% |

## 3. Tần Suất Quyết Định & Nguyên Nhân Tử Vong
- **Decision Hits:** `{"dec_job_offers":281,"dec_rankup":199,"dec_college_18":183,"dec_retire_60":178,"dec_exam_prompt":1704,"dec_official_promote":213,"dec_biz_offers":34,"dec_official_appoint":38}`
- **Top Nguyên nhân kết thúc:** Tuổi cao sức yếu, an nhiên qua đời (93) · Sức khỏe suy kiệt qua đời (70) · Sống qua 80 tuổi (22) · Chết đói vì hết lương thực và tiền bạc (8) · Bị xử trảm vì tội Khi quân (Nữ cải nam trang bại lộ) (7)

## 4. Độ Phủ Sự Kiện
- **Top 12 sự kiện nổ nhiều nhất:** `evt_jianghu_river_convoy_storm` (565), `evt_physician_noble_poison` (316), `evt_estate_tenant_revolt_mediation` (296), `evt_hermit_mountain_retreat` (294), `evt_physician_plague_outbreak` (286), `evt_wealth_imperial_relief_fund` (200), `evt_wealth_sponsor_academy` (184), `evt_biz_caravan_venture` (181), `evt_wealth_royal_contribution_title` (175), `evt_adult_martial_bandit_ambush` (160), `evt_biz_apothecary_rare_herb` (155), `evt_chain_bao_hieu_me_1` (151)
- **Dead Major Events (0% sau 200 kiếp — 14/187):** `evt_biz_tea_cart_rumor`, `evt_biz_scribe_secret_letter`, `evt_servitude_opportunity`, `evt_adult_major_desperate_theft`, `evt_female_royal_title_grant`, `evt_rebellion_people_support`, `evt_rebellion_amnesty_offer`, `evt_adult_hoang_toc_border_pacification`, `evt_adult_hoang_toc_teen_palace_library`, `evt_adult_hoang_toc_teen_royal_hunt`, `evt_rebellion_recruit_bandits`, `evt_scholar_poor_copy_books`, `evt_debt_desperate_indenture`, `evt_servitude_secret_ledger`

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

### Giàu nhất #1: `dia_chu` / `cong_danh_exam` (seed=6053, tuổi=77, tiền=18442332đ, quan hàm=5, lý do="Sức khỏe suy kiệt qua đời")
- [Tuổi 13] dec_job_offers (Tìm kiếm sinh kế: 3 lời mời việc làm phù hợp) -> #0
- [Tuổi 15] dec_exam_prompt (Khoa cử: Kỳ Thi Hương Mùa Thu) -> #0
- [Tuổi 16] dec_rankup (Cơ hội thăng tiến: Thợ cả · Đốc công phường hội) -> #0
- [Tuổi 16] evt_adult_martial_bandit_ambush (Thảo Khấu Chặn Đường) -> #1
- [Tuổi 18] evt_adult_reunion_best_friend (Tái Ngộ Bạn Nối Khố Năm Xưa) -> #1
- [Tuổi 19] evt_official_corrupt_bribe_case (Nhận Hối Lộ Chạy Án Trọng Tội) -> #0
- [Tuổi 20] evt_scholar_road_to_capital (Sĩ Tử Lều Chõng Lên Kinh Ứng Thí) -> #0
- [Tuổi 21] evt_jianghu_river_convoy_storm (Thuyền Buôn Gặp Giông Lớn Trên Sông Cái) -> #0
- [Tuổi 22] dec_exam_prompt (Khoa cử: Kỳ Thi Hội Kinh Đô) -> #0
- [Tuổi 22] evt_adult_exp_dia_chu_buy_land (Cơ Hội Mua Ruộng Tốt Giá Hời) -> #0
- [Tuổi 23] evt_estate_tenant_revolt_mediation (Tá Điền Kéo Đến Trang Trại Xin Giảm Tô Mùa Hạn) -> #0
- [Tuổi 24] evt_physician_plague_outbreak (Dịch Khí Hoành Hành, Mở Quán Phát Thuốc) -> #0
- [Tuổi 24] evt_physician_imperial_summons (Phủ Đệ & Thái Y Viện Triệu Kiến Trọng Dụng) -> #0
- [Tuổi 25] dec_exam_prompt (Khoa cử: Kỳ Thi Hội Kinh Đô) -> #0
- ... *(còn 51 sự kiện nữa)*

### Nợ nặng nhất #1: `quan_lai` / `suc_khoe_longevity` (seed=6807, tuổi=25, tiền=0đ, quan hàm=3, lý do="Chết đói vì hết lương thực và tiền bạc")
- [Tuổi 13] dec_job_offers (Tìm kiếm sinh kế: 3 lời mời việc làm phù hợp) -> #0
- [Tuổi 15] evt_adult_major_noble_patron (Gặp Quý Nhân Giữa Chợ Phiên) -> #0
- [Tuổi 15] dec_exam_prompt (Khoa cử: Kỳ Thi Hương Mùa Thu) -> #1
- [Tuổi 16] dec_rankup (Cơ hội thăng tiến: Thợ cả · Đốc công phường hội) -> #0
- [Tuổi 16] evt_scholar_rich_poetry_club (Hội Văn Thơ Tao Nhân Chốn Kinh Kỳ) -> #1
- [Tuổi 18] dec_college_18 (Ngã rẽ tuổi 18: Nhập học Quốc Tử Giám hay Ra đời lập nghiệp?) -> #2
- [Tuổi 18] evt_romance_lantern_festival (Đêm Hội Hoa Đăng Gặp Người Tri Kỷ) -> #1
- [Tuổi 18] dec_exam_prompt (Khoa cử: Kỳ Thi Hương Mùa Thu) -> #1
- [Tuổi 19] evt_world_rich_bandit_target (Giặc Cướp Dòm Ngó Phủ Giàu Giữa Thời Loạn) -> #1
- [Tuổi 20] dec_official_appoint (Triều đình bổ nhiệm: Nhậm chức Tri huyện) -> #0
- [Tuổi 20] evt_adult_family_sibling_wedding (Hỷ Sự Của Anh Chị Em Trong Nhà) -> #1
- [Tuổi 21] dec_official_promote (Thăng tiến quan trường: Đề bạt chức Tri phủ) -> #0
- [Tuổi 21] dec_exam_prompt (Khoa cử: Kỳ Thi Hương Mùa Thu) -> #1
- [Tuổi 21] evt_world_bumper_harvest_edict (Chiếu Khuyến Nông & Hội Chợ Thái Bình) -> #2
- ... *(còn 5 sự kiện nữa)*

### Thọ nhất #1: `thu_cong` / `hanh_thien_fame` (seed=5988, tuổi=80, tiền=3576375đ, quan hàm=0, lý do="Sống qua 80 tuổi")
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
- ... *(còn 76 sự kiện nữa)*

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

### Mẫu Công danh: `ban_nong` / `cong_danh_exam` (seed=5026, tuổi=70, tiền=13584093đ, quan hàm=5, lý do="Tuổi cao sức yếu, an nhiên qua đời")
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
- [Tuổi 23] evt_youth_family_sibling_crisis_common (Anh Chị Em Gặp Khó Nơi Xứ Người) -> #1
- ... *(còn 41 sự kiện nữa)*
