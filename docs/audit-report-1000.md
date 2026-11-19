# Báo Cáo Kiểm Định 1.000 Cuộc Đời (Monte Carlo + Narrative Audit)

- **Tổng số kiếp:** 200 (5 Xuất thân × 10 Archetype | Thời gian chạy song song: 115.1s)
- **Tuổi thọ trung bình:** 64.0 tuổi | **Tử vong sớm (<20 tuổi):** 18/200 (9.0%)
- **Lỗi logic/NaN phát hiện:** 0

## 1. Thống Kê Theo Xuất Thân (`OriginClass`)
| Xuất thân | Tuổi TB | Tài sản TB (đ) | Học thức TB | Thanh danh TB | Quan hàm >0 | Triggers/kiếp |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| ban_nong | 61.3 | 2269306 | 57.4 | 1497.8 | 2.5% | 46.5 |
| dia_chu | 73.4 | 4559711 | 94.3 | 2700.6 | 15.0% | 58.3 |
| hoang_toc | 58.4 | 2794030 | 72.9 | 1529.8 | 25.0% | 45.6 |
| quan_lai | 54.5 | 2045850 | 81.3 | 1370.4 | 57.5% | 42.8 |
| thu_cong | 72.5 | 2879984 | 65.1 | 1973.8 | 2.5% | 56.8 |

## 2. Thống Kê Theo Trọng Tâm & Chiến Lược (`Archetype`)
| Archetype (Focus) | Tuổi TB | Tài sản TB (đ) | Học thức TB | Kết hôn | Khởi nghiệp | Điền sản TB |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| cong_danh_exam (cong_danh) | 52.6 | 6137869 | 92.1 | 55% | 0% | 6.9 |
| gia_dinh_marriage (gia_dinh) | 63.2 | 2168169 | 77.8 | 95% | 0% | 9.0 |
| thuong_buon_venture (lam_them) | 75.5 | 6176851 | 79.4 | 95% | 90% | 11.7 |
| dien_san_gold (can_bang) | 73.8 | 4048310 | 70.6 | 95% | 0% | 11.6 |
| suc_khoe_longevity (suc_khoe) | 75.0 | 370649 | 70.6 | 0% | 0% | 0.1 |
| tu_than_moral (tu_than) | 49.8 | 2518977 | 71.4 | 0% | 0% | 0.1 |
| so_thich_hobby (so_thich) | 70.3 | 996108 | 84.3 | 85% | 0% | 0.3 |
| nghi_ngoi_chill (nghi_ngoi) | 48.1 | 770906 | 56.2 | 0% | 0% | 0.1 |
| hanh_thien_fame (hanh_thien) | 58.7 | 1968834 | 68.7 | 70% | 0% | 7.6 |
| risk_debt_hardship (lam_them) | 73.2 | 3941089 | 71.1 | 0% | 100% | 0.0 |

## 2b. Thống Kê Theo Giới Tính (`Gender`)
| Giới tính | Số kiếp | Tuổi TB | Tài sản TB (đ) | Quan hàm >0 | Kết hôn |
| :--- | ---: | ---: | ---: | ---: | ---: |
| male | 124 | 65.1 | 3364987 | 24.2% | 52% |
| female | 76 | 62.3 | 2167063 | 14.5% | 46% |

## 3. Tần Suất Quyết Định & Nguyên Nhân Tử Vong
- **Decision Hits:** `{"dec_college_18":169,"dec_job_offers":135,"dec_retire_60":154,"dec_biz_offers":38,"dec_official_promote":204,"dec_official_appoint":45,"dec_loan_heavy":18,"dec_rankup":1}`
- **Top Nguyên nhân kết thúc:** Sức khỏe suy kiệt qua đời (77) · Tuổi cao sức yếu, an nhiên qua đời (70) · Sống qua 80 tuổi (42) · Bị xử trảm vì tội Khi quân (Nữ cải nam trang bại lộ) (11)

## 4. Độ Phủ Sự Kiện
- **Top 12 sự kiện nổ nhiều nhất:** `evt_jianghu_river_convoy_storm` (460), `evt_estate_tenant_revolt_mediation` (416), `evt_physician_noble_poison` (350), `evt_physician_plague_outbreak` (302), `evt_hermit_mountain_retreat` (277), `evt_wealth_sponsor_academy` (209), `evt_wealth_imperial_relief_fund` (208), `evt_biz_caravan_venture` (189), `evt_wealth_royal_contribution_title` (135), `evt_adult_martial_bandit_ambush` (133), `evt_physician_imperial_summons` (128), `evt_tier_binh_dan_seasonal_fair` (128)
- **Dead Major Events (0% sau 200 kiếp — 6/187):** `evt_female_royal_title_grant`, `evt_adult_hoang_toc_border_pacification`, `evt_adult_hoang_toc_famine_imperial_edict`, `evt_adult_hoang_toc_teen_palace_library`, `evt_adult_hoang_toc_teen_royal_hunt`, `evt_scholar_poor_matchmaker`

## 5. Các Ca Mẫu & Bất Thường (Outliers để Agent Soi Mạch Truyện)
### Chết sớm nhất #1: `quan_lai` / `cong_danh_exam` (seed=6586, tuổi=13, tiền=2đ, quan hàm=0, lý do="Sức khỏe suy kiệt qua đời")

### Chết sớm nhất #2: `quan_lai` / `cong_danh_exam` (seed=6599, tuổi=13, tiền=2đ, quan hàm=0, lý do="Sức khỏe suy kiệt qua đời")

### Giàu nhất #1: `dia_chu` / `cong_danh_exam` (seed=6053, tuổi=80, tiền=18245331đ, quan hàm=5, lý do="Sống qua 80 tuổi")
- [Tuổi 14] evt_biz_tea_cart_rumor (Khách Quán Nước Đồn Chuyện Lạ) -> #1
- [Tuổi 16] evt_adult_exp_world_plague_herb_relief (Khan Hiếm Dược Liệu Giữa Cơn Dịch) -> #2
- [Tuổi 17] evt_biz_scribe_secret_letter (Lá Thư Nhờ Viết Hộ Đầy Bí Ẩn) -> #1
- [Tuổi 18] dec_college_18 (Ngã rẽ tuổi 18: Nhập học Quốc Tử Giám hay Ra đời lập nghiệp?) -> #0
- [Tuổi 18] evt_adult_exp_dia_chu_bandit_raid (Thảo Khấu Đe Dọa Cướp Điền Trang) -> #2
- [Tuổi 19] evt_adult_reunion_best_friend (Tái Ngộ Bạn Nối Khố Năm Xưa) -> #0
- [Tuổi 19] dec_official_promote (Thăng tiến quan trường: Đề bạt chức Tể tướng) -> #0
- [Tuổi 20] evt_physician_plague_outbreak (Dịch Khí Hoành Hành, Mở Quán Phát Thuốc) -> #1
- [Tuổi 21] evt_adult_family_sibling_wedding (Hỷ Sự Của Anh Chị Em Trong Nhà) -> #0
- [Tuổi 22] evt_official_clean_dike_patrol (Tuần Tra Đê Điều Giữa Mùa Lũ) -> #0
- [Tuổi 23] evt_official_faction_choice (Ngã Rẽ Phe Phái Nơi Triều Đường) -> #1
- [Tuổi 24] evt_chain_ra_o_rieng_1 (Thưa Chuyện Ra Ở Riêng) -> #1
- [Tuổi 25] evt_adult_family_spouse_hardship (Vợ Chồng Đồng Cam Cộng Khổ) -> #1
- [Tuổi 26] evt_chain_len_kinh_1 (Khăn Gói Lên Kinh Thành) -> #1
- ... *(còn 52 sự kiện nữa)*

### Nợ nặng nhất #1: `ban_nong` / `tu_than_moral` (seed=5286, tuổi=22, tiền=-41đ, quan hàm=0, lý do="Sức khỏe suy kiệt qua đời")
- [Tuổi 14] evt_tier_binh_dan_seasonal_fair (Hội Vật & Phiên Chợ Đầu Xuân) -> #0
- [Tuổi 15] evt_youth_family_sibling_crisis_common (Anh Chị Em Gặp Khó Nơi Xứ Người) -> #0
- [Tuổi 16] evt_chain_ra_o_rieng_1 (Thưa Chuyện Ra Ở Riêng) -> #1
- [Tuổi 17] evt_fate_eunuch_or_palace_maid (Bước Đường Cùng: Tiến Cung Làm Thái Giám / Cung Nữ) -> #2
- [Tuổi 18] dec_college_18 (Ngã rẽ tuổi 18: Học Y dược · Thương toán hay Ra đời tự lập?) -> #1
- [Tuổi 19] evt_world_bumper_harvest_edict (Chiếu Khuyến Nông & Hội Chợ Thái Bình) -> #2
- [Tuổi 20] evt_debt_desperate_indenture (Chủ Nợ Xiết Nhà — Cầm Thân Hay Bỏ Xứ) -> #0
- [Tuổi 22] evt_adult_family_sibling_wedding (Hỷ Sự Của Anh Chị Em Trong Nhà) -> #1

### Thọ nhất #1: `thu_cong` / `hanh_thien_fame` (seed=5988, tuổi=80, tiền=3346710đ, quan hàm=0, lý do="Sống qua 80 tuổi")
- [Tuổi 14] evt_biz_tea_cart_rumor (Khách Quán Nước Đồn Chuyện Lạ) -> #0
- [Tuổi 15] evt_adult_exp_thu_cong_merchant_order (Thương Nhân Phương Xa Đặt Lô Hàng Lớn) -> #1
- [Tuổi 16] evt_adult_major_corvee (Trát Bắt Đi Phu Đắp Đê) -> #0
- [Tuổi 18] dec_college_18 (Ngã rẽ tuổi 18: Nhập học Quốc Tử Giám hay Ra đời lập nghiệp?) -> #0
- [Tuổi 19] evt_youth_family_sibling_crisis_common (Anh Chị Em Gặp Khó Nơi Xứ Người) -> #0
- [Tuổi 20] evt_youth_family_father_injury_common (Phụ Thân Gặp Nạn Khi Mưu Sinh) -> #0
- [Tuổi 21] evt_tier_trung_luu_guild_banquet (Tiệc Trà Hội Thương & Giới Sĩ Phu) -> #1
- [Tuổi 22] evt_jianghu_river_convoy_storm (Thuyền Buôn Gặp Giông Lớn Trên Sông Cái) -> #1
- [Tuổi 23] evt_biz_tea_cart_rumor (Khách Quán Nước Đồn Chuyện Lạ) -> #1
- [Tuổi 23] dec_job_offers (Tìm kiếm sinh kế: 3 lời mời việc làm phù hợp) -> #0
- [Tuổi 24] evt_estate_tenant_revolt_mediation (Tá Điền Kéo Đến Trang Trại Xin Giảm Tô Mùa Hạn) -> #0
- [Tuổi 25] evt_adult_exp_thu_cong_magistrate_repair (Lên Phủ Huyện Sửa Đồ Quý Cho Quan Lớn) -> #2
- [Tuổi 26] evt_chain_bao_hieu_me_1 (Mẫu Thân Đổ Bệnh Giữa Đêm Gió Lạnh) -> #0
- [Tuổi 26] evt_chain_bao_hieu_me_2_tot (Mẫu Thân Bình Phục An Khang) -> #0
- ... *(còn 50 sự kiện nữa)*

### Mẫu Gia đình: `ban_nong` / `gia_dinh_marriage` (seed=5065, tuổi=80, tiền=3095426đ, quan hàm=0, lý do="Sống qua 80 tuổi")
- [Tuổi 14] evt_tier_binh_dan_seasonal_fair (Hội Vật & Phiên Chợ Đầu Xuân) -> #1
- [Tuổi 15] evt_adult_martial_bandit_ambush (Thảo Khấu Chặn Đường) -> #1
- [Tuổi 16] evt_chain_ra_o_rieng_1 (Thưa Chuyện Ra Ở Riêng) -> #0
- [Tuổi 16] evt_chain_ra_o_rieng_2 (Ngày Dựng Mái Nhà Riêng) -> #2
- [Tuổi 17] evt_youth_family_father_injury_common (Phụ Thân Gặp Nạn Khi Mưu Sinh) -> #1
- [Tuổi 18] dec_college_18 (Ngã rẽ tuổi 18: Nhập học Quốc Tử Giám hay Ra đời lập nghiệp?) -> #1
- [Tuổi 18] evt_romance_lantern_festival (Đêm Hội Hoa Đăng Gặp Người Tri Kỷ) -> #1
- [Tuổi 19] evt_ban_nong_land_reclaim (Khai Khẩn Đất Hoang Ven Bãi Bồi) -> #0
- [Tuổi 20] evt_biz_property_tenant_crisis (Khách Thuê & Tá Điền Khất Nợ Giữa Mùa Khó) -> #0
- [Tuổi 21] evt_chain_len_kinh_1 (Khăn Gói Lên Kinh Thành) -> #2
- [Tuổi 21] evt_chain_len_kinh_2 (Những Ngày Đầu Nơi Kinh Kỳ) -> #1
- [Tuổi 21] evt_chain_len_kinh_3 (Ánh Mắt Của Quý Nhân Nơi Phồn Hoa) -> #1
- [Tuổi 23] dec_job_offers (Tìm kiếm sinh kế: 3 lời mời việc làm phù hợp) -> #0
- [Tuổi 23] evt_chain_bao_hieu_me_1 (Mẫu Thân Đổ Bệnh Giữa Đêm Gió Lạnh) -> #2
- ... *(còn 53 sự kiện nữa)*

### Mẫu Thương buôn: `ban_nong` / `thuong_buon_venture` (seed=5117, tuổi=74, tiền=5620635đ, quan hàm=0, lý do="Tuổi cao sức yếu, an nhiên qua đời")
- [Tuổi 14] evt_tier_binh_dan_seasonal_fair (Hội Vật & Phiên Chợ Đầu Xuân) -> #1
- [Tuổi 16] evt_chain_ra_o_rieng_1 (Thưa Chuyện Ra Ở Riêng) -> #0
- [Tuổi 16] evt_chain_ra_o_rieng_2 (Ngày Dựng Mái Nhà Riêng) -> #0
- [Tuổi 16] evt_chain_ra_o_rieng_3 (Anh Chị Em Ghé Thăm Nhà Mới) -> #0
- [Tuổi 18] evt_romance_lantern_festival (Đêm Hội Hoa Đăng Gặp Người Tri Kỷ) -> #0
- [Tuổi 18] dec_college_18 (Ngã rẽ tuổi 18: Học Y dược · Thương toán hay Ra đời tự lập?) -> #1
- [Tuổi 19] evt_biz_scribe_secret_letter (Lá Thư Nhờ Viết Hộ Đầy Bí Ẩn) -> #1
- [Tuổi 21] evt_scholar_poor_copy_books (Chép Sách Thuê & Dạy Trẻ Đầu Làng) -> #2
- [Tuổi 22] evt_estate_tenant_revolt_mediation (Tá Điền Kéo Đến Trang Trại Xin Giảm Tô Mùa Hạn) -> #1
- [Tuổi 23] dec_job_offers (Tìm kiếm sinh kế: 3 lời mời việc làm phù hợp) -> #0
- [Tuổi 23] evt_youth_family_father_injury_common (Phụ Thân Gặp Nạn Khi Mưu Sinh) -> #0
- [Tuổi 23] dec_biz_offers (Cơ hội lập nghiệp: 3 mô hình kinh doanh khả thi) -> #0
- [Tuổi 24] evt_biz_craft_guild_order (Đơn Hàng Lớn Từ Thương Đoàn Kinh Kỳ) -> #1
- [Tuổi 26] evt_biz_property_tenant_crisis (Khách Thuê & Tá Điền Khất Nợ Giữa Mùa Khó) -> #0
- ... *(còn 44 sự kiện nữa)*

### Mẫu Công danh: `dia_chu` / `cong_danh_exam` (seed=6053, tuổi=80, tiền=18245331đ, quan hàm=5, lý do="Sống qua 80 tuổi")
- [Tuổi 14] evt_biz_tea_cart_rumor (Khách Quán Nước Đồn Chuyện Lạ) -> #1
- [Tuổi 16] evt_adult_exp_world_plague_herb_relief (Khan Hiếm Dược Liệu Giữa Cơn Dịch) -> #2
- [Tuổi 17] evt_biz_scribe_secret_letter (Lá Thư Nhờ Viết Hộ Đầy Bí Ẩn) -> #1
- [Tuổi 18] dec_college_18 (Ngã rẽ tuổi 18: Nhập học Quốc Tử Giám hay Ra đời lập nghiệp?) -> #0
- [Tuổi 18] evt_adult_exp_dia_chu_bandit_raid (Thảo Khấu Đe Dọa Cướp Điền Trang) -> #2
- [Tuổi 19] evt_adult_reunion_best_friend (Tái Ngộ Bạn Nối Khố Năm Xưa) -> #0
- [Tuổi 19] dec_official_promote (Thăng tiến quan trường: Đề bạt chức Tể tướng) -> #0
- [Tuổi 20] evt_physician_plague_outbreak (Dịch Khí Hoành Hành, Mở Quán Phát Thuốc) -> #1
- [Tuổi 21] evt_adult_family_sibling_wedding (Hỷ Sự Của Anh Chị Em Trong Nhà) -> #0
- [Tuổi 22] evt_official_clean_dike_patrol (Tuần Tra Đê Điều Giữa Mùa Lũ) -> #0
- [Tuổi 23] evt_official_faction_choice (Ngã Rẽ Phe Phái Nơi Triều Đường) -> #1
- [Tuổi 24] evt_chain_ra_o_rieng_1 (Thưa Chuyện Ra Ở Riêng) -> #1
- [Tuổi 25] evt_adult_family_spouse_hardship (Vợ Chồng Đồng Cam Cộng Khổ) -> #1
- [Tuổi 26] evt_chain_len_kinh_1 (Khăn Gói Lên Kinh Thành) -> #1
- ... *(còn 52 sự kiện nữa)*
