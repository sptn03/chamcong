-- =========================================================
-- SEED DATA — Dữ liệu mẫu cho Hệ thống Chấm Công
-- IDEMPOTENT: chạy được nhiều lần (xoá sạch → insert lại)
-- =========================================================
-- Cách chạy: mở pgAdmin Query Tool → paste → Execute
-- Hoặc: psql -h localhost -U postgres -d postgres -f docs\002_seed_data.sql

-- Xoá toàn bộ dữ liệu cũ (CASCADE tự động xoá theo FK)
TRUNCATE TABLE
  notifications,
  attendance_edit_logs,
  attendance_evidences,
  attendance_records,
  leave_requests,
  shift_assignments,
  shifts,
  holidays,
  wifis,
  locations,
  devices,
  tokens,
  company_memberships,
  employees,
  departments,
  branches,
  companies,
  users
RESTART IDENTITY CASCADE;

-- =========================================================
-- 1. USERS — Tài khoản đăng nhập
-- Mật khẩu dùng pgcrypto: crypt('admin123', gen_salt('bf'))
-- =========================================================
INSERT INTO users (phone, email, pass, full_name, birthday, gender, status) VALUES
('0912345678', 'admin@minhphuc.vn', crypt('admin123', gen_salt('bf')), 'Nguyễn Minh Hiếu', '1990-01-15', 1, 1),
('0987654321', 'admin2@minhphuc.vn', crypt('admin123', gen_salt('bf')), 'Quản trị viên', '1988-06-20', 1, 1),
('0977111222', 'tran.ha@minhphuc.vn', crypt('admin123', gen_salt('bf')), 'Trần Thu Hà', '1994-03-12', 2, 1),
('0966111333', 'le.bao@minhphuc.vn', crypt('admin123', gen_salt('bf')), 'Lê Quốc Bảo', '1996-07-25', 1, 1),
('0955111444', 'pham.linh@minhphuc.vn', crypt('admin123', gen_salt('bf')), 'Phạm Thuỳ Linh', '1992-01-30', 2, 1),
('0944111555', 'hoang.tuan@minhphuc.vn', crypt('admin123', gen_salt('bf')), 'Hoàng Anh Tuấn', '1988-09-19', 1, 1),
('0933111666', 'vu.mai@minhphuc.vn', crypt('admin123', gen_salt('bf')), 'Vũ Thị Mai', '1995-06-02', 2, 1),
('0922111777', 'do.khoi@minhphuc.vn', crypt('admin123', gen_salt('bf')), 'Đỗ Văn Khôi', '1993-12-14', 1, 1),
('0911881888', 'bui.vy@minhphuc.vn', crypt('admin123', gen_salt('bf')), 'Bùi Khánh Vy', '1997-04-27', 2, 1),
('0901991999', 'dang.phuoc@minhphuc.vn', crypt('admin123', gen_salt('bf')), 'Đặng Hữu Phước', '1991-08-06', 1, 1);

-- =========================================================
-- 2. COMPANIES
-- =========================================================
INSERT INTO companies (name, code, timezone) VALUES
('Công ty TNHH Minh Phúc', 'MINHPHUC', 'Asia/Ho_Chi_Minh');

-- =========================================================
-- 3. BRANCHES (chi nhánh)
-- =========================================================
INSERT INTO branches (company_id, name, address) VALUES
(1, 'Chi nhánh Hà Nội', 'Tầng 8, Toà nhà Sông Đà, Mỹ Đình, Hà Nội'),
(1, 'Chi nhánh Đà Nẵng', 'KCN Hoà Khánh, Liên Chiểu, Đà Nẵng'),
(1, 'Chi nhánh HCM', 'Số 12 Nguyễn Huệ, Quận 1, TP.HCM');

-- =========================================================
-- 4. DEPARTMENTS (phòng ban)
-- =========================================================
INSERT INTO departments (company_id, branch_id, name) VALUES
(1, 1, 'Phòng Kỹ thuật'),
(1, 1, 'Phòng Kinh doanh'),
(1, 1, 'Phòng Nhân sự'),
(1, 2, 'Phòng Vận hành'),
(1, 2, 'Phòng Hỗ trợ'),
(1, 3, 'Phòng Kinh doanh'),
(1, 3, 'Phòng Marketing');

-- =========================================================
-- 5. EMPLOYEES (nhân viên)
-- =========================================================
INSERT INTO employees (user_id, company_id, branch_id, department_id, employee_code, title, status) VALUES
(1, 1, 1, 3, 'NV-421', 'Giám đốc', 1),
(2, 1, 1, 3, 'NV-422', 'Quản trị viên', 1),
(3, 1, 1, 1, 'NV-423', 'Kỹ sư', 1),
(4, 1, 2, 4, 'NV-424', 'Trưởng nhóm', 1),
(5, 1, 3, 6, 'NV-425', 'Chuyên viên', 1),
(6, 1, 1, 2, 'NV-426', 'Nhân viên', 1),
(7, 1, 3, 6, 'NV-427', 'Chuyên viên', 1),
(8, 1, 2, 5, 'NV-428', 'Nhân viên', 1),
(9, 1, 1, 1, 'NV-429', 'Kỹ sư', 1),
(10, 1, 1, 1, 'NV-430', 'Nhân viên', 1);

-- =========================================================
-- 6. COMPANY MEMBERSHIPS (quyền)
-- =========================================================
INSERT INTO company_memberships (user_id, company_id, employee_id, role) VALUES
(1, 1, 1, 1),
(2, 1, 2, 1),
(3, 1, 3, 2),
(4, 1, 4, 2),
(5, 1, 5, 2),
(6, 1, 6, 2),
(7, 1, 7, 2),
(8, 1, 8, 2),
(9, 1, 9, 2),
(10, 1, 10, 2);

-- =========================================================
-- 7. LOCATIONS (vị trí GPS)
-- =========================================================
INSERT INTO locations (company_id, branch_id, name, address, lat, lng, radius_m) VALUES
(1, 1, 'VP Hà Nội', 'Tầng 8, Toà nhà Sông Đà, Mỹ Đình, Hà Nội', 21.028511, 105.804817, 80),
(1, 2, 'Nhà máy Đà Nẵng', 'KCN Hoà Khánh, Liên Chiểu, Đà Nẵng', 16.073270, 108.149870, 150),
(1, 3, 'VP HCM', 'Số 12 Nguyễn Huệ, Quận 1, TP.HCM', 10.774160, 106.703450, 60),
(1, 1, 'Kho Long Biên', 'Số 5 Ngọc Lâm, Long Biên, Hà Nội', 21.041500, 105.873200, 100);

-- =========================================================
-- 8. WIFIS
-- =========================================================
INSERT INTO wifis (company_id, branch_id, name, ssid, bssid, match_mode) VALUES
(1, 1, 'Mạng văn phòng', 'MinhPhuc-Office', 'A4:2B:8C:11:90:01', 2),
(1, 2, 'Mạng nhà máy', 'Factory-5G', 'B8:27:EB:55:23:7F', 2),
(1, 3, 'Mạng HCM', 'MP-HCM', NULL, 1);

-- =========================================================
-- 9. SHIFTS (ca làm)
-- =========================================================
INSERT INTO shifts (company_id, name, start_time, end_time, checkin_from, checkin_to, checkout_from, checkout_to, weekdays, attendance_method, late_threshold_min, early_threshold_min, work_credit) VALUES
(1, 'Ca hành chính', '08:00', '17:30', '06:00', '09:00', '16:30', '18:30', 31, 3, 10, 10, 1.00),
(1, 'Ca sáng nhà máy', '06:00', '14:00', '05:00', '07:00', '13:30', '15:00', 63, 1, 5, 5, 1.00),
(1, 'Ca tối', '14:00', '22:00', '13:00', '15:00', '21:30', '23:00', 63, 3, 5, 5, 0.33),
(1, 'Ca cuối tuần', '08:00', '12:00', '07:00', '09:00', '11:30', '12:30', 96, 2, 15, 10, 0.50);

-- =========================================================
-- 10. SHIFT ASSIGNMENTS (gán ca)
-- =========================================================
INSERT INTO shift_assignments (shift_id, scope_type, company_id, branch_id, department_id, employee_id) VALUES
(1, 1, 1, NULL, NULL, NULL),
(2, 2, 1, 2, NULL, NULL),
(3, 2, 1, 2, NULL, NULL),
(4, 1, 1, NULL, NULL, NULL);

-- =========================================================
-- 11. ATTENDANCE RECORDS
-- =========================================================
INSERT INTO attendance_records (company_id, employee_id, branch_id, department_id, shift_id, work_date, checkin_at, checkout_at, source, work_status, late_min, early_min, actual_work_minutes, work_credit) VALUES
(1, 1, 1, 3, 1, CURRENT_DATE, CURRENT_TIMESTAMP - INTERVAL '8 hours', CURRENT_TIMESTAMP - INTERVAL '1 hour', 1, 1, 0, 0, 480, 1.00),
(1, 3, 1, 1, 1, CURRENT_DATE, CURRENT_TIMESTAMP - INTERVAL '8 hours', CURRENT_TIMESTAMP - INTERVAL '2 hours', 1, 1, 0, 0, 480, 1.00),
(1, 4, 2, 4, 2, CURRENT_DATE, CURRENT_TIMESTAMP - INTERVAL '7 hours', CURRENT_TIMESTAMP - INTERVAL '3 hours', 1, 1, 0, 0, 480, 1.00),
(1, 6, 3, 6, 1, CURRENT_DATE, CURRENT_TIMESTAMP - INTERVAL '8.5 hours', NULL, 1, 2, 14, 0, 450, 0.94),
(1, 9, 1, 1, 1, CURRENT_DATE, CURRENT_TIMESTAMP - INTERVAL '9 hours', CURRENT_TIMESTAMP - INTERVAL '0.5 hours', 1, 1, 0, 0, 480, 1.00);

INSERT INTO attendance_records (company_id, employee_id, branch_id, department_id, shift_id, work_date, checkin_at, source, approval_status, work_status, late_min, actual_work_minutes) VALUES
(1, 3, 1, 1, 1, CURRENT_DATE - 1, CURRENT_TIMESTAMP - INTERVAL '1 day' - INTERVAL '8 hours', 2, 1, 1, 0, 480),
(1, 7, 3, 6, 1, CURRENT_DATE - 1, CURRENT_TIMESTAMP - INTERVAL '1 day' - INTERVAL '8 hours', 2, 1, 2, 12, 468),
(1, 8, 2, 5, 1, CURRENT_DATE - 1, CURRENT_TIMESTAMP - INTERVAL '1 day' - INTERVAL '7 hours', 2, 1, 2, 18, 462);

-- =========================================================
-- 12. NOTIFICATIONS
-- =========================================================
INSERT INTO notifications (company_id, user_id, type, title, body, data_json) VALUES
(1, 1, 'offline_pending', 'Chấm công cần duyệt', 'Trần Thu Hà gửi chấm công offline.', '{"employeeId":3}'::jsonb),
(1, 1, 'device_pending', 'Thiết bị mới cần xác nhận', 'Hoàng Anh Tuấn đăng nhập từ thiết bị mới.', '{"userId":6}'::jsonb),
(1, 1, 'offline_pending', 'Chấm công cần duyệt', 'Vũ Thị Mai gửi chấm công offline từ HCM.', '{"employeeId":7}'::jsonb);

-- =========================================================
-- 13. HOLIDAYS
-- =========================================================
INSERT INTO holidays (company_id, name, holiday_date, work_credit) VALUES
(1, 'Tết Dương lịch', '2026-01-01', 1.00),
(1, 'Tết Nguyên đán', '2026-02-16', 1.00),
(1, 'Tết Nguyên đán', '2026-02-17', 1.00),
(1, 'Giỗ Tổ Hùng Vương', '2026-04-06', 1.00),
(1, 'Ngày Giải phóng', '2026-04-30', 1.00),
(1, 'Ngày Quốc tế Lao động', '2026-05-01', 1.00),
(1, 'Quốc khánh', '2026-09-02', 1.00);
