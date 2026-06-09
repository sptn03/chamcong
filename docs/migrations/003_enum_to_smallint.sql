-- =========================================================
-- MIGRATION 003: ENUM → SMALLINT + VARCHAR → TEXT
-- Chuyển tất cả PostgreSQL ENUM types thành SMALLINT
-- và đổi VARCHAR(name/address) thành TEXT
-- =========================================================

-- Bước 1: ALTER bảng users
ALTER TABLE users ALTER COLUMN status TYPE SMALLINT USING (
  CASE status::text WHEN 'active' THEN 1 WHEN 'locked' THEN 2 END
);
ALTER TABLE users ALTER COLUMN status SET DEFAULT 1;
ALTER TABLE users ADD CONSTRAINT chk_users_status CHECK (status IN (1, 2));

ALTER TABLE users ALTER COLUMN gender TYPE SMALLINT USING (
  CASE WHEN gender IS NULL THEN NULL
       WHEN gender::text = 'male' THEN 1
       WHEN gender::text = 'female' THEN 2
       WHEN gender::text = 'other' THEN 3
  END
);
ALTER TABLE users ADD CONSTRAINT chk_users_gender CHECK (gender IN (1, 2, 3));

ALTER TABLE users ALTER COLUMN full_name TYPE TEXT;

DROP INDEX IF EXISTS idx_employees_user_id;
CREATE INDEX idx_employees_user_id ON employees(user_id) WHERE status = 1 AND deleted_at IS NULL;

-- Bước 2: ALTER bảng employees
ALTER TABLE employees ALTER COLUMN status TYPE SMALLINT USING (
  CASE status::text WHEN 'active' THEN 1 WHEN 'locked' THEN 2 END
);
ALTER TABLE employees ALTER COLUMN status SET DEFAULT 1;
ALTER TABLE employees ADD CONSTRAINT chk_employees_status CHECK (status IN (1, 2));

ALTER TABLE employees DROP COLUMN IF EXISTS full_name;
ALTER TABLE employees DROP COLUMN IF EXISTS birthday;
ALTER TABLE employees DROP COLUMN IF EXISTS gender;

-- Bước 3: ALTER bảng company_memberships
ALTER TABLE company_memberships ALTER COLUMN role TYPE SMALLINT USING (
  CASE role::text WHEN 'admin' THEN 1 WHEN 'employee' THEN 2 END
);
ALTER TABLE company_memberships ALTER COLUMN role SET DEFAULT 2;
ALTER TABLE company_memberships ADD CONSTRAINT chk_membership_role CHECK (role IN (1, 2));

-- Bước 4: ALTER bảng devices
ALTER TABLE devices ALTER COLUMN platform TYPE SMALLINT USING (
  CASE platform::text WHEN 'ios' THEN 1 WHEN 'android' THEN 2 END
);
ALTER TABLE devices ADD CONSTRAINT chk_devices_platform CHECK (platform IN (1, 2));

ALTER TABLE devices ALTER COLUMN status TYPE SMALLINT USING (
  CASE status::text
    WHEN 'pending' THEN 1
    WHEN 'approved' THEN 2
    WHEN 'rejected' THEN 3
    WHEN 'revoked' THEN 4
  END
);
ALTER TABLE devices ALTER COLUMN status SET DEFAULT 1;
ALTER TABLE devices ADD CONSTRAINT chk_devices_status CHECK (status IN (1, 2, 3, 4));

ALTER TABLE devices ALTER COLUMN device_uid TYPE TEXT;
ALTER TABLE devices ALTER COLUMN device_name TYPE TEXT;

-- Bước 5: ALTER bảng wifis
ALTER TABLE wifis ALTER COLUMN match_mode TYPE SMALLINT USING (
  CASE match_mode::text WHEN 'ssid' THEN 1 WHEN 'ssid_bssid' THEN 2 END
);
ALTER TABLE wifis ALTER COLUMN match_mode SET DEFAULT 2;
ALTER TABLE wifis ADD CONSTRAINT chk_wifis_match_mode CHECK (match_mode IN (1, 2));

-- Bước 6: ALTER bảng shifts
ALTER TABLE shifts ALTER COLUMN attendance_method TYPE SMALLINT USING (
  CASE attendance_method::text
    WHEN 'gps' THEN 1
    WHEN 'wifi' THEN 2
    WHEN 'gps_wifi' THEN 3
    WHEN 'gps_or_wifi' THEN 4
  END
);
ALTER TABLE shifts ADD CONSTRAINT chk_shifts_attendance_method CHECK (attendance_method IN (1, 2, 3, 4));

-- Bước 7: ALTER bảng shift_assignments
ALTER TABLE shift_assignments ALTER COLUMN scope_type TYPE SMALLINT USING (
  CASE scope_type::text
    WHEN 'company' THEN 1
    WHEN 'branch' THEN 2
    WHEN 'department' THEN 3
    WHEN 'employee' THEN 4
  END
);
ALTER TABLE shift_assignments ADD CONSTRAINT chk_shift_assignments_scope CHECK (scope_type IN (1, 2, 3, 4));

-- Bước 8: ALTER bảng leave_requests
ALTER TABLE leave_requests ALTER COLUMN leave_type TYPE SMALLINT USING (
  CASE leave_type::text
    WHEN 'annual' THEN 1
    WHEN 'sick' THEN 2
    WHEN 'unpaid' THEN 3
    WHEN 'other' THEN 4
  END
);
ALTER TABLE leave_requests ADD CONSTRAINT chk_leave_requests_type CHECK (leave_type IN (1, 2, 3, 4));

ALTER TABLE leave_requests ALTER COLUMN status TYPE SMALLINT USING (
  CASE status::text
    WHEN 'pending' THEN 1
    WHEN 'approved' THEN 2
    WHEN 'rejected' THEN 3
  END
);
ALTER TABLE leave_requests ALTER COLUMN status SET DEFAULT 1;
ALTER TABLE leave_requests ADD CONSTRAINT chk_leave_requests_status CHECK (status IN (1, 2, 3));

-- Bước 9: ALTER bảng attendance_records
ALTER TABLE attendance_records ALTER COLUMN source TYPE SMALLINT USING (
  CASE source::text
    WHEN 'online' THEN 1
    WHEN 'offline' THEN 2
    WHEN 'admin_edit' THEN 3
  END
);
ALTER TABLE attendance_records ALTER COLUMN source SET DEFAULT 1;
ALTER TABLE attendance_records ADD CONSTRAINT chk_attendance_source CHECK (source IN (1, 2, 3));

ALTER TABLE attendance_records ALTER COLUMN original_source TYPE SMALLINT USING (
  CASE original_source::text
    WHEN 'online' THEN 1
    WHEN 'offline' THEN 2
    WHEN 'admin_edit' THEN 3
  END
);
ALTER TABLE attendance_records ALTER COLUMN original_source SET DEFAULT 1;
ALTER TABLE attendance_records ADD CONSTRAINT chk_attendance_original_source CHECK (original_source IN (1, 2, 3));

ALTER TABLE attendance_records ALTER COLUMN approval_status TYPE SMALLINT USING (
  CASE approval_status::text
    WHEN 'pending' THEN 1
    WHEN 'approved' THEN 2
    WHEN 'rejected' THEN 3
  END
);
ALTER TABLE attendance_records ALTER COLUMN approval_status SET DEFAULT 2;
ALTER TABLE attendance_records ADD CONSTRAINT chk_attendance_approval_status CHECK (approval_status IN (1, 2, 3));

ALTER TABLE attendance_records ALTER COLUMN work_status TYPE SMALLINT USING (
  CASE work_status::text
    WHEN 'normal' THEN 1
    WHEN 'late' THEN 2
    WHEN 'early' THEN 3
    WHEN 'late_early' THEN 4
    WHEN 'forgot' THEN 5
    WHEN 'absent' THEN 6
    WHEN 'leave' THEN 7
  END
);
ALTER TABLE attendance_records ALTER COLUMN work_status SET DEFAULT 1;
ALTER TABLE attendance_records ADD CONSTRAINT chk_attendance_work_status CHECK (work_status IN (1, 2, 3, 4, 5, 6, 7));

-- Bước 10: ALTER bảng attendance_evidences
ALTER TABLE attendance_evidences ALTER COLUMN punch_type TYPE SMALLINT USING (
  CASE punch_type::text WHEN 'in' THEN 1 WHEN 'out' THEN 2 END
);
ALTER TABLE attendance_evidences ADD CONSTRAINT chk_evidences_punch_type CHECK (punch_type IN (1, 2));

-- Bước 11: Đổi VARCHAR → TEXT cho name/address columns
ALTER TABLE companies ALTER COLUMN name TYPE TEXT;
ALTER TABLE branches ALTER COLUMN name TYPE TEXT;
ALTER TABLE branches ALTER COLUMN address TYPE TEXT;
ALTER TABLE departments ALTER COLUMN name TYPE TEXT;
ALTER TABLE locations ALTER COLUMN name TYPE TEXT;
ALTER TABLE locations ALTER COLUMN address TYPE TEXT;
ALTER TABLE wifis ALTER COLUMN name TYPE TEXT;
ALTER TABLE shifts ALTER COLUMN name TYPE TEXT;
ALTER TABLE holidays ALTER COLUMN name TYPE TEXT;
ALTER TABLE notifications ALTER COLUMN title TYPE TEXT;

-- Bước 12: Cập nhật CHECK constraints có tham chiếu string
ALTER TABLE company_memberships DROP CONSTRAINT IF EXISTS chk_membership_employee_required;
ALTER TABLE company_memberships ADD CONSTRAINT chk_membership_employee_required CHECK (role = 1 OR employee_id IS NOT NULL);

ALTER TABLE wifis DROP CONSTRAINT IF EXISTS chk_wifi_bssid_required;
ALTER TABLE wifis ADD CONSTRAINT chk_wifi_bssid_required CHECK (match_mode = 1 OR bssid IS NOT NULL);

-- Bước 13: DROP old ENUM types
DROP TYPE IF EXISTS user_status CASCADE;
DROP TYPE IF EXISTS membership_role CASCADE;
DROP TYPE IF EXISTS employee_status CASCADE;
DROP TYPE IF EXISTS gender_type CASCADE;
DROP TYPE IF EXISTS device_platform CASCADE;
DROP TYPE IF EXISTS device_status CASCADE;
DROP TYPE IF EXISTS approval_status CASCADE;
DROP TYPE IF EXISTS wifi_match_mode CASCADE;
DROP TYPE IF EXISTS attendance_method CASCADE;
DROP TYPE IF EXISTS shift_assignment_scope CASCADE;
DROP TYPE IF EXISTS punch_type CASCADE;
DROP TYPE IF EXISTS attendance_source CASCADE;
DROP TYPE IF EXISTS work_status CASCADE;
DROP TYPE IF EXISTS leave_type CASCADE;
