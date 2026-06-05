# Đặc tả tính năng — App Chấm Công

> Phạm vi tài liệu: **chỉ nêu và chốt tính năng**. Chưa mô tả cơ sở dữ liệu, cách test, hay kiến trúc kỹ thuật.

---

## 0. Tổng quan

Ứng dụng chấm công gồm **2 phía**:

- **Phía Nhân viên — App mobile (người đi làm):** điểm danh vào/ra ca, xem lịch sử và thống kê cá nhân.
- **Phía Admin — Web (Quản trị):** quản lý nhân viên, cơ cấu tổ chức, vị trí, wifi, ca làm, thống kê và xuất báo cáo.

> **Nền tảng:** phía Nhân viên chạy trên **ứng dụng di động (mobile app)**; phía Admin chạy trên **web**.

### Cơ cấu tổ chức (phân cấp)
```
Công ty
 └── Chi nhánh
      └── Phòng (bộ phận)
           └── Nhân viên
```
- **1 công ty** có **nhiều chi nhánh**.
- **1 chi nhánh** có **nhiều phòng (bộ phận)**.
- **1 phòng** có **nhiều nhân viên**.
- **1 tài khoản** có thể thuộc **nhiều công ty**.

### Vai trò
- Chỉ có **2 vai trò**: `Admin` và `Nhân viên`.
- Việc **xác nhận đăng nhập / thiết bị mới** và **duyệt chấm công offline** do **Admin** thực hiện.

---

## 1. Phía Nhân viên — App mobile (người đi làm)

### 1.1. Đăng nhập
- Đăng nhập bằng **tài khoản (SĐT) + mật khẩu**.
- **Không tự tạo được tài khoản** — tài khoản do Admin cấp.
- **Mỗi tài khoản chỉ đăng nhập trên 1 phòng (bộ phận)** tại một thời điểm.
- **Khi đăng nhập phải có xác nhận của Admin.**
- **Khi đăng nhập trên điện thoại/thiết bị mới phải có xác nhận của Admin.**
- Một tài khoản có thể thuộc **nhiều công ty** — có **nút chuyển đổi công ty** để đổi ngữ cảnh làm việc.

### 1.2. Điểm danh vào ca / ra ca
- Nhân viên thực hiện **chấm vào ca** và **chấm ra ca**.
- Xác thực vị trí bằng **GPS** và/hoặc **Wifi**, theo phương thức Admin đã chọn cho ca đó (xem 2.2):
  - **Chỉ GPS**, hoặc
  - **Chỉ Wifi**, hoặc
  - **Cả hai (GPS + Wifi)** — khi áp dụng cả hai, **phải đúng cả hai** mới chấm được.
- Nếu **không thỏa điều kiện** → **chặn chấm công** và **báo thất bại**.

### 1.3. Chấm công offline
- Áp dụng khi **điện thoại không có mạng**.
- Nhân viên vẫn chấm được nhưng phải **chụp ảnh** tại thời điểm chấm (để xác minh có thật sự ở nơi làm việc).
- Ảnh được **lưu lên server**, **kèm toạ độ GPS** lúc chấm; bản ghi ở trạng thái **chờ duyệt**.
- **Admin duyệt** thì bản ghi mới được tính hợp lệ (xem 2.8).

### 1.4. Xem lịch & lịch sử chấm công
- Xem được **những ngày đi muộn / về sớm** của bản thân.
- Xem **lịch sử chấm công theo tuần** hoặc **theo tháng** (tùy giao diện chuyển đổi).

### 1.5. Thống kê cá nhân hiển thị
- **Số phút đi muộn** và **số phút về sớm**.
- **Số ngày nghỉ.**
- **Số lần quên ra/vào ca.**

**Ranh giới phân loại (áp dụng khi tính thống kê):**
- **Có chấm vào nhưng thiếu chấm ra** (chỉ chấm 1 đầu) → tính là **quên ra/vào ca**.
- **Không chấm vào ca** (không có điểm danh đầu vào) → tính là **ngày nghỉ**.

---

## 2. Phía Admin — Web (quản trị)

### 2.1. Quản lý nhân sự
- **Thêm / sửa / xoá nhân viên.** Tài khoản do Admin cấp (SĐT + mật khẩu). Mỗi nhân viên gồm các trường:
  - **Mã nhân viên**
  - **SĐT**
  - **Email**
  - **Ngày sinh**
  - **Giới tính**
  - **Chi nhánh**
  
  - **Phòng ban**
  - **Chức vụ**
  - **Quyền truy cập**

### 2.2. Cài đặt ca làm
Mỗi ca làm gồm các thiết lập:
- **Tên ca làm.**
- **Thời gian ra/vào ca** (giờ bắt đầu, giờ kết thúc).
- **Ngày áp dụng trong tuần** — chọn ca áp dụng vào những thứ nào (VD: T2–T6, hoặc cả T7).
- **Khoảng thời gian được phép chấm ra/vào ca** — VD ca 8h thì cho chấm vào ca trong khung 6h–9h.
- **Phương thức điểm danh & nguồn dữ liệu** — chọn ngay tại đây:
  - Chọn **GPS / Wifi / cả hai** (nếu cả hai thì phải đúng cả hai).
  - Chọn **Vị trí** và/hoặc **Wifi** áp dụng cho ca (lấy từ danh mục đã tạo ở 2.3, 2.4).
- **Số phút được phép đi muộn / về sớm** (ngưỡng trước khi tính vi phạm).
- **Số công cho một ca** — quy đổi ca ra công. VD: 1 ca = 1 công, hoặc 2 ca = 1 công, hoặc 3 ca = 1 công.
  - **Cách tính công: theo tỷ lệ.** Nếu nhóm cần N ca = 1 công thì mỗi ca = 1/N công; làm thiếu/dư cộng theo số ca thực tế. VD: cài 3 ca = 1 công, làm 2 ca → ≈ 0,67 công; làm 4 ca → ≈ 1,33 công.
  - **Điều kiện 1 ca được tính:** phải chấm **cả vào lẫn ra** ca đó *(giả định — báo nếu muốn chỉ cần chấm vào)*.

**Gán ca cho nhân viên:**
- Một người **có thể có nhiều ca** (ví dụ ca sáng + ca tối).
- Khi gán ca, chọn **phạm vi gán:** **1 người** / **1 chi nhánh** / **1 phòng ban** / **toàn công ty**.
- Có thể gán riêng cho **cá nhân cụ thể** thêm ca/vị trí khác — VD trong cùng một phòng, chỉ một số người (hay đi công tác) được chấm ở **cả văn phòng và nhà máy**, người khác thì không.

### 2.3. Quản lý Vị trí (GPS)
- **Thêm / sửa / xoá vị trí.** Vị trí luôn dùng **GPS**. Mỗi vị trí gồm:
  - **Tên vị trí**
  - **Địa chỉ**
  - **Toạ độ (lat, lng)** — chọn trên Google Map
  - **Bán kính cho phép chấm công**
  - **Một hoặc nhiều chi nhánh** áp dụng
  - **Một hoặc nhiều phòng ban** thuộc các chi nhánh trên

### 2.4. Quản lý Wifi
- **Thêm / sửa / xoá wifi.** Mỗi wifi gồm:
  - **Tên wifi (SSID)**
  - **BSSID**
  - **Một hoặc nhiều chi nhánh** áp dụng
  - **Một hoặc nhiều phòng ban** thuộc các chi nhánh trên
  - **Chế độ đối chiếu:** chấm công dựa trên **tên wifi**, hoặc **cả tên wifi + BSSID**

### 2.5. Sửa bản ghi chấm công
- Admin **chỉnh sửa được** bản ghi chấm công của nhân viên (VD: quên chấm, thiết bị lỗi).

### 2.6. Quản lý cơ cấu tổ chức
- **Thêm / sửa công ty, chi nhánh, phòng (bộ phận).**
- Gán nhân viên vào phòng (thực hiện khi tạo nhân viên — xem 2.1).

### 2.7. Xác nhận đăng nhập / thiết bị
- **Xác nhận đăng nhập** của nhân viên.
- **Xác nhận khi nhân viên đăng nhập trên thiết bị/điện thoại mới.**

### 2.8. Duyệt chấm công offline
- Xem danh sách các lần **chấm offline đang chờ duyệt** (kèm ảnh chụp + toạ độ GPS).
- **Duyệt / từ chối** từng bản ghi; chỉ bản ghi được duyệt mới tính hợp lệ.

### 2.9. Thống kê & báo cáo
- Thống kê **ca của mỗi người**.
- Thống kê **theo phòng (bộ phận)**.
- Hiển thị **số phút đi muộn / về sớm**.
- Hiển thị **số lần quên ra/vào ca** (theo người / theo phòng).

### 2.10. Xuất báo cáo Excel
- **Xuất bảng công ra Excel**.
- Phạm vi xuất: **toàn công ty** hoặc **theo phòng (bộ phận)**.

---

## 3. Bảng tổng hợp tính năng

| # | Tính năng | Phía | Trạng thái |
|---|-----------|------|------------|
| 1 | Đăng nhập (SĐT + mật khẩu), không tự tạo tài khoản | Nhân viên | Chốt |
| 2 | Đăng nhập qua Google / Apple (OAuth) | Nhân viên | Chốt |
| 3 | Mỗi tài khoản chỉ đăng nhập trên 1 phòng | Nhân viên | Chốt |
| 4 | 1 tài khoản thuộc nhiều công ty + nút chuyển công ty | Nhân viên | Chốt |
| 5 | Xác nhận đăng nhập / thiết bị mới (bởi Admin) | Nhân viên + Admin | Chốt |
| 6 | Chấm vào ca / ra ca (GPS / Wifi / cả hai — cả hai phải đúng cả hai) | Nhân viên | Chốt |
| 7 | Chặn + báo thất bại khi không thỏa điều kiện | Nhân viên | Chốt |
| 8 | Chấm công offline khi mất mạng: chụp ảnh + toạ độ, Admin duyệt | Nhân viên + Admin | Chốt |
| 9 | Xem ngày đi muộn / về sớm | Nhân viên | Chốt |
| 10 | Lịch sử chấm công theo tuần / tháng | Nhân viên | Chốt |
| 11 | Số phút đi muộn / về sớm, số ngày nghỉ | Nhân viên | Chốt |
| 12 | Số lần quên ra/vào ca | Nhân viên + Admin | Chốt |
| 13 | Quản lý nhân sự: thêm/sửa/xoá + đầy đủ trường (mã, SĐT, email, ngày sinh, giới tính, chi nhánh, phòng, chức vụ, quyền) | Admin | Chốt |
| 14 | Cài đặt ca: tên ca, giờ, ngày trong tuần, khung giờ chấm | Admin | Chốt |
| 15 | Cài đặt ca: chọn phương thức GPS/Wifi/cả hai + vị trí/wifi | Admin | Chốt |
| 16 | Cài đặt ca: ngưỡng muộn/sớm | Admin | Chốt |
| 17 | Cài đặt ca: số công / ca (tính theo tỷ lệ) | Admin | Chốt |
| 18 | Gán ca: người / chi nhánh / phòng / công ty (+ cá nhân chấm nhiều nơi) | Admin | Chốt |
| 19 | Nhiều ca cho 1 người | Admin | Chốt |
| 20 | Quản lý Vị trí (tên, địa chỉ, toạ độ, bán kính, gán chi nhánh/phòng) | Admin | Chốt |
| 21 | Quản lý Wifi (SSID, BSSID, gán chi nhánh/phòng, chế độ đối chiếu) | Admin | Chốt |
| 22 | Sửa bản ghi chấm công | Admin | Chốt |
| 23 | Quản lý cơ cấu: công ty / chi nhánh / phòng | Admin | Chốt |
| 24 | Thống kê theo người / phòng | Admin | Chốt |
| 25 | Xuất Excel (toàn công ty / theo phòng) | Admin | Chốt |

---

---- 
Kỹ thuật dùng Expo,  

sửa màn hình : Thêm vị trí (GPS)
- cho chọn 1 người trong danh sách nhân viên nữa
Phần báo cáo cho thêm là xem xem thánh của mối người. kiểu như là Nguyễn văn. a ,tháng/12/2023 xem được lịch sử chấm công. gồm một bảng tất cả các nhân viên hoặc tỏng phòng ban. 