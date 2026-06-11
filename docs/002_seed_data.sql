-- =========================================================
-- SEED DATA — Dữ liệu mẫu cho Hệ thống Chấm Công
-- IDEMPOTENT: chạy được nhiều lần (xoá sạch → insert lại)
-- =========================================================
-- Cách chạy: mở pgAdmin Query Tool → paste → Execute
-- Hoặc: psql -h localhost -U postgres -d postgres -f docs\002_seed_data.sql

-- Xoá toàn bộ dữ liệu cũ (CASCADE tự động xoá theo FK)
TRUNCATE TABLE
  attendance_edit_logs,
  attendance_evidences,
  attendance_records,
  shift_assignments,
  shifts,
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
INSERT INTO users (phone, email, full_name, birthday,is_hunonic, gender, status) VALUES
('0394241597', '0394241597@hunonic.vn', 'Nguyễn Minh Hiếu', '1990-01-15', 1, 1, 1);

-- =========================================================
-- 2. COMPANIES
-- =========================================================
INSERT INTO companies (name, code, timezone) VALUES
('Công ty cổ phần HUNONIC VN', 'HUNONICVN', 'Asia/Ho_Chi_Minh');

-- =========================================================
-- 3. BRANCHES (chi nhánh)
-- =========================================================
INSERT INTO branches (company_id, name, address) VALUES
(1, 'Trụ sở chính', 'Hunonic Center, Đường CMT8, Tổ dân phố Cam Giá 2, Phường Gia Sàng, Tỉnh Thái Nguyên');

-- =========================================================
-- 4. DEPARTMENTS (phòng ban)
-- =========================================================
INSERT INTO departments (company_id, branch_id, name) VALUES
(1, 1, 'RD');

-- =========================================================
-- 5. EMPLOYEES (nhân viên)
-- =========================================================
INSERT INTO employees (user_id, company_id, branch_id, department_id, employee_code, title, status) VALUES
(1, 1, 1, 1, 'HUNONICVN-001', 'Chủ Tịt', 1);

-- =========================================================
-- 6. COMPANY MEMBERSHIPS (quyền)
-- =========================================================
INSERT INTO company_memberships (user_id, company_id, employee_id, role) VALUES
(1, 1, 1, 1);



