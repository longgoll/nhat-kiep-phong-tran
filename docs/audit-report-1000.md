# Báo Cáo Kiểm Định 1.000 Cuộc Đời (Monte Carlo + Narrative Audit)

- **Tổng số kiếp:** 1000 (5 Xuất thân × 10 Archetype | Thời gian chạy song song: 147.3s)
- **Tuổi thọ trung bình:** 67.6 tuổi | **Tử vong sớm (<20 tuổi):** 106/1000 (10.6%)
- **Lỗi logic/NaN phát hiện:** 0

## 1. Thống Kê Theo Xuất Thân (`OriginClass`)
| Xuất thân | Tuổi TB | Tài sản TB (đ) | Học thức TB | Thanh danh TB | Quan hàm >0 | Triggers/kiếp |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| ban_nong | 61.0 | 2264016 | 74.3 | 1819.2 | 5.5% | 85.0 |
| dia_chu | 72.0 | 3765907 | 96.2 | 2495.5 | 7.5% | 106.6 |
| hoang_toc | 74.3 | 2966377 | 96.6 | 2653.8 | 14.0% | 120.7 |
| quan_lai | 62.5 | 3404307 | 88.7 | 2203.3 | 17.0% | 89.4 |
| thu_cong | 68.3 | 2930443 | 82.6 | 2050.4 | 11.0% | 101.7 |

## 2. Thống Kê Theo Trọng Tâm & Chiến Lược (`Archetype`)
| Archetype (Focus) | Tuổi TB | Tài sản TB (đ) | Học thức TB | Kết hôn | Khởi nghiệp | Điền sản TB |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| cong_danh_exam (cong_danh) | 54.0 | 4673852 | 94.3 | 49% | 0% | 7.6 |
| gia_dinh_marriage (gia_dinh) | 66.2 | 2481557 | 88.7 | 84% | 0% | 9.6 |
| thuong_buon_venture (lam_them) | 75.5 | 6141369 | 92.3 | 96% | 83% | 11.3 |
| dien_san_gold (can_bang) | 73.4 | 4211264 | 91.7 | 97% | 0% | 11.7 |
| suc_khoe_longevity (suc_khoe) | 72.5 | 595562 | 88.6 | 0% | 0% | 0.2 |
| tu_than_moral (tu_than) | 53.0 | 3566553 | 72.1 | 0% | 0% | 0.1 |
| so_thich_hobby (so_thich) | 74.1 | 1015777 | 95.4 | 91% | 0% | 0.2 |
| nghi_ngoi_chill (nghi_ngoi) | 58.7 | 963512 | 74.7 | 0% | 0% | 0.1 |
| hanh_thien_fame (hanh_thien) | 76.9 | 3393502 | 94.4 | 90% | 0% | 12.0 |
| risk_debt_hardship (lam_them) | 71.7 | 3619150 | 84.6 | 0% | 100% | 0.0 |

## 3. Tần Suất Quyết Định & Nguyên Nhân Tử Vong
- **Decision Hits:** `{"dec_college_18":777,"dec_loan_heavy":110,"dec_official_promote":2152,"dec_retire_60":840,"dec_job_offers":607,"dec_biz_offers":183,"dec_official_appoint":374}`
- **Top Nguyên nhân kết thúc:** Tuổi cao sức yếu, an nhiên qua đời (392) · Sức khỏe suy kiệt qua đời (388) · Sống qua 80 tuổi (220)

## 4. Độ Phủ Sự Kiện
- **Top 12 sự kiện nổ nhiều nhất:** `evt_physician_noble_poison` (3466), `evt_jianghu_river_convoy_storm` (3403), `evt_estate_tenant_revolt_mediation` (3288), `evt_physician_plague_outbreak` (3052), `evt_hermit_mountain_retreat` (2675), `evt_wealth_sponsor_academy` (1790), `evt_biz_caravan_venture` (1785), `evt_wealth_imperial_relief_fund` (1770), `evt_family_clan_dispute` (1507), `evt_wealth_royal_contribution_title` (1449), `evt_adult_martial_bandit_ambush` (1424), `evt_adult_major_noble_patron` (1359)
- **Dead Major Events (0% sau 1000 kiếp — 0/182):** Không có!

## 5. Các Ca Mẫu & Bất Thường (Outliers để Agent Soi Mạch Truyện)
### Chết sớm nhất #1: `hoang_toc` / `cong_danh_exam` (seed=15465, tuổi=13, tiền=4đ, quan hàm=0, lý do="Sức khỏe suy kiệt qua đời")

### Chết sớm nhất #2: `hoang_toc` / `cong_danh_exam` (seed=15478, tuổi=13, tiền=4đ, quan hàm=0, lý do="Sức khỏe suy kiệt qua đời")

### Giàu nhất #1: `hoang_toc` / `cong_danh_exam` (seed=15413, tuổi=80, tiền=18402418đ, quan hàm=5, lý do="Sống qua 80 tuổi")
- [Tuổi 13] evt_adult_hoang_toc_teen_palace_library (Đọc Mật Sử Nơi Tàng Kinh Các) -> #0
- [Tuổi 14] evt_adult_hoang_toc_teen_royal_hunt (Cuộc Săn Mùa Thu Tại Lâm Uyển Hoàng Gia) -> #0
- [Tuổi 14] evt_adult_hoang_toc_teen_empress_dowager (Thỉnh An Thái Hậu Nơi Cung Từ Ninh) -> #0
- [Tuổi 15] evt_youth_family_sibling_court_rivalry (Sóng Gió Huynh Đệ Nơi Phủ Đệ) -> #0
- [Tuổi 15] evt_scholar_rich_poetry_club (Hội Văn Thơ Tao Nhân Chốn Kinh Kỳ) -> #0
- [Tuổi 16] evt_scholar_rich_temptation (Bạn Giàu Rủ Rê Tửu Sắc & Trường Bạc) -> #0
- [Tuổi 16] evt_adult_exp_hoang_toc_title_estate (Lễ Trưởng Thành & Khai Phủ Tôn Thất) -> #1
- [Tuổi 17] evt_adult_exp_hoang_toc_slander (Bị Kẻ Tiểu Nhân Gièm Pha Trước Ngai Vàng) -> #1
- [Tuổi 17] evt_adult_hoang_toc_patron_arts (Mở Hội Bình Thơ & Bảo Trợ Tao Nhân) -> #1
- [Tuổi 18] evt_world_bumper_harvest_edict (Chiếu Khuyến Nông & Hội Chợ Thái Bình) -> #0
- [Tuổi 18] evt_military_enlist (Đầu Quân Nhập Ngũ Lập Công Danh) -> #2
- [Tuổi 18] dec_college_18 (Ngã rẽ tuổi 18: Nhập học Quốc Tử Giám hay Ra đời lập nghiệp?) -> #0
- [Tuổi 19] dec_official_promote (Thăng tiến quan trường: Đề bạt chức Thượng thư) -> #0
- [Tuổi 19] evt_adult_martial_bandit_ambush (Thảo Khấu Chặn Đường) -> #1
- ... *(còn 122 sự kiện nữa)*

### Nợ nặng nhất #1: `quan_lai` / `thuong_buon_venture` (seed=13554, tuổi=19, tiền=-4393đ, quan hàm=0, lý do="Sức khỏe suy kiệt qua đời")
- [Tuổi 15] evt_debt_desperate_indenture (Chủ Nợ Xiết Nhà — Cầm Thân Hay Bỏ Xứ) -> #0
- [Tuổi 15] evt_biz_scribe_secret_letter (Lá Thư Nhờ Viết Hộ Đầy Bí Ẩn) -> #1
- [Tuổi 16] evt_adult_major_desperate_theft (Cơn Quẫn Bách Đêm Khuya) -> #1
- [Tuổi 16] evt_adult_burnout_melancholy (Lòng Ngổn Ngang Trăm Mối) -> #0
- [Tuổi 17] evt_servitude_secret_ledger (Phát Hiện Sổ Sách Gian Lận Trong Phủ Chủ) -> #1
- [Tuổi 17] evt_world_bumper_harvest_edict (Chiếu Khuyến Nông & Hội Chợ Thái Bình) -> #2
- [Tuổi 18] evt_adult_quan_lai_tap_am (Đặc Ân Tập Ấm Nơi Nha Môn) -> #0
- [Tuổi 18] evt_fate_tuyen_tu_palace (Chiếu Chỉ Tuyển Tú Nữ Vào Hậu Cung) -> #1
- [Tuổi 19] evt_adult_court_faction_purge (Sóng Gió Phe Cánh Triều Đình) -> #1
- [Tuổi 19] evt_jianghu_black_market_raid (Quan Sai Vây Bắt Phiên Chợ Đen Nửa Đêm) -> #0

### Thọ nhất #1: `thu_cong` / `hanh_thien_fame` (seed=9927, tuổi=80, tiền=3316535đ, quan hàm=0, lý do="Tuổi cao sức yếu, an nhiên qua đời")
- [Tuổi 14] evt_youth_family_father_injury_common (Phụ Thân Gặp Nạn Khi Mưu Sinh) -> #1
- [Tuổi 14] evt_tier_binh_dan_seasonal_fair (Hội Vật & Phiên Chợ Đầu Xuân) -> #0
- [Tuổi 15] evt_adult_exp_world_plague_quarantine (Dịch Bệnh Lan Tràn Khắp Phủ) -> #1
- [Tuổi 15] evt_adult_exp_thu_cong_merchant_order (Thương Nhân Phương Xa Đặt Lô Hàng Lớn) -> #1
- [Tuổi 16] evt_adult_exp_thu_cong_guild (Lập Phường Hội Thợ Nghề) -> #2
- [Tuổi 16] evt_chain_len_kinh_1 (Khăn Gói Lên Kinh Thành) -> #1
- [Tuổi 16] evt_chain_len_kinh_2 (Những Ngày Đầu Nơi Kinh Kỳ) -> #0
- [Tuổi 16] evt_chain_len_kinh_3 (Ánh Mắt Của Quý Nhân Nơi Phồn Hoa) -> #0
- [Tuổi 18] evt_adult_exp_thu_cong_workshop_fire (Hỏa Hoạn Tại Xưởng Nghề) -> #0
- [Tuổi 18] dec_college_18 (Ngã rẽ tuổi 18: Nhập học Quốc Tử Giám hay Ra đời lập nghiệp?) -> #0
- [Tuổi 18] evt_chain_ra_o_rieng_1 (Thưa Chuyện Ra Ở Riêng) -> #0
- [Tuổi 18] evt_chain_ra_o_rieng_2 (Ngày Dựng Mái Nhà Riêng) -> #0
- [Tuổi 19] evt_chain_ra_o_rieng_3 (Anh Chị Em Ghé Thăm Nhà Mới) -> #0
- [Tuổi 20] evt_world_imperial_tax_levy (Triều Đình Ban Lệnh Tăng Thuế Thời Loạn) -> #0
- ... *(còn 116 sự kiện nữa)*

### Mẫu Gia đình: `ban_nong` / `gia_dinh_marriage` (seed=5273, tuổi=64, tiền=2557369đ, quan hàm=0, lý do="Tuổi cao sức yếu, an nhiên qua đời")
- [Tuổi 14] evt_youth_family_father_injury_common (Phụ Thân Gặp Nạn Khi Mưu Sinh) -> #0
- [Tuổi 14] evt_tier_binh_dan_seasonal_fair (Hội Vật & Phiên Chợ Đầu Xuân) -> #0
- [Tuổi 15] evt_youth_family_sibling_crisis_common (Anh Chị Em Gặp Khó Nơi Xứ Người) -> #1
- [Tuổi 15] evt_adult_martial_bandit_ambush (Thảo Khấu Chặn Đường) -> #1
- [Tuổi 17] evt_chain_ra_o_rieng_1 (Thưa Chuyện Ra Ở Riêng) -> #1
- [Tuổi 18] dec_college_18 (Ngã rẽ tuổi 18: Nhập học Quốc Tử Giám hay Ra đời lập nghiệp?) -> #1
- [Tuổi 18] evt_ban_nong_land_reclaim (Khai Khẩn Đất Hoang Ven Bãi Bồi) -> #0
- [Tuổi 20] evt_biz_property_tenant_crisis (Khách Thuê & Tá Điền Khất Nợ Giữa Mùa Khó) -> #2
- [Tuổi 20] evt_world_war_zone_evacuation (Chiến Họa Tràn Qua Vùng) -> #2
- [Tuổi 21] evt_fate_brothel_or_bodyguard (Ánh Đèn Thanh Lâu & Bến Bãi Giang Hồ) -> #2
- [Tuổi 21] evt_biz_tea_cart_rumor (Khách Quán Nước Đồn Chuyện Lạ) -> #0
- [Tuổi 22] dec_job_offers (Tìm kiếm sinh kế: 3 lời mời việc làm phù hợp) -> #0
- [Tuổi 22] evt_adult_major_corvee (Trát Bắt Đi Phu Đắp Đê) -> #1
- [Tuổi 22] evt_tier_binh_dan_seasonal_fair (Hội Vật & Phiên Chợ Đầu Xuân) -> #1
- ... *(còn 75 sự kiện nữa)*

### Mẫu Thương buôn: `ban_nong` / `thuong_buon_venture` (seed=5533, tuổi=77, tiền=6226946đ, quan hàm=0, lý do="Sức khỏe suy kiệt qua đời")
- [Tuổi 14] evt_youth_family_father_injury_common (Phụ Thân Gặp Nạn Khi Mưu Sinh) -> #1
- [Tuổi 14] evt_tier_binh_dan_seasonal_fair (Hội Vật & Phiên Chợ Đầu Xuân) -> #0
- [Tuổi 15] evt_adult_exp_world_famine_rice (Nạn Đói Hoành Hành, Giá Gạo Tăng Vọt) -> #0
- [Tuổi 15] evt_adult_martial_bandit_ambush (Thảo Khấu Chặn Đường) -> #0
- [Tuổi 16] evt_world_bumper_harvest_edict (Chiếu Khuyến Nông & Hội Chợ Thái Bình) -> #2
- [Tuổi 16] evt_chain_len_kinh_1 (Khăn Gói Lên Kinh Thành) -> #2
- [Tuổi 16] evt_chain_len_kinh_2 (Những Ngày Đầu Nơi Kinh Kỳ) -> #1
- [Tuổi 17] evt_chain_len_kinh_3 (Ánh Mắt Của Quý Nhân Nơi Phồn Hoa) -> #1
- [Tuổi 17] evt_ban_nong_land_reclaim (Khai Khẩn Đất Hoang Ven Bãi Bồi) -> #1
- [Tuổi 17] evt_youth_family_sibling_crisis_common (Anh Chị Em Gặp Khó Nơi Xứ Người) -> #0
- [Tuổi 18] dec_college_18 (Ngã rẽ tuổi 18: Nhập học Quốc Tử Giám hay Ra đời lập nghiệp?) -> #1
- [Tuổi 18] evt_world_bumper_harvest_edict (Chiếu Khuyến Nông & Hội Chợ Thái Bình) -> #2
- [Tuổi 19] evt_romance_lantern_festival (Đêm Hội Hoa Đăng Gặp Người Tri Kỷ) -> #1
- [Tuổi 19] evt_scholar_poor_exam_fail (Lỡ Hẹn Bảng Vàng Khoa Đầu) -> #2
- ... *(còn 115 sự kiện nữa)*

### Mẫu Công danh: `ban_nong` / `cong_danh_exam` (seed=5065, tuổi=74, tiền=11847193đ, quan hàm=5, lý do="Tuổi cao sức yếu, an nhiên qua đời")
- [Tuổi 14] evt_scholar_poor_copy_books (Chép Sách Thuê & Dạy Trẻ Đầu Làng) -> #0
- [Tuổi 14] evt_scholar_poor_mentor (Thầy Đồ Già Nhận Làm Môn Sinh) -> #0
- [Tuổi 15] evt_world_bumper_harvest_edict (Chiếu Khuyến Nông & Hội Chợ Thái Bình) -> #2
- [Tuổi 15] evt_biz_scribe_secret_letter (Lá Thư Nhờ Viết Hộ Đầy Bí Ẩn) -> #1
- [Tuổi 16] evt_adult_teacher_gift (Lời Nhắn Nhủ Của Thầy Đồ Xưa) -> #0
- [Tuổi 16] evt_adult_major_corvee (Trát Bắt Đi Phu Đắp Đê) -> #1
- [Tuổi 17] evt_fate_brothel_or_bodyguard (Ánh Đèn Thanh Lâu & Bến Bãi Giang Hồ) -> #1
- [Tuổi 17] evt_military_enlist (Đầu Quân Nhập Ngũ Lập Công Danh) -> #0
- [Tuổi 18] evt_chain_len_kinh_1 (Khăn Gói Lên Kinh Thành) -> #1
- [Tuổi 18] evt_jianghu_black_market_raid (Quan Sai Vây Bắt Phiên Chợ Đen Nửa Đêm) -> #1
- [Tuổi 18] evt_chain_len_kinh_2 (Những Ngày Đầu Nơi Kinh Kỳ) -> #0
- [Tuổi 18] evt_chain_len_kinh_3 (Ánh Mắt Của Quý Nhân Nơi Phồn Hoa) -> #0
- [Tuổi 19] evt_chain_ra_o_rieng_1 (Thưa Chuyện Ra Ở Riêng) -> #1
- [Tuổi 19] evt_romance_lantern_festival (Đêm Hội Hoa Đăng Gặp Người Tri Kỷ) -> #1
- ... *(còn 95 sự kiện nữa)*
