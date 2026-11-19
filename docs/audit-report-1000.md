# Báo Cáo Kiểm Định 1.000 Cuộc Đời (Monte Carlo + Narrative Audit)

- **Tổng số kiếp:** 200 (5 Xuất thân × 10 Archetype | Thời gian chạy song song: 119.2s)
- **Tuổi thọ trung bình:** 65.9 tuổi | **Tử vong sớm (<20 tuổi):** 18/200 (9.0%)
- **Lỗi logic/NaN phát hiện:** 0

## 1. Thống Kê Theo Xuất Thân (`OriginClass`)
| Xuất thân | Tuổi TB | Tài sản TB (đ) | Học thức TB | Thanh danh TB | Quan hàm >0 | Triggers/kiếp |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| ban_nong | 63.9 | 2442947 | 54.0 | 1588.8 | 2.5% | 47.6 |
| dia_chu | 73.7 | 4633614 | 94.3 | 2719.6 | 17.5% | 58.7 |
| hoang_toc | 60.9 | 3255647 | 71.4 | 1700.6 | 30.0% | 48.3 |
| quan_lai | 59.5 | 2076416 | 84.2 | 1375.3 | 22.5% | 47.3 |
| thu_cong | 71.4 | 2840221 | 63.5 | 1919.5 | 7.5% | 57.0 |

## 2. Thống Kê Theo Trọng Tâm & Chiến Lược (`Archetype`)
| Archetype (Focus) | Tuổi TB | Tài sản TB (đ) | Học thức TB | Kết hôn | Khởi nghiệp | Điền sản TB |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| cong_danh_exam (cong_danh) | 59.2 | 7380001 | 92.4 | 65% | 0% | 8.0 |
| gia_dinh_marriage (gia_dinh) | 75.9 | 2376018 | 76.2 | 100% | 0% | 9.0 |
| thuong_buon_venture (lam_them) | 74.4 | 6397374 | 77.4 | 95% | 90% | 11.7 |
| dien_san_gold (can_bang) | 75.5 | 4239741 | 70.5 | 100% | 0% | 11.6 |
| suc_khoe_longevity (suc_khoe) | 76.6 | 385611 | 72.8 | 0% | 0% | 0.1 |
| tu_than_moral (tu_than) | 49.7 | 2062266 | 71.9 | 0% | 0% | 0.1 |
| so_thich_hobby (so_thich) | 70.2 | 979482 | 77.5 | 85% | 0% | 0.3 |
| nghi_ngoi_chill (nghi_ngoi) | 46.2 | 786889 | 54.8 | 0% | 0% | 0.1 |
| hanh_thien_fame (hanh_thien) | 58.1 | 1973655 | 69.1 | 70% | 0% | 7.6 |
| risk_debt_hardship (lam_them) | 73.0 | 3916653 | 72.2 | 0% | 100% | 0.0 |

## 2b. Thống Kê Theo Giới Tính (`Gender`)
| Giới tính | Số kiếp | Tuổi TB | Tài sản TB (đ) | Quan hàm >0 | Kết hôn |
| :--- | ---: | ---: | ---: | ---: | ---: |
| male | 124 | 67.4 | 3540657 | 20.2% | 53% |
| female | 76 | 63.4 | 2248847 | 9.2% | 49% |

## 3. Tần Suất Quyết Định & Nguyên Nhân Tử Vong
- **Decision Hits:** `{"dec_college_18":172,"dec_job_offers":133,"dec_official_promote":209,"dec_retire_60":163,"dec_biz_offers":38,"dec_official_appoint":49,"dec_loan_heavy":8,"dec_rankup":2}`
- **Top Nguyên nhân kết thúc:** Tuổi cao sức yếu, an nhiên qua đời (82) · Sức khỏe suy kiệt qua đời (51) · Sống qua 80 tuổi (43) · Chết đói vì hết lương thực và tiền bạc (14) · Bị xử trảm vì tội Khi quân (Nữ cải nam trang bại lộ) (10)

## 4. Độ Phủ Sự Kiện
- **Top 12 sự kiện nổ nhiều nhất:** `evt_jianghu_river_convoy_storm` (493), `evt_estate_tenant_revolt_mediation` (454), `evt_physician_noble_poison` (349), `evt_physician_plague_outbreak` (314), `evt_hermit_mountain_retreat` (269), `evt_wealth_sponsor_academy` (205), `evt_biz_caravan_venture` (195), `evt_wealth_imperial_relief_fund` (192), `evt_wealth_royal_contribution_title` (148), `evt_adult_martial_bandit_ambush` (136), `evt_physician_imperial_summons` (134), `evt_biz_apothecary_rare_herb` (125)
- **Dead Major Events (0% sau 200 kiếp — 6/187):** `evt_female_royal_title_grant`, `evt_official_faction_scholar_support`, `evt_adult_hoang_toc_border_pacification`, `evt_adult_hoang_toc_famine_imperial_edict`, `evt_adult_hoang_toc_teen_palace_library`, `evt_adult_hoang_toc_teen_royal_hunt`

## 5. Các Ca Mẫu & Bất Thường (Outliers để Agent Soi Mạch Truyện)
### Chết sớm nhất #1: `quan_lai` / `cong_danh_exam` (seed=6586, tuổi=13, tiền=2đ, quan hàm=0, lý do="Chết đói vì hết lương thực và tiền bạc")

### Chết sớm nhất #2: `quan_lai` / `cong_danh_exam` (seed=6599, tuổi=13, tiền=2đ, quan hàm=0, lý do="Chết đói vì hết lương thực và tiền bạc")

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

### Thọ nhất #1: `thu_cong` / `hanh_thien_fame` (seed=5975, tuổi=80, tiền=3559894đ, quan hàm=0, lý do="Sống qua 80 tuổi")
- [Tuổi 14] evt_tier_binh_dan_seasonal_fair (Hội Vật & Phiên Chợ Đầu Xuân) -> #1
- [Tuổi 16] evt_biz_caravan_venture (Cơ Hội Chung Vốn Buôn Chuyến Liên Trấn) -> #0
- [Tuổi 17] evt_adult_exp_thu_cong_guild (Lập Phường Hội Thợ Nghề) -> #2
- [Tuổi 18] evt_adult_martial_bandit_ambush (Thảo Khấu Chặn Đường) -> #1
- [Tuổi 18] dec_college_18 (Ngã rẽ tuổi 18: Nhập học Quốc Tử Giám hay Ra đời lập nghiệp?) -> #0
- [Tuổi 19] evt_chain_ra_o_rieng_1 (Thưa Chuyện Ra Ở Riêng) -> #0
- [Tuổi 19] evt_chain_ra_o_rieng_2 (Ngày Dựng Mái Nhà Riêng) -> #1
- [Tuổi 19] evt_chain_ra_o_rieng_3 (Anh Chị Em Ghé Thăm Nhà Mới) -> #0
- [Tuổi 21] evt_scholar_poor_copy_books (Chép Sách Thuê & Dạy Trẻ Đầu Làng) -> #0
- [Tuổi 22] evt_biz_scribe_secret_letter (Lá Thư Nhờ Viết Hộ Đầy Bí Ẩn) -> #1
- [Tuổi 23] dec_job_offers (Tìm kiếm sinh kế: 3 lời mời việc làm phù hợp) -> #0
- [Tuổi 23] evt_scholar_poor_mentor (Thầy Đồ Già Nhận Làm Môn Sinh) -> #1
- [Tuổi 24] evt_adult_corrupt_official_bribe (Quan Phủ Vòi Tiền Bảo Kê) -> #0
- [Tuổi 25] evt_biz_apothecary_rare_herb (Khách Quý Tìm Mua Vị Thuốc Hiếm) -> #1
- ... *(còn 48 sự kiện nữa)*

### Mẫu Gia đình: `ban_nong` / `gia_dinh_marriage` (seed=5065, tuổi=80, tiền=3540730đ, quan hàm=0, lý do="Sống qua 80 tuổi")
- [Tuổi 14] evt_tier_binh_dan_seasonal_fair (Hội Vật & Phiên Chợ Đầu Xuân) -> #1
- [Tuổi 15] evt_adult_burnout_melancholy (Lòng Ngổn Ngang Trăm Mối) -> #1
- [Tuổi 16] evt_chain_ra_o_rieng_1 (Thưa Chuyện Ra Ở Riêng) -> #0
- [Tuổi 16] evt_chain_ra_o_rieng_2 (Ngày Dựng Mái Nhà Riêng) -> #2
- [Tuổi 17] evt_youth_family_father_injury_common (Phụ Thân Gặp Nạn Khi Mưu Sinh) -> #1
- [Tuổi 18] dec_college_18 (Ngã rẽ tuổi 18: Nhập học Quốc Tử Giám hay Ra đời lập nghiệp?) -> #1
- [Tuổi 18] evt_romance_lantern_festival (Đêm Hội Hoa Đăng Gặp Người Tri Kỷ) -> #1
- [Tuổi 20] evt_biz_property_tenant_crisis (Khách Thuê & Tá Điền Khất Nợ Giữa Mùa Khó) -> #0
- [Tuổi 21] evt_chain_len_kinh_1 (Khăn Gói Lên Kinh Thành) -> #2
- [Tuổi 21] evt_chain_len_kinh_2 (Những Ngày Đầu Nơi Kinh Kỳ) -> #1
- [Tuổi 21] evt_chain_len_kinh_3 (Ánh Mắt Của Quý Nhân Nơi Phồn Hoa) -> #1
- [Tuổi 23] dec_job_offers (Tìm kiếm sinh kế: 3 lời mời việc làm phù hợp) -> #0
- [Tuổi 23] evt_tier_binh_dan_seasonal_fair (Hội Vật & Phiên Chợ Đầu Xuân) -> #0
- [Tuổi 24] evt_adult_exp_world_plague_herb_relief (Khan Hiếm Dược Liệu Giữa Cơn Dịch) -> #1
- ... *(còn 51 sự kiện nữa)*

### Mẫu Thương buôn: `ban_nong` / `thuong_buon_venture` (seed=5117, tuổi=80, tiền=6186065đ, quan hàm=0, lý do="Sống qua 80 tuổi")
- [Tuổi 14] evt_youth_family_father_injury_common (Phụ Thân Gặp Nạn Khi Mưu Sinh) -> #1
- [Tuổi 15] evt_youth_family_sibling_crisis_common (Anh Chị Em Gặp Khó Nơi Xứ Người) -> #0
- [Tuổi 16] evt_chain_ra_o_rieng_1 (Thưa Chuyện Ra Ở Riêng) -> #1
- [Tuổi 17] evt_ban_nong_land_reclaim (Khai Khẩn Đất Hoang Ven Bãi Bồi) -> #1
- [Tuổi 18] evt_chain_len_kinh_1 (Khăn Gói Lên Kinh Thành) -> #2
- [Tuổi 18] evt_chain_len_kinh_2 (Những Ngày Đầu Nơi Kinh Kỳ) -> #1
- [Tuổi 18] dec_college_18 (Ngã rẽ tuổi 18: Học Y dược · Thương toán hay Ra đời tự lập?) -> #1
- [Tuổi 18] evt_chain_len_kinh_3 (Ánh Mắt Của Quý Nhân Nơi Phồn Hoa) -> #1
- [Tuổi 19] evt_scholar_poor_copy_books (Chép Sách Thuê & Dạy Trẻ Đầu Làng) -> #1
- [Tuổi 22] evt_chain_bao_hieu_me_1 (Mẫu Thân Đổ Bệnh Giữa Đêm Gió Lạnh) -> #2
- [Tuổi 22] evt_chain_bao_hieu_me_2_nguy (Ánh Đèn Khuya Bên Giường Mẹ) -> #1
- [Tuổi 23] dec_job_offers (Tìm kiếm sinh kế: 3 lời mời việc làm phù hợp) -> #0
- [Tuổi 23] dec_biz_offers (Cơ hội lập nghiệp: 3 mô hình kinh doanh khả thi) -> #0
- [Tuổi 24] evt_scholar_poor_village_fund (Quỹ Nghĩa Học Của Làng Xã) -> #0
- ... *(còn 47 sự kiện nữa)*

### Mẫu Công danh: `ban_nong` / `cong_danh_exam` (seed=5026, tuổi=80, tiền=14982277đ, quan hàm=5, lý do="Sống qua 80 tuổi")
- [Tuổi 14] evt_scholar_poor_copy_books (Chép Sách Thuê & Dạy Trẻ Đầu Làng) -> #0
- [Tuổi 15] evt_biz_scribe_secret_letter (Lá Thư Nhờ Viết Hộ Đầy Bí Ẩn) -> #0
- [Tuổi 16] evt_youth_family_father_injury_common (Phụ Thân Gặp Nạn Khi Mưu Sinh) -> #0
- [Tuổi 17] evt_adult_reunion_best_friend (Tái Ngộ Bạn Nối Khố Năm Xưa) -> #0
- [Tuổi 18] dec_college_18 (Ngã rẽ tuổi 18: Nhập học Quốc Tử Giám hay Ra đời lập nghiệp?) -> #0
- [Tuổi 19] evt_scholar_local_exam_temptation (Cám Dỗ Mua Đề Trước Trường Thi) -> #0
- [Tuổi 20] evt_scholar_poor_exam_fail (Lỡ Hẹn Bảng Vàng Khoa Đầu) -> #0
- [Tuổi 21] evt_scholar_poor_matchmaker (Phú Hộ Kén Dâu Rể Hiếu Học) -> #1
- [Tuổi 22] evt_ban_nong_land_reclaim (Khai Khẩn Đất Hoang Ven Bãi Bồi) -> #0
- [Tuổi 23] dec_job_offers (Tìm kiếm sinh kế: 3 lời mời việc làm phù hợp) -> #0
- [Tuổi 23] evt_chain_bao_hieu_me_1 (Mẫu Thân Đổ Bệnh Giữa Đêm Gió Lạnh) -> #0
- [Tuổi 23] evt_chain_bao_hieu_me_2_tot (Mẫu Thân Bình Phục An Khang) -> #0
- [Tuổi 25] dec_official_promote (Thăng tiến quan trường: Đề bạt chức Tuần phủ) -> #0
- [Tuổi 25] evt_physician_plague_outbreak (Dịch Khí Hoành Hành, Mở Quán Phát Thuốc) -> #0
- ... *(còn 54 sự kiện nữa)*
