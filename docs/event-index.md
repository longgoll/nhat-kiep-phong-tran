# Event & Flag Index (Auto-Generated)

> File tự động sinh bởi `npm run gen:index` (`scripts/gen-event-index.mjs`). AI đọc file này để tra cứu toàn bộ ID, file, cờ (`flags`) và tránh đọc hàng chục file JSON lớn.

- **Tổng số file:** 53 | **Tổng số sự kiện:** 268 | **Tổng số flags:** 81

## 1. Từ Điển Flags Đang Hoạt Động
| Flag | Được gắn/gỡ bởi | Được kiểm tra bởi (samples) |
| :--- | :--- | :--- |
| `bang_nhan` | *(engine/init)* | evt_scholar_vinh_quy_bai_to(has_any_flag) |
| `bao_ke_giang_ho` | evt_fate_brothel_or_bodyguard, evt_fate_bodyguard_crossroads(-remove) | evt_fate_brothel_or_bodyguard(missing_flags), evt_fate_bodyguard_crossroads(has_flags) |
| `bi_ep_lam_gia_no` | evt_servitude_opportunity(-remove), evt_debt_collection_01, evt_debt_servitude_end(-remove) | evt_chain_len_kinh_1(missing_flags), evt_chain_ra_o_rieng_1(missing_flags), evt_servitude_opportunity(has_any_flag), evt_military_enlist(missing_flags) |
| `bo_tron_o_do` | evt_child_odo_run_away | — |
| `career_bao_tieu` | *(engine/init)* | evt_career_martial_incident(has_any_flag) |
| `career_chao_hang` | *(engine/init)* | evt_career_trade_temptation(has_any_flag), evt_career_crisis_hardship(has_any_flag) |
| `career_chuong_quy` | *(engine/init)* | evt_career_trade_temptation(has_any_flag) |
| `career_phu_ban_hang` | *(engine/init)* | evt_career_trade_temptation(has_any_flag), evt_career_crisis_hardship(has_any_flag) |
| `career_thay_do` | *(engine/init)* | evt_career_scholar_patron(has_any_flag) |
| `career_thay_lang` | *(engine/init)* | evt_career_scholar_patron(has_any_flag) |
| `career_tho_ca` | *(engine/init)* | evt_career_martial_incident(has_any_flag) |
| `career_tho_phu` | *(engine/init)* | evt_career_martial_incident(has_any_flag), evt_career_crisis_hardship(has_any_flag) |
| `career_thu_lai` | *(engine/init)* | evt_career_trade_temptation(has_any_flag) |
| `career_tuan_dem` | *(engine/init)* | evt_career_martial_incident(has_any_flag), evt_career_crisis_hardship(has_any_flag) |
| `career_vo_su` | *(engine/init)* | evt_career_martial_incident(has_any_flag) |
| `chi_lon_phuc_hung` | evt_child_exp_circ_fall_betrayal, evt_court_succession_betrayal | evt_rebellion_spark(has_any_flag) |
| `co_an_tap_am` | evt_adult_quan_lai_tap_am | — |
| `co_ban_noi_kho` | evt_child_best_friend | evt_adult_reunion_best_friend(has_flags) |
| `co_ban_tri_ky` | evt_child_quan_lai_academy_peer | — |
| `co_luc_luong_rieng` | evt_martial_train_disciples | evt_rebellion_spark(has_any_flag) |
| `co_tai_mat_noi_dinh` | evt_adult_hoang_toc_teen_cold_palace_ally | — |
| `da_co_con` | *(engine/init)* | evt_adult_family_child_education(has_flags), evt_adult_family_child_illness(has_flags), evt_fate_tuyen_tu_palace(missing_flags), evt_fate_eunuch_or_palace_maid(missing_flags) |
| `da_hoi_ra_o_rieng` | evt_chain_ra_o_rieng_1 | evt_chain_ra_o_rieng_1(missing_flags) |
| `da_ket_hon` | *(engine/init)* | evt_adult_family_spouse_hardship(has_flags), evt_life_marriage_harmony(has_flags), evt_adult_quan_lai_marriage_alliance(missing_flags), evt_scholar_poor_matchmaker(missing_flags) |
| `da_khai_phu_hoang_toc` | evt_adult_exp_hoang_toc_title_estate | evt_world_imperial_tax_levy(has_any_flag) |
| `da_khoi_nghia` | evt_rebellion_spark | evt_rebellion_spark(missing_flags), evt_rebellion_recruit_bandits(has_flags), evt_rebellion_decisive_battle(has_flags) |
| `da_len_kinh_thanh` | evt_chain_len_kinh_1 | evt_chain_len_kinh_1(missing_flags), evt_chain_len_kinh_2(has_flags), evt_chain_len_kinh_3(has_flags) |
| `da_nhan_tuoc_vi` | evt_adult_exp_hoang_toc_title_estate | evt_court_succession_crisis(has_any_flag), evt_world_imperial_tax_levy(has_any_flag) |
| `da_ra_o_rieng` | evt_chain_ra_o_rieng_1 | evt_chain_ra_o_rieng_1(missing_flags), evt_chain_ra_o_rieng_2(has_flags), evt_chain_ra_o_rieng_3(has_flags) |
| `dang_lam_quan` | evt_nu_cai_nam_trang_exposed(-remove), evt_life_corrupt_audit(-remove), evt_official_corrupt_censor_raid(-remove), evt_official_retire_gracefully(-remove) | evt_biz_caravan_venture(missing_flags), evt_biz_supply_contract(missing_flags), evt_biz_tea_cart_rumor(missing_flags), evt_biz_scribe_secret_letter(missing_flags) |
| `dang_no_dia_chu` | evt_debt_collection_01(-remove) | evt_debt_collection_01(has_flags) |
| `do_cu_nhan` | *(engine/init)* | evt_military_enlist(missing_flags), evt_scholar_local_exam_temptation(missing_flags), evt_scholar_road_to_capital(has_flags), evt_scholar_poor_exam_fail(missing_flags) |
| `do_tien_si` | *(engine/init)* | evt_military_enlist(missing_flags), evt_scholar_local_exam_temptation(missing_flags), evt_scholar_road_to_capital(missing_flags), evt_scholar_vinh_quy_bai_to(has_any_flag) |
| `do_tu_tai` | *(engine/init)* | evt_military_enlist(missing_flags), evt_adult_major_corvee(missing_flags) |
| `duoc_phu_hoang_chu_y` | evt_child_exp_hoang_toc_cold_palace_encounter | evt_adult_exp_hoang_toc_vindication(has_flags) |
| `duoc_quy_nhan_nang_do` | evt_chain_len_kinh_3 | — |
| `duoc_thay_do_quy` | evt_child_eavesdrop_01, evt_child_odo_study_eavesdrop, evt_scholar_poor_mentor | evt_adult_teacher_gift(has_flags), evt_scholar_poor_mentor(missing_flags) |
| `gia_dinh_bi_chen_ep` | *(engine/init)* | evt_child_exp_thu_cong_extortion(has_flags) |
| `gia_dinh_mac_no` | evt_child_poor_sell_indenture(-remove), evt_adult_family_pay_old_debt(-remove) | evt_child_poor_begging(has_any_flag), evt_child_poor_sell_indenture(has_flags), evt_adult_family_pay_old_debt(has_flags), evt_fate_eunuch_or_palace_maid(has_flags) |
| `gia_phong_thu_huong` | *(engine/init)* | evt_child_exp_dia_chu_strict_tutor(has_flags) |
| `gia_toc_phuc_hung` | evt_chain_phuc_hung_2 | — |
| `gia_toc_sa_sut` | evt_chain_phuc_hung_2(-remove), evt_child_quan_lai_fall | evt_chain_phuc_hung_1(has_any_flag), evt_child_exp_circ_fall_betrayal(has_any_flag), evt_child_family_mother_sick_noble(missing_flags), evt_child_quan_lai_fall(missing_flags) |
| `giu_tin_vat_gia_toc` | evt_chain_phuc_hung_1, evt_chain_phuc_hung_2(-remove) | evt_chain_phuc_hung_2(has_flags) |
| `ket_hon_chi_hon` | evt_adult_exp_hoang_toc_royal_marriage | — |
| `kinh_thanh_buon_ban` | evt_chain_len_kinh_1 | — |
| `kinh_thanh_dau_quan` | evt_chain_len_kinh_1 | — |
| `kinh_thanh_ung_thi` | evt_chain_len_kinh_1 | — |
| `lien_minh_the_gia` | evt_adult_quan_lai_marriage_alliance | — |
| `mau_phi_phuc_sung` | evt_adult_exp_hoang_toc_vindication | — |
| `mo_coi_cha` | evt_chain_bao_hieu_phu_hoang_2_nguy, evt_child_ban_nong_corvee, evt_child_quan_lai_fall | evt_chain_bao_hieu_me_1(has_flags), evt_chain_bao_hieu_phu_hoang_1(missing_flags), evt_child_exp_circ_fatherless(has_flags), evt_child_poor_begging(has_any_flag) |
| `mo_coi_me` | evt_chain_bao_hieu_me_2_nguy, evt_chain_bao_hieu_hoang_toc_2_nguy, evt_family_mother_old_age_passing | — |
| `nghe_ky_thanh_lau` | evt_fate_brothel_or_bodyguard, evt_fate_brothel_redemption(-remove) | evt_fate_brothel_or_bodyguard(missing_flags), evt_fate_brothel_redemption(has_flags) |
| `nho_thu_quan_tham` | evt_child_exp_thu_cong_extortion, evt_scholar_rich_backdoor | — |
| `nu_cai_nam_trang` | evt_nu_cai_nam_trang_exposed(-remove) | evt_nu_cai_nam_trang_exposed(has_flags) |
| `nu_quan_dac_xa` | evt_nu_cai_nam_trang_exposed | — |
| `phe_hoang_tu` | evt_official_faction_choice | evt_court_succession_crisis(has_any_flag), evt_official_faction_choice(missing_flags) |
| `phe_hoang_tu_binh_quyen` | evt_court_succession_crisis | evt_court_succession_victory(has_any_flag) |
| `phe_quyen_than` | evt_official_faction_choice, evt_official_faction_patron_fall(-remove) | evt_official_faction_choice(missing_flags), evt_official_faction_patron_fall(has_flags) |
| `phe_thai_tu_thang_the` | evt_court_succession_crisis | evt_court_succession_victory(has_any_flag) |
| `phe_thanh_luu` | evt_official_faction_choice | evt_official_faction_choice(missing_flags), evt_official_faction_scholar_support(has_flags) |
| `quan_ham_binh_si` | evt_military_enlist, evt_military_promotion_1(-remove), evt_military_retire(-remove) | evt_military_promotion_1(has_flags) |
| `quan_ham_hieu_uy` | evt_military_enlist, evt_military_promotion_1, evt_military_promotion_2(-remove), evt_military_retire(-remove) | evt_military_promotion_2(has_flags), evt_martial_border_campaign(has_any_flag), evt_martial_court_rivalry(has_any_flag) |
| `quan_ham_tuong_quan` | evt_military_promotion_2, evt_military_retire(-remove) | evt_martial_border_campaign(has_any_flag), evt_martial_court_rivalry(has_any_flag) |
| `thai_giam` | evt_fate_eunuch_or_palace_maid | evt_chain_len_kinh_1(missing_flags), evt_chain_ra_o_rieng_1(missing_flags), evt_military_enlist(missing_flags), evt_adult_major_noble_patron(missing_flags) |
| `tham_hoa` | *(engine/init)* | evt_scholar_vinh_quy_bai_to(has_any_flag) |
| `thanh_vien_phuong_tho` | evt_adult_exp_thu_cong_guild | evt_adult_exp_thu_cong_merchant_order(has_any_flag) |
| `that_sung_cung_dinh` | evt_chain_phuc_hung_2(-remove), evt_child_exp_hoang_toc_harem_intrigue, evt_infant_exp_ht_2, evt_adult_exp_hoang_toc_vindication(-remove) | evt_chain_bao_hieu_hoang_toc_1(has_flags), evt_chain_phuc_hung_1(has_any_flag), evt_child_exp_circ_fall_betrayal(has_any_flag), evt_child_family_mother_sick_noble(missing_flags) |
| `theo_phe_chinh_thong` | evt_adult_exp_hoang_toc_succession | — |
| `thien_huong_but_long` | evt_milestone_thoi_noi, evt_milestone_thoi_noi_thu_cong, evt_milestone_thoi_noi_dia_chu, evt_milestone_thoi_noi_quan_lai | evt_child_eavesdrop_01(has_flags) |
| `thien_huong_kiem_go` | evt_milestone_thoi_noi, evt_milestone_thoi_noi_thu_cong, evt_milestone_thoi_noi_dia_chu, evt_milestone_thoi_noi_quan_lai | — |
| `thien_huong_nam_xoi` | evt_milestone_thoi_noi, evt_milestone_thoi_noi_thu_cong, evt_milestone_thoi_noi_dia_chu, evt_milestone_thoi_noi_quan_lai | — |
| `thien_huong_thoi_bac` | evt_milestone_thoi_noi, evt_milestone_thoi_noi_thu_cong, evt_milestone_thoi_noi_dia_chu, evt_milestone_thoi_noi_quan_lai | — |
| `trang_nguyen` | *(engine/init)* | evt_scholar_vinh_quy_bai_to(has_any_flag) |
| `trong_hau_cung` | evt_fate_tuyen_tu_palace, evt_fate_eunuch_or_palace_maid, evt_fate_palace_promotion(-remove) | evt_chain_len_kinh_1(missing_flags), evt_chain_ra_o_rieng_1(missing_flags), evt_biz_tea_cart_rumor(missing_flags), evt_biz_scribe_secret_letter(missing_flags) |
| `trong_quan_ngu` | evt_military_enlist, evt_military_retire(-remove) | evt_military_enlist(missing_flags), evt_military_promotion_1(has_flags), evt_military_promotion_2(has_flags), evt_military_retire(has_flags) |
| `trum_phuong_tho` | evt_adult_exp_thu_cong_guild | evt_adult_exp_thu_cong_merchant_order(has_any_flag) |
| `tu_choi_chi_hon` | evt_adult_exp_hoang_toc_royal_marriage | — |
| `tung_bi_giang_chuc` | evt_official_faction_patron_fall, evt_official_faction_rehabilitate(-remove), evt_official_intrigue_slander | evt_official_faction_rehabilitate(has_flags), evt_rebellion_spark(has_any_flag) |
| `tung_di_an_xin` | evt_child_poor_begging | — |
| `tung_o_do` | evt_child_poor_sell_indenture, evt_child_odo_redeem_freedom(-remove), evt_child_odo_run_away(-remove) | evt_child_exp_circ_youngest_pampered(missing_flags), evt_child_poor_begging(missing_flags), evt_child_poor_sell_indenture(missing_flags), evt_child_village_festival(missing_flags) |
| `xuat_than_o_do` | evt_child_odo_redeem_freedom, evt_child_odo_run_away | evt_servitude_opportunity(has_any_flag) |

## 2. Danh Sách Sự Kiện Theo Thư Mục
| ID | Tiêu đề | Stage | Severity | Cooldown | Origin | File |
| :--- | :--- | :--- | :--- | ---: | :--- | :--- |
| `evt_chain_bao_hieu_1` | Phụ Thân Lâm Trọng Bệnh | adulthood | major (1x) | 99999 | ban_nong, thu_cong, dia_chu, quan_lai | `chains/arc_bao_hieu_cha_me.json` |
| `evt_chain_bao_hieu_2_tot` | Danh Y Diệu Thủ Hồi Xuân | adulthood | major | 0 | all | `chains/arc_bao_hieu_cha_me.json` |
| `evt_chain_bao_hieu_2_nguy` | Bệnh Tình Trở Nặng Lúc Canh Khuya | adulthood | major | 0 | all | `chains/arc_bao_hieu_cha_me.json` |
| `evt_chain_bao_hieu_me_1` | Mẫu Thân Đổ Bệnh Giữa Đêm Gió Lạnh | adulthood | major (1x) | 99999 | ban_nong, thu_cong, dia_chu, quan_lai | `chains/arc_bao_hieu_cha_me.json` |
| `evt_chain_bao_hieu_me_2_tot` | Mẫu Thân Bình Phục An Khang | adulthood | major | 0 | all | `chains/arc_bao_hieu_cha_me.json` |
| `evt_chain_bao_hieu_me_2_nguy` | Ánh Đèn Khuya Bên Giường Mẹ | adulthood | major | 0 | all | `chains/arc_bao_hieu_cha_me.json` |
| `evt_chain_bao_hieu_hoang_toc_1` | Mẫu Thân Lâm Trọng Bệnh Nơi Cung Cấm | adulthood | major (1x) | 99999 | hoang_toc | `chains/arc_bao_hieu_cha_me.json` |
| `evt_chain_bao_hieu_hoang_toc_2_tot` | Thái Y Diệu Thủ, Cung Đình An Thái | adulthood | major | 0 | hoang_toc | `chains/arc_bao_hieu_cha_me.json` |
| `evt_chain_bao_hieu_hoang_toc_2_nguy` | Đèn Lồng Trắng Trước Cửa Cung | adulthood | major | 0 | hoang_toc | `chains/arc_bao_hieu_cha_me.json` |
| `evt_chain_bao_hieu_phu_hoang_1` | Long Thể Bệ Hạ Khiếm An | adulthood | major (1x) | 99999 | hoang_toc | `chains/arc_bao_hieu_cha_me.json` |
| `evt_chain_bao_hieu_phu_hoang_2_tot` | Thánh Thể Khang An, Triều Đình Khánh Hạ | adulthood | major | 0 | hoang_toc | `chains/arc_bao_hieu_cha_me.json` |
| `evt_chain_bao_hieu_phu_hoang_2_nguy` | Chuông Đêm Vang Vọng Điện Càn Thanh | adulthood | major | 0 | hoang_toc | `chains/arc_bao_hieu_cha_me.json` |
| `evt_chain_len_kinh_1` | Khăn Gói Lên Kinh Thành | adulthood | major (1x) | 99999 | ban_nong, thu_cong, dia_chu | `chains/arc_len_kinh_thanh.json` |
| `evt_chain_len_kinh_2` | Những Ngày Đầu Nơi Kinh Kỳ | adulthood | major | 0 | all | `chains/arc_len_kinh_thanh.json` |
| `evt_chain_len_kinh_3` | Ánh Mắt Của Quý Nhân Nơi Phồn Hoa | adulthood | major | 0 | all | `chains/arc_len_kinh_thanh.json` |
| `evt_chain_phuc_hung_1` | Di Thư Và Tín Vật Trong Rương Cũ | adulthood | major (1x) | 99999 | all | `chains/arc_phuc_hung_gia_toc.json` |
| `evt_chain_phuc_hung_2` | Cố Nhân Tương Phùng, Cơ Đồ Tái Khởi | adulthood | major | 0 | all | `chains/arc_phuc_hung_gia_toc.json` |
| `evt_chain_ra_o_rieng_1` | Thưa Chuyện Ra Ở Riêng | adulthood | major (1x) | 99999 | ban_nong, thu_cong, dia_chu | `chains/arc_ra_o_rieng.json` |
| `evt_chain_ra_o_rieng_2` | Ngày Dựng Mái Nhà Riêng | adulthood | major | 0 | all | `chains/arc_ra_o_rieng.json` |
| `evt_chain_ra_o_rieng_3` | Anh Chị Em Ghé Thăm Nhà Mới | adulthood | major | 0 | all | `chains/arc_ra_o_rieng.json` |
| `evt_child_exp_circ_eldest_burden` | Trọng Trách Phận Con Cả | childhood | major (1x) | 99999 | all | `dong_au/circ_gia_dinh.json` |
| `evt_child_exp_circ_youngest_pampered` | Phận Con Út Được Cưng Chiều | childhood | major (1x) | 99999 | all | `dong_au/circ_gia_dinh.json` |
| `evt_child_exp_circ_fatherless` | Sóng Gió Dưới Mái Nhà Thiếu Bóng Cha | childhood | major (1x) | 99999 | ban_nong, thu_cong, dia_chu, quan_lai | `dong_au/circ_gia_dinh.json` |
| `evt_child_exp_circ_fall_betrayal` | Thế Thái Nhân Tình Lúc Gia Đạo Sa Sút | childhood | major (1x) | 99999 | all | `dong_au/circ_gia_dinh.json` |
| `evt_child_poor_begging` | Nhà Hết Gạo, Theo Gia Đình Đi Xin Ăn | childhood | major (1x) | 99999 | ban_nong, thu_cong | `dong_au/circ_gia_dinh.json` |
| `evt_child_poor_sell_indenture` | Chủ Nợ Ép Cửa, Nguy Cơ Bán Con Trừ Nợ | childhood | major (1x) | 99999 | ban_nong, thu_cong, dia_chu | `dong_au/circ_gia_dinh.json` |
| `evt_child_village_festival` | Hội Làng Đầu Xuân | childhood | major | 1440 | ban_nong, thu_cong, dia_chu | `dong_au/common.json` |
| `evt_child_best_friend` | Lời Hẹn Dưới Gốc Đa Đầu Làng | childhood | major (1x) | 99999 | ban_nong, thu_cong, dia_chu | `dong_au/common.json` |
| `evt_child_sibling_bond` | Chuyện Riêng Với Anh Chị Em Trong Nhà | childhood | major (1x) | 99999 | all | `dong_au/common.json` |
| `evt_child_female_ambition` | Định Kiến "Nữ Nhi Ngoại Tộc" | childhood | major (1x) | 99999 | all | `dong_au/common.json` |
| `evt_child_low_health_crisis` | Sức Khỏe Suy Nhược | childhood | major | 1080 | all | `dong_au/common.json` |
| `evt_child_low_happiness_rebel` | Nỗi Uất Ức Tuổi Thơ | childhood | major | 1080 | ban_nong, thu_cong, dia_chu | `dong_au/common.json` |
| `evt_child_low_happiness_rebel_cung_dinh` | Nỗi Ngột Ngạt Chốn Phủ Đệ | childhood | major | 1080 | quan_lai, hoang_toc | `dong_au/common.json` |
| `evt_child_craft_discovery` | Thạo Việc Nhà Nghề | childhood | minor | 720 | all | `dong_au/common.json` |
| `evt_child_family_mother_sick_poor` | Mẹ Gục Ngã Bên Bếp Lửa | childhood | major (1x) | 99999 | ban_nong, thu_cong | `dong_au/family_events.json` |
| `evt_child_family_mother_sick_noble` | Mẫu Thân Khiếm An | childhood | major (1x) | 99999 | dia_chu, quan_lai, hoang_toc | `dong_au/family_events.json` |
| `evt_child_family_sibling_illness` | Anh Chị Em Đổ Bệnh Mùa Trở Trời | childhood | major (1x) | 99999 | all | `dong_au/family_events.json` |
| `evt_child_family_father_sick_common` | Cha Đổ Bệnh Sốt Rét Sau Mùa Gặt | childhood | major (1x) | 99999 | ban_nong, thu_cong | `dong_au/family_events.json` |
| `evt_feed_child_kite` | Thả diều sáo trên đê | childhood | minor | 300 | all | `dong_au/minor_life_feed.json` |
| `evt_feed_child_ink_grind` | Mài mực giúp thầy đồ | childhood | minor | 300 | all | `dong_au/minor_life_feed.json` |
| `evt_feed_child_grandma_tale` | Nghe chuyện cổ tích bên bếp lửa | childhood | minor | 360 | all | `dong_au/minor_life_feed.json` |
| `evt_feed_child_wooden_sword` | Đẽo kiếm gỗ tập trận giả | childhood | minor | 300 | all | `dong_au/minor_life_feed.json` |
| `evt_feed_child_help_kitchen` | Phụ mẹ nhóm bếp thổi cơm | childhood | minor | 270 | all | `dong_au/minor_life_feed.json` |
| `evt_feed_child_lantern_festival` | Đêm rước đèn Trung Thu | childhood | minor | 360 | all | `dong_au/minor_life_feed.json` |
| `evt_feed_child_oil_lamp` | Chong đèn dầu ôn chữ | childhood | minor | 300 | all | `dong_au/minor_life_feed.json` |
| `evt_feed_child_climb_tree` | Trèo cây hái ổi vườn nhà | childhood | minor | 300 | all | `dong_au/minor_life_feed.json` |
| `evt_feed_child_tet_clothes` | Áo mới ngày đầu xuân | childhood | minor | 360 | all | `dong_au/minor_life_feed.json` |
| `evt_feed_child_rain_puddle` | Nghịch nước mưa đầu mùa | childhood | minor | 320 | all | `dong_au/minor_life_feed.json` |
| `evt_feed_child_bully_tease` | Bị bạn lớn trêu chọc | childhood | minor | 360 | all | `dong_au/minor_life_feed.json` |
| `evt_child_eavesdrop_01` | Nghe lỏm ngoài cửa lớp thầy đồ | childhood | major (1x) | 99999 | ban_nong | `dong_au/origin_ban_nong.json` |
| `evt_child_tax_collector` | Lính Lệ Về Làng Thúc Thuế | childhood | major (1x) | 99999 | ban_nong | `dong_au/origin_ban_nong.json` |
| `evt_child_ban_nong_corvee` | Trát Bắt Phu Đắp Đê | childhood | major (1x) | 99999 | ban_nong | `dong_au/origin_ban_nong.json` |
| `evt_child_exp_dia_chu_rent_harvest` | Theo Cha Đi Thu Tô Mùa Gặt | childhood | major (1x) | 99999 | dia_chu | `dong_au/origin_dia_chu.json` |
| `evt_child_exp_dia_chu_strict_tutor` | Thước Kẻ Thầy Đồ Nghiêm Khắc | childhood | major (1x) | 99999 | dia_chu | `dong_au/origin_dia_chu.json` |
| `evt_child_exp_dia_chu_night_thieves` | Trộm Rình Rập Điền Trang Ban Đêm | childhood | major (1x) | 99999 | dia_chu | `dong_au/origin_dia_chu.json` |
| `evt_child_exp_dia_chu_inheritance_talk` | Chuyện Chia Ruộng Đất Sau Này | childhood | major (1x) | 99999 | dia_chu | `dong_au/origin_dia_chu.json` |
| `evt_child_exp_hoang_toc_etiquette` | Lễ Nghi Khắt Khe Nơi Nội Cung | childhood | major (1x) | 99999 | hoang_toc | `dong_au/origin_hoang_toc.json` |
| `evt_child_exp_hoang_toc_archery_rival` | Tỷ Thí Cung Tiễn Nơi Trường Tập | childhood | major (1x) | 99999 | hoang_toc | `dong_au/origin_hoang_toc.json` |
| `evt_child_exp_hoang_toc_harem_intrigue` | Sóng Gió Hậu Cung: Mẫu Thân Bị Gièm Pha | childhood | major (1x) | 99999 | hoang_toc | `dong_au/origin_hoang_toc.json` |
| `evt_child_exp_hoang_toc_royal_banquet` | Yến Tiệc Mừng Thọ Trong Cung | childhood | minor (1x) | 99999 | hoang_toc | `dong_au/origin_hoang_toc.json` |
| `evt_child_exp_hoang_toc_cold_palace_encounter` | Gặp Phụ Hoàng Nơi Ngự Hoa Viên | childhood | major (1x) | 99999 | hoang_toc | `dong_au/origin_hoang_toc.json` |
| `evt_child_exp_hoang_toc_cold_palace_study` | Đèn Khuya Nơi Lãnh Cung | childhood | minor | 720 | hoang_toc | `dong_au/origin_hoang_toc.json` |
| `evt_child_exp_hoang_toc_tai_phu_library` | Thái Phó Ra Đề Đối Khó | childhood | major (1x) | 99999 | hoang_toc | `dong_au/origin_hoang_toc.json` |
| `evt_child_exp_hoang_toc_secret_passage` | Lối Đi Bí Mật Sau Giả Sơn Ngự Hoa Viên | childhood | minor (1x) | 99999 | hoang_toc | `dong_au/origin_hoang_toc.json` |
| `evt_child_quan_lai_fall` | Biến Cố Quan Trường Của Phụ Thân | childhood | major (1x) | 99999 | quan_lai | `dong_au/origin_quan_lai.json` |
| `evt_child_quan_lai_concubine_rivalry` | Sóng Ngầm Nơi Hậu Viện Phủ Quan | childhood | major (1x) | 99999 | quan_lai | `dong_au/origin_quan_lai.json` |
| `evt_child_quan_lai_father_lesson` | Theo Phụ Thân Học Việc Công Đường | childhood | major (1x) | 99999 | quan_lai | `dong_au/origin_quan_lai.json` |
| `evt_child_quan_lai_academy_peer` | Kết Giao Đồng Môn Nơi Tư Thục Danh Sư | childhood | major (1x) | 99999 | quan_lai | `dong_au/origin_quan_lai.json` |
| `evt_child_quan_lai_temptation` | Cậy Thế Phủ Quan Nơi Phố Thị | childhood | minor | 1080 | quan_lai | `dong_au/origin_quan_lai.json` |
| `evt_child_exp_thu_cong_apprentice` | Học Nghề Tổ Truyền Nơi Xưởng Nhỏ | childhood | major (1x) | 99999 | thu_cong | `dong_au/origin_thu_cong.json` |
| `evt_child_exp_thu_cong_extortion` | Quan Lệ Vòi Tiền Bảo Kê Sạp Hàng | childhood | major (1x) | 99999 | thu_cong | `dong_au/origin_thu_cong.json` |
| `evt_child_exp_thu_cong_first_craft` | Món Đồ Đầu Tay Nơi Chợ Phiên | childhood | minor (1x) | 99999 | thu_cong | `dong_au/origin_thu_cong.json` |
| `evt_child_exp_thu_cong_guild_contest` | Hội Thi Tay Nghề Làng Nghề Cổ Truyền | childhood | major (1x) | 99999 | thu_cong | `dong_au/origin_thu_cong.json` |
| `evt_child_odo_heavy_chores` | Việc Nặng Nơi Sân Sau Phủ Địa Chủ | childhood | minor | 360 | all | `dong_au/servitude_o_do.json` |
| `evt_child_odo_study_eavesdrop` | Đứng Ngoài Cửa Thư Phòng Cậu Ấm | childhood | major (1x) | 99999 | all | `dong_au/servitude_o_do.json` |
| `evt_child_odo_ledger_kitchen` | Phụ Bếp & Đong Đếm Kho Thóc Phủ Lớn | childhood | minor | 360 | all | `dong_au/servitude_o_do.json` |
| `evt_child_odo_master_child_bond` | Kết Giao Nơi Phủ Đệ | childhood | major (1x) | 99999 | all | `dong_au/servitude_o_do.json` |
| `evt_child_odo_redeem_freedom` | Cơ Hội Chuộc Khế Ước Trở Về Nhà | childhood | major | 360 | all | `dong_au/servitude_o_do.json` |
| `evt_child_odo_run_away` | Ý Định Trốn Khỏi Phủ Địa Chủ | childhood | major (1x) | 540 | all | `dong_au/servitude_o_do.json` |
| `evt_child_noble_banquet` | Yến Tiệc Phủ Tể Tướng | childhood | major (1x) | 99999 | quan_lai, hoang_toc, dia_chu | `dong_au/tier_thuong_luu.json` |
| `evt_infant_debt_pressure` | Tiếng Thở Dài Đêm Khuya | infancy | minor | 1080 | all | `tho_au/circ_mac_no.json` |
| `evt_milestone_thoi_noi` | Lễ Thôi Nôi Tròn Một Tuổi | infancy | major (1x) | 99999 | ban_nong | `tho_au/common.json` |
| `evt_milestone_thoi_noi_thu_cong` | Lễ Thôi Nôi Tròn Một Tuổi | infancy | major (1x) | 99999 | thu_cong | `tho_au/common.json` |
| `evt_milestone_thoi_noi_dia_chu` | Lễ Thôi Nôi Tròn Một Tuổi | infancy | major (1x) | 99999 | dia_chu | `tho_au/common.json` |
| `evt_milestone_thoi_noi_quan_lai` | Lễ Thôi Nôi Tròn Một Tuổi | infancy | major (1x) | 99999 | quan_lai | `tho_au/common.json` |
| `evt_milestone_thoi_noi_hoang_toc` | Lễ Thí Chu Tròn Một Tuổi | infancy | major (1x) | 99999 | hoang_toc | `tho_au/common.json` |
| `evt_infant_toddler_curiosity` | Buổi Trưa Yên Tĩnh | infancy | major (1x) | 99999 | all | `tho_au/common.json` |
| `evt_infant_share_cake` | Miếng Bánh Ngon Đầu Ngõ | infancy | major (1x) | 99999 | ban_nong, thu_cong, dia_chu | `tho_au/common.json` |
| `evt_infant_exp_cm_1` | Tiếng Pháo Đêm Giao Thừa | infancy | minor | 1080 | all | `tho_au/common_seasons.json` |
| `evt_infant_exp_cm_2` | Trận Ốm Sốt Mùa Hè | infancy | major | 1080 | all | `tho_au/common_seasons.json` |
| `evt_infant_exp_cm_3` | Trò Chơi Dân Gian Ngoài Ngõ | infancy | minor | 720 | ban_nong, thu_cong, dia_chu | `tho_au/common_seasons.json` |
| `evt_infant_exp_cm_4` | Cơn Bão Lũ Đầu Mùa | infancy | major | 1080 | all | `tho_au/common_seasons.json` |
| `evt_infant_exp_ht_1` | Thái Y Bắt Mạch Nơi Cung Cấm | infancy | major (1x) | 99999 | hoang_toc | `tho_au/origin_hoang_toc.json` |
| `evt_infant_exp_ht_2` | Sóng Ngầm Nơi Hậu Cung | infancy | major (1x) | 99999 | hoang_toc | `tho_au/origin_hoang_toc.json` |
| `evt_infant_exp_ht_3` | Ánh Mắt Lạnh Nơi Đại Yến Tông Thất | infancy | minor (1x) | 99999 | hoang_toc | `tho_au/origin_hoang_toc.json` |
| `evt_infant_exp_tl_1` | Lễ Đầy Tháng Linh Đình | infancy | minor (1x) | 99999 | dia_chu, quan_lai | `tho_au/origin_thuong_luu.json` |
| `evt_infant_exp_tl_2` | Nếp Nhà Gia Giáo | infancy | minor (1x) | 99999 | dia_chu, quan_lai | `tho_au/origin_thuong_luu.json` |
| `evt_infant_exp_tl_3` | Báu Vật Trong Thư Phòng | infancy | major (1x) | 99999 | dia_chu, quan_lai | `tho_au/origin_thuong_luu.json` |
| `evt_infant_illness_poor` | Cơn Sốt Phong Hàn Mùa Đông | infancy | minor | 1080 | ban_nong, thu_cong | `tho_au/tier_binh_dan.json` |
| `evt_infant_minor_harvest` | Mùa Màng Bội Thu | infancy | minor | 720 | ban_nong, thu_cong | `tho_au/tier_binh_dan.json` |
| `evt_infant_court_poison` | Án Ngữ Trong Chén Thuốc Bổ | infancy | minor (1x) | 99999 | quan_lai, hoang_toc | `tho_au/tier_cung_dinh.json` |
| `evt_infant_share_cake_cung_dinh` | Đĩa Bánh Ngon Trong Phủ | infancy | major (1x) | 99999 | quan_lai, hoang_toc | `tho_au/tier_cung_dinh.json` |
| `evt_biz_caravan_venture` | Cơ Hội Chung Vốn Buôn Chuyến Liên Trấn | adulthood | major | 2160 | all | `truong_thanh/business_events.json` |
| `evt_biz_property_tenant_crisis` | Khách Thuê & Tá Điền Khất Nợ Giữa Mùa Khó | adulthood | major | 1800 | all | `truong_thanh/business_events.json` |
| `evt_biz_supply_contract` | Thầu Cung Ứng Vật Phẩm Cho Phủ Nha | adulthood | major | 2160 | all | `truong_thanh/business_events.json` |
| `evt_biz_tea_cart_rumor` | Khách Quán Nước Đồn Chuyện Lạ | adulthood | major | 2160 | all | `truong_thanh/business_events.json` |
| `evt_biz_scribe_secret_letter` | Lá Thư Nhờ Viết Hộ Đầy Bí Ẩn | adulthood | major | 2160 | all | `truong_thanh/business_events.json` |
| `evt_biz_apothecary_rare_herb` | Khách Quý Tìm Mua Vị Thuốc Hiếm | adulthood | major | 2160 | all | `truong_thanh/business_events.json` |
| `evt_biz_craft_guild_order` | Đơn Hàng Lớn Từ Thương Đoàn Kinh Kỳ | adulthood | major | 2160 | all | `truong_thanh/business_events.json` |
| `evt_servitude_opportunity` | Thân Phận Gia Nô Trong Phủ Địa Chủ | adulthood | major | 270 | all | `truong_thanh/career_and_servitude.json` |
| `evt_career_trade_temptation` | Khoản Chênh Lệch Trong Sổ Sách | adulthood | minor | 360 | all | `truong_thanh/career_and_servitude.json` |
| `evt_career_scholar_patron` | Hương Thân Quý Mến Tài Học | adulthood | minor | 360 | all | `truong_thanh/career_and_servitude.json` |
| `evt_career_martial_incident` | Biến Cố Nơi Bến Bãi · Đường Tiêu | adulthood | minor | 360 | all | `truong_thanh/career_and_servitude.json` |
| `evt_career_crisis_hardship` | Thời Cuộc Khó Khăn, Công Việc Bấp Bênh | adulthood | minor | 540 | all | `truong_thanh/career_and_servitude.json` |
| `evt_military_enlist` | Đầu Quân Nhập Ngũ Lập Công Danh | adulthood | major (1x) | 99999 | all | `truong_thanh/career_military.json` |
| `evt_military_promotion_1` | Lập Công Trận Tiền, Thăng Chức Hiệu Úy | adulthood | major (1x) | 99999 | all | `truong_thanh/career_military.json` |
| `evt_military_promotion_2` | Đại Phá Địch Quân, Phong Tước Tướng Quân | adulthood | major (1x) | 99999 | all | `truong_thanh/career_military.json` |
| `evt_military_retire` | Giải Giáp Quy Điền — Vinh Quy Hồi Hương | adulthood | major (1x) | 99999 | all | `truong_thanh/career_military.json` |
| `evt_nu_cai_nam_trang_exposed` | Bại Lộ Thân Phận Nữ Nhi! | adulthood | major | 0 | all | `truong_thanh/circ_flags.json` |
| `evt_adult_reunion_best_friend` | Tái Ngộ Bạn Nối Khố Năm Xưa | adulthood | major (1x) | 99999 | all | `truong_thanh/circ_flags.json` |
| `evt_adult_teacher_gift` | Lời Nhắn Nhủ Của Thầy Đồ Xưa | adulthood | major (1x) | 99999 | all | `truong_thanh/circ_flags.json` |
| `evt_debt_collection_01` | Đầu Gấu Nhà Địa Chủ Tới Xiết Nợ | adulthood | major | 0 | all | `truong_thanh/circ_no_nan.json` |
| `evt_debt_servitude_end` | Hết Hạn Làm Gia Nô Gán Nợ | adulthood | major | 0 | all | `truong_thanh/circ_no_nan.json` |
| `evt_adult_minor_coin` | Nhặt được tiền rơi | adulthood | minor | 210 | ban_nong, thu_cong, dia_chu, quan_lai | `truong_thanh/common.json` |
| `evt_adult_minor_cold` | Cảm lạnh trở trời | adulthood | minor | 180 | all | `truong_thanh/common.json` |
| `evt_adult_minor_neighbor_gift` | Hàng xóm biếu khoai | adulthood | minor | 240 | ban_nong, thu_cong, dia_chu | `truong_thanh/common.json` |
| `evt_adult_major_noble_patron` | Gặp Quý Nhân Giữa Chợ Phiên | adulthood | major | 1800 | all | `truong_thanh/common.json` |
| `evt_adult_major_desperate_theft` | Cơn Quẫn Bách Đêm Khuya | adulthood | major | 720 | all | `truong_thanh/common.json` |
| `evt_adult_burnout_melancholy` | Lòng Ngổn Ngang Trăm Mối | adulthood | major | 720 | all | `truong_thanh/common.json` |
| `evt_adult_martial_bandit_ambush` | Thảo Khấu Chặn Đường | adulthood | major | 2880 | all | `truong_thanh/common.json` |
| `evt_adult_infamy_bounty` | Ác Danh Lan Truyền | adulthood | major | 1800 | all | `truong_thanh/common.json` |
| `evt_court_succession_crisis` | Long Ngai Biến Động — Cuộc Chiến Trữ Vị | adulthood | major (1x) | 99999 | all | `truong_thanh/court_succession.json` |
| `evt_court_succession_victory` | Tân Hoàng Đăng Cơ — Luận Công Hành Thưởng | adulthood | major (1x) | 99999 | all | `truong_thanh/court_succession.json` |
| `evt_court_succession_betrayal` | Mật Chỉ Phế Lập & Âm Mưu Binh Biến | adulthood | major (1x) | 99999 | all | `truong_thanh/court_succession.json` |
| `evt_court_harem_court_ally` | Liên Minh Hậu Cung & Triều Thần | adulthood | major | 1440 | all | `truong_thanh/court_succession.json` |
| `evt_elder_grandkids_garden` | Quây quần bên cháu nhỏ dưới hiên | adulthood | minor | 360 | all | `truong_thanh/elder_life.json` |
| `evt_elder_memory_fade` | Quên trước quên sau | adulthood | minor | 360 | all | `truong_thanh/elder_life.json` |
| `evt_elder_wedding_anniversary` | Kỷ niệm ngày thành thân năm xưa | adulthood | minor | 720 | all | `truong_thanh/elder_life.json` |
| `evt_elder_child_gift` | Con cái gửi lễ vật phụng dưỡng | adulthood | minor | 420 | all | `truong_thanh/elder_life.json` |
| `evt_elder_temple_pilgrimage` | Hành hương cửa Phật cầu bình an | adulthood | major | 1080 | all | `truong_thanh/elder_life.json` |
| `evt_elder_village_scholarship` | Lập quỹ đèn sách giúp sĩ tử nghèo | adulthood | major (1x) | 1800 | all | `truong_thanh/elder_life.json` |
| `evt_elder_pass_craft` | Truyền lại sở học cho hậu thế | adulthood | major (1x) | 1440 | all | `truong_thanh/elder_life.json` |
| `evt_elder_atone_past` | Hàn gắn hiềm khích năm xưa | adulthood | major (1x) | 1800 | all | `truong_thanh/elder_life.json` |
| `evt_adult_family_pay_old_debt` | Món Nợ Cũ Của Song Thân Đến Hạn | adulthood | major (1x) | 99999 | ban_nong, thu_cong, dia_chu | `truong_thanh/family_marriage_and_children.json` |
| `evt_adult_family_sibling_wedding` | Hỷ Sự Của Anh Chị Em Trong Nhà | adulthood | major (1x) | 99999 | all | `truong_thanh/family_marriage_and_children.json` |
| `evt_adult_family_spouse_hardship` | Vợ Chồng Đồng Cam Cộng Khổ | adulthood | major | 720 | all | `truong_thanh/family_marriage_and_children.json` |
| `evt_adult_family_child_education` | Chuyện Học Hành Của Con Cái | adulthood | major | 900 | all | `truong_thanh/family_marriage_and_children.json` |
| `evt_adult_family_child_illness` | Con Nhỏ Lên Cơn Sốt Cao Ban Đêm | adulthood | major | 720 | all | `truong_thanh/family_marriage_and_children.json` |
| `evt_youth_family_father_injury_common` | Phụ Thân Gặp Nạn Khi Mưu Sinh | adulthood | major (1x) | 99999 | ban_nong, thu_cong | `truong_thanh/family_youth_and_siblings.json` |
| `evt_youth_family_sibling_crisis_common` | Anh Chị Em Gặp Khó Nơi Xứ Người | adulthood | major (1x) | 99999 | ban_nong, thu_cong | `truong_thanh/family_youth_and_siblings.json` |
| `evt_youth_family_sibling_court_rivalry` | Sóng Gió Huynh Đệ Nơi Phủ Đệ | adulthood | major (1x) | 99999 | quan_lai, hoang_toc | `truong_thanh/family_youth_and_siblings.json` |
| `evt_family_father_old_age_passing` | Phụ Thân Tuổi Cao Quy Tiên | adulthood | major (1x) | 99999 | all | `truong_thanh/family_youth_and_siblings.json` |
| `evt_family_mother_old_age_passing` | Mẫu Thân Tuổi Già Nhắm Mắt Xuôi Tay | adulthood | major (1x) | 99999 | all | `truong_thanh/family_youth_and_siblings.json` |
| `evt_life_corrupt_audit` | Ngự Sử Đài Về Địa Phương Thanh Tra | adulthood | major | 540 | all | `truong_thanh/life_events.json` |
| `evt_life_midlife_illness` | Chứng Bệnh Tuổi Trung Niên | adulthood | major | 720 | all | `truong_thanh/life_events.json` |
| `evt_life_marriage_harmony` | Chuyện Trong Nhà Ngoài Ngõ | adulthood | major | 720 | all | `truong_thanh/life_events.json` |
| `evt_life_elderly_reflection` | Tuổi Xế Chiều Nhìn Lại Một Đời | adulthood | major (1x) | 99999 | all | `truong_thanh/life_events.json` |
| `evt_martial_border_campaign` | Xuất Chinh Bình Định Giặc Biên Ải | adulthood | major | 1080 | all | `truong_thanh/martial_general.json` |
| `evt_martial_siege_defense` | Tử Thủ Thành Trì Trước Vòng Vây Địch | adulthood | major | 1440 | all | `truong_thanh/martial_general.json` |
| `evt_martial_court_rivalry` | Văn Quan Dèm Pha Công Trận Của Võ Tướng | adulthood | major | 1440 | all | `truong_thanh/martial_general.json` |
| `evt_martial_merit_to_official` | Lập Quân Công Hiển Hách — Thưởng Chức Võ Quan | adulthood | major (1x) | 99999 | all | `truong_thanh/martial_general.json` |
| `evt_martial_train_disciples` | Mở Võ Quán Truyền Thụ Binh Pháp | adulthood | major | 1440 | all | `truong_thanh/martial_general.json` |
| `evt_feed_adult_tet_market` | Chợ phiên đầu xuân | adulthood | minor | 360 | all | `truong_thanh/minor_life_feed.json` |
| `evt_feed_adult_summer_rain` | Cơn mưa rào giải nhiệt | adulthood | minor | 270 | all | `truong_thanh/minor_life_feed.json` |
| `evt_feed_adult_autumn_harvest` | Hương cốm mùa thu | adulthood | minor | 360 | all | `truong_thanh/minor_life_feed.json` |
| `evt_feed_adult_neighbor_tea` | Chén trà hàng xóm | adulthood | minor | 240 | all | `truong_thanh/minor_life_feed.json` |
| `evt_feed_adult_old_book` | Trang sách cũ dưới ánh đèn dầu | adulthood | minor | 300 | all | `truong_thanh/minor_life_feed.json` |
| `evt_feed_adult_trade_rumor` | Thương buôn ghé bến | adulthood | minor | 270 | all | `truong_thanh/minor_life_feed.json` |
| `evt_feed_adult_temple_bell` | Tiếng chuông chùa chiều | adulthood | minor | 320 | all | `truong_thanh/minor_life_feed.json` |
| `evt_feed_adult_elder_joint_ache` | Trở trời đau nhức gân cốt | adulthood | minor | 240 | all | `truong_thanh/minor_life_feed.json` |
| `evt_feed_adult_imperial_edict` | Bảng vàng yết thị nơi cổng phủ | adulthood | minor | 360 | all | `truong_thanh/minor_life_feed.json` |
| `evt_feed_adult_village_feast` | Cỗ đình ngày giỗ tổ | adulthood | minor | 300 | all | `truong_thanh/minor_life_feed.json` |
| `evt_feed_adult_morning_exercise` | Khí trời tinh sương | adulthood | minor | 270 | all | `truong_thanh/minor_life_feed.json` |
| `evt_feed_adult_kind_deed` | Chỉ đường cho khách lỡ độ đường | adulthood | minor | 300 | all | `truong_thanh/minor_life_feed.json` |
| `evt_feed_adult_homesick_meal` | Nhớ bữa cơm quê nhà | adulthood | minor | 360 | all | `truong_thanh/minor_life_feed.json` |
| `evt_feed_adult_overwork_fatigue` | Mệt lả sau nhiều ngày bôn ba | adulthood | minor | 320 | all | `truong_thanh/minor_life_feed.json` |
| `evt_feed_adult_small_bonus` | Được thưởng thêm tiền trà nước | adulthood | minor | 400 | all | `truong_thanh/minor_life_feed.json` |
| `evt_feed_adult_village_ceremony` | Giỗ chạp, hiếu hỉ họ hàng | adulthood | minor | 360 | all | `truong_thanh/minor_life_feed.json` |
| `evt_feed_adult_clear_autumn_sky` | Trời thu trong vắt, trăng thanh | adulthood | minor | 360 | all | `truong_thanh/minor_life_feed.json` |
| `evt_official_clean_unjust_case` | Xử Án Oan Cho Dân Nghèo | adulthood | major | 1080 | all | `truong_thanh/official_clean.json` |
| `evt_official_clean_dike_patrol` | Tuần Tra Đê Điều Giữa Mùa Lũ | adulthood | major | 1080 | all | `truong_thanh/official_clean.json` |
| `evt_official_clean_refuse_gift` | Từ Chối Lễ Vật Của Hào Cường Địa Phương | adulthood | major | 1200 | all | `truong_thanh/official_clean.json` |
| `evt_official_clean_censor_praise` | Ngự Sử Tấu Trình Khen Ngợi Thanh Liêm | adulthood | major (1x) | 99999 | all | `truong_thanh/official_clean.json` |
| `evt_official_corrupt_merchant_deal` | Móc Ngoặc Lái Buôn Chia Phần Thuế Chợ | adulthood | major | 1080 | all | `truong_thanh/official_corrupt.json` |
| `evt_official_corrupt_bribe_case` | Nhận Hối Lộ Chạy Án Trọng Tội | adulthood | major | 1200 | all | `truong_thanh/official_corrupt.json` |
| `evt_official_corrupt_faction_alliance` | Kết Bè Đảng Với Quyền Thần Trong Triều | adulthood | major (1x) | 99999 | all | `truong_thanh/official_corrupt.json` |
| `evt_official_corrupt_censor_raid` | Đoàn Thanh Tra Ngự Sử Ập Tới Nha Môn | adulthood | major | 1440 | all | `truong_thanh/official_corrupt.json` |
| `evt_official_faction_choice` | Ngã Rẽ Phe Phái Nơi Triều Đường | adulthood | major (1x) | 99999 | all | `truong_thanh/official_factions.json` |
| `evt_official_faction_grand_case` | Đại Án Quân Lương Biên Ải | adulthood | major | 1440 | all | `truong_thanh/official_factions.json` |
| `evt_official_faction_patron_fall` | Quyền Thần Thất Thế — Sóng Gió Liên Lụy | adulthood | major (1x) | 99999 | all | `truong_thanh/official_factions.json` |
| `evt_official_faction_scholar_support` | Đồng Môn Thanh Lưu Hợp Sức Cải Cách | adulthood | major | 1440 | all | `truong_thanh/official_factions.json` |
| `evt_official_faction_rehabilitate` | Tân Triều Ân Xá — Cơ Hội Phục Chức | adulthood | major (1x) | 99999 | all | `truong_thanh/official_factions.json` |
| `evt_official_intrigue_slander` | Bị Đồng Liêu Hãm Hại & Vu Khống Tham Ô | adulthood | major | 1440 | all | `truong_thanh/official_intrigue.json` |
| `evt_official_intrigue_strike_rival` | Nắm Thóp Đối Thủ Tranh Chức | adulthood | major | 1440 | all | `truong_thanh/official_intrigue.json` |
| `evt_official_intrigue_border_exile` | Bị Điều Đi Trấn Nhậm Vùng Biên Viễn | adulthood | major | 1800 | all | `truong_thanh/official_intrigue.json` |
| `evt_official_intrigue_tax_audit` | Phụng Chỉ Tra Xét Tham Nhũng Địa Phương | adulthood | major | 1440 | all | `truong_thanh/official_intrigue.json` |
| `evt_adult_exp_dia_chu_tenant_rent` | Tá Điền Kéo Đến Xin Khất Tô | adulthood | major | 480 | dia_chu | `truong_thanh/origin_dia_chu.json` |
| `evt_adult_exp_dia_chu_buy_land` | Cơ Hội Mua Ruộng Tốt Giá Hời | adulthood | major | 540 | dia_chu | `truong_thanh/origin_dia_chu.json` |
| `evt_adult_exp_dia_chu_bandit_raid` | Thảo Khấu Đe Dọa Cướp Điền Trang | adulthood | major | 540 | dia_chu | `truong_thanh/origin_dia_chu.json` |
| `evt_adult_exp_dia_chu_bribe_corvee` | Chạy Chọt Miễn Sưu Dịch Cho Điền Trang | adulthood | major | 540 | dia_chu | `truong_thanh/origin_dia_chu.json` |
| `evt_adult_exp_hoang_toc_title_estate` | Lễ Trưởng Thành & Khai Phủ Tôn Thất | adulthood | major (1x) | 99999 | hoang_toc | `truong_thanh/origin_hoang_toc.json` |
| `evt_adult_exp_hoang_toc_succession` | Vòng Xoáy Tranh Đoạt Trữ Vị | adulthood | major | 600 | hoang_toc | `truong_thanh/origin_hoang_toc.json` |
| `evt_adult_exp_hoang_toc_slander` | Bị Kẻ Tiểu Nhân Gièm Pha Trước Ngai Vàng | adulthood | major | 540 | hoang_toc | `truong_thanh/origin_hoang_toc.json` |
| `evt_adult_exp_hoang_toc_royal_marriage` | Thánh Chỉ Ban Hôn Hoàng Gia | adulthood | major (1x) | 99999 | hoang_toc | `truong_thanh/origin_hoang_toc.json` |
| `evt_adult_exp_hoang_toc_vindication` | Minh Oan Cho Mẫu Phi Nơi Triều Đường | adulthood | major (1x) | 99999 | hoang_toc | `truong_thanh/origin_hoang_toc.json` |
| `evt_adult_hoang_toc_teen_palace_library` | Đọc Mật Sử Nơi Tàng Kinh Các | adulthood | major (1x) | 99999 | hoang_toc | `truong_thanh/origin_hoang_toc.json` |
| `evt_adult_hoang_toc_teen_cold_palace_ally` | Mối Giao Hảo Bí Mật Nơi Lãnh Cung | adulthood | major (1x) | 99999 | hoang_toc | `truong_thanh/origin_hoang_toc.json` |
| `evt_adult_hoang_toc_teen_royal_hunt` | Cuộc Săn Mùa Thu Tại Lâm Uyển Hoàng Gia | adulthood | major (1x) | 99999 | hoang_toc | `truong_thanh/origin_hoang_toc.json` |
| `evt_adult_hoang_toc_patron_arts` | Mở Hội Bình Thơ & Bảo Trợ Tao Nhân | adulthood | major | 540 | hoang_toc | `truong_thanh/origin_hoang_toc.json` |
| `evt_adult_hoang_toc_diplomatic_envoy` | Đón Tiếp Sứ Thần Ngoại Bang | adulthood | major | 720 | hoang_toc | `truong_thanh/origin_hoang_toc.json` |
| `evt_adult_hoang_toc_imperial_inspection` | Phụng Mệnh Khâm Sai Tuần Du Địa Phương | adulthood | major | 720 | hoang_toc | `truong_thanh/origin_hoang_toc.json` |
| `evt_adult_hoang_toc_teen_empress_dowager` | Thỉnh An Thái Hậu Nơi Cung Từ Ninh | adulthood | major (1x) | 99999 | hoang_toc | `truong_thanh/origin_hoang_toc.json` |
| `evt_adult_hoang_toc_border_pacification` | Lĩnh Mệnh Đốc Chiến Bình Định Biên Cương | adulthood | major | 900 | hoang_toc | `truong_thanh/origin_hoang_toc.json` |
| `evt_adult_hoang_toc_clan_mediation` | Hòa Giải Mâu Thuẫn Trong Tông Nhân Phủ | adulthood | major | 720 | hoang_toc | `truong_thanh/origin_hoang_toc.json` |
| `evt_adult_hoang_toc_famine_imperial_edict` | Dâng Sớ Xin Mở Kho Ngự Khố Cứu Dân | adulthood | major | 540 | hoang_toc | `truong_thanh/origin_hoang_toc.json` |
| `evt_adult_hoang_toc_elder_memoirs` | Soạn Ngọc Phả & Di Huấn Tôn Thất | adulthood | major (1x) | 99999 | hoang_toc | `truong_thanh/origin_hoang_toc.json` |
| `evt_adult_quan_lai_tap_am` | Đặc Ân Tập Ấm Nơi Nha Môn | adulthood | major (1x) | 99999 | quan_lai | `truong_thanh/origin_quan_lai.json` |
| `evt_adult_quan_lai_marriage_alliance` | Nghị Hôn Môn Đăng Hộ Đối | adulthood | major (1x) | 99999 | quan_lai | `truong_thanh/origin_quan_lai.json` |
| `evt_adult_quan_lai_family_estate` | Sổ Sách & Môn Khách Trong Phủ Đệ | adulthood | minor | 1440 | quan_lai | `truong_thanh/origin_quan_lai.json` |
| `evt_adult_quan_lai_father_legacy` | Thư Tiến Cử & Tâm Huyết Của Phụ Thân | adulthood | major (1x) | 99999 | quan_lai | `truong_thanh/origin_quan_lai.json` |
| `evt_adult_quan_lai_fallen_humiliation` | Ánh Nhìn Lạnh Lẽo Khi Thế Gia Sa Cơ | adulthood | major (1x) | 99999 | quan_lai | `truong_thanh/origin_quan_lai.json` |
| `evt_adult_quan_lai_extravagant_peer` | Cuộc Vui Thâu Đêm Chốn Tràng An | adulthood | minor | 1080 | quan_lai | `truong_thanh/origin_quan_lai.json` |
| `evt_adult_exp_thu_cong_guild` | Lập Phường Hội Thợ Nghề | adulthood | major (1x) | 99999 | thu_cong | `truong_thanh/origin_thu_cong.json` |
| `evt_adult_exp_thu_cong_merchant_order` | Thương Nhân Phương Xa Đặt Lô Hàng Lớn | adulthood | major | 480 | thu_cong | `truong_thanh/origin_thu_cong.json` |
| `evt_adult_exp_thu_cong_workshop_fire` | Hỏa Hoạn Tại Xưởng Nghề | adulthood | major | 600 | thu_cong | `truong_thanh/origin_thu_cong.json` |
| `evt_adult_exp_thu_cong_magistrate_repair` | Lên Phủ Huyện Sửa Đồ Quý Cho Quan Lớn | adulthood | major | 540 | thu_cong | `truong_thanh/origin_thu_cong.json` |
| `evt_rebellion_spark` | Áp Bức Nặng Nề — Ngọn Lửa Khởi Nghĩa | adulthood | major (1x) | 99999 | all | `truong_thanh/rebellion_arc.json` |
| `evt_rebellion_recruit_bandits` | Thu Phục Thảo Khấu & Nghĩa Sĩ Bốn Phương | adulthood | major | 1080 | all | `truong_thanh/rebellion_arc.json` |
| `evt_rebellion_decisive_battle` | Trận Quyết Chiến Tiến Về Kinh Thành | adulthood | major (1x) | 99999 | all | `truong_thanh/rebellion_arc.json` |
| `evt_underworld_prison_brotherhood` | Kết Nghĩa Giang Hồ Giữa Chốn Phong Trần | adulthood | major | 1440 | all | `truong_thanh/rebellion_arc.json` |
| `evt_scholar_local_exam_temptation` | Cám Dỗ Mua Đề Trước Trường Thi | adulthood | major (1x) | 99999 | all | `truong_thanh/scholar_and_official.json` |
| `evt_scholar_road_to_capital` | Sĩ Tử Lều Chõng Lên Kinh Ứng Thí | adulthood | major (1x) | 99999 | ban_nong, thu_cong, dia_chu, quan_lai | `truong_thanh/scholar_and_official.json` |
| `evt_scholar_vinh_quy_bai_to` | Lễ Vinh Quy Bái Tổ Rạng Danh Gia Tộc | adulthood | major (1x) | 99999 | ban_nong, thu_cong, dia_chu, quan_lai | `truong_thanh/scholar_and_official.json` |
| `evt_official_bribe_or_justice` | Án Oan Nơi Công Đường & Bạc Đút Lót | adulthood | major | 600 | all | `truong_thanh/scholar_and_official.json` |
| `evt_official_famine_granary` | Dân Đói Vây Nha Môn — Mở Kho Hay Chờ Lệnh? | adulthood | major | 540 | all | `truong_thanh/scholar_and_official.json` |
| `evt_official_remonstrate_emperor` | Dâng Sớ Can Gián Trước Ngai Vàng | adulthood | major (1x) | 99999 | all | `truong_thanh/scholar_and_official.json` |
| `evt_official_retire_gracefully` | Cáo Lão Hồi Hương Giữ Trọn Thanh Danh | adulthood | major (1x) | 99999 | all | `truong_thanh/scholar_and_official.json` |
| `evt_scholar_poor_copy_books` | Chép Sách Thuê & Dạy Trẻ Đầu Làng | adulthood | major | 1080 | ban_nong, thu_cong | `truong_thanh/scholar_poor.json` |
| `evt_scholar_poor_mentor` | Thầy Đồ Già Nhận Làm Môn Sinh | adulthood | major (1x) | 99999 | ban_nong, thu_cong | `truong_thanh/scholar_poor.json` |
| `evt_scholar_poor_matchmaker` | Phú Hộ Kén Dâu Rể Hiếu Học | adulthood | major (1x) | 99999 | ban_nong, thu_cong | `truong_thanh/scholar_poor.json` |
| `evt_scholar_poor_exam_fail` | Lỡ Hẹn Bảng Vàng Khoa Đầu | adulthood | major (1x) | 99999 | ban_nong, thu_cong | `truong_thanh/scholar_poor.json` |
| `evt_scholar_poor_village_fund` | Quỹ Nghĩa Học Của Làng Xã | adulthood | major | 1440 | ban_nong, thu_cong | `truong_thanh/scholar_poor.json` |
| `evt_scholar_rich_poetry_club` | Hội Văn Thơ Tao Nhân Chốn Kinh Kỳ | adulthood | major | 1080 | dia_chu, quan_lai, hoang_toc | `truong_thanh/scholar_rich.json` |
| `evt_scholar_rich_temptation` | Bạn Giàu Rủ Rê Tửu Sắc & Trường Bạc | adulthood | major | 1440 | dia_chu, quan_lai, hoang_toc | `truong_thanh/scholar_rich.json` |
| `evt_scholar_rich_backdoor` | Lời Mời Chạy Cửa Sau Mua Danh | adulthood | major (1x) | 99999 | dia_chu, quan_lai, hoang_toc | `truong_thanh/scholar_rich.json` |
| `evt_scholar_rich_family_pressure` | Áp Lực Gia Phong & Kỳ Vọng Của Tộc Trưởng | adulthood | major (1x) | 99999 | dia_chu, quan_lai, hoang_toc | `truong_thanh/scholar_rich.json` |
| `evt_scholar_rich_patron_poor` | Gặp Sĩ Tử Nghèo Hết Tiền Lộ Phí | adulthood | major | 1440 | dia_chu, quan_lai, hoang_toc | `truong_thanh/scholar_rich.json` |
| `evt_fate_tuyen_tu_palace` | Chiếu Chỉ Tuyển Tú Nữ Vào Hậu Cung | adulthood | major (1x) | 99999 | dia_chu, quan_lai | `truong_thanh/special_fates.json` |
| `evt_fate_eunuch_or_palace_maid` | Bước Đường Cùng: Tiến Cung Làm Thái Giám / Cung Nữ | adulthood | major (1x) | 99999 | ban_nong, thu_cong | `truong_thanh/special_fates.json` |
| `evt_fate_eunuch_promotion` | Quyền Khuynh Nội Đình: Tổng Quản Thái Giám | adulthood | major (1x) | 99999 | all | `truong_thanh/special_fates.json` |
| `evt_fate_brothel_or_bodyguard` | Ánh Đèn Thanh Lâu & Bến Bãi Giang Hồ | adulthood | major (1x) | 99999 | ban_nong, thu_cong | `truong_thanh/special_fates.json` |
| `evt_fate_palace_promotion` | Sóng Gió Hậu Cung: Thăng Vị Hay Xuất Cung | adulthood | major (1x) | 99999 | all | `truong_thanh/special_fates.json` |
| `evt_fate_brothel_redemption` | Tri Kỷ Chuộc Thân Hoàn Lương | adulthood | major (1x) | 99999 | all | `truong_thanh/special_fates.json` |
| `evt_fate_bodyguard_crossroads` | Quan Phủ Truy Quét — Rửa Tay Gác Kiếm? | adulthood | major (1x) | 99999 | all | `truong_thanh/special_fates.json` |
| `evt_adult_major_corvee` | Trát Bắt Đi Phu Đắp Đê | adulthood | major | 360 | ban_nong, thu_cong | `truong_thanh/tier_binh_dan.json` |
| `evt_adult_court_faction_purge` | Sóng Gió Phe Cánh Triều Đình | adulthood | major | 720 | quan_lai, hoang_toc | `truong_thanh/tier_cung_dinh.json` |
| `evt_adult_corrupt_official_bribe` | Quan Phủ Vòi Tiền Bảo Kê | adulthood | major | 540 | thu_cong, dia_chu | `truong_thanh/tier_trung_luu.json` |
| `evt_world_rich_forced_donation` | Quan Phủ "Kêu Gọi" Phú Hộ Quyên Góp | adulthood | major | 540 | ban_nong, thu_cong, dia_chu | `truong_thanh/world_rich_and_war.json` |
| `evt_world_rich_bandit_target` | Giặc Cướp Dòm Ngó Phủ Giàu Giữa Thời Loạn | adulthood | major | 600 | all | `truong_thanh/world_rich_and_war.json` |
| `evt_world_war_zone_evacuation` | Chiến Họa Tràn Qua Vùng | adulthood | major | 540 | ban_nong, thu_cong, dia_chu, quan_lai | `truong_thanh/world_rich_and_war.json` |
| `evt_adult_exp_world_famine_rice` | Nạn Đói Hoành Hành, Giá Gạo Tăng Vọt | adulthood | major | 360 | all | `truong_thanh/world_states.json` |
| `evt_adult_exp_world_war_conscription` | Lệnh Tổng Động Viên Thời Chiến | adulthood | major | 420 | ban_nong, thu_cong, dia_chu | `truong_thanh/world_states.json` |
| `evt_adult_exp_world_war_noble_duty` | Chiếu Chỉ Quyên Lương & Hộ Quốc Thời Chiến | adulthood | major | 420 | hoang_toc, quan_lai | `truong_thanh/world_states.json` |
| `evt_adult_exp_world_war_looting` | Quân Lính Cướp Bóc Làng Xã | adulthood | major | 360 | ban_nong, thu_cong, dia_chu, quan_lai | `truong_thanh/world_states.json` |
| `evt_adult_exp_world_plague_quarantine` | Dịch Bệnh Lan Tràn Khắp Phủ | adulthood | major | 360 | all | `truong_thanh/world_states.json` |
| `evt_adult_exp_world_plague_herb_relief` | Khan Hiếm Dược Liệu Giữa Cơn Dịch | adulthood | major | 420 | ban_nong, thu_cong, dia_chu, quan_lai | `truong_thanh/world_states.json` |
| `evt_world_imperial_tax_levy` | Triều Đình Ban Lệnh Tăng Thuế Thời Loạn | adulthood | major | 540 | all | `truong_thanh/world_states.json` |
| `evt_world_bumper_harvest_edict` | Chiếu Khuyến Nông & Hội Chợ Thái Bình | adulthood | major | 600 | all | `truong_thanh/world_states.json` |
