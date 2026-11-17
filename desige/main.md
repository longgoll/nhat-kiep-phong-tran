TÀI LIỆU THIẾT KẾ GAME (GDD) & KIẾN TRÚC KỸ THUẬT HOÀN CHỈNHTên dự án (Dự kiến): Nhất Kiếp Phong Trần (Feudal Life Simulator)Phiên bản: v3.1 — Bản Chốt Toàn Diện (Production-Ready Master Blueprint)1. Tổng Quan & Triết Lý Thiết Kế (Core Concept & Pillars)Thể loại: Mô phỏng cuộc đời (Life Sim), Quản lý chiến lược (Dashboard Management), Sandbox, Single-Life Roguelite.Cảm hứng kết hợp:1 in 8 Billion: Khởi đầu ngẫu nhiên tuyệt đối theo phân tầng xã hội thực tế; mỗi kiếp người là một ván bài độc lập 100%, tuyệt đối không có buff ngầm hay kế thừa sức mạnh từ kiếp trước.Nobody: The Turnaround: Áp lực mưu sinh sát sườn từng ngày, cân đối thể lực, bữa ăn, giấc ngủ và chi phí sinh hoạt, kèm hệ thống van xả áp cho người ở đáy xã hội.BitLife / Crusader Kings: Giao diện trực quan dễ nắm bắt ngay từ giây đầu tiên, tự do chọn lối đi từ dân đen tới đế vương, hệ thống sự kiện phân nhánh theo ngữ cảnh và nhân quả.4 Nguyên tắc cốt lõi (Core Pillars):Một kiếp trọn vẹn: Bắt đầu từ tiếng khóc chào đời (0 tuổi) và khép lại hoàn toàn khi nhắm mắt xuôi tay. Không truyền đời cho con cháu.Công bằng tuyệt đối giữa các lần chơi: Xóa trắng hoàn toàn dữ liệu khi nhân vật qua đời. Meta-progression chỉ mở khóa vật phẩm trưng bày, giao diện và Bách khoa toàn thư (Pure Cosmetic & Codex).Xuất thân định điểm khởi đầu, không khóa tương lai: Sinh ra ở tầng lớp nào chỉ quyết định tài nguyên ban đầu và độ khó; mọi con đường (khoa cử, buôn bán, khởi nghĩa) đều mở cho tất cả nếu đủ năng lực, thời cơ (hoặc chấp nhận rủi ro đặc thù như nữ cải nam trang đi thi).Chân thực lịch sử phong kiến Á Đông: Tái hiện sát nhịp sống xưa từ lễ thôi nôi, đi ở đợ, học lỏm thầy đồ cho tới lều chõng đi thi, quyên quan mua chức hay phất cờ tạo phản.2. Khởi Đầu Ngẫu Nhiên (Gacha Xuất Thân & Giới Tính)Khi bắt đầu kiếp mới, hệ thống dùng bộ sinh số ngẫu nhiên có hạt giống (Seeded PRNG — mulberry32) để quay giới tính (50% Nam / 50% Nữ) và xuất thân theo tỷ lệ phân hóa xã hội phong kiến thực tế:Tầng lớp xuất thânTỷ lệTài nguyên & Lợi thế khởi đầuÁp lực & Rủi ro đặc trưngBần nông / Dân đen70.0%Tài sản gần như bằng 0, không ruộng đất, sức khỏe/thể lực dẻo dai từ nhỏ.Cái đói thường trực, sưu thuế nặng nề, dễ bị bắt đi phu đắp đê hoặc đi lính quân dịch.Thợ thủ công / Tiểu thương18.0%Có chút vốn liếng nhỏ, sớm tiếp xúc nghề thủ công hoặc tính toán buôn bán.Địa vị xã hội thấp ("Sĩ, Nông, Công, Thương"), hay bị quan lại và cường hào chèn ép.Địa chủ / Cự phú8.0%Giàu có, sẵn ruộng đất, cửa hiệu, đủ tiền mời thầy đồ dạy chữ từ bé.Liên tục phải đút lót quan tham để giữ tài sản, nguy cơ bị cướp bóc hoặc đấu tố khi loạn lạc.Quan lại3.5%Sống trong nhung lụa, có sẵn thư viện gia đình, quan hệ xã hội rộng.Áp lực chính trị cực nặng; gia đình thất thế hoặc chọn sai phe có thể bị tịch biên gia sản, tru di.Hoàng tộc0.5%Đỉnh cao quyền lực và tài sản ngay từ vạch xuất phát.Bệnh tật cung đình, âm mưu đầu độc từ bé, vòng xoáy tranh đoạt ngai vàng ("cửu tử đoạt đích").Quy tắc Giới tính trong bối cảnh Phong kiến (Tả thực phân nhánh)Nam giới (male): Đi theo các lộ trình truyền thống (Khoa cử chính thống, Tòng quân, Thương nghiệp, Khởi nghĩa).Nữ giới (female): Mở khóa các nhánh đặc trưng (Quản gia tộc/thương hội, Y thuật dân gian, Tuyển tú/Cung đấu) VÀ vẫn có thể chọn con đường Khoa cử/Quan trường thông qua cơ chế Nữ cải nam trang (tạo cờ nu_cai_nam_trang, có chỉ số rủi ro bại lộ tăng dần theo chức tước; nếu bị phát hiện có thể bị tội khi quân hoặc được vua đặc xá nếu Thanh danh đủ cao).3. Hệ Thống Chỉ Số, Tài Sản & Cơ Chế Chống "Death Spiral"Tầng 1: Bộ 4 Thanh Chỉ Số Cơ Bản (Thang 0 – 100%, luôn hiển thị trên cùng)Sức khỏe (health): Thước đo sinh mệnh và thể trạng. Chịu ảnh hưởng bởi bữa ăn, tuổi tác, bệnh tật và lao lực. Về 0 đồng nghĩa với tử vong.Hạnh phúc (happiness): Phản ánh trạng thái tinh thần. Khi tụt xuống dưới 20%, nhân vật rơi vào trạng thái U uất / Tuyệt vọng: giảm 30% hiệu suất học tập & làm việc thông thường, đồng thời mở khóa các hành động/sự kiện liều lĩnh (trộm cắp, vay nặng lãi, gia nhập thảo khấu, bán thân làm gia nô) thay vì đẩy người chơi vào ngõ cụt không lối thoát.Quan hệ (relationships): Điểm tổng hòa sự gắn kết với gia đình, làng xóm, bằng hữu và đồng liêu. Nhấn vào thanh này sẽ mở danh sách chi tiết từng NPC (Cha mẹ, Vợ/Chồng, Con cái, Tri kỷ, Kẻ thù).Học thức (education): Trình độ chữ nghĩa và hiểu biết kinh sử (0% là mù chữ hoàn toàn, 100% là bậc đại nho thông kim bác cổ).Tầng 2: Thanh Năng Lượng Hàng Ngày (Thang 0 – maxStamina)Thể lực (stamina): Nằm ngay dưới Bảng Thời Khóa Biểu 4 buổi. Tiêu hao khi lao động, học tập, luyện võ; hồi phục qua bữa ăn và giấc ngủ. Giới hạn tối đa (maxStamina) đạt đỉnh ở tuổi thanh niên (100) và giảm dần khi bước vào tuổi trung niên (80) và tuổi già (50–60).Tầng 3: Nhóm Năng Lực Chuyên Sâu & Địa Vị (Hiển thị dạng điểm số, mở khóa theo lối chơi)Võ nghệ (martial): Sức mạnh chiến đấu và binh pháp (cần cho đường võ cử, tòng quân, tiêu cục, khởi nghĩa).Thương tài / Tay nghề (craftTrade): Kỹ năng sản xuất và nhạy bén thị trường (quyết định lợi nhuận buôn bán, làm nghề).Thanh danh (fame — Danh vọng chính thống): Uy tín với triều đình, giới sĩ phu và bách tính. Giúp dễ thăng quan, được danh sư nhận làm đệ tử, chiêu mộ hiền tài.Uy thế / Tai tiếng (infamy — Quyền lực ngầm): Sự khiếp sợ của kẻ khác. Giúp thao túng giá cả thị trường, ép nợ, nuôi tử sĩ và làm phản.Tầng 4: Tài Sản & Cơ NghiệpTiền tệ: Tiền đồng (copper, tiêu vặt hàng ngày) $\rightarrow$ Lượng bạc (silver, 1 lượng = 1.000 đồng) $\rightarrow$ Vàng nén (gold, 1 nén = 10 lượng bạc).Lương thực (rice): Lúa gạo dự trữ (đơn vị: đấu; 10 đấu = 1 thạch), quyết định khả năng sống sót qua nạn đói và mùa giáp hạt.Bất động sản & Cơ nghiệp: Gầm cầu/Ở nhờ, Nhà tranh, Nhà gạch, Phủ đệ, Ruộng tư, Cửa hiệu, Thương đoàn.Van Xả Áp Sinh Tồn (Chống kẹt vòng xoáy chết đói cho Bần nông)Khi rice === 0 và hết tiền mua gạo, người chơi luôn có quyền truy cập các hành động khẩn cấp không yêu cầu vốn hay điều kiện:Mót lúa / Đào củ rừng: Tốn ít thể lực, kiếm được 1–2 đấu lương thực đủ cầm cự qua ngày.Xin cháo thí ở đình/chùa: Hồi phục chút thể lực và lương thực nhưng giảm nhẹ Thanh danh.Vay nóng địa chủ: Nhận ngay 500 đồng và 5 đấu gạo, đồng thời đẩy một sự kiện xiết nợ vào delayedEvents sau 180 ngày (nếu không trả đủ cả gốc lẫn lãi sẽ bị cướp ruộng, đánh đập hoặc ép làm gia nô).4. Vòng Đời & Nhịp Độ Thời Gian (0 Tuổi $\rightarrow$ Tử Vong)Quy chuẩn thời gian: 1 năm = 360 ngày, chia thành 4 mùa (Xuân – Hạ – Thu – Đông), mỗi mùa 90 ngày.Giai đoạn 1: Thơ Ấu (0 – 5 tuổi) — Vượt Cửa Tử & Nghi Lễ Đầu ĐờiNhịp độ: Chạy tóm tắt theo từng năm (5 bước tiến tới tuổi 6).Cơ chế lịch sử:Chống chọi với tỷ lệ tử vong trẻ nhỏ thời phong kiến (đậu mùa, sởi, phong hàn, thiếu ăn).1 tuổi — Lễ Thôi Nôi: Bày mâm đồ vật (bút lông, thỏi bạc, thanh gươm gỗ, nắm xôi...) để đứa trẻ bốc thử, định hình thiên hướng ban đầu (+5 điểm chỉ số tương ứng) và mở khóa lời thoại đặc trưng.Biến cố gia đình ảnh hưởng trực tiếp tới 4 thanh chỉ số gốc.Giai đoạn 2: Đồng Ấu (6 – 12 tuổi) — Đúc Nền Móng Số PhậnNhịp độ: Từng năm một. Mỗi năm người chơi chọn 1 Hoạt động chủ đạo trong năm (mở khóa dựa trên xuất thân và tài chính của cha mẹ):Nhà Bần nông:Chăn trâu, cắt cỏ, mót lúa phụ gia đình: Tăng Sức khỏe & Quan hệ gia đình, giúp nhà đỡ đói.Đi ở đợ cho nhà địa chủ: Tích cóp được vài đồng xu lẻ từ bé nhưng dễ bị đánh đập (giảm Hạnh phúc).Đứng ngoài cửa lớp thầy đồ "học lỏm": Trốn việc nhà nghe giảng Tam Tự Kinh, lấy que vạch chữ xuống đất. Tỷ lệ thành công thấp nhưng giúp mở khóa chút Học thức quý giá dù nhà nghèo.Nhà Thợ thủ công / Tiểu thương:Phụ việc trong xưởng / Đứng quầy gảy bàn tính: Tăng sớm Thương tài / Tay nghề.Xin cha mẹ cho đi học chữ (nếu nhà đủ ăn): Tìm đường thoát kiếp thương nhân bị xã hội phong kiến xếp cuối.Nhà Địa chủ / Quan lại / Hoàng tộc:Lễ Khai tâm & Học trường làng / Quốc Tử Giám: Tăng mạnh Học thức, tạo lợi thế đi thi Hương sớm.Luyện võ nghệ / Cưỡi ngựa bắn cung: Tăng Võ nghệ và Sức khỏe.Kết giao bạn nối khố / Trốn học đi chơi: Giảm Học thức nhưng tăng Hạnh phúc và mở khóa các mối quan hệ NPC đồng trang lứa.Kết quả mốc 13 tuổi: Tổng kết toàn bộ tuổi thơ thành Hồ sơ Thiếu niên trước khi bước vào đời tự lập.Giai đoạn 3: Tự Lập, Trưởng Thành & Lão Hóa (13 tuổi $\rightarrow$ Cuối đời)Nhịp độ: Mở khóa Bảng Thời Khóa Biểu 4 Khung Giờ / Ngày:Sáng & Chiều (2 khung giờ chính): Làm thuê, mót lúa, cày ruộng, đọc sách, bái sư, buôn bán, xử án, luyện binh...Tối (1 khung giờ phụ): Đọc sách đèn dầu, làm thêm việc vặt, ra tửu lầu nghe ngóng tin tức, đút lót quan hệ, hoặc nghỉ ngơi.Đêm (1 khung giờ đặc biệt): Mặc định là Ngủ (hồi phục Thể lực và Sức khỏe tùy theo chất lượng chỗ ở: Gầm cầu / Nhà tranh / Nhà gạch / Phủ đệ). Có thể chọn "Thức trắng đêm" để nhân đôi tiến độ học/mưu sự nhưng làm sụt Sức khỏe và Hạnh phúc rất nhanh.Hệ thống Tự động hóa & Tua nhanh:Người chơi thiết lập Thời khóa biểu mẫu (Routine), Mức sống hàng ngày (Nhịn đói / Cháo loãng qua ngày / Cơm rau đạm bạc / Thịt cá đủ đầy) và Quy tắc dự phòng (Fallback Rules) (ví dụ: "Nếu Thể lực < 25%, tự động chuyển buổi Tối sang Nghỉ ngơi" hoặc "Nếu Lúa gạo = 0, tự động chuyển buổi Chiều sang Mót lúa").Cụm nút tua thời gian: [+1 Ngày], [+1 Tuần (7 ngày)], [+1 Tháng (30 ngày)], [+1 Mùa (90 ngày)].Cơ chế Phanh gấp (Auto-Pause): Hệ thống tự ngắt tua ngay lập tức khi:Gặp Biến cố lớn (major event) cần người chơi ra quyết định.Bất kỳ chỉ số sinh tồn nào (health, happiness, stamina) chạm ngưỡng nguy hiểm (< 20%).Hết sạch lương thực (rice === 0) và không có quy tắc dự phòng xử lý.Bước sang tuổi mới (mốc sinh nhật mỗi 360 ngày) hoặc đến kỳ mở khoa thi.Đường cong Lão hóa (Aging Curve):13 – 30 tuổi (Thanh niên): Sung sức nhất, tốc độ tăng Học thức và Võ nghệ cao nhất, hồi phục nhanh.31 – 55 tuổi (Trung niên): Đỉnh cao sự nghiệp và quyền lực, nhưng gánh nặng gia đình lớn và maxStamina giảm dần.56+ tuổi (Tuổi già): Sức khỏe suy giảm tự nhiên mỗi mùa, bệnh tật dễ ập đến, chuyển sang cuộc đua thời gian để hoàn thành tâm nguyện cuối đời.5. Lộ Trình Phát Triển Tự Do (Sandbox Progression)Không khóa nhân vật vào "Class" cố định; người chơi tự do chuyển hướng hoặc kết hợp nhiều con đường:Con đường Khoa cử & Quan trường (Sĩ):Tự học / Bái sư $\rightarrow$ Thi Hương (Tú tài, Cử nhân — mở 3 năm/lần vào mùa Thu) $\rightarrow$ Thi Hội (Cống sĩ) $\rightarrow$ Thi Đình (Tiến sĩ, Bảng nhãn, Thám hoa, Trạng nguyên).Bổ nhiệm làm quan: Tri huyện $\rightarrow$ Tri phủ $\rightarrow$ Tuần phủ $\rightarrow$ Thượng thư $\rightarrow$ Tể tướng (hoặc Đại tướng quân nếu theo ngạch Võ cử).Gameplay quan trường: Xử án, thu thuế, đắp đê trị thủy, thanh liêm vì dân hoặc cấu kết phe phái tham nhũng.Con đường Thương nghiệp & Thủ công (Công – Thương):Làm thuê tích vốn $\rightarrow$ Buôn bán nhỏ $\rightarrow$ Mở xưởng thủ công / Cửa hiệu $\rightarrow$ Lập thương đoàn buôn xuyên vùng $\rightarrow$ Lũng đoạn thị trường (găm lúa gạo chờ mùa giáp hạt hoặc chiến tranh để bán giá cao).Dùng tiền "Quyên quan" (mua chức tước) hoặc dùng bạc thao túng quan lại để bước chân vào chính trường.Con đường Đảo chính & Khởi nghĩa (End-game):Khi Thanh danh hoặc Uy thế đủ cao, người chơi có thể bí mật tích lũy 3 yếu tố: Ngân khố riêng, Binh quyền & Tử sĩ, và Thời cơ (triều đình thối nát, mất mùa, giặc giã).Thành công sẽ lật đổ triều đại cũ, lên ngôi Hoàng đế và ghi danh vào cột mốc chiến thắng cao nhất của game.6. Hệ Thống Sự Kiện & Nhịp Độ (2-Tier Event Engine)Để tránh tình trạng "mệt mỏi vì sự kiện" (Event Fatigue) trong vòng đời 20.000+ ngày, hệ thống chia sự kiện thành 2 cấp độ và quản lý bằng Cooldown:Tin Vặt Đời Thường (severity: "minor"):Ví dụ: Nhặt được vài đồng xu, trời mưa cảm lạnh nhẹ, hàng xóm biếu củ khoai, nghe được tin đồn giá gạo.Xử lý: Tự động tính toán kết quả theo chỉ số hiện tại, áp dụng hiệu ứng và đẩy thẳng một dòng tóm tắt vào Nhật ký đời người, KHÔNG ngắt nhịp tua nhanh.Biến Cố Lớn (severity: "major"):Ví dụ: Gặp quý nhân, bị bắt đi phu, thi cử, cưới hỏi, quan tham vòi tiền, bạo bệnh, khởi nghĩa.Xử lý: Kích hoạt Auto-Pause ngay lập tức và bật thẻ Modal yêu cầu người chơi chọn phương án giải quyết.Cơ chế Kiểm soát Tần suất & Nhân quả:Event Cooldown (eventCooldowns): Lưu ngày kích hoạt gần nhất của từng eventId hoặc category (ví dụ: sự kiện ngẫu nhiên thông thường chỉ xuất hiện tối đa 1 lần mỗi 30–60 ngày).Hàng đợi Sự kiện Trễ (delayedEvents): Hành động ở hiện tại có thể đẩy một sự kiện vào tương lai (ví dụ: cứu người ăn mày hôm nay $\rightarrow$ 1.000 ngày sau người đó đỗ đạt quay lại báo ân; vay nặng lãi $\rightarrow$ 180 ngày sau đầu gấu tới xiết nợ).7. Thiết Kế Giao Diện Dashboard (Modular 3-Column UI)Giao diện chia 3 cột trên màn hình Desktop (tự động gộp thành các tab dưới đáy trên Mobile/Tablet), các module chức năng chỉ mở khóa khi nhân vật đạt đủ điều kiện:Cột Trái — Hồ Sơ & Chỉ Số:Chân dung nhân vật (thay đổi theo độ tuổi, giới tính và trang phục chức tước), Tên, Tuổi, Xuất thân, Danh phận.4 Thanh Chỉ Số Cơ Bản (0–100%): Sức khỏe, Hạnh phúc, Quan hệ (bấm vào để mở danh sách NPC), Học thức.Nhóm chỉ số chuyên sâu & địa vị: Võ nghệ, Thương tài, Thanh danh, Uy thế.Kho tài sản: Tiền đồng / Bạc / Vàng, Lúa gạo dự trữ, Điền sản.Cột Giữa — Bảng Điều Hành (Action Planner):Lưới phân bổ 4 khung giờ: Sáng – Chiều – Tối – Đêm + Thanh Thể lực (Stamina) ngay bên dưới.Ô chọn Trọng tâm sống, Mức sống hàng ngày và Cài đặt Quy tắc dự phòng (Fallback).Cụm nút điều khiển thời gian: [+1 Ngày] [+1 Tuần] [+1 Tháng] [+1 Mùa].Các thẻ chức năng mở khóa động: Khoa cử & Thư viện, Thương hội & Giá cả, Công đường & Phe phái, Mật thất Khởi nghĩa.Cột Phải — Thời Cuộc & Nhật Ký:Bảng tin Thời cuộc: Niên hiệu triều đại, Mùa hiện tại, Thời tiết, Giá lúa gạo biến động, Chiếu chỉ triều đình.Nhật ký đời người (Life Feed): Dòng thời gian ghi lại ngắn gọn diễn biến từng ngày/tháng.Thẻ Sự Kiện Tương Tác (Modal): Hiển thị khi có biến cố major cần ra quyết định.8. Hệ Thống Kết Thúc & Tàng Kinh Các (Pure Cosmetic Meta)Khi nhân vật qua đời (health <= 0 hoặc bị xử trảm):Hiển thị Màn Hình Bia Mộ & Sử Ký Một Đời: Tóm tắt xuất thân, tuổi thọ, nguyên nhân tử vong, biểu đồ biến động tài sản/chỉ số cả đời (vẽ từ mảng milestones), và phong tặng Danh hiệu tổng kết (ví dụ: "Bần nông chết cóng mùa đông", "Thần đồng đỗ đạt", "Khai quốc Hoàng đế").Toàn bộ dữ liệu kiếp vừa chơi (active_life) bị xóa trắng hoàn toàn để đảm bảo kiếp sau là một khởi đầu ngẫu nhiên độc lập 100%.Ghi nhận thành tích vào Tàng Kinh Các (legacy_archive) — hoàn toàn không cộng chỉ số hay buff cho kiếp sau:Bách khoa Kết cục (Codex): Sưu tầm các kết cục hiếm, các loại bệnh và sự kiện ẩn đã từng trải qua.Trang trí & Giao diện (Cosmetics): Mở khóa khung bia mộ mới, giao diện Dashboard (Giấy Dó, Mực Tàu, Son Thếp) và nhạc nền cổ phong mới.Thống kê cá nhân: Tổng số kiếp đã sống, tỷ lệ xuất thân thực tế, tuổi thọ trung bình.9. Kiến Trúc Công Nghệ "0 Đồng" (Local-First Stack)Toàn bộ ứng dụng chạy tĩnh trên trình duyệt người dùng, không cần backend server hay database đám mây:Frontend & UI: React 19 + TypeScript + Vite + Tailwind CSS + Lucide Icons + Recharts (vẽ biểu đồ giá gạo và sử ký cuộc đời).Quản lý State & Lưu trữ:Zustand (kèm middleware persist lưu vào localStorage / IndexedDB, có sẵn trường schemaVersion: 1 để hỗ trợ migrate dữ liệu khi cập nhật phiên bản).Tách 2 store độc lập: useActiveLifeStore (lưu 1 JSON object duy nhất của kiếp đang chơi, xóa khi Game Over) và useLegacyArchiveStore (lưu bia mộ, codex và giao diện đã mở khóa).Tối ưu bộ nhớ Nhật ký: Mảng logs chỉ giữ tối đa 150 dòng gần nhất (Rolling Buffer) để tránh phình dung lượng localStorage khi chơi tới 70–80 tuổi; các mốc quan trọng cả đời lưu riêng vào mảng milestones (~20–30 mốc).Hiệu năng & Mô phỏng đa luồng (Data-Driven Rule Engine):Web Worker (simulation.worker.ts): Toàn bộ vòng lặp tính toán khi bấm tua nhanh (+1 Tuần / Tháng / Mùa) chạy trong Worker trên RAM thuần túy, chỉ trả kết quả cập nhật về Main Thread khi hoàn tất hoặc khi gặp điều kiện Auto-Pause.100% Data-Driven: Cả Hành động (actions.json) và Sự kiện (events_*.json) đều định nghĩa bằng dữ liệu JSON thuần túy. Worker chỉ đóng vai trò đọc dữ liệu và thực thi luật, không hardcode logic từng nghề nghiệp.Deterministic PRNG: Thuật toán mulberry32 kèm seed lưu theo từng kiếp giúp tái hiện và debug chuỗi sự kiện chính xác tuyệt đối.Safe Expression Evaluator: Tuyệt đối không dùng eval(). Trọng số sự kiện và điều kiện hành động định nghĩa bằng object điều kiện thuần túy.Quản lý Dữ liệu Nội dung & Sao lưu:Chia nhỏ kho dữ liệu thành các file JSON theo giai đoạn/tầng lớp (actions.json, events_thoi_noi.json, events_dong_au.json, events_ban_nong.json, events_khoa_cu.json...) và tải lười (Lazy Load) theo giai đoạn nhân vật.Hỗ trợ Export / Import Save File (.json) để người chơi tự sao lưu.Hosting: Deploy tĩnh miễn phí vĩnh viễn trên Cloudflare Pages hoặc GitHub Pages.10. Cấu Trúc Dữ Liệu Chuẩn (TypeScript & JSON Schema)A. State Nhân Vật (active_life.ts)TypeScriptexport type OriginClass = 'ban_nong' | 'thu_cong' | 'dia_chu' | 'quan_lai' | 'hoang_toc';
export type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'night';
export type LifestyleTier = 'nhin_doi' | 'chao_loang' | 'com_rau' | 'thit_ca';

export interface NPC {
  id: string;
  name: string;
  gender: 'male' | 'female';
  relation: 'parent' | 'spouse' | 'child' | 'friend' | 'rival' | 'mentor';
  affinity: number; // -100 đến +100
  isAlive: boolean;
  role: string;
}

export interface FallbackRule {
  id: string;
  stat: 'health' | 'happiness' | 'stamina' | 'rice' | 'copper';
  operator: '<' | '<=';
  threshold: number;
  targetSlot: TimeSlot;
  fallbackActionId: string;
}

export interface MilestoneRecord {
  ageYears: number;
  ageDays: number;
  title: string;
  netWorthInCopper: number;
  fame: number;
}

export interface ActiveLifeState {
  schemaVersion: number;
  seed: number;
  prngState: number; // Trạng thái hiện tại của mulberry32 để lưu/tải game liền mạch
  isAlive: boolean;
  deathReason?: string;

  profile: {
    fullName: string;
    gender: 'male' | 'female';
    originClass: OriginClass;
    currentRole: string;
    ageYears: number;
    ageDays: number; // 1 năm = 360 ngày (4 mùa x 90 ngày)
  };

  stats: {
    // 4 Thanh cơ bản (0 - 100)
    health: number;
    happiness: number;
    relationships: number;
    education: number;

    // Năng lượng chạy lịch 4 buổi hàng ngày
    stamina: number;
    maxStamina: number;

    // Nhóm năng lực chuyên sâu & địa vị
    martial: number;
    craftTrade: number;
    fame: number;
    infamy: number;
  };

  assets: {
    copper: number;
    silver: number;
    gold: number;
    rice: number; // Đơn vị: đấu (10 đấu = 1 thạch)
    housing: 'gam_cau' | 'nha_tranh' | 'nha_gach' | 'phu_de';
    properties: string[];
  };

  world: {
    dynastyName: string;
    yearInEra: number;
    season: 'spring' | 'summer' | 'autumn' | 'winter';
    ricePriceInCopper: number; // Biến động theo mùa & thời cuộc
    worldState: 'binh_on' | 'mat_mua' | 'chien_tranh' | 'dich_benh';
  };

  schedule: {
    childhoodFocus?: string; // Dùng cho giai đoạn 6-12 tuổi
    morning: string;         // actionId
    afternoon: string;       // actionId
    evening: string;         // actionId
    night: string;           // actionId
    lifestyle: LifestyleTier;
    lifeFocus: string;
    fallbackRules: FallbackRule[];
  };

  npcs: NPC[];
  flags: string[]; // Ví dụ: 'da_ket_hon', 'do_tu_tai', 'nu_cai_nam_trang', 'bi_truy_na'
  delayedEvents: Array<{ eventId: string; triggerDay: number }>;
  eventCooldowns: Record<string, number>; // Map eventId -> ngày gần nhất đã kích hoạt
  milestones: MilestoneRecord[];          // Lưu tối đa 30 mốc quan trọng để vẽ Bia Mộ
  logs: Array<{ day: number; category: string; text: string }>; // Rolling buffer tối đa 150 dòng
}
B. Schema File Hành Động (actions.json)JSON[
  {
    "id": "act_mot_lua",
    "name": "Mót lúa / Đào củ rừng",
    "category": "survival",
    "allowedSlots": ["morning", "afternoon"],
    "description": "Lục lọi đồng ruộng sau gặt hoặc vào rừng đào củ mài. Thu nhập bèo bọt nhưng giúp không chết đói.",
    "conditions": {
      "min_age": 13
    },
    "costs": {
      "stamina": 15
    },
    "rewards": {
      "rice": 1.5,
      "health": -1,
      "fame": -0.2
    }
  },
  {
    "id": "act_lam_thue_nong_vu",
    "name": "Làm thuê cày cấy cho địa chủ",
    "category": "labor",
    "allowedSlots": ["morning", "afternoon"],
    "description": "Bán sức lao động ngoài đồng ruộng để đổi lấy tiền đồng và gạo ăn.",
    "conditions": {
      "min_age": 13,
      "min_health": 20
    },
    "costs": {
      "stamina": 25
    },
    "rewards": {
      "copper": 35,
      "rice": 1,
      "happiness": -1
    }
  },
  {
    "id": "act_doc_sach_den_dau",
    "name": "Đọc sách bên đèn dầu",
    "category": "study",
    "allowedSlots": ["evening", "night"],
    "description": "Tận dụng đêm khuya dùi mài kinh sử. Tốn nhiều thể lực và dầu thắp.",
    "conditions": {
      "min_age": 13,
      "min_education": 5,
      "min_copper": 5
    },
    "costs": {
      "stamina": 20,
      "copper": 5
    },
    "rewards": {
      "education": 1.5,
      "health": -0.5
    }
  }
]
C. Schema File Sự Kiện (events_dong_au.json)JSON[
  {
    "id": "evt_child_eavesdrop_01",
    "stage": "childhood",
    "severity": "major",
    "cooldownDays": 360,
    "title": "Nghe lỏm ngoài cửa lớp thầy đồ",
    "conditions": {
      "min_age": 7,
      "max_age": 12,
      "origin_in": ["ban_nong"],
      "childhood_focus": "hoc_lom"
    },
    "weight": {
      "base": 40,
      "modifiers": []
    },
    "description": "Trời mưa phùn, bạn trốn việc chăn trâu, nép bên hiên nhà thầy đồ nghe tiếng ê a đọc Tam Tự Kinh. Thầy đồ vô tình nhìn ra bắt gặp ánh mắt ham học của bạn.",
    "choices": [
      {
        "label": "Mạnh dạn quỳ xuống xin thầy cho nghe ké",
        "outcomes": [
          {
            "weight": { "base": 60, "modifiers": [] },
            "result_text": "Thầy đồ cảm động trước tấm lòng hiếu học, tặng cho bạn một cây bút cùn và dạy cho vài chữ vỡ lòng.",
            "effects": {
              "education": 6,
              "happiness": 15,
              "relationships": 5,
              "add_flag": "duoc_thay_do_quy"
            }
          },
          {
            "weight": { "base": 40, "modifiers": [] },
            "result_text": "Thầy đồ sợ mang tiếng với nhà giàu nên xua đuổi bạn về. Về nhà bạn lại bị cha mắng vì bỏ bê đàn trâu.",
            "effects": {
              "happiness": -10,
              "relationships": -3
            }
          }
        ]
      },
      {
        "label": "Sợ hãi bỏ chạy về đồng",
        "effects": {
          "education": 2,
          "happiness": -2
        }
      }
    ]
  }
]
11. Lộ Trình Triển Khai & Tiêu Chí Nghiệm Thu (Roadmap)Giai đoạn 1 — Core Engine & Tuổi Thơ Tương Phản (MVP 1)Mục tiêu kỹ thuật: Khởi tạo dự án React 19 + TS + Vite + Tailwind + Zustand; cài đặt thuật toán mulberry32 PRNG có lưu trạng thái (prngState) và schemaVersion: 1.Nội dung game: Xây dựng màn hình Gacha Xuất Thân (5 tầng lớp + Giới tính) và hoàn thiện sâu giai đoạn 0–12 tuổi (Lễ thôi nôi 1 tuổi + chọn hoạt động đồng ấu 6–12 tuổi), ưu tiên làm thật sắc nét 2 thái cực đối lập (Bần nông vs. Quan lại) để kiểm chứng cảm xúc người chơi.Giai đoạn 2 — Vòng Lặp Trưởng Thành, Web Worker & Van Xả Áp (MVP 2)Mục tiêu kỹ thuật: Dựng giao diện Dashboard 3 cột (4 thanh chỉ số cơ bản trên cùng + Bảng thời khóa biểu 4 buổi + Quy tắc dự phòng + Nhật ký đời người rolling buffer 150 dòng). Viết simulation.worker.ts đọc dữ liệu từ actions.json và events_*.json, xử lý vòng lặp tua nhanh (+1 Ngày / Tuần / Tháng / Mùa) và cơ chế Auto-Pause theo severity: "major".Nội dung game: Hoàn thiện trọn vẹn vòng đời từ 13 tuổi đến lúc chết cho nhánh Bần nông & Sinh tồn (bao gồm các hành động van xả áp: Mót lúa, Xin cháo thí, Vay nóng địa chủ) + Màn hình Bia Mộ Tổng Kết kèm biểu đồ sử ký.Giai đoạn 3 — Mở Rộng Đa Nghề & Sự Kiện Ngữ Cảnh (MVP 3)Nội dung game: Nạp đầy đủ kho hành động và sự kiện JSON cho 4 xuất thân còn lại.Mở khóa các module chuyên sâu: Khoa cử & Quan trường (Thi Hương/Hội/Đình, xử án, cơ chế Nữ cải nam trang đi thi), Thương nghiệp (biến động giá gạo theo mùa, đầu cơ tích trữ), và Mật thất Khởi nghĩa (lật đổ triều đại).Giai đoạn 4 — Tàng Kinh Các, Âm Thanh & Phát Hành (MVP 4)Nội dung game: Xây dựng useLegacyArchiveStore cho Tàng Kinh Các (Codex sưu tầm kết cục hiếm, danh hiệu, mở khóa giao diện Giấy Dó, Mực Tàu, Son Thếp).Hoàn thiện: Tích hợp tính năng Export/Import file save .json, tối ưu giao diện tab trên Mobile, thêm nhạc nền cổ phong nhẹ nhàng và deploy tĩnh lên Cloudflare Pages.