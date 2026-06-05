# API Backend - Hệ Thống Chấm Công

**Base URL:** `http://localhost:3000/api`

**Auth:** Đa số API yêu cầu token gửi qua body (`token`) hoặc query param (`?token=...`). Chỉ `/api/auth/login`, `/api/auth/hunonic-login` và `/health` là public.

---

## Auth

### `POST /api/auth/login` — Đăng nhập (SĐT + mật khẩu)

```json
{
  "phone": "0987654321",
  "password": "123456",
  "deviceUid": "uuid-thiet-bi",
  "deviceName": "iPhone 15",
  "platform": "ios",
  "osVersion": "17.0",
  "appVersion": "1.0.0"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "uuid-token",
    "userId": 1,
    "deviceId": 1,
    "createdAt": "2026-06-05T10:00:00.000Z"
  },
  "message": "Đăng nhập thành công"
}
```

---

### `POST /api/auth/hunonic-login` — Đăng nhập qua Hunonic

```json
{
  "hunonicToken": "token-tu-hunonic",
  "phone": "0987654321",
  "deviceUid": "uuid-thiet-bi",
  "deviceName": "iPhone 15",
  "platform": "ios",
  "osVersion": "17.0",
  "appVersion": "1.0.0"
}
```

---

### `POST /api/auth/logout` — Đăng xuất (vô hiệu token)

**Body:** `{ "token": "uuid-token" }` hoặc query `?token=uuid-token`

---

## Companies

### `GET /api/companies` — DS công ty
- `?id=` — Chi tiết 1 công ty
### `POST /api/companies/create`
```json
{ "name": "Công ty ABC", "code": "ABC", "timezone": "Asia/Ho_Chi_Minh" }
```
### `POST /api/companies/update`
```json
{ "id": 1, "name": "ABC Corp", "code": "ABC", "timezone": "Asia/Ho_Chi_Minh" }
```
### `POST /api/companies/delete`
```json
{ "id": 1 }
```

---

## Branches

### `GET /api/branches`
- `?id=` — Chi tiết
- `?companyId=` — DS chi nhánh theo công ty

### `POST /api/branches/create`
```json
{ "companyId": 1, "name": "Chi nhánh HCM", "address": "123 Nguyễn Huệ" }
```
### `POST /api/branches/update`
```json
{ "id": 1, "name": "Chi nhánh HN", "address": "456 Tràng Tiền" }
```
### `POST /api/branches/delete`
```json
{ "id": 1 }
```

---

## Departments

### `GET /api/departments`
- `?id=` — Chi tiết
- `?companyId=` — DS phòng ban theo công ty
- `?branchId=` — DS phòng ban theo chi nhánh

### `POST /api/departments/create`
```json
{ "companyId": 1, "branchId": 1, "name": "Phòng Kỹ thuật" }
```
### `POST /api/departments/update`
```json
{ "id": 1, "name": "Phòng Kinh doanh", "branchId": 1 }
```
### `POST /api/departments/delete`
```json
{ "id": 1 }
```

---

## Employees

### `GET /api/employees`
- `?id=` — Chi tiết
- `?companyId=` — DS nhân viên theo công ty

### `POST /api/employees/create`
```json
{
  "userId": 1,
  "companyId": 1,
  "branchId": 1,
  "departmentId": 1,
  "employeeCode": "NV001",
  "fullName": "Nguyễn Văn A",
  "birthday": "1990-01-01",
  "gender": "male",
  "title": "Nhân viên"
}
```
### `POST /api/employees/update`
```json
{
  "id": 1,
  "fullName": "Nguyễn Văn B",
  "branchId": 1,
  "departmentId": 1,
  "birthday": "1990-01-01",
  "gender": "female",
  "title": "Trưởng phòng",
  "status": "active"
}
```
### `POST /api/employees/delete`
```json
{ "id": 1 }
```

---

## Memberships

### `GET /api/memberships`
- `?id=` — Chi tiết
- `?userId=` — DS công ty của user
- `?companyId=` — DS user trong công ty

### `POST /api/memberships/create`
```json
{
  "userId": 1,
  "companyId": 1,
  "employeeId": 1,
  "role": "employee",
  "activeDepartmentId": 1
}
```
### `POST /api/memberships/delete`
```json
{ "id": 1 }
```

---

## Devices

### `GET /api/devices`
- `?id=` — Chi tiết
- `?userId=` — DS thiết bị của user

### `POST /api/devices/register`
```json
{
  "userId": 1,
  "deviceUid": "uuid-thiet-bi",
  "deviceName": "iPhone 15",
  "platform": "ios",
  "osVersion": "17.0",
  "appVersion": "1.0.0",
  "pushToken": "firebase-push-token"
}
```
### `POST /api/devices/update-status`
```json
{ "id": 1, "status": "approved" }
```
**status:** `pending | approved | rejected | revoked`

---

## Approvals (Duyệt đăng nhập)

### `GET /api/approvals`
- `?id=` — Chi tiết
- `?userId=` — DS yêu cầu pending của user
- `?companyId=` — DS yêu cầu pending theo công ty

### `POST /api/approvals/create`
```json
{
  "userId": 1,
  "deviceId": 1,
  "requestType": "new_login",
  "ipAddress": "192.168.1.1",
  "userAgent": "Chrome/120"
}
```
**requestType:** `new_login | new_device`

### `POST /api/approvals/review` — Admin duyệt/từ chối
```json
{ "id": 1, "status": "approved", "rejectionReason": "" }
```
**status:** `approved | rejected`

---

## Locations (GPS)

### `GET /api/locations`
- `?id=` — Chi tiết
- `?companyId=` — DS địa điểm theo công ty
- `?branchId=` — DS địa điểm theo chi nhánh

### `POST /api/locations/create`
```json
{
  "companyId": 1,
  "branchId": 1,
  "name": "Văn phòng HCM",
  "address": "123 Nguyễn Huệ, Q1",
  "lat": 10.776,
  "lng": 106.701,
  "radiusM": 200
}
```
### `POST /api/locations/update`
```json
{
  "id": 1,
  "name": "VP HCM",
  "lat": 10.777,
  "lng": 106.702,
  "radiusM": 300,
  "address": "456 Lê Lợi",
  "branchId": 1
}
```
### `POST /api/locations/delete`
```json
{ "id": 1 }
```

---

## Wifis

### `GET /api/wifis`
- `?id=` — Chi tiết
- `?companyId=` — DS wifi theo công ty
- `?branchId=` — DS wifi theo chi nhánh

### `POST /api/wifis/create`
```json
{
  "companyId": 1,
  "branchId": 1,
  "name": "Wifi VP",
  "ssid": "MP-HCM",
  "bssid": "00:11:22:33:44:55",
  "matchMode": "ssid_bssid"
}
```
**matchMode:** `ssid` (chỉ tên wifi) | `ssid_bssid` (tên + địa chỉ MAC)

### `POST /api/wifis/update`
```json
{
  "id": 1,
  "name": "Wifi HN",
  "ssid": "MP-HN",
  "bssid": "AA:BB:CC:DD:EE:FF",
  "matchMode": "ssid",
  "branchId": 1
}
```
### `POST /api/wifis/delete`
```json
{ "id": 1 }
```

---

## Shifts

### `GET /api/shifts`
- `?id=` — Chi tiết
- `?companyId=` — DS ca làm theo công ty

### `POST /api/shifts/create`
```json
{
  "companyId": 1,
  "name": "Ca hành chính",
  "startTime": "08:00",
  "endTime": "17:00",
  "checkinFrom": "07:30",
  "checkinTo": "08:30",
  "checkoutFrom": "16:30",
  "checkoutTo": "17:30",
  "weekdays": 31,
  "attendanceMethod": "gps_wifi",
  "lateThresholdMin": 15,
  "earlyThresholdMin": 15,
  "workCredit": 1.0
}
```
**weekdays:** Bitmask (CN=1, T2=2, T3=4, T4=8, T5=16, T6=32, T7=64). VD: 31 = T2-T6

**attendanceMethod:** `gps | wifi | gps_wifi`

### `POST /api/shifts/update`
```json
{
  "id": 1,
  "name": "Ca Hành chính (Điều chỉnh)",
  "startTime": "08:30",
  "endTime": "17:30",
  "checkinFrom": "08:00",
  "checkinTo": "09:00",
  "checkoutFrom": "17:00",
  "checkoutTo": "18:00",
  "weekdays": 31,
  "attendanceMethod": "gps_wifi",
  "lateThresholdMin": 10,
  "earlyThresholdMin": 10,
  "workCredit": 1.0
}
```
### `POST /api/shifts/delete`
```json
{ "id": 1 }
```

---

## Shift Assignments

### `GET /api/shift-assignments`
- `?id=` — Chi tiết
- `?shiftId=` — DS gán ca theo ca
- `?employeeId=` — DS gán ca theo nhân viên
- `?employeeId=&date=2026-06-05` — Tra cứu ca hiệu lực cho nhân viên theo ngày
- `?departmentId=` — DS gán ca theo phòng ban
- `?branchId=` — DS gán ca theo chi nhánh

### `POST /api/shift-assignments/create`
```json
{
  "shiftId": 1,
  "scopeType": "employee",
  "companyId": 1,
  "branchId": 1,
  "departmentId": 1,
  "employeeId": 1,
  "startsOn": "2026-06-01",
  "endsOn": "2026-12-31"
}
```
**scopeType:** `company | branch | department | employee`
- Nếu `branch` → bắt buộc `branchId`
- Nếu `department` → bắt buộc `departmentId`
- Nếu `employee` → bắt buộc `employeeId`

### `POST /api/shift-assignments/delete`
```json
{ "id": 1 }
```

---

## Attendance

### `GET /api/attendance` — DS bản ghi chấm công
- `?id=` — Chi tiết
- `?companyId=&employeeId=&branchId=&departmentId=` — Lọc
- `&fromDate=2026-06-01&toDate=2026-06-30` — Khoảng ngày
- `&approvalStatus=pending` — `pending | approved | rejected`
- `&page=1&limit=20` — Phân trang

### `GET /api/attendance/evidences?recordId=1` — Bằng chứng chấm công

### `POST /api/attendance/checkin` — Check-in
```json
{
  "employeeId": 1,
  "shiftId": 1,
  "workDate": "2026-06-05",
  "clientTime": "2026-06-05T08:00:00.000Z",
  "lat": 10.776,
  "lng": 106.701,
  "accuracyM": 15,
  "wifiSsid": "MP-HCM",
  "wifiBssid": "00:11:22:33:44:55",
  "photoPath": "uploads/photo.jpg",
  "note": "Đã check-in",
  "deviceId": 1
}
```

### `POST /api/attendance/checkout` — Check-out
```json
{
  "attendanceRecordId": 1,
  "clientTime": "2026-06-05T17:00:00.000Z",
  "lat": 10.776,
  "lng": 106.701,
  "accuracyM": 20,
  "wifiSsid": "MP-HCM",
  "wifiBssid": "00:11:22:33:44:55",
  "photoPath": "uploads/photo-out.jpg",
  "note": "Đã check-out",
  "deviceId": 1
}
```

### `POST /api/attendance/approve` — Admin duyệt/từ chối
```json
{ "id": 1, "status": "approved", "rejectionReason": "" }
```
**status:** `approved | rejected`

### `POST /api/attendance/edit` — Admin sửa bản ghi (có log)
```json
{
  "id": 1,
  "reason": "Quên check-out",
  "checkinAt": "2026-06-05T08:00:00.000Z",
  "checkoutAt": "2026-06-05T17:00:00.000Z",
  "workStatus": "full_day",
  "lateMin": 0,
  "earlyMin": 0,
  "workCredit": 1.0
}
```

---

## Notifications

### `GET /api/notifications`
- `?id=` — Chi tiết
- `?userId=` — DS thông báo của user
- `?userId=&unread=1` — DS chưa đọc
- `&limit=10&offset=0` — Phân trang

### `POST /api/notifications/read`
```json
{ "id": 1 }
```
### `POST /api/notifications/read-all`
```json
{ "userId": 1 }
```

---

## Health Check (không cần auth)

### `GET /health`
```
Response: { "success": true, "message": "Server is running", "timestamp": "..." }
```
