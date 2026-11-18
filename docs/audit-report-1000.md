# Báo Cáo Kiểm Định 1.000 Cuộc Đời (Monte Carlo + Narrative Audit)

- **Tổng số kiếp:** 200 (5 Xuất thân × 10 Archetype | Thời gian chạy song song: 29.8s)
- **Tuổi thọ trung bình:** 67.4 tuổi | **Tử vong sớm (<20 tuổi):** 20/200 (10.0%)
- **Lỗi logic/NaN phát hiện:** 0

## 1. Thống Kê Theo Xuất Thân (`OriginClass`)
| Xuất thân | Tuổi TB | Tài sản TB (đ) | Học thức TB | Thanh danh TB | Quan hàm >0 | Triggers/kiếp |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| ban_nong | 60.4 | 4859516 | 73.3 | 1323.7 | 5.0% | 81.0 |
| dia_chu | 69.3 | 6767068 | 91.9 | 2080.0 | 15.0% | 101.0 |
| hoang_toc | 72.8 | 6425742 | 88.0 | 2152.5 | 20.0% | 113.7 |
| quan_lai | 64.9 | 6813838 | 90.5 | 1915.9 | 17.5% | 90.9 |
| thu_cong | 69.4 | 5614628 | 78.5 | 1548.4 | 7.5% | 100.3 |

## 2. Thống Kê Theo Trọng Tâm & Chiến Lược (`Archetype`)
| Archetype (Focus) | Tuổi TB | Tài sản TB (đ) | Học thức TB | Kết hôn | Khởi nghiệp | Điền sản TB |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| cong_danh_exam (cong_danh) | 50.5 | 7261643 | 92.4 | 50% | 0% | 6.3 |
| gia_dinh_marriage (gia_dinh) | 73.7 | 9190535 | 89.5 | 95% | 0% | 11.0 |
| thuong_buon_venture (lam_them) | 74.0 | 14299388 | 85.8 | 100% | 90% | 11.7 |
| dien_san_gold (can_bang) | 72.2 | 11167990 | 87.8 | 100% | 0% | 11.6 |
| suc_khoe_longevity (suc_khoe) | 76.0 | 633041 | 91.2 | 0% | 0% | 0.1 |
| tu_than_moral (tu_than) | 51.3 | 1897194 | 71.8 | 0% | 0% | 0.2 |
| so_thich_hobby (so_thich) | 71.5 | 1600104 | 89.4 | 90% | 0% | 0.2 |
| nghi_ngoi_chill (nghi_ngoi) | 59.9 | 1166471 | 71.7 | 0% | 0% | 0.1 |
| hanh_thien_fame (hanh_thien) | 71.6 | 9246436 | 85.8 | 100% | 0% | 10.7 |
| risk_debt_hardship (lam_them) | 73.2 | 4498783 | 79.2 | 0% | 100% | 0.0 |

## 3. Tần Suất Quyết Định & Nguyên Nhân Tử Vong
- **Decision Hits:** `{"dec_college_18":153,"dec_retire_60":167,"dec_job_offers":110,"dec_official_promote":437,"dec_biz_offers":38,"dec_official_appoint":67,"dec_loan_heavy":24}`
- **Top Nguyên nhân kết thúc:** Sức khỏe suy kiệt qua đời (78) · Tuổi cao sức yếu, an nhiên qua đời (76) · Sống qua 80 tuổi (46)

## 4. Độ Phủ Sự Kiện
- **Top 12 sự kiện nổ nhiều nhất:** `evt_wealth_sponsor_academy` (564), `evt_biz_caravan_venture` (505), `evt_wealth_imperial_relief_fund` (498), `evt_wealth_royal_contribution_title` (428), `evt_family_clan_dispute` (407), `evt_adult_martial_bandit_ambush` (399), `evt_biz_apothecary_rare_herb` (395), `evt_biz_craft_guild_order` (385), `evt_biz_supply_contract` (376), `evt_adult_major_noble_patron` (373), `evt_adult_infamy_bounty` (357), `evt_biz_property_tenant_crisis` (319)
- **Dead Major Events (0% sau 200 kiếp — 1/165):** `evt_adult_hoang_toc_teen_royal_hunt`

## 5. Các Ca Mẫu & Bất Thường (Outliers để Agent Soi Mạch Truyện)
### Chết sớm nhất #1: `quan_lai` / `cong_danh_exam` (seed=6586, tuổi=13, tiền=2đ, quan hàm=0, lý do="Sức khỏe suy kiệt qua đời")

### Chết sớm nhất #2: `quan_lai` / `cong_danh_exam` (seed=6599, tuổi=13, tiền=2đ, quan hàm=0, lý do="Sức khỏe suy kiệt qua đời")

### Giàu nhất #1: `quan_lai` / `thuong_buon_venture` (seed=6690, tuổi=80, tiền=19017046đ, quan hàm=0, lý do="Sống qua 80 tuổi")
- [Tuổi 15] evt_youth_family_sibling_court_rivalry (Sóng Gió Huynh Đệ Nơi Phủ Đệ) -> #0
- [Tuổi 15] evt_scholar_rich_poetry_club (Hội Văn Thơ Tao Nhân Chốn Kinh Kỳ) -> #0
- [Tuổi 17] evt_adult_major_noble_patron (Gặp Quý Nhân Giữa Chợ Phiên) -> #0
- [Tuổi 18] evt_scholar_rich_temptation (Bạn Giàu Rủ Rê Tửu Sắc & Trường Bạc) -> #1
- [Tuổi 18] dec_college_18 (Ngã rẽ tuổi 18: Nhập học Quốc Tử Giám hay Ra đời lập nghiệp?) -> #1
- [Tuổi 19] evt_adult_quan_lai_tap_am (Đặc Ân Tập Ấm Nơi Nha Môn) -> #1
- [Tuổi 20] evt_scholar_rich_backdoor (Lời Mời Chạy Cửa Sau Mua Danh) -> #0
- [Tuổi 20] dec_official_appoint (Triều đình bổ nhiệm: Nhậm chức Tri huyện) -> #0
- [Tuổi 20] evt_adult_court_faction_purge (Sóng Gió Phe Cánh Triều Đình) -> #0
- [Tuổi 21] evt_adult_family_sibling_wedding (Hỷ Sự Của Anh Chị Em Trong Nhà) -> #1
- [Tuổi 21] dec_official_promote (Thăng tiến quan trường: Đề bạt chức Tri phủ) -> #0
- [Tuổi 21] evt_official_bribe_or_justice (Án Oan Nơi Công Đường & Bạc Đút Lót) -> #0
- [Tuổi 22] evt_official_faction_choice (Ngã Rẽ Phe Phái Nơi Triều Đường) -> #0
- [Tuổi 22] evt_official_clean_censor_praise (Ngự Sử Tấu Trình Khen Ngợi Thanh Liêm) -> #0
- ... *(còn 108 sự kiện nữa)*

### Nợ nặng nhất #1: `dia_chu` / `nghi_ngoi_chill` (seed=6430, tuổi=25, tiền=-1123đ, quan hàm=3, lý do="Sức khỏe suy kiệt qua đời")
- [Tuổi 14] evt_biz_tea_cart_rumor (Khách Quán Nước Đồn Chuyện Lạ) -> #0
- [Tuổi 16] evt_military_enlist (Đầu Quân Nhập Ngũ Lập Công Danh) -> #2
- [Tuổi 16] evt_chain_ra_o_rieng_1 (Thưa Chuyện Ra Ở Riêng) -> #1
- [Tuổi 17] evt_adult_exp_dia_chu_bribe_corvee (Chạy Chọt Miễn Sưu Dịch Cho Điền Trang) -> #2
- [Tuổi 17] evt_scholar_local_exam_temptation (Cám Dỗ Mua Đề Trước Trường Thi) -> #1
- [Tuổi 18] evt_chain_len_kinh_1 (Khăn Gói Lên Kinh Thành) -> #1
- [Tuổi 18] evt_debt_desperate_indenture (Chủ Nợ Xiết Nhà — Cầm Thân Hay Bỏ Xứ) -> #0
- [Tuổi 18] evt_chain_len_kinh_2 (Những Ngày Đầu Nơi Kinh Kỳ) -> #0
- [Tuổi 18] evt_chain_len_kinh_3 (Ánh Mắt Của Quý Nhân Nơi Phồn Hoa) -> #0
- [Tuổi 19] evt_adult_burnout_melancholy (Lòng Ngổn Ngang Trăm Mối) -> #1
- [Tuổi 19] evt_adult_major_noble_patron (Gặp Quý Nhân Giữa Chợ Phiên) -> #0
- [Tuổi 20] evt_servitude_secret_ledger (Phát Hiện Sổ Sách Gian Lận Trong Phủ Chủ) -> #1
- [Tuổi 20] dec_official_appoint (Triều đình bổ nhiệm: Nhậm chức Tri huyện) -> #0
- [Tuổi 20] evt_adult_exp_dia_chu_tenant_rent (Tá Điền Kéo Đến Xin Khất Tô) -> #2
- ... *(còn 13 sự kiện nữa)*

### Thọ nhất #1: `thu_cong` / `suc_khoe_longevity` (seed=5754, tuổi=80, tiền=530904đ, quan hàm=0, lý do="Sống qua 80 tuổi")
- [Tuổi 14] evt_biz_tea_cart_rumor (Khách Quán Nước Đồn Chuyện Lạ) -> #1
- [Tuổi 14] evt_youth_family_father_injury_common (Phụ Thân Gặp Nạn Khi Mưu Sinh) -> #0
- [Tuổi 16] evt_adult_exp_world_famine_rice (Nạn Đói Hoành Hành, Giá Gạo Tăng Vọt) -> #1
- [Tuổi 16] evt_chain_ra_o_rieng_1 (Thưa Chuyện Ra Ở Riêng) -> #1
- [Tuổi 17] evt_chain_len_kinh_1 (Khăn Gói Lên Kinh Thành) -> #3
- [Tuổi 17] evt_adult_reunion_best_friend (Tái Ngộ Bạn Nối Khố Năm Xưa) -> #0
- [Tuổi 18] dec_college_18 (Ngã rẽ tuổi 18: Nhập học Quốc Tử Giám hay Ra đời lập nghiệp?) -> #2
- [Tuổi 18] evt_adult_exp_thu_cong_guild (Lập Phường Hội Thợ Nghề) -> #1
- [Tuổi 18] evt_adult_exp_thu_cong_workshop_fire (Hỏa Hoạn Tại Xưởng Nghề) -> #1
- [Tuổi 19] evt_biz_caravan_venture (Cơ Hội Chung Vốn Buôn Chuyến Liên Trấn) -> #0
- [Tuổi 20] evt_tier_trung_luu_guild_banquet (Tiệc Trà Hội Thương & Giới Sĩ Phu) -> #1
- [Tuổi 20] evt_adult_exp_thu_cong_merchant_order (Thương Nhân Phương Xa Đặt Lô Hàng Lớn) -> #1
- [Tuổi 21] evt_adult_exp_thu_cong_magistrate_repair (Lên Phủ Huyện Sửa Đồ Quý Cho Quan Lớn) -> #0
- [Tuổi 21] evt_fate_brothel_or_bodyguard (Ánh Đèn Thanh Lâu & Bến Bãi Giang Hồ) -> #2
- ... *(còn 90 sự kiện nữa)*

### Mẫu Gia đình: `ban_nong` / `gia_dinh_marriage` (seed=5065, tuổi=74, tiền=7950339đ, quan hàm=0, lý do="Tuổi cao sức yếu, an nhiên qua đời")
- [Tuổi 14] evt_tier_binh_dan_seasonal_fair (Hội Vật & Phiên Chợ Đầu Xuân) -> #1
- [Tuổi 14] evt_youth_family_father_injury_common (Phụ Thân Gặp Nạn Khi Mưu Sinh) -> #1
- [Tuổi 15] evt_world_bumper_harvest_edict (Chiếu Khuyến Nông & Hội Chợ Thái Bình) -> #2
- [Tuổi 15] evt_adult_martial_bandit_ambush (Thảo Khấu Chặn Đường) -> #0
- [Tuổi 16] evt_chain_len_kinh_1 (Khăn Gói Lên Kinh Thành) -> #0
- [Tuổi 16] evt_chain_len_kinh_2 (Những Ngày Đầu Nơi Kinh Kỳ) -> #1
- [Tuổi 16] evt_chain_len_kinh_3 (Ánh Mắt Của Quý Nhân Nơi Phồn Hoa) -> #1
- [Tuổi 18] dec_college_18 (Ngã rẽ tuổi 18: Nhập học Quốc Tử Giám hay Ra đời lập nghiệp?) -> #1
- [Tuổi 18] evt_military_enlist (Đầu Quân Nhập Ngũ Lập Công Danh) -> #1
- [Tuổi 19] evt_biz_property_tenant_crisis (Khách Thuê & Tá Điền Khất Nợ Giữa Mùa Khó) -> #2
- [Tuổi 19] evt_martial_border_campaign (Xuất Chinh Bình Định Giặc Biên Ải) -> #1
- [Tuổi 20] evt_martial_supply_sabotage (Đêm Tập Kích Kho Lương Quân Địch) -> #0
- [Tuổi 20] evt_ban_nong_land_reclaim (Khai Khẩn Đất Hoang Ven Bãi Bồi) -> #0
- [Tuổi 21] evt_chain_ra_o_rieng_1 (Thưa Chuyện Ra Ở Riêng) -> #1
- ... *(còn 96 sự kiện nữa)*

### Mẫu Thương buôn: `ban_nong` / `thuong_buon_venture` (seed=5117, tuổi=56, tiền=8657879đ, quan hàm=0, lý do="Tuổi cao sức yếu, an nhiên qua đời")
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
- [Tuổi 19] evt_biz_apothecary_rare_herb (Khách Quý Tìm Mua Vị Thuốc Hiếm) -> #1
- [Tuổi 19] evt_chain_ra_o_rieng_1 (Thưa Chuyện Ra Ở Riêng) -> #0
- [Tuổi 19] evt_chain_ra_o_rieng_2 (Ngày Dựng Mái Nhà Riêng) -> #2
- [Tuổi 20] evt_chain_ra_o_rieng_3 (Anh Chị Em Ghé Thăm Nhà Mới) -> #0
- ... *(còn 65 sự kiện nữa)*

### Mẫu Công danh: `dia_chu` / `cong_danh_exam` (seed=6053, tuổi=80, tiền=16095267đ, quan hàm=5, lý do="Sống qua 80 tuổi")
- [Tuổi 14] evt_biz_tea_cart_rumor (Khách Quán Nước Đồn Chuyện Lạ) -> #1
- [Tuổi 16] evt_adult_exp_dia_chu_tenant_rent (Tá Điền Kéo Đến Xin Khất Tô) -> #1
- [Tuổi 16] evt_chain_len_kinh_1 (Khăn Gói Lên Kinh Thành) -> #2
- [Tuổi 16] evt_chain_len_kinh_2 (Những Ngày Đầu Nơi Kinh Kỳ) -> #1
- [Tuổi 16] evt_chain_len_kinh_3 (Ánh Mắt Của Quý Nhân Nơi Phồn Hoa) -> #1
- [Tuổi 18] dec_college_18 (Ngã rẽ tuổi 18: Nhập học Quốc Tử Giám hay Ra đời lập nghiệp?) -> #0
- [Tuổi 18] evt_world_bumper_harvest_edict (Chiếu Khuyến Nông & Hội Chợ Thái Bình) -> #1
- [Tuổi 18] evt_adult_reunion_best_friend (Tái Ngộ Bạn Nối Khố Năm Xưa) -> #0
- [Tuổi 19] dec_official_promote (Thăng tiến quan trường: Đề bạt chức Thượng thư) -> #0
- [Tuổi 20] evt_adult_exp_dia_chu_tenant_rent (Tá Điền Kéo Đến Xin Khất Tô) -> #1
- [Tuổi 20] evt_official_intrigue_strike_rival (Nắm Thóp Đối Thủ Tranh Chức) -> #1
- [Tuổi 21] evt_adult_family_sibling_wedding (Hỷ Sự Của Anh Chị Em Trong Nhà) -> #0
- [Tuổi 21] evt_official_clean_refuse_gift (Từ Chối Lễ Vật Của Hào Cường Địa Phương) -> #1
- [Tuổi 22] evt_scholar_rich_patron_poor (Gặp Sĩ Tử Nghèo Hết Tiền Lộ Phí) -> #0
- ... *(còn 108 sự kiện nữa)*
