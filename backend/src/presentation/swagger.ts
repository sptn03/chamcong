import swaggerJsdoc from 'swagger-jsdoc';

const swaggerDefinition: swaggerJsdoc.Options['definition'] = {
  openapi: '3.0.3',
  info: {
    title: 'Hun Cham Cong API',
    version: '1.0.0',
    description: 'API quản lý chấm công - Hun Cham Cong System',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      tokenQuery: {
        type: 'apiKey',
        in: 'query',
        name: 'token',
        description: 'Token xác thực (dùng query param cho GET requests)',
      },
      tokenBody: {
        type: 'apiKey',
        in: 'header',
        name: 'X-Token',
        description: 'Token xác thực (dùng header cho POST requests, ưu tiên hơn body.token)',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Lỗi xác thực' },
          errors: { type: 'array', items: { type: 'string' }, nullable: true },
        },
      },
      Pagination: {
        type: 'object',
        properties: {
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 20 },
          total: { type: 'integer', example: 100 },
          totalPages: { type: 'integer', example: 5 },
        },
      },
      // --- Auth ---
      LoginInput: {
        type: 'object',
        required: ['phone', 'password'],
        properties: {
          phone: { type: 'string', example: '0912345678' },
          password: { type: 'string', example: 'password123' },
          deviceUid: { type: 'string', example: 'abc-123-def' },
          deviceName: { type: 'string', example: 'iPhone 15' },
          platform: { type: 'string', enum: ['ios', 'android'], example: 'ios' },
          osVersion: { type: 'string', example: '17.4' },
          appVersion: { type: 'string', example: '1.0.0' },
        },
      },
      HunonicLoginInput: {
        type: 'object',
        required: ['hunonicToken'],
        properties: {
          hunonicToken: { type: 'string', description: 'Token từ Hunonic sau xác thực' },
          phone: { type: 'string', example: '0912345678' },
          deviceUid: { type: 'string' },
          deviceName: { type: 'string' },
          platform: { type: 'string', enum: ['ios', 'android'] },
          osVersion: { type: 'string' },
          appVersion: { type: 'string' },
        },
      },
      TokenResponse: {
        type: 'object',
        properties: {
          token: { type: 'string', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
          userId: { type: 'integer', example: 1 },
          deviceId: { type: 'integer', nullable: true, example: 1 },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      // --- Company ---
      CompanyDto: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Công ty TNHH ABC' },
          code: { type: 'string', example: 'ABC' },
          timezone: { type: 'string', example: 'Asia/Ho_Chi_Minh' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateCompanyInput: {
        type: 'object',
        required: ['name', 'code'],
        properties: {
          name: { type: 'string', example: 'Công ty TNHH ABC' },
          code: { type: 'string', example: 'ABC' },
          timezone: { type: 'string', example: 'Asia/Ho_Chi_Minh' },
        },
      },
      UpdateCompanyInput: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          code: { type: 'string' },
          timezone: { type: 'string' },
        },
      },
      // --- Branch ---
      BranchDto: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          companyId: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Chi nhánh Hà Nội' },
          address: { type: 'string', nullable: true, example: '123 Nguyễn Huệ, Q.1' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateBranchInput: {
        type: 'object',
        required: ['companyId', 'name'],
        properties: {
          companyId: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Chi nhánh Hà Nội' },
          address: { type: 'string', example: '123 Nguyễn Huệ, Q.1' },
        },
      },
      UpdateBranchInput: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          address: { type: 'string' },
        },
      },
      // --- Department ---
      DepartmentDto: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          companyId: { type: 'integer', example: 1 },
          branchId: { type: 'integer', nullable: true, example: 1 },
          name: { type: 'string', example: 'Phòng Kỹ thuật' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateDepartmentInput: {
        type: 'object',
        required: ['companyId', 'name'],
        properties: {
          companyId: { type: 'integer', example: 1 },
          branchId: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Phòng Kỹ thuật' },
        },
      },
      UpdateDepartmentInput: {
        type: 'object',
        properties: {
          branchId: { type: 'integer' },
          name: { type: 'string' },
        },
      },
      // --- Employee ---
      EmployeeDto: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          userId: { type: 'integer', example: 1 },
          companyId: { type: 'integer', example: 1 },
          branchId: { type: 'integer', example: 1 },
          departmentId: { type: 'integer', example: 1 },
          employeeCode: { type: 'string', example: 'NV001' },
          fullName: { type: 'string', example: 'Nguyễn Văn A' },
          birthday: { type: 'string', nullable: true, example: '1990-01-15' },
          gender: { type: 'string', nullable: true, enum: ['male', 'female', 'other'] },
          title: { type: 'string', nullable: true, example: 'Kỹ sư' },
          status: { type: 'string', enum: ['active', 'locked'], example: 'active' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateEmployeeInput: {
        type: 'object',
        required: ['userId', 'companyId', 'branchId', 'departmentId', 'employeeCode', 'fullName'],
        properties: {
          userId: { type: 'integer', example: 1 },
          companyId: { type: 'integer', example: 1 },
          branchId: { type: 'integer', example: 1 },
          departmentId: { type: 'integer', example: 1 },
          employeeCode: { type: 'string', example: 'NV001' },
          fullName: { type: 'string', example: 'Nguyễn Văn A' },
          birthday: { type: 'string', example: '1990-01-15' },
          gender: { type: 'string', enum: ['male', 'female', 'other'] },
          title: { type: 'string', example: 'Kỹ sư' },
        },
      },
      UpdateEmployeeInput: {
        type: 'object',
        properties: {
          branchId: { type: 'integer' },
          departmentId: { type: 'integer' },
          fullName: { type: 'string' },
          birthday: { type: 'string' },
          gender: { type: 'string', enum: ['male', 'female', 'other'] },
          title: { type: 'string' },
          status: { type: 'string', enum: ['active', 'locked'] },
        },
      },
      // --- Membership ---
      MembershipDto: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          userId: { type: 'integer', example: 1 },
          companyId: { type: 'integer', example: 1 },
          employeeId: { type: 'integer', nullable: true, example: 1 },
          role: { type: 'string', enum: ['admin', 'employee'], example: 'employee' },
          activeDepartmentId: { type: 'integer', nullable: true, example: 1 },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateMembershipInput: {
        type: 'object',
        required: ['userId', 'companyId', 'role'],
        properties: {
          userId: { type: 'integer', example: 1 },
          companyId: { type: 'integer', example: 1 },
          employeeId: { type: 'integer', example: 1 },
          role: { type: 'string', enum: ['admin', 'employee'], example: 'employee' },
          activeDepartmentId: { type: 'integer', example: 1 },
        },
      },
      // --- Device ---
      DeviceDto: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          userId: { type: 'integer', example: 1 },
          deviceUid: { type: 'string', example: 'abc-123-def' },
          deviceName: { type: 'string', nullable: true, example: 'iPhone 15' },
          platform: { type: 'string', enum: ['ios', 'android'], example: 'ios' },
          osVersion: { type: 'string', nullable: true, example: '17.4' },
          appVersion: { type: 'string', nullable: true, example: '1.0.0' },
          pushToken: { type: 'string', nullable: true },
          status: { type: 'string', enum: ['pending', 'approved', 'rejected', 'revoked'], example: 'approved' },
          lastLoginAt: { type: 'string', nullable: true, format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      RegisterDeviceInput: {
        type: 'object',
        required: ['userId', 'deviceUid', 'platform'],
        properties: {
          userId: { type: 'integer', example: 1 },
          deviceUid: { type: 'string', example: 'abc-123-def' },
          deviceName: { type: 'string', example: 'iPhone 15' },
          platform: { type: 'string', enum: ['ios', 'android'], example: 'ios' },
          osVersion: { type: 'string', example: '17.4' },
          appVersion: { type: 'string', example: '1.0.0' },
          pushToken: { type: 'string' },
        },
      },
      UpdateDeviceStatusInput: {
        type: 'object',
        required: ['id', 'status'],
        properties: {
          id: { type: 'integer', example: 1 },
          status: { type: 'string', enum: ['pending', 'approved', 'rejected', 'revoked'], example: 'approved' },
        },
      },
      // --- Login Approval ---
      LoginApprovalDto: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          userId: { type: 'integer', example: 1 },
          employeeId: { type: 'integer', nullable: true, example: 1 },
          deviceId: { type: 'integer', example: 1 },
          requestType: { type: 'string', enum: ['new_login', 'new_device'], example: 'new_device' },
          status: { type: 'string', enum: ['pending', 'approved', 'rejected'], example: 'pending' },
          ipAddress: { type: 'string', nullable: true },
          userAgent: { type: 'string', nullable: true },
          reviewedBy: { type: 'integer', nullable: true },
          reviewedAt: { type: 'string', nullable: true, format: 'date-time' },
          rejectionReason: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateApprovalInput: {
        type: 'object',
        required: ['userId', 'deviceId', 'requestType'],
        properties: {
          userId: { type: 'integer', example: 1 },
          employeeId: { type: 'integer', example: 1 },
          deviceId: { type: 'integer', example: 1 },
          requestType: { type: 'string', enum: ['new_login', 'new_device'], example: 'new_device' },
          ipAddress: { type: 'string' },
          userAgent: { type: 'string' },
        },
      },
      ReviewApprovalInput: {
        type: 'object',
        required: ['id', 'status'],
        properties: {
          id: { type: 'integer', example: 1 },
          status: { type: 'string', enum: ['approved', 'rejected'], example: 'approved' },
          rejectionReason: { type: 'string', example: 'Thiếu thông tin' },
        },
      },
      // --- Location ---
      LocationDto: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          companyId: { type: 'integer', example: 1 },
          branchId: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Văn phòng Hà Nội' },
          address: { type: 'string', nullable: true, example: '123 Nguyễn Huệ' },
          lat: { type: 'number', example: 21.0285 },
          lng: { type: 'number', example: 105.8542 },
          radiusM: { type: 'integer', example: 50 },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateLocationInput: {
        type: 'object',
        required: ['companyId', 'branchId', 'name', 'lat', 'lng'],
        properties: {
          companyId: { type: 'integer', example: 1 },
          branchId: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Văn phòng Hà Nội' },
          address: { type: 'string', example: '123 Nguyễn Huệ' },
          lat: { type: 'number', example: 21.0285 },
          lng: { type: 'number', example: 105.8542 },
          radiusM: { type: 'integer', example: 50 },
        },
      },
      UpdateLocationInput: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          address: { type: 'string' },
          lat: { type: 'number' },
          lng: { type: 'number' },
          radiusM: { type: 'integer' },
          branchId: { type: 'integer' },
        },
      },
      // --- WiFi ---
      WifiDto: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          companyId: { type: 'integer', example: 1 },
          branchId: { type: 'integer', example: 1 },
          name: { type: 'string', nullable: true, example: 'WiFi văn phòng' },
          ssid: { type: 'string', example: 'Office_WiFi' },
          bssid: { type: 'string', nullable: true, example: '00:11:22:33:44:55' },
          matchMode: { type: 'string', enum: ['ssid', 'ssid_bssid'], example: 'ssid_bssid' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateWifiInput: {
        type: 'object',
        required: ['companyId', 'branchId', 'ssid'],
        properties: {
          companyId: { type: 'integer', example: 1 },
          branchId: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'WiFi văn phòng' },
          ssid: { type: 'string', example: 'Office_WiFi' },
          bssid: { type: 'string', example: '00:11:22:33:44:55' },
          matchMode: { type: 'string', enum: ['ssid', 'ssid_bssid'], example: 'ssid_bssid' },
        },
      },
      UpdateWifiInput: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          ssid: { type: 'string' },
          bssid: { type: 'string' },
          matchMode: { type: 'string', enum: ['ssid', 'ssid_bssid'] },
          branchId: { type: 'integer' },
        },
      },
      // --- Shift ---
      ShiftDto: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          companyId: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Ca hành chính' },
          startTime: { type: 'string', example: '08:00:00' },
          endTime: { type: 'string', example: '17:00:00' },
          checkinFrom: { type: 'string', example: '07:30:00' },
          checkinTo: { type: 'string', example: '08:30:00' },
          checkoutFrom: { type: 'string', example: '16:30:00' },
          checkoutTo: { type: 'string', example: '17:30:00' },
          weekdays: { type: 'integer', description: 'Bitmask: Mon=1, Tue=2, Wed=4, Thu=8, Fri=16, Sat=32, Sun=64', example: 31 },
          attendanceMethod: { type: 'string', enum: ['gps', 'wifi', 'gps_wifi'], example: 'gps_wifi' },
          lateThresholdMin: { type: 'integer', example: 15 },
          earlyThresholdMin: { type: 'integer', example: 15 },
          workCredit: { type: 'number', example: 1 },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateShiftInput: {
        type: 'object',
        required: ['companyId', 'name', 'startTime', 'endTime', 'checkinFrom', 'checkinTo', 'checkoutFrom', 'checkoutTo', 'weekdays', 'attendanceMethod'],
        properties: {
          companyId: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Ca hành chính' },
          startTime: { type: 'string', example: '08:00' },
          endTime: { type: 'string', example: '17:00' },
          checkinFrom: { type: 'string', example: '07:30' },
          checkinTo: { type: 'string', example: '08:30' },
          checkoutFrom: { type: 'string', example: '16:30' },
          checkoutTo: { type: 'string', example: '17:30' },
          weekdays: { type: 'integer', example: 31 },
          attendanceMethod: { type: 'string', enum: ['gps', 'wifi', 'gps_wifi'], example: 'gps_wifi' },
          lateThresholdMin: { type: 'integer', example: 15 },
          earlyThresholdMin: { type: 'integer', example: 15 },
          workCredit: { type: 'number', example: 1 },
        },
      },
      UpdateShiftInput: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          startTime: { type: 'string' },
          endTime: { type: 'string' },
          checkinFrom: { type: 'string' },
          checkinTo: { type: 'string' },
          checkoutFrom: { type: 'string' },
          checkoutTo: { type: 'string' },
          weekdays: { type: 'integer' },
          attendanceMethod: { type: 'string', enum: ['gps', 'wifi', 'gps_wifi'] },
          lateThresholdMin: { type: 'integer' },
          earlyThresholdMin: { type: 'integer' },
          workCredit: { type: 'number' },
        },
      },
      // --- ShiftAssignment ---
      ShiftAssignmentDto: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          shiftId: { type: 'integer', example: 1 },
          scopeType: { type: 'string', enum: ['company', 'branch', 'department', 'employee'], example: 'department' },
          companyId: { type: 'integer', example: 1 },
          branchId: { type: 'integer', nullable: true, example: 1 },
          departmentId: { type: 'integer', nullable: true, example: 1 },
          employeeId: { type: 'integer', nullable: true, example: 1 },
          startsOn: { type: 'string', nullable: true, example: '2024-01-01' },
          endsOn: { type: 'string', nullable: true, example: '2024-12-31' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateShiftAssignmentInput: {
        type: 'object',
        required: ['shiftId', 'scopeType', 'companyId'],
        properties: {
          shiftId: { type: 'integer', example: 1 },
          scopeType: { type: 'string', enum: ['company', 'branch', 'department', 'employee'], example: 'department' },
          companyId: { type: 'integer', example: 1 },
          branchId: { type: 'integer', example: 1 },
          departmentId: { type: 'integer', example: 1 },
          employeeId: { type: 'integer', example: 1 },
          startsOn: { type: 'string', example: '2024-01-01' },
          endsOn: { type: 'string', example: '2024-12-31' },
        },
      },
      // --- Attendance ---
      AttendanceEvidenceDto: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          attendanceRecordId: { type: 'integer', example: 1 },
          punchType: { type: 'string', enum: ['in', 'out'], example: 'in' },
          deviceId: { type: 'integer', nullable: true, example: 1 },
          clientTime: { type: 'string', format: 'date-time' },
          serverTime: { type: 'string', format: 'date-time' },
          lat: { type: 'number', nullable: true, example: 21.0285 },
          lng: { type: 'number', nullable: true, example: 105.8542 },
          accuracyM: { type: 'number', nullable: true, example: 10 },
          wifiSsid: { type: 'string', nullable: true, example: 'Office_WiFi' },
          wifiBssid: { type: 'string', nullable: true, example: '00:11:22:33:44:55' },
          photoPath: { type: 'string', nullable: true, example: '/uploads/attendance/photo_1.jpg' },
          note: { type: 'string', nullable: true, example: 'Đã check-in' },
          gpsValid: { type: 'boolean', example: true },
          wifiValid: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      CheckinInput: {
        type: 'object',
        required: ['employeeId', 'shiftId', 'workDate', 'clientTime'],
        properties: {
          employeeId: { type: 'integer', example: 1 },
          shiftId: { type: 'integer', example: 1 },
          workDate: { type: 'string', example: '2024-01-15' },
          lat: { type: 'number', example: 21.0285 },
          lng: { type: 'number', example: 105.8542 },
          accuracyM: { type: 'number', example: 10 },
          wifiSsid: { type: 'string', example: 'Office_WiFi' },
          wifiBssid: { type: 'string', example: '00:11:22:33:44:55' },
          photoPath: { type: 'string' },
          note: { type: 'string' },
          deviceId: { type: 'integer' },
          clientTime: { type: 'string', format: 'date-time' },
        },
      },
      CheckoutInput: {
        type: 'object',
        required: ['attendanceRecordId', 'clientTime'],
        properties: {
          attendanceRecordId: { type: 'integer', example: 1 },
          lat: { type: 'number', example: 21.0285 },
          lng: { type: 'number', example: 105.8542 },
          accuracyM: { type: 'number', example: 10 },
          wifiSsid: { type: 'string', example: 'Office_WiFi' },
          wifiBssid: { type: 'string', example: '00:11:22:33:44:55' },
          photoPath: { type: 'string' },
          note: { type: 'string' },
          deviceId: { type: 'integer' },
          clientTime: { type: 'string', format: 'date-time' },
        },
      },
      ApproveAttendanceInput: {
        type: 'object',
        required: ['id', 'status'],
        properties: {
          id: { type: 'integer', example: 1 },
          status: { type: 'string', enum: ['approved', 'rejected'], example: 'approved' },
          rejectionReason: { type: 'string', example: 'Không có lý do' },
        },
      },
      EditAttendanceInput: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'integer', example: 1 },
          checkinAt: { type: 'string', format: 'date-time' },
          checkoutAt: { type: 'string', format: 'date-time' },
          workStatus: { type: 'string', enum: ['normal', 'late', 'early', 'late_early', 'forgot', 'absent'] },
          lateMin: { type: 'integer' },
          earlyMin: { type: 'integer' },
          workCredit: { type: 'number' },
        },
      },
      // --- Notification ---
      NotificationDto: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          companyId: { type: 'integer', nullable: true, example: 1 },
          userId: { type: 'integer', example: 1 },
          type: { type: 'string', example: 'approval' },
          title: { type: 'string', example: 'Yêu cầu duyệt mới' },
          body: { type: 'string', nullable: true },
          dataJson: { type: 'object', nullable: true },
          readAt: { type: 'string', nullable: true, format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      MarkNotificationReadInput: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'integer', example: 1 },
        },
      },
      MarkAllNotificationReadInput: {
        type: 'object',
        required: ['userId'],
        properties: {
          userId: { type: 'integer', example: 1 },
        },
      },
      // --- Generic Wrappers ---
      SuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Success' },
        },
      },
    },
  },
  paths: {
    // ==================== HEALTH ====================
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Kiểm tra server',
        responses: {
          '200': {
            description: 'Server đang chạy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Server is running' },
                    timestamp: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
        },
      },
    },

    // ==================== AUTH ====================
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Đăng nhập bằng số điện thoại + mật khẩu',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginInput' } } },
        },
        responses: {
          '200': {
            description: 'Đăng nhập thành công',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Đăng nhập thành công' },
                    data: { $ref: '#/components/schemas/TokenResponse' },
                  },
                },
              },
            },
          },
          '401': { description: 'Sai phone/password', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/api/auth/hunonic-login': {
      post: {
        tags: ['Auth'],
        summary: 'Đăng nhập qua Hunonic SSO',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/HunonicLoginInput' } } },
        },
        responses: {
          '200': { description: 'Đăng nhập thành công' },
          '401': { description: 'Token Hunonic không hợp lệ', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/api/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Đăng xuất (vô hiệu token)',
        requestBody: {
          content: { 'application/json': { schema: { type: 'object', properties: { token: { type: 'string' } } } } },
        },
        responses: {
          '200': { description: 'Đã đăng xuất' },
        },
      },
    },

    // ==================== COMPANIES ====================
    '/api/companies': {
      get: {
        tags: ['Companies'],
        summary: 'Danh sách công ty hoặc chi tiết theo id',
        parameters: [
          { name: 'token', in: 'query', required: true, schema: { type: 'string' }, description: 'Token xác thực' },
          { name: 'id', in: 'query', schema: { type: 'integer' }, description: 'Lọc theo ID công ty' },
        ],
        responses: {
          '200': { description: 'Danh sách công ty' },
          '401': { description: 'Thiếu token hoặc token không hợp lệ', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/api/companies/create': {
      post: {
        tags: ['Companies'],
        summary: 'Tạo công ty mới',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateCompanyInput' } } } },
        responses: { '201': { description: 'Tạo công ty thành công' } },
      },
    },
    '/api/companies/update': {
      post: {
        tags: ['Companies'],
        summary: 'Cập nhật công ty',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateCompanyInput' } } } },
        responses: { '200': { description: 'Cập nhật thành công' } },
      },
    },
    '/api/companies/delete': {
      post: {
        tags: ['Companies'],
        summary: 'Xóa mềm công ty',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['id'], properties: { id: { type: 'integer', example: 1 } } } } } },
        responses: { '200': { description: 'Xóa thành công' } },
      },
    },

    // ==================== BRANCHES ====================
    '/api/branches': {
      get: {
        tags: ['Branches'],
        summary: 'Danh sách chi nhánh',
        parameters: [
          { name: 'token', in: 'query', required: true, schema: { type: 'string' } },
          { name: 'id', in: 'query', schema: { type: 'integer' } },
          { name: 'companyId', in: 'query', schema: { type: 'integer' } },
        ],
        responses: { '200': { description: 'Danh sách chi nhánh' } },
      },
    },
    '/api/branches/create': {
      post: {
        tags: ['Branches'],
        summary: 'Tạo chi nhánh mới',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateBranchInput' } } } },
        responses: { '201': { description: 'Tạo chi nhánh thành công' } },
      },
    },
    '/api/branches/update': {
      post: {
        tags: ['Branches'],
        summary: 'Cập nhật chi nhánh',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateBranchInput' } } } },
        responses: { '200': { description: 'Cập nhật thành công' } },
      },
    },
    '/api/branches/delete': {
      post: {
        tags: ['Branches'],
        summary: 'Xóa mềm chi nhánh',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['id'], properties: { id: { type: 'integer' } } } } } },
        responses: { '200': { description: 'Xóa thành công' } },
      },
    },

    // ==================== DEPARTMENTS ====================
    '/api/departments': {
      get: {
        tags: ['Departments'],
        summary: 'Danh sách phòng ban',
        parameters: [
          { name: 'token', in: 'query', required: true, schema: { type: 'string' } },
          { name: 'id', in: 'query', schema: { type: 'integer' } },
          { name: 'companyId', in: 'query', schema: { type: 'integer' } },
          { name: 'branchId', in: 'query', schema: { type: 'integer' } },
        ],
        responses: { '200': { description: 'Danh sách phòng ban' } },
      },
    },
    '/api/departments/create': {
      post: {
        tags: ['Departments'],
        summary: 'Tạo phòng ban mới',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateDepartmentInput' } } } },
        responses: { '201': { description: 'Tạo phòng ban thành công' } },
      },
    },
    '/api/departments/update': {
      post: {
        tags: ['Departments'],
        summary: 'Cập nhật phòng ban',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateDepartmentInput' } } } },
        responses: { '200': { description: 'Cập nhật thành công' } },
      },
    },
    '/api/departments/delete': {
      post: {
        tags: ['Departments'],
        summary: 'Xóa mềm phòng ban',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['id'], properties: { id: { type: 'integer' } } } } } },
        responses: { '200': { description: 'Xóa thành công' } },
      },
    },

    // ==================== EMPLOYEES ====================
    '/api/employees': {
      get: {
        tags: ['Employees'],
        summary: 'Danh sách nhân viên',
        parameters: [
          { name: 'token', in: 'query', required: true, schema: { type: 'string' } },
          { name: 'id', in: 'query', schema: { type: 'integer' } },
          { name: 'companyId', in: 'query', schema: { type: 'integer' } },
        ],
        responses: { '200': { description: 'Danh sách nhân viên' } },
      },
    },
    '/api/employees/create': {
      post: {
        tags: ['Employees'],
        summary: 'Tạo nhân viên mới',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateEmployeeInput' } } } },
        responses: { '201': { description: 'Tạo nhân viên thành công' } },
      },
    },
    '/api/employees/update': {
      post: {
        tags: ['Employees'],
        summary: 'Cập nhật nhân viên',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateEmployeeInput' } } } },
        responses: { '200': { description: 'Cập nhật thành công' } },
      },
    },
    '/api/employees/delete': {
      post: {
        tags: ['Employees'],
        summary: 'Xóa mềm nhân viên',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['id'], properties: { id: { type: 'integer' } } } } } },
        responses: { '200': { description: 'Xóa thành công' } },
      },
    },

    // ==================== MEMBERSHIPS ====================
    '/api/memberships': {
      get: {
        tags: ['Memberships'],
        summary: 'Danh sách thành viên công ty',
        parameters: [
          { name: 'token', in: 'query', required: true, schema: { type: 'string' } },
          { name: 'id', in: 'query', schema: { type: 'integer' } },
          { name: 'userId', in: 'query', schema: { type: 'integer' } },
          { name: 'companyId', in: 'query', schema: { type: 'integer' } },
        ],
        responses: { '200': { description: 'Danh sách thành viên' } },
      },
    },
    '/api/memberships/create': {
      post: {
        tags: ['Memberships'],
        summary: 'Thêm user vào công ty',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateMembershipInput' } } } },
        responses: { '201': { description: 'Thêm thành viên thành công' } },
      },
    },
    '/api/memberships/delete': {
      post: {
        tags: ['Memberships'],
        summary: 'Gỡ user khỏi công ty',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['id'], properties: { id: { type: 'integer' } } } } } },
        responses: { '200': { description: 'Xóa thành viên thành công' } },
      },
    },

    // ==================== DEVICES ====================
    '/api/devices': {
      get: {
        tags: ['Devices'],
        summary: 'Danh sách thiết bị',
        parameters: [
          { name: 'token', in: 'query', required: true, schema: { type: 'string' } },
          { name: 'id', in: 'query', schema: { type: 'integer' } },
          { name: 'userId', in: 'query', schema: { type: 'integer' } },
        ],
        responses: { '200': { description: 'Danh sách thiết bị' } },
      },
    },
    '/api/devices/register': {
      post: {
        tags: ['Devices'],
        summary: 'Đăng ký thiết bị (upsert)',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterDeviceInput' } } } },
        responses: { '201': { description: 'Đăng ký thiết bị thành công' } },
      },
    },
    '/api/devices/update-status': {
      post: {
        tags: ['Devices'],
        summary: 'Duyệt/từ chối/thu hồi thiết bị',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateDeviceStatusInput' } } } },
        responses: { '200': { description: 'Cập nhật trạng thái thành công' } },
      },
    },

    // ==================== LOCATIONS ====================
    '/api/locations': {
      get: {
        tags: ['Locations'],
        summary: 'Danh sách địa điểm GPS',
        parameters: [
          { name: 'token', in: 'query', required: true, schema: { type: 'string' } },
          { name: 'id', in: 'query', schema: { type: 'integer' } },
          { name: 'companyId', in: 'query', schema: { type: 'integer' } },
          { name: 'branchId', in: 'query', schema: { type: 'integer' } },
        ],
        responses: { '200': { description: 'Danh sách địa điểm' } },
      },
    },
    '/api/locations/create': {
      post: {
        tags: ['Locations'],
        summary: 'Tạo địa điểm chấm công GPS',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateLocationInput' } } } },
        responses: { '201': { description: 'Tạo địa điểm thành công' } },
      },
    },
    '/api/locations/update': {
      post: {
        tags: ['Locations'],
        summary: 'Cập nhật địa điểm',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateLocationInput' } } } },
        responses: { '200': { description: 'Cập nhật thành công' } },
      },
    },
    '/api/locations/delete': {
      post: {
        tags: ['Locations'],
        summary: 'Xóa mềm địa điểm',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['id'], properties: { id: { type: 'integer' } } } } } },
        responses: { '200': { description: 'Xóa thành công' } },
      },
    },

    // ==================== WIFIS ====================
    '/api/wifis': {
      get: {
        tags: ['WiFi'],
        summary: 'Danh sách WiFi được phép',
        parameters: [
          { name: 'token', in: 'query', required: true, schema: { type: 'string' } },
          { name: 'id', in: 'query', schema: { type: 'integer' } },
          { name: 'companyId', in: 'query', schema: { type: 'integer' } },
          { name: 'branchId', in: 'query', schema: { type: 'integer' } },
        ],
        responses: { '200': { description: 'Danh sách WiFi' } },
      },
    },
    '/api/wifis/create': {
      post: {
        tags: ['WiFi'],
        summary: 'Thêm WiFi được phép chấm công',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateWifiInput' } } } },
        responses: { '201': { description: 'Thêm WiFi thành công' } },
      },
    },
    '/api/wifis/update': {
      post: {
        tags: ['WiFi'],
        summary: 'Cập nhật WiFi',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateWifiInput' } } } },
        responses: { '200': { description: 'Cập nhật thành công' } },
      },
    },
    '/api/wifis/delete': {
      post: {
        tags: ['WiFi'],
        summary: 'Xóa mềm WiFi',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['id'], properties: { id: { type: 'integer' } } } } } },
        responses: { '200': { description: 'Xóa thành công' } },
      },
    },

    // ==================== SHIFTS ====================
    '/api/shifts': {
      get: {
        tags: ['Shifts'],
        summary: 'Danh sách ca làm',
        parameters: [
          { name: 'token', in: 'query', required: true, schema: { type: 'string' } },
          { name: 'id', in: 'query', schema: { type: 'integer' } },
          { name: 'companyId', in: 'query', schema: { type: 'integer' } },
        ],
        responses: { '200': { description: 'Danh sách ca làm' } },
      },
    },
    '/api/shifts/create': {
      post: {
        tags: ['Shifts'],
        summary: 'Tạo ca làm mới',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateShiftInput' } } } },
        responses: { '201': { description: 'Tạo ca làm thành công' } },
      },
    },
    '/api/shifts/update': {
      post: {
        tags: ['Shifts'],
        summary: 'Cập nhật ca làm',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateShiftInput' } } } },
        responses: { '200': { description: 'Cập nhật thành công' } },
      },
    },
    '/api/shifts/delete': {
      post: {
        tags: ['Shifts'],
        summary: 'Xóa mềm ca làm',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['id'], properties: { id: { type: 'integer' } } } } } },
        responses: { '200': { description: 'Xóa thành công' } },
      },
    },

    // ==================== SHIFT ASSIGNMENTS ====================
    '/api/shift-assignments': {
      get: {
        tags: ['Shift Assignments'],
        summary: 'Danh sách phân ca',
        parameters: [
          { name: 'token', in: 'query', required: true, schema: { type: 'string' } },
          { name: 'id', in: 'query', schema: { type: 'integer' } },
          { name: 'shiftId', in: 'query', schema: { type: 'integer' } },
          { name: 'employeeId', in: 'query', schema: { type: 'integer' } },
          { name: 'departmentId', in: 'query', schema: { type: 'integer' } },
          { name: 'branchId', in: 'query', schema: { type: 'integer' } },
          { name: 'date', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Cần kèm employeeId để tra ca hiệu lực theo ngày' },
        ],
        responses: { '200': { description: 'Danh sách phân ca' } },
      },
    },
    '/api/shift-assignments/create': {
      post: {
        tags: ['Shift Assignments'],
        summary: 'Gán ca cho nhân viên/phòng ban/chi nhánh',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateShiftAssignmentInput' } } } },
        responses: { '201': { description: 'Gán ca thành công' } },
      },
    },
    '/api/shift-assignments/delete': {
      post: {
        tags: ['Shift Assignments'],
        summary: 'Xóa gán ca',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['id'], properties: { id: { type: 'integer' } } } } } },
        responses: { '200': { description: 'Xóa gán ca thành công' } },
      },
    },

    // ==================== ATTENDANCE ====================
    '/api/attendance': {
      get: {
        tags: ['Attendance'],
        summary: 'Danh sách bản ghi chấm công',
        parameters: [
          { name: 'token', in: 'query', required: true, schema: { type: 'string' } },
          { name: 'id', in: 'query', schema: { type: 'integer' }, description: 'Chi tiết bản ghi' },
          { name: 'companyId', in: 'query', schema: { type: 'integer' } },
          { name: 'employeeId', in: 'query', schema: { type: 'integer' } },
          { name: 'branchId', in: 'query', schema: { type: 'integer' } },
          { name: 'departmentId', in: 'query', schema: { type: 'integer' } },
          { name: 'fromDate', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'toDate', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'approvalStatus', in: 'query', schema: { type: 'string', enum: ['pending', 'approved', 'rejected'] } },
          { name: 'page', in: 'query', schema: { type: 'integer', example: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', example: 20 } },
        ],
        responses: { '200': { description: 'Danh sách chấm công' } },
      },
    },
    '/api/attendance/evidences': {
      get: {
        tags: ['Attendance'],
        summary: 'Lấy danh sách bằng chứng chấm công',
        parameters: [
          { name: 'token', in: 'query', required: true, schema: { type: 'string' } },
          { name: 'recordId', in: 'query', required: true, schema: { type: 'integer' } },
        ],
        responses: { '200': { description: 'Danh sách evidences' } },
      },
    },
    '/api/attendance/checkin': {
      post: {
        tags: ['Attendance'],
        summary: 'Check-in',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CheckinInput' } } } },
        responses: { '201': { description: 'Check-in thành công' } },
      },
    },
    '/api/attendance/checkout': {
      post: {
        tags: ['Attendance'],
        summary: 'Check-out',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CheckoutInput' } } } },
        responses: { '200': { description: 'Check-out thành công' } },
      },
    },
    '/api/attendance/approve': {
      post: {
        tags: ['Attendance'],
        summary: 'Admin duyệt/từ chối bản ghi công',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ApproveAttendanceInput' } } } },
        responses: { '200': { description: 'Xử lý duyệt công thành công' } },
      },
    },
    '/api/attendance/edit': {
      post: {
        tags: ['Attendance'],
        summary: 'Admin sửa bản ghi công (có audit log)',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/EditAttendanceInput' } } } },
        responses: { '200': { description: 'Sửa công thành công' } },
      },
    },

    // ==================== NOTIFICATIONS ====================
    '/api/notifications': {
      get: {
        tags: ['Notifications'],
        summary: 'Danh sách thông báo',
        parameters: [
          { name: 'token', in: 'query', required: true, schema: { type: 'string' } },
          { name: 'id', in: 'query', schema: { type: 'integer' } },
          { name: 'userId', in: 'query', required: true, schema: { type: 'integer' } },
          { name: 'unread', in: 'query', schema: { type: 'string', enum: ['1'], description: 'Chỉ lấy chưa đọc' } },
        ],
        responses: { '200': { description: 'Danh sách thông báo' } },
      },
    },
    '/api/notifications/read': {
      post: {
        tags: ['Notifications'],
        summary: 'Đánh dấu đã đọc một thông báo',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/MarkNotificationReadInput' } } } },
        responses: { '200': { description: 'Đã đánh dấu đã đọc' } },
      },
    },
    '/api/notifications/read-all': {
      post: {
        tags: ['Notifications'],
        summary: 'Đánh dấu tất cả đã đọc',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/MarkAllNotificationReadInput' } } } },
        responses: { '200': { description: 'Đã đánh dấu tất cả đã đọc' } },
      },
    },
  },
};

export const swaggerSpec = swaggerJsdoc({
  definition: swaggerDefinition,
  apis: [],
});
