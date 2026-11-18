# Báo Cáo Kiểm Định 1.000 Cuộc Đời (Monte Carlo + Narrative Audit)

- **Tổng số kiếp:** 200 (5 Xuất thân × 10 Archetype | Thời gian chạy song song: 30.1s)
- **Tuổi thọ trung bình:** 68.1 tuổi | **Tử vong sớm (<20 tuổi):** 17/200 (8.5%)
- **Lỗi logic/NaN phát hiện:** 0

## 1. Thống Kê Theo Xuất Thân (`OriginClass`)
| Xuất thân | Tuổi TB | Tài sản TB (đ) | Học thức TB | Thanh danh TB | Quan hàm >0 | Triggers/kiếp |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| ban_nong | 60.7 | 2263641 | 75.3 | 1792.4 | 2.5% | 84.2 |
| dia_chu | 71.4 | 4377801 | 95.4 | 2875.9 | 12.5% | 105.9 |
| hoang_toc | 73.3 | 4473901 | 91.8 | 2752.7 | 17.5% | 114.5 |
| quan_lai | 63.4 | 3057429 | 92.3 | 2218.7 | 15.0% | 92.5 |
| thu_cong | 71.7 | 2971078 | 85.7 | 2473.5 | 2.5% | 109.0 |

## 2. Thống Kê Theo Trọng Tâm & Chiến Lược (`Archetype`)
| Archetype (Focus) | Tuổi TB | Tài sản TB (đ) | Học thức TB | Kết hôn | Khởi nghiệp | Điền sản TB |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| cong_danh_exam (cong_danh) | 53.0 | 7595837 | 93.1 | 65% | 0% | 6.9 |
| gia_dinh_marriage (gia_dinh) | 76.7 | 2810563 | 93.0 | 100% | 0% | 11.6 |
| thuong_buon_venture (lam_them) | 77.8 | 7169240 | 92.8 | 100% | 90% | 11.7 |
| dien_san_gold (can_bang) | 73.0 | 4016101 | 90.5 | 100% | 0% | 11.6 |
| suc_khoe_longevity (suc_khoe) | 70.5 | 320445 | 86.0 | 0% | 0% | 0.3 |
| tu_than_moral (tu_than) | 51.6 | 2860883 | 77.3 | 0% | 0% | 0.1 |
| so_thich_hobby (so_thich) | 75.2 | 1554361 | 95.4 | 90% | 0% | 0.4 |
| nghi_ngoi_chill (nghi_ngoi) | 60.4 | 1136335 | 77.5 | 0% | 0% | 0.1 |
| hanh_thien_fame (hanh_thien) | 70.3 | 3013028 | 89.3 | 100% | 0% | 10.7 |
| risk_debt_hardship (lam_them) | 72.5 | 3810907 | 86.3 | 0% | 100% | 0.0 |

## 3. Tần Suất Quyết Định & Nguyên Nhân Tử Vong
- **Decision Hits:** `{"dec_college_18":155,"dec_loan_heavy":18,"dec_retire_60":168,"dec_job_offers":121,"dec_biz_offers":38,"dec_official_appoint":63,"dec_official_promote":394}`
- **Top Nguyên nhân kết thúc:** Tuổi cao sức yếu, an nhiên qua đời (79) · Sức khỏe suy kiệt qua đời (78) · Sống qua 80 tuổi (43)

## 4. Độ Phủ Sự Kiện
- **Top 12 sự kiện nổ nhiều nhất:** `evt_jianghu_river_convoy_storm` (816), `evt_estate_tenant_revolt_mediation` (749), `evt_physician_noble_poison` (673), `evt_physician_plague_outbreak` (580), `evt_hermit_mountain_retreat` (554), `evt_wealth_sponsor_academy` (379), `evt_wealth_imperial_relief_fund` (376), `evt_biz_caravan_venture` (370), `evt_biz_apothecary_rare_herb` (310), `evt_adult_martial_bandit_ambush` (305), `evt_wealth_royal_contribution_title` (297), `evt_adult_major_noble_patron` (288)
- **Dead Major Events (0% sau 200 kiếp — 0/182):** Không có!

## 5. Các Ca Mẫu & Bất Thường (Outliers để Agent Soi Mạch Truyện)
### Chết sớm nhất #1: `quan_lai` / `cong_danh_exam` (seed=6586, tuổi=13, tiền=2đ, quan hàm=0, lý do="Sức khỏe suy kiệt qua đời")

### Chết sớm nhất #2: `quan_lai` / `cong_danh_exam` (seed=6599, tuổi=13, tiền=2đ, quan hàm=0, lý do="Sức khỏe suy kiệt qua đời")

### Giàu nhất #1: `hoang_toc` / `cong_danh_exam` (seed=7093, tuổi=80, tiền=16932700đ, quan hàm=5, lý do="Sống qua 80 tuổi")
- [Tuổi 14] evt_scholar_poor_mentor (Thầy Đồ Già Nhận Làm Môn Sinh) -> #1
- [Tuổi 14] evt_scholar_poor_copy_books (Chép Sách Thuê & Dạy Trẻ Đầu Làng) -> #2
- [Tuổi 15] evt_biz_tea_cart_rumor (Khách Quán Nước Đồn Chuyện Lạ) -> #0
- [Tuổi 15] evt_scholar_local_exam_temptation (Cám Dỗ Mua Đề Trước Trường Thi) -> #0
- [Tuổi 17] evt_adult_exp_thu_cong_merchant_order (Thương Nhân Phương Xa Đặt Lô Hàng Lớn) -> #1
- [Tuổi 17] evt_adult_reunion_best_friend (Tái Ngộ Bạn Nối Khố Năm Xưa) -> #1
- [Tuổi 18] evt_chain_ra_o_rieng_1 (Thưa Chuyện Ra Ở Riêng) -> #1
- [Tuổi 18] dec_college_18 (Ngã rẽ tuổi 18: Nhập học Quốc Tử Giám hay Ra đời lập nghiệp?) -> #0
- [Tuổi 18] evt_biz_apothecary_rare_herb (Khách Quý Tìm Mua Vị Thuốc Hiếm) -> #0
- [Tuổi 19] evt_scholar_road_to_capital (Sĩ Tử Lều Chõng Lên Kinh Ứng Thí) -> #0
- [Tuổi 19] evt_adult_exp_thu_cong_guild (Lập Phường Hội Thợ Nghề) -> #1
- [Tuổi 19] dec_official_promote (Thăng tiến quan trường: Đề bạt chức Thượng thư) -> #0
- [Tuổi 20] evt_official_faction_choice (Ngã Rẽ Phe Phái Nơi Triều Đường) -> #3
- [Tuổi 21] evt_jianghu_river_convoy_storm (Thuyền Buôn Gặp Giông Lớn Trên Sông Cái) -> #0
- ... *(còn 115 sự kiện nữa)*

### Nợ nặng nhất #1: `hoang_toc` / `suc_khoe_longevity` (seed=7327, tuổi=24, tiền=-1227đ, quan hàm=0, lý do="Sức khỏe suy kiệt qua đời")
- [Tuổi 14] evt_biz_tea_cart_rumor (Khách Quán Nước Đồn Chuyện Lạ) -> #1
- [Tuổi 14] evt_tier_binh_dan_seasonal_fair (Hội Vật & Phiên Chợ Đầu Xuân) -> #0
- [Tuổi 16] evt_ban_nong_land_reclaim (Khai Khẩn Đất Hoang Ven Bãi Bồi) -> #0
- [Tuổi 16] evt_chain_ra_o_rieng_1 (Thưa Chuyện Ra Ở Riêng) -> #0
- [Tuổi 17] evt_chain_ra_o_rieng_2 (Ngày Dựng Mái Nhà Riêng) -> #0
- [Tuổi 18] evt_youth_family_father_injury_common (Phụ Thân Gặp Nạn Khi Mưu Sinh) -> #1
- [Tuổi 18] dec_college_18 (Ngã rẽ tuổi 18: Nhập học Quốc Tử Giám hay Ra đời lập nghiệp?) -> #2
- [Tuổi 18] evt_adult_reunion_best_friend (Tái Ngộ Bạn Nối Khố Năm Xưa) -> #1
- [Tuổi 19] evt_fate_brothel_or_bodyguard (Ánh Đèn Thanh Lâu & Bến Bãi Giang Hồ) -> #0
- [Tuổi 19] evt_military_enlist (Đầu Quân Nhập Ngũ Lập Công Danh) -> #2
- [Tuổi 20] evt_romance_lantern_festival (Đêm Hội Hoa Đăng Gặp Người Tri Kỷ) -> #0
- [Tuổi 20] evt_debt_desperate_indenture (Chủ Nợ Xiết Nhà — Cầm Thân Hay Bỏ Xứ) -> #0
- [Tuổi 21] evt_fate_brothel_redemption (Tri Kỷ Chuộc Thân Hoàn Lương) -> #0
- [Tuổi 21] evt_adult_burnout_melancholy (Lòng Ngổn Ngang Trăm Mối) -> #1
- ... *(còn 5 sự kiện nữa)*

### Thọ nhất #1: `thu_cong` / `hanh_thien_fame` (seed=5988, tuổi=80, tiền=3667690đ, quan hàm=0, lý do="Sống qua 80 tuổi")
- [Tuổi 14] evt_tier_binh_dan_seasonal_fair (Hội Vật & Phiên Chợ Đầu Xuân) -> #1
- [Tuổi 15] evt_adult_exp_thu_cong_merchant_order (Thương Nhân Phương Xa Đặt Lô Hàng Lớn) -> #0
- [Tuổi 15] evt_youth_family_sibling_crisis_common (Anh Chị Em Gặp Khó Nơi Xứ Người) -> #0
- [Tuổi 16] evt_adult_exp_thu_cong_workshop_fire (Hỏa Hoạn Tại Xưởng Nghề) -> #1
- [Tuổi 16] evt_adult_exp_thu_cong_magistrate_repair (Lên Phủ Huyện Sửa Đồ Quý Cho Quan Lớn) -> #1
- [Tuổi 17] evt_adult_exp_thu_cong_guild (Lập Phường Hội Thợ Nghề) -> #0
- [Tuổi 17] evt_youth_family_father_injury_common (Phụ Thân Gặp Nạn Khi Mưu Sinh) -> #0
- [Tuổi 18] evt_chain_len_kinh_1 (Khăn Gói Lên Kinh Thành) -> #0
- [Tuổi 18] evt_world_rich_forced_donation (Quan Phủ "Kêu Gọi" Phú Hộ Quyên Góp) -> #2
- [Tuổi 18] evt_chain_len_kinh_2 (Những Ngày Đầu Nơi Kinh Kỳ) -> #1
- [Tuổi 18] dec_college_18 (Ngã rẽ tuổi 18: Nhập học Quốc Tử Giám hay Ra đời lập nghiệp?) -> #0
- [Tuổi 18] evt_chain_len_kinh_3 (Ánh Mắt Của Quý Nhân Nơi Phồn Hoa) -> #1
- [Tuổi 19] evt_military_enlist (Đầu Quân Nhập Ngũ Lập Công Danh) -> #1
- [Tuổi 20] evt_biz_caravan_venture (Cơ Hội Chung Vốn Buôn Chuyến Liên Trấn) -> #0
- ... *(còn 107 sự kiện nữa)*

### Mẫu Gia đình: `ban_nong` / `gia_dinh_marriage` (seed=5065, tuổi=77, tiền=2618144đ, quan hàm=0, lý do="Tuổi cao sức yếu, an nhiên qua đời")
- [Tuổi 14] evt_tier_binh_dan_seasonal_fair (Hội Vật & Phiên Chợ Đầu Xuân) -> #1
- [Tuổi 14] evt_youth_family_father_injury_common (Phụ Thân Gặp Nạn Khi Mưu Sinh) -> #1
- [Tuổi 15] evt_world_bumper_harvest_edict (Chiếu Khuyến Nông & Hội Chợ Thái Bình) -> #2
- [Tuổi 15] evt_adult_martial_bandit_ambush (Thảo Khấu Chặn Đường) -> #0
- [Tuổi 16] evt_chain_len_kinh_1 (Khăn Gói Lên Kinh Thành) -> #0
- [Tuổi 16] evt_chain_len_kinh_2 (Những Ngày Đầu Nơi Kinh Kỳ) -> #1
- [Tuổi 16] evt_chain_len_kinh_3 (Ánh Mắt Của Quý Nhân Nơi Phồn Hoa) -> #1
- [Tuổi 18] dec_college_18 (Ngã rẽ tuổi 18: Nhập học Quốc Tử Giám hay Ra đời lập nghiệp?) -> #1
- [Tuổi 18] evt_romance_lantern_festival (Đêm Hội Hoa Đăng Gặp Người Tri Kỷ) -> #1
- [Tuổi 20] evt_biz_scribe_secret_letter (Lá Thư Nhờ Viết Hộ Đầy Bí Ẩn) -> #0
- [Tuổi 20] evt_tier_binh_dan_seasonal_fair (Hội Vật & Phiên Chợ Đầu Xuân) -> #0
- [Tuổi 21] evt_scholar_poor_exam_fail (Lỡ Hẹn Bảng Vàng Khoa Đầu) -> #1
- [Tuổi 21] evt_scholar_poor_copy_books (Chép Sách Thuê & Dạy Trẻ Đầu Làng) -> #0
- [Tuổi 22] evt_adult_exp_world_famine_rice (Nạn Đói Hoành Hành, Giá Gạo Tăng Vọt) -> #2
- ... *(còn 99 sự kiện nữa)*

### Mẫu Thương buôn: `ban_nong` / `thuong_buon_venture` (seed=5117, tuổi=80, tiền=7347655đ, quan hàm=0, lý do="Sống qua 80 tuổi")
- [Tuổi 14] evt_adult_exp_world_famine_rice (Nạn Đói Hoành Hành, Giá Gạo Tăng Vọt) -> #1
- [Tuổi 14] evt_tier_binh_dan_seasonal_fair (Hội Vật & Phiên Chợ Đầu Xuân) -> #1
- [Tuổi 15] evt_youth_family_father_injury_common (Phụ Thân Gặp Nạn Khi Mưu Sinh) -> #1
- [Tuổi 15] evt_world_bumper_harvest_edict (Chiếu Khuyến Nông & Hội Chợ Thái Bình) -> #0
- [Tuổi 16] evt_youth_family_sibling_crisis_common (Anh Chị Em Gặp Khó Nơi Xứ Người) -> #1
- [Tuổi 17] evt_adult_exp_world_war_looting (Quân Lính Cướp Bóc Làng Xã) -> #2
- [Tuổi 17] evt_chain_len_kinh_1 (Khăn Gói Lên Kinh Thành) -> #0
- [Tuổi 17] evt_chain_len_kinh_2 (Những Ngày Đầu Nơi Kinh Kỳ) -> #1
- [Tuổi 18] evt_chain_len_kinh_3 (Ánh Mắt Của Quý Nhân Nơi Phồn Hoa) -> #1
- [Tuổi 18] dec_college_18 (Ngã rẽ tuổi 18: Nhập học Quốc Tử Giám hay Ra đời lập nghiệp?) -> #1
- [Tuổi 19] evt_romance_lantern_festival (Đêm Hội Hoa Đăng Gặp Người Tri Kỷ) -> #0
- [Tuổi 19] evt_chain_ra_o_rieng_1 (Thưa Chuyện Ra Ở Riêng) -> #1
- [Tuổi 20] evt_adult_family_pay_old_debt (Món Nợ Cũ Của Song Thân Đến Hạn) -> #0
- [Tuổi 20] evt_biz_scribe_secret_letter (Lá Thư Nhờ Viết Hộ Đầy Bí Ẩn) -> #1
- ... *(còn 116 sự kiện nữa)*

### Mẫu Công danh: `dia_chu` / `cong_danh_exam` (seed=6053, tuổi=80, tiền=16797379đ, quan hàm=5, lý do="Sống qua 80 tuổi")
- [Tuổi 14] evt_biz_tea_cart_rumor (Khách Quán Nước Đồn Chuyện Lạ) -> #1
- [Tuổi 16] evt_adult_exp_dia_chu_tenant_rent (Tá Điền Kéo Đến Xin Khất Tô) -> #1
- [Tuổi 16] evt_chain_len_kinh_1 (Khăn Gói Lên Kinh Thành) -> #2
- [Tuổi 16] evt_chain_len_kinh_2 (Những Ngày Đầu Nơi Kinh Kỳ) -> #1
- [Tuổi 16] evt_chain_len_kinh_3 (Ánh Mắt Của Quý Nhân Nơi Phồn Hoa) -> #1
- [Tuổi 18] dec_college_18 (Ngã rẽ tuổi 18: Nhập học Quốc Tử Giám hay Ra đời lập nghiệp?) -> #0
- [Tuổi 18] evt_scholar_rich_patron_poor (Gặp Sĩ Tử Nghèo Hết Tiền Lộ Phí) -> #1
- [Tuổi 18] evt_adult_martial_bandit_ambush (Thảo Khấu Chặn Đường) -> #1
- [Tuổi 19] evt_romance_lantern_festival (Đêm Hội Hoa Đăng Gặp Người Tri Kỷ) -> #1
- [Tuổi 19] dec_official_promote (Thăng tiến quan trường: Đề bạt chức Thượng thư) -> #0
- [Tuổi 19] evt_scholar_road_to_capital (Sĩ Tử Lều Chõng Lên Kinh Ứng Thí) -> #2
- [Tuổi 20] evt_adult_exp_dia_chu_buy_land (Cơ Hội Mua Ruộng Tốt Giá Hời) -> #1
- [Tuổi 20] evt_adult_reunion_best_friend (Tái Ngộ Bạn Nối Khố Năm Xưa) -> #1
- [Tuổi 21] evt_scholar_rich_poetry_club (Hội Văn Thơ Tao Nhân Chốn Kinh Kỳ) -> #0
- ... *(còn 116 sự kiện nữa)*
