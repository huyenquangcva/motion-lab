# PHYSICS MOTION LAB – Phòng thí nghiệm chuyển động (Vật lí THPT)

Web app/PWA phân tích chuyển động thật từ video. **Toàn bộ xử lý chạy trên thiết bị**, không upload video, không đăng nhập, không thu thập dữ liệu cá nhân. Giao diện 100 % tiếng Việt.

## Chạy
- Thử nhanh: mở `index.html` bằng Chrome/Edge (chạy được cả khi mở trực tiếp tệp).
- Dùng thật trên điện thoại: đưa cả thư mục lên một máy chủ **HTTPS** (GitHub Pages, Netlify, máy chủ nhà trường…). Camera (quay video) và cài PWA/offline cần HTTPS hoặc `localhost`.
  Chạy cục bộ: `python3 -m http.server 8765` rồi mở `http://localhost:8765`.
- Cài như ứng dụng: Chrome/Edge → nút “Cài ứng dụng”; iPhone/iPad → Chia sẻ → “Thêm vào Màn hình chính”. Sau lần mở đầu có thể dùng offline.
- Không cần cài thư viện nào (không CDN, không npm): đồ thị, xuất Excel/ZIP, tracking, hồi quy đều tự viết.

## Quy trình 7 bước
Video → Hiệu chuẩn (FPS, đoạn chuẩn, hệ trục) → Theo dõi vật → Bảng số liệu → Đồ thị → Phân tích vật lí → Báo cáo.

## Kiến trúc
```
index.html, style.css, manifest.json, service-worker.js, icons/
src/utils/math.js          bình phương tối thiểu, đa thức, định dạng số kiểu Việt Nam
src/calibration/           pixel ↔ mét, hệ trục Oxy (xoay, đảo, y hướng lên)
src/physics/kinematics.js  vận tốc, gia tốc, PCA quỹ đạo, nhận dạng loại chuyển động, ngân sách sai số
src/physics/assistant.js   hồi quy, so sánh mô hình (BIC), kết quả + nhận xét + kết luận bằng lời
src/tracking/tracking.js   NCC dưới pixel (Web Worker), theo màu, phát hiện chuyển động
src/tracking/runner.js     vòng lặp theo dõi nhiều frame (cửa sổ nhỏ quanh vị trí dự đoán)
src/video/video.js         nguồn video (HTML5), đo FPS, 4 cảnh mẫu giả lập
src/charts/plot.js         đồ thị Canvas: zoom, pan, tooltip, chọn điểm, PNG
src/export/exporter.js     CSV, XLSX (tự ghi), ZIP
src/storage/storage.js     IndexedDB
src/app/                   core (trạng thái), stage (video/chạm), panels (bước 1–6), report (bước 7), selftest, main
tests/                     test_core.js, test_tracking.js, test_export.js (Node); e2e_selftest.py (Chromium)
```

## Thuật toán
- **Thời gian:** t = n / FPS (FPS đo bằng `requestVideoFrameCallback`, có thể nhập tay).
- **Hiệu chuẩn:** scale = |AB|_pixel / độ dài thật (pixel/m); x = (px − Oₓ)/scale, y = (y_gốc − y_pixel)/scale, có xoay/đảo trục.
- **Tracking:** (1) thủ công; (2) so khớp mẫu NCC chuẩn hóa, nội suy parabol dưới pixel, dự đoán vị trí theo vận tốc không đổi, tùy chọn cập nhật mẫu (khuyên dùng khi vật nhòe); (3) theo màu YCbCr. Mất dấu thì dừng và báo frame.
- **Vận tốc/gia tốc:** sai phân trung tâm, làm trơn, hồi quy bậc hai cục bộ (mặc định), hoặc hồi quy bậc hai toàn đoạn.
- **Nhận dạng:** PCA hướng chuyển động + so sánh R²/BIC của các mô hình → thẳng đều, biến đổi đều, rơi tự do, ném ngang/xiên, dao động điều hòa (khớp sin), hoặc “chưa khớp”.
- **Sai số:** 6 nguồn (khoảng cách, tâm vật, thời gian, FPS, camera, phối cảnh) + tổng hợp; kết quả luôn ghi “xấp xỉ”, kèm ±.

## Kiểm thử đã chạy (Chromium)
- Node: lõi toán/vật lí, tracking, xuất file – đạt.
- “Tự kiểm tra quy trình” (nút ở Bước 1): 4 cảnh mẫu × 2 cách (điểm chấm sẵn có nhiễu 0,6 px; tracking thật trên video giả lập) → 18/18 phép đo nằm trong dung sai (5 % cho a, g, v₀, T, A; 2° cho α).
- Video thật dạng webm 1280×720, 60 fps, có nhòe và nhiễu: g đo được 9,79 ± 0,11 m/s² (mô phỏng 9,81).
- Điện thoại 390×844 (cảm ứng), offline sau lần mở đầu, xuất XLSX/CSV/JSON/ZIP/PDF, lưu và mở lại dự án (kèm video).


