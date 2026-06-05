# Tai lieu tich hop App nhan vien

> Pham vi: App mobile cho nhan vien cham cong. Tai lieu nay mo ta cong nghe app, cach tich hop Firebase App Check va danh sach API app can goi len server.

## 1. Cong nghe su dung

| Hang muc | Cong nghe | Ghi chu |
|---|---|---|
| Nen tang app | Expo + React Native | Dung Expo Development Client/EAS Build vi Firebase App Check la native module, khong dung Expo Go cho ban tich hop that. |
| Firebase core | `@react-native-firebase/app` | Module bat buoc truoc khi cai `app-check`. |
| Firebase App Check | `@react-native-firebase/app-check` | Tai lieu: https://rnfirebase.io/app-check/usage |
| Xac thuc | SĐT + mat khau tren server, Google/Apple OAuth | Google/Apple lay token tu nha cung cap roi gui server xac minh/gan voi tai khoan do Admin cap. |
| Luu token | `expo-secure-store` | Luu access token/session token, device id, company context hien tai. |
| Vi tri GPS | `expo-location` | Lay `lat`, `lng`, `accuracy`, timestamp khi cham cong. |
| Camera | `expo-camera` | Bat buoc khi cham cong offline. |
| Trang thai mang | `expo-network` | Phat hien mat mang de hien luong cham offline. |
| Upload file | `fetch`/HTTP client ho tro `multipart/form-data` | Dung cho anh cham cong offline. |

## 2. Tich hop Firebase App Check

App Check duoc dung de chung minh request den tu app hop le, khong thay the dang nhap nguoi dung. App van phai gui token dang nhap/session rieng sau khi user duoc server xac thuc.

Thiet lap provider:

| Moi truong | Android | iOS |
|---|---|---|
| Development/CI | `debug` + `debugToken` | `debug` + `debugToken` |
| Production | `playIntegrity` | `appAttestWithDeviceCheckFallback` |

Luong khoi tao:

1. Dang ky app Android/iOS trong Firebase Console va bat App Check.
2. Cai `@react-native-firebase/app` va `@react-native-firebase/app-check`.
3. Cau hinh provider theo moi truong.
4. Goi `initializeAppCheck` truoc khi goi API backend.
5. Moi request len server gui header:

```http
X-Firebase-AppCheck: <firebase_app_check_token>
Authorization: Bearer <server_access_token>
X-Company-Id: <company_id>
```

Voi cac API chua dang nhap nhu login, van gui `X-Firebase-AppCheck`; `Authorization` chi co sau khi server cap token.

## 3. Nguyen tac goi API tu app

- Base URL mac dinh: `/api/v1`.
- Dinh dang mac dinh: `application/json`.
- Upload cham cong offline: `multipart/form-data`.
- Moi API nhan vien phai qua App Check.
- Moi request sau dang nhap phai kem `Authorization: Bearer <token>`.
- `company_id` la ngu canh lam viec hien tai vi 1 tai khoan co the thuoc nhieu cong ty.
- Cham cong online chi thanh cong khi dung cau hinh ca: GPS, Wifi, hoac GPS + Wifi. Neu ca chon GPS + Wifi thi phai dung ca hai.

## 4. Bang API app can thiet

| Nhom | Method | URL | formData/body | Dung de lam gi |
|---|---:|---|---|---|
| Auth | POST | `/api/v1/auth/login` | JSON: `phone`, `password`, `device_id`, `device_name`, `platform`, `os_version`, `app_version` | Dang nhap bang SĐT + mat khau do Admin cap. Tra ve token neu tai khoan/thiet bi da duoc duyet, hoac trang thai cho Admin xac nhan. |
| Auth | POST | `/api/v1/auth/oauth/google` | JSON: `id_token`, `device_id`, `device_name`, `platform`, `os_version`, `app_version` | Dang nhap bang Google, server xac minh token va map voi tai khoan nhan vien da ton tai. |
| Auth | POST | `/api/v1/auth/oauth/apple` | JSON: `identity_token`, `authorization_code`, `device_id`, `device_name`, `platform`, `os_version`, `app_version` | Dang nhap bang Apple, server xac minh token va map voi tai khoan nhan vien da ton tai. |
| Auth | POST | `/api/v1/auth/logout` | JSON: `device_id` | Dang xuat thiet bi hien tai, thu hoi session/token phia server. |
| Auth | GET | `/api/v1/auth/me` | Query/header: `company_id` | Lay thong tin tai khoan, nhan vien, phong ban, vai tro trong cong ty dang chon. |
| Cong ty | GET | `/api/v1/me/companies` | Khong co body | Lay danh sach cong ty tai khoan duoc tham gia de hien nut chuyen cong ty. |
| Cong ty | POST | `/api/v1/me/switch-company` | JSON: `company_id`, `department_id` | Doi ngu canh cong ty/phong lam viec; server kiem tra tai khoan chi dang nhap 1 phong tai mot thoi diem. |
| Thiet bi | POST | `/api/v1/devices/register` | JSON: `device_id`, `device_name`, `platform`, `os_version`, `app_version`, `push_token` | Ghi nhan thiet bi moi va tao yeu cau Admin xac nhan neu can. |
| Thiet bi | GET | `/api/v1/devices/current` | Query: `device_id` | Kiem tra thiet bi hien tai da duoc duyet, bi tu choi, hay dang cho. |
| Thiet bi | GET | `/api/v1/login-approval-requests/current` | Query: `device_id` | Poll trang thai yeu cau xac nhan dang nhap/thiet bi moi. |
| Ho so | GET | `/api/v1/me/profile` | Query/header: `company_id` | Lay thong tin ca nhan: ma NV, SĐT, email, ngay sinh, gioi tinh, chi nhanh, phong ban, chuc vu. |
| Ca lam | GET | `/api/v1/me/today-shifts` | Query: `company_id`, `date` | Lay danh sach ca hom nay, gio vao/ra, khung cham, nguong muon/som, GPS/Wifi ap dung. |
| Ca lam | GET | `/api/v1/me/shift-rules/{shift_id}` | Path: `shift_id`; query: `company_id` | Lay chi tiet quy dinh cham cong cua 1 ca de hien "Quy dinh ca lam". |
| Cham cong | POST | `/api/v1/attendance/punch` | JSON: `company_id`, `employee_id`, `shift_id`, `punch_type` (`in`/`out`), `client_time`, `lat`, `lng`, `accuracy`, `wifi_ssid`, `wifi_bssid`, `device_id` | Cham vao/ra ca online. Server doi chieu GPS/Wifi theo cau hinh ca. |
| Cham cong | POST | `/api/v1/attendance/offline` | `multipart/form-data`: `company_id`, `employee_id`, `shift_id`, `punch_type`, `client_time`, `lat`, `lng`, `accuracy`, `device_id`, `note`, `photo` | Gui ban ghi cham cong offline kem anh va toa do GPS, trang thai mac dinh la cho Admin duyet. |
| Cham cong | GET | `/api/v1/attendance/today` | Query: `company_id`, `date` | Lay gio vao/ra cua ngay hien tai de hien card "Gio vao ca", "Gio ra ca". |
| Lich su | GET | `/api/v1/attendance/history` | Query: `company_id`, `from_date`, `to_date`, `view` (`week`/`month`) | Lay lich su cham cong theo tuan/thang, gom dung gio, di muon, ve som, quen cham, nghi, offline cho duyet. |
| Thong ke | GET | `/api/v1/me/statistics` | Query: `company_id`, `month` (`YYYY-MM`) | Lay tong cong, so phut di muon, ve som, so ngay nghi, so lan quen cham cua nhan vien. |
| Thong bao | GET | `/api/v1/me/notifications` | Query: `company_id`, `page`, `limit` | Lay thong bao duyet/từ choi cham offline, duyet thiet bi, thay doi ca. |

## 5. Ghi chu nghiep vu tren app

- Tai khoan khong tu dang ky; Admin tao truoc nhan vien va tai khoan.
- Lan dang nhap dau hoac thiet bi moi phai cho Admin xac nhan.
- Neu offline, app cho phep tao ban ghi tam nhung bat buoc co anh + GPS; ban ghi chi tinh hop le sau khi server/Admin duyet.
- App chi hien nut cham online khi nam trong khung gio duoc phep cham cua ca.
- Khi server tra ve loi GPS/Wifi khong hop le, app hien ly do that bai va khong tao ban ghi thanh cong.
