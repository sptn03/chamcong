# Chấm Công

Prototype hệ thống chấm công gồm 2 giao diện:

- App nhân viên: chấm vào/ra ca, chấm offline, lịch sử, thống kê cá nhân.
- Web Admin: quản lý nhân sự, ca làm, vị trí GPS, Wifi, duyệt offline, xác nhận đăng nhập, báo cáo.

Project hiện tại là HTML tĩnh dùng React/Babel qua CDN, chưa cần cài dependency.

## Yêu cầu

- Trình duyệt hiện đại: Chrome, Edge, Safari hoặc Firefox.
- Có internet khi mở lần đầu để tải React, ReactDOM, Babel và font từ CDN.
- Nếu muốn chạy qua local server: cần Python 3.

## Cách chạy nhanh

Mở file `index.html` bằng trình duyệt:

```bash
open index.html
```

Từ màn hình chính, chọn:

- `App Nhân viên`
- `Web Admin`

## Chạy bằng local server

Khuyến nghị dùng local server để trình duyệt xử lý file tĩnh ổn định hơn:

```bash
python3 -m http.server 8000
```

Sau đó mở:

```text
http://localhost:8000
```

Các đường dẫn trực tiếp:

```text
http://localhost:8000/mobile/Cham%20Cong%20-%20App%20Nhan%20Vien.html
http://localhost:8000/web/Cham%20Cong%20-%20Web%20Admin.html
```

## Cấu trúc project

```text
.
├── index.html
├── mobile/
│   ├── Cham Cong - App Nhan Vien.html
│   ├── app.jsx
│   ├── screens-core.jsx
│   ├── screens-more.jsx
│   ├── data.js
│   ├── theme.js
│   └── icons.jsx
├── web/
│   ├── Cham Cong - Web Admin.html
│   ├── admin-app.jsx
│   ├── admin-pages-1.jsx
│   ├── admin-pages-2.jsx
│   ├── admin-ui.jsx
│   ├── admin-data.js
│   └── admin-icons.jsx
├── docs/
│   ├── hunchamcong.md
│   ├── hunchamcong-app.md
│   └── hunchamcong-server.md
├── screenshots/
└── uploads/
```

## Tài liệu

- `docs/hunchamcong.md`: đặc tả tính năng.
- `docs/hunchamcong-app.md`: tài liệu app, API app và App Check.
- `docs/hunchamcong-server.md`: tài liệu server PHP, App Check, DB diagram và SQL.

## Ghi chú phát triển

- Dữ liệu hiện tại là dữ liệu mẫu trong `mobile/data.js` và `web/admin-data.js`.
- Các file `.jsx` được Babel standalone biên dịch trực tiếp trên trình duyệt.
- Chưa có backend thật trong repo này; tài liệu server nằm trong `docs/hunchamcong-server.md`.
- Nếu trình duyệt không hiển thị giao diện, kiểm tra kết nối mạng vì project đang tải thư viện từ `unpkg.com` và font từ Google Fonts.
