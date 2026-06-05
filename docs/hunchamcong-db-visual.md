# Sơ đồ trực quan Database PostgreSQL — App Chấm Công

> Copy các đoạn **Mermaid** dưới đây vào nơi hỗ trợ Mermaid để xem trực quan:
>
> - VS Code cài extension: **Markdown Preview Mermaid Support**
> - Hoặc dùng web: https://mermaid.live
> - Hoặc GitHub/GitLab markdown cũng có thể hiển thị Mermaid.

---

## 1. Sơ đồ tổng quan database

```mermaid
erDiagram
    accounts ||--o{ employees : "co ho so nhan vien"
    accounts ||--o{ company_memberships : "tham gia cong ty"
    accounts ||--o{ devices : "su dung thiet bi"
    accounts ||--o{ user_sessions : "co phien dang nhap"
    accounts ||--o{ notifications : "nhan thong bao"

    companies ||--o{ branches : "co chi nhanh"
    companies ||--o{ departments : "co phong ban"
    companies ||--o{ employees : "co nhan vien"
    companies ||--o{ company_memberships : "co thanh vien"
    companies ||--o{ locations : "co vi tri GPS"
    companies ||--o{ wifis : "co wifi"
    companies ||--o{ shifts : "co ca lam"
    companies ||--o{ attendance_records : "co bang cong"
    companies ||--o{ notifications : "co thong bao"

    branches ||--o{ departments : "co phong ban"
    branches ||--o{ employees : "co nhan vien"
    branches ||--o{ locations : "co vi tri GPS"
    branches ||--o{ wifis : "co wifi"
    branches ||--o{ shift_assignments : "gan ca"

    departments ||--o{ employees : "co nhan vien"
    departments ||--o{ shift_assignments : "gan ca"
    departments ||--o{ company_memberships : "phong active"

    employees ||--o{ location_employee_overrides : "duoc cham GPS rieng"
    employees ||--o{ shift_assignments : "duoc gan ca rieng"
    employees ||--o{ attendance_records : "co ban ghi cong"
    employees ||--o{ login_approval_requests : "can duyet login"

    devices ||--o{ user_sessions : "tao session"
    devices ||--o{ login_approval_requests : "yeu cau duyet"
    devices ||--o{ attendance_evidences : "bang chung cham"

    locations ||--o{ location_employee_overrides : "override nhan vien"
    locations ||--o{ shift_locations : "duoc ca su dung"
    locations ||--o{ attendance_evidences : "GPS matched"
    wifis ||--o{ shift_wifis : "duoc ca su dung"
    wifis ||--o{ attendance_evidences : "Wifi matched"

    shifts ||--o{ shift_locations : "chon GPS"
    shifts ||--o{ shift_wifis : "chon Wifi"
    shifts ||--o{ shift_assignments : "gan cho doi tuong"
    shifts ||--o{ attendance_records : "phat sinh cong"

    attendance_records ||--o{ attendance_evidences : "co bang chung"
    attendance_records ||--o{ attendance_edit_logs : "co log sua"

    accounts {
        bigint id PK
        varchar phone UK
        varchar email UK
        varchar password_hash
        varchar google_sub UK
        varchar apple_sub UK
        account_status status
        timestamptz created_at
        timestamptz updated_at
    }

    companies {
        bigint id PK
        varchar name
        varchar code UK
        varchar tax_id
        varchar timezone
        timestamptz deleted_at
        timestamptz created_at
        timestamptz updated_at
    }

    branches {
        bigint id PK
        bigint company_id FK
        varchar name
        varchar address
        timestamptz deleted_at
        timestamptz created_at
        timestamptz updated_at
    }

    departments {
        bigint id PK
        bigint company_id FK
        bigint branch_id FK
        varchar name
        timestamptz deleted_at
        timestamptz created_at
        timestamptz updated_at
    }

    employees {
        bigint id PK
        bigint account_id FK
        bigint company_id FK
        bigint branch_id FK
        bigint department_id FK
        varchar employee_code
        varchar full_name
        varchar email
        varchar phone
        date birthday
        gender_type gender
        varchar title
        employee_status status
        timestamptz deleted_at
        timestamptz created_at
        timestamptz updated_at
    }

    company_memberships {
        bigint id PK
        bigint account_id FK
        bigint company_id FK
        bigint employee_id FK
        membership_role role
        bigint active_department_id FK
        timestamptz created_at
        timestamptz updated_at
    }

    devices {
        bigint id PK
        bigint account_id FK
        varchar device_uid
        varchar device_name
        device_platform platform
        varchar os_version
        varchar app_version
        varchar push_token
        device_status status
        timestamptz last_login_at
        timestamptz created_at
        timestamptz updated_at
    }

    user_sessions {
        bigint id PK
        bigint account_id FK
        bigint device_id FK
        varchar refresh_token_hash
        varchar ip_address
        varchar user_agent
        timestamptz expires_at
        timestamptz revoked_at
        timestamptz created_at
        timestamptz updated_at
    }

    login_approval_requests {
        bigint id PK
        bigint account_id FK
        bigint employee_id FK
        bigint device_id FK
        login_request_type request_type
        approval_status status
        varchar ip_address
        varchar user_agent
        bigint reviewed_by FK
        timestamptz reviewed_at
        varchar rejection_reason
        timestamptz created_at
        timestamptz updated_at
    }

    locations {
        bigint id PK
        bigint company_id FK
        bigint branch_id FK
        varchar name
        varchar address
        numeric lat
        numeric lng
        int radius_m
        timestamptz deleted_at
        timestamptz created_at
        timestamptz updated_at
    }

    location_employee_overrides {
        bigint id PK
        bigint location_id FK
        bigint employee_id FK
        timestamptz created_at
    }

    wifis {
        bigint id PK
        bigint company_id FK
        bigint branch_id FK
        varchar name
        varchar ssid
        varchar bssid
        wifi_match_mode match_mode
        timestamptz deleted_at
        timestamptz created_at
        timestamptz updated_at
    }

    shifts {
        bigint id PK
        bigint company_id FK
        varchar name
        time start_time
        time end_time
        time checkin_from
        time checkin_to
        time checkout_from
        time checkout_to
        text_array weekdays
        attendance_method attendance_method
        int late_threshold_min
        int early_threshold_min
        numeric shifts_per_workday
        timestamptz deleted_at
        timestamptz created_at
        timestamptz updated_at
    }

    shift_locations {
        bigint id PK
        bigint shift_id FK
        bigint location_id FK
        timestamptz created_at
    }

    shift_wifis {
        bigint id PK
        bigint shift_id FK
        bigint wifi_id FK
        timestamptz created_at
    }

    shift_assignments {
        bigint id PK
        bigint shift_id FK
        shift_assignment_scope scope_type
        bigint company_id FK
        bigint branch_id FK
        bigint department_id FK
        bigint employee_id FK
        date starts_on
        date ends_on
        timestamptz deleted_at
        timestamptz created_at
        timestamptz updated_at
    }

    attendance_records {
        bigint id PK
        bigint company_id FK
        bigint employee_id FK
        bigint shift_id FK
        date work_date
        timestamptz checkin_at
        timestamptz checkout_at
        attendance_source source
        approval_status approval_status
        work_status work_status
        int late_min
        int early_min
        numeric work_credit
        bigint approved_by FK
        timestamptz approved_at
        varchar rejection_reason
        timestamptz created_at
        timestamptz updated_at
    }

    attendance_evidences {
        bigint id PK
        bigint attendance_record_id FK
        punch_type punch_type
        bigint device_id FK
        timestamptz client_time
        timestamptz server_time
        numeric lat
        numeric lng
        numeric accuracy_m
        varchar wifi_ssid
        varchar wifi_bssid
        varchar photo_path
        varchar photo_hash
        varchar note
        boolean gps_valid
        boolean wifi_valid
        numeric distance_m
        bigint matched_location_id FK
        bigint matched_wifi_id FK
        varchar validation_error
        timestamptz created_at
    }

    attendance_edit_logs {
        bigint id PK
        bigint attendance_record_id FK
        bigint edited_by FK
        jsonb before_json
        jsonb after_json
        varchar reason
        timestamptz created_at
    }

    notifications {
        bigint id PK
        bigint company_id FK
        bigint account_id FK
        varchar type
        varchar title
        text body
        jsonb data_json
        timestamptz read_at
        timestamptz created_at
    }
```

---

## 2. Sơ đồ đơn giản hơn — nhìn luồng chính

```mermaid
flowchart TB
    A[accounts<br/>Tài khoản đăng nhập] --> M[company_memberships<br/>Quyền theo công ty]
    C[companies<br/>Công ty] --> B[branches<br/>Chi nhánh]
    B --> D[departments<br/>Phòng ban]
    D --> E[employees<br/>Nhân viên]
    A --> E

    A --> DV[devices<br/>Thiết bị]
    DV --> LR[login_approval_requests<br/>Admin duyệt login/thiết bị]
    A --> SS[user_sessions<br/>Phiên đăng nhập]

    B --> L[locations<br/>GPS]
    B --> W[wifis<br/>Wifi]

    L --> LEO[location_employee_overrides<br/>GPS riêng cho nhân viên]

    C --> S[shifts<br/>Ca làm]
    S --> SL[shift_locations<br/>Ca dùng GPS nào]
    S --> SW[shift_wifis<br/>Ca dùng Wifi nào]
    S --> SA[shift_assignments<br/>Gán ca]

    E --> AR[attendance_records<br/>Bảng công theo nhân viên-ca-ngày]
    S --> AR
    AR --> AE[attendance_evidences<br/>GPS/Wifi/Ảnh từng lần chấm]
    AR --> EL[attendance_edit_logs<br/>Log Admin sửa công]

    A --> N[notifications<br/>Thông báo]
```

---

## 3. Sơ đồ nghiệp vụ chấm công online

```mermaid
sequenceDiagram
    participant App as Mobile App
    participant API as Backend API
    participant DB as PostgreSQL
    participant Admin as Admin Web

    App->>API: POST /attendance/punch<br/>shift_id, punch_type, GPS, Wifi, device_id
    API->>API: Verify App Check token
    API->>API: Verify access token
    API->>DB: Kiểm tra account + company_membership
    API->>DB: Kiểm tra device approved
    API->>DB: Lấy shift + assignment
    API->>DB: Lấy shift_locations / shift_wifis
    API->>API: Validate khung giờ checkin/checkout
    API->>API: Validate GPS/Wifi theo attendance_method

    alt Hợp lệ
        API->>DB: Upsert attendance_records
        API->>DB: Insert attendance_evidences
        API->>DB: Tính late_min, early_min, work_credit
        API-->>App: Thành công
    else Không hợp lệ
        API->>DB: Có thể lưu evidence thất bại nếu muốn debug
        API-->>App: Thất bại + lý do
    end
```

---

## 4. Sơ đồ nghiệp vụ chấm công offline

```mermaid
sequenceDiagram
    participant App as Mobile App
    participant API as Backend API
    participant DB as PostgreSQL
    participant Admin as Admin Web

    App->>App: Mất mạng, chụp ảnh + lấy GPS
    App->>App: Lưu local bản ghi offline

    App->>API: Khi có mạng: POST /attendance/offline<br/>multipart ảnh + GPS + client_time
    API->>API: Verify App Check + access token
    API->>DB: Insert/Update attendance_records<br/>source=offline, approval_status=pending
    API->>DB: Insert attendance_evidences<br/>photo_path, photo_hash, GPS
    API-->>App: Đã gửi, chờ Admin duyệt

    Admin->>API: Xem danh sách offline pending
    API->>DB: Query attendance_records + evidences
    API-->>Admin: Ảnh, GPS, nhân viên, ca

    alt Admin duyệt
        Admin->>API: Approve
        API->>DB: approval_status=approved
        API->>DB: Tính công, muộn/sớm
        API->>DB: Insert notification
    else Admin từ chối
        Admin->>API: Reject + reason
        API->>DB: approval_status=rejected, work_credit=0
        API->>DB: Insert notification
    end
```

---

## 5. Sơ đồ phân quyền

```mermaid
flowchart LR
    A[accounts<br/>Thông tin đăng nhập] --> CM[company_memberships<br/>role admin/employee theo công ty]
    CM --> C[companies]
    CM --> E[employees]
    CM --> D[active_department_id]

    note1["Không dùng accounts.role để phân quyền công ty<br/>Vì 1 account có thể là Admin công ty A<br/>nhưng là Nhân viên công ty B"]
    CM --- note1
```

---

## 6. Sơ đồ báo cáo tháng

```mermaid
flowchart TB
    F[Bộ lọc báo cáo<br/>company, branch, department, employee, month] --> Q[Query attendance_records]
    Q --> E[Join employees]
    Q --> D[Join departments]
    Q --> S[Join shifts]

    Q --> T1[SUM work_credit<br/>Tổng công]
    Q --> T2[SUM late_min<br/>Tổng phút muộn]
    Q --> T3[SUM early_min<br/>Tổng phút về sớm]
    Q --> T4[COUNT work_status=absent<br/>Số ngày nghỉ]
    Q --> T5[COUNT work_status=forgot<br/>Số lần quên chấm]
    Q --> T6[COUNT approval_status=pending<br/>Offline chờ duyệt]

    T1 --> R[Bảng báo cáo tháng]
    T2 --> R
    T3 --> R
    T4 --> R
    T5 --> R
    T6 --> R
```

---

## 7. Bản cực ngắn để copy nhanh vào Mermaid Live

Nếu chỉ muốn nhìn quan hệ chính, copy đoạn này:

```mermaid
erDiagram
    accounts ||--o{ employees : has
    accounts ||--o{ company_memberships : joins
    accounts ||--o{ devices : uses
    accounts ||--o{ user_sessions : sessions

    companies ||--o{ branches : has
    branches ||--o{ departments : has
    departments ||--o{ employees : has

    branches ||--o{ locations : has
    branches ||--o{ wifis : has
    companies ||--o{ shifts : has

    locations ||--o{ location_employee_overrides : overrides

    shifts ||--o{ shift_locations : uses
    shifts ||--o{ shift_wifis : uses
    shifts ||--o{ shift_assignments : assigned

    employees ||--o{ attendance_records : punches
    shifts ||--o{ attendance_records : records
    attendance_records ||--o{ attendance_evidences : evidences
    attendance_records ||--o{ attendance_edit_logs : edit_logs

    devices ||--o{ login_approval_requests : approval
    devices ||--o{ attendance_evidences : evidence_device

    accounts ||--o{ notifications : receives
```

---

## 8. Gợi ý công cụ trực quan hơn Mermaid

Nếu muốn kéo thả/nhìn database đẹp hơn, có thể dùng:

1. **dbdiagram.io**
   - Dễ nhìn ERD.
   - Có ngôn ngữ DBML.
   - Hợp để trình bày database.

2. **DrawSQL**
   - Đẹp, dễ share cho team.
   - Hợp thiết kế database dạng SaaS.

3. **DBeaver**
   - Kết nối PostgreSQL thật.
   - Generate ER Diagram từ database thật.

4. **DataGrip**
   - Mạnh, chuyên nghiệp.
   - Generate diagram tốt.

5. **pgAdmin**
   - Có ERD tool, nhưng giao diện không đẹp bằng dbdiagram/DrawSQL.

Khuyến nghị thực tế:

- Giai đoạn thiết kế: dùng **dbdiagram.io**.
- Khi có PostgreSQL thật: dùng **DBeaver** để generate ERD từ DB.