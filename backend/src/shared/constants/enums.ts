// =========================================================
// ENUM CONSTANTS  DATA TYPE MAPPINGS
// =========================================================

// Trạng thái người dùng
export const USER_STATUS_ACTIVE = 1; // Đang hoạt động
export const USER_STATUS_LOCKED = 2; // Bị khóa

// Vai trò thành viên
export const MEMBERSHIP_ROLE_ADMIN = 1; // Quản trị viên
export const MEMBERSHIP_ROLE_EMPLOYEE = 2; // Nhân viên

// Trạng thái nhân viên
export const EMPLOYEE_STATUS_ACTIVE = 1; // Đang hoạt động
export const EMPLOYEE_STATUS_LOCKED = 2; // Bị khóa

// Giới tính
export const GENDER_TYPE_MALE = 1; // Nam
export const GENDER_TYPE_FEMALE = 2; // Nữ
export const GENDER_TYPE_OTHER = 3; // Không xác định

// Platform thiết bị
export const DEVICE_PLATFORM_IOS = 1; // iOS
export const DEVICE_PLATFORM_ANDROID = 2; // Android

// Trạng thái thiết bị
export const DEVICE_STATUS_PENDING = 1; // Đang chờ
export const DEVICE_STATUS_APPROVED = 2; // Đã duyệt
export const DEVICE_STATUS_REJECTED = 3; // Bị từ chối
export const DEVICE_STATUS_REVOKED = 4; // Đã thu hồi


// Trạng thái duyệt phép
export const APPROVAL_STATUS_PENDING = 1; // Đang chờ
export const APPROVAL_STATUS_APPROVED = 2; // Đã duyệt
export const APPROVAL_STATUS_REJECTED = 3; // Bị từ chối

// Mode khớp WIFI
export const WIFI_MATCH_MODE_SSID = 1; // SSID
export const WIFI_MATCH_MODE_SSID_BSSID = 2; // SSID + BSSID

// Phương thức chấm công
export const ATTENDANCE_METHOD_GPS = 1; // GPS
export const ATTENDANCE_METHOD_WIFI = 2; // WIFI
export const ATTENDANCE_METHOD_WIFI_OR_GPS = 3; // WIFI or GPS
export const ATTENDANCE_METHOD_GPS_WIFI = 4; // GPS + WIFI


// Phạm vi áp dụng ca làm việc
export const SHIFT_ASSIGNMENT_SCOPE_COMPANY = 1; // Toàn công ty
export const SHIFT_ASSIGNMENT_SCOPE_BRANCH = 2; // Chi nhánh
export const SHIFT_ASSIGNMENT_SCOPE_DEPARTMENT = 3; // Phòng ban
export const SHIFT_ASSIGNMENT_SCOPE_EMPLOYEE = 4; // Nhân viên cụ thể

// Kiểu chấm công
export const PUNCH_TYPE_IN = 1;   // Vào ca
export const PUNCH_TYPE_OUT = 2;  // Ra ca

// nguồn chấm công
export const ATTENDANCE_SOURCE_ONLINE = 1; // Online
export const ATTENDANCE_SOURCE_OFFLINE = 2; // Offline
export const ATTENDANCE_SOURCE_ADMIN_EDIT = 3; // Quản trị viên sửa đổi

// Trạng thái làm việc
export const WORK_STATUS_NORMAL = 1; // Bình thường
export const WORK_STATUS_LATE = 2; // Trễ
export const WORK_STATUS_EARLY = 3; // Sớm
export const WORK_STATUS_LATE_EARLY = 4; // Trễ và Sớm
export const WORK_STATUS_FORGOT = 5; // Quên chấm công
export const WORK_STATUS_ABSENT = 6; // Vắng
export const WORK_STATUS_LEAVE = 7; // Phép

// Kiểu phép nghỉ
export const LEAVE_TYPE_ANNUAL = 1; // Phép năm
export const LEAVE_TYPE_SICK = 2; // Phép ốm
export const LEAVE_TYPE_UNPAID = 3;  // Phép không lương
export const LEAVE_TYPE_OTHER = 4; // Phép khác
