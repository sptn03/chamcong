import { Pool } from 'pg';
import { pgPool } from '../database/postgres';
import { createAuthMiddleware } from '../../presentation/middleware/auth';
import { HunonicService } from '../services/HunonicService';

// Repository implementations
import {
  PostgresCompanyRepository,
  PostgresEmployeeRepository,
  PostgresAttendanceRecordRepository,
  PostgresAttendanceEvidenceRepository,
  PostgresBranchRepository,
  PostgresDepartmentRepository,
  PostgresMembershipRepository,
  PostgresDeviceRepository,
  PostgresTokenRepository,
  PostgresLocationRepository,
  PostgresWifiRepository,
  PostgresShiftRepository,
  PostgresShiftAssignmentRepository,
  PostgresNotificationRepository,
} from '../repositories/postgres';

// Usecases
import {
  CompanyUsecase,
  EmployeeUsecase,
  AttendanceUsecase,
  AuthUsecase,
  BranchUsecase,
  DepartmentUsecase,
  MembershipUsecase,
  DeviceUsecase,
  LocationUsecase,
  WifiUsecase,
  ShiftUsecase,
  ShiftAssignmentUsecase,
  NotificationUsecase,
} from '../../modules/attendance/application/usecases';

// Controllers
import {
  CompanyController,
  EmployeeController,
  AttendanceController,
  AuthController,
  BranchController,
  DepartmentController,
  MembershipController,
  DeviceController,
  LocationController,
  WifiController,
  ShiftController,
  ShiftAssignmentController,
  NotificationController,
} from '../../presentation/controllers';

export interface AppContainer {
  pool: Pool;
  authMiddleware: ReturnType<typeof createAuthMiddleware>;
  controllers: {
    auth: AuthController;
    company: CompanyController;
    branch: BranchController;
    department: DepartmentController;
    employee: EmployeeController;
    membership: MembershipController;
    device: DeviceController;
    location: LocationController;
    wifi: WifiController;
    shift: ShiftController;
    shiftAssignment: ShiftAssignmentController;
    attendance: AttendanceController;
    notification: NotificationController;
  };
}

export function buildContainer(): AppContainer {
  const pool: Pool = pgPool;

  // --- Repositories ---
  const companyRepo = new PostgresCompanyRepository(pool);
  const branchRepo = new PostgresBranchRepository(pool);
  const deptRepo = new PostgresDepartmentRepository(pool);
  const employeeRepo = new PostgresEmployeeRepository(pool);
  const membershipRepo = new PostgresMembershipRepository(pool);
  const deviceRepo = new PostgresDeviceRepository(pool);
  const tokenRepo = new PostgresTokenRepository(pool);
  const locationRepo = new PostgresLocationRepository(pool);
  const wifiRepo = new PostgresWifiRepository(pool);
  const shiftRepo = new PostgresShiftRepository(pool);
  const shiftAssignmentRepo = new PostgresShiftAssignmentRepository(pool);
  const recordRepo = new PostgresAttendanceRecordRepository(pool);
  const evidenceRepo = new PostgresAttendanceEvidenceRepository(pool);
  const notifRepo = new PostgresNotificationRepository(pool);

  // --- Services ---
  const hunonicService = new HunonicService();

  // --- Usecases ---
  const authUsecase = new AuthUsecase(tokenRepo, pool, hunonicService);
  const companyUsecase = new CompanyUsecase(companyRepo);
  const branchUsecase = new BranchUsecase(branchRepo);
  const deptUsecase = new DepartmentUsecase(deptRepo);
  const employeeUsecase = new EmployeeUsecase(employeeRepo);
  const membershipUsecase = new MembershipUsecase(membershipRepo);
  const deviceUsecase = new DeviceUsecase(deviceRepo);
  const locationUsecase = new LocationUsecase(locationRepo);
  const wifiUsecase = new WifiUsecase(wifiRepo);
  const shiftUsecase = new ShiftUsecase(shiftRepo);
  const shiftAssignmentUsecase = new ShiftAssignmentUsecase(shiftAssignmentRepo);
  const attendanceUsecase = new AttendanceUsecase(
    recordRepo,
    evidenceRepo,
    shiftRepo,
    employeeRepo,
    shiftAssignmentRepo,
    pool,
  );
  const notifUsecase = new NotificationUsecase(notifRepo);

  // --- Middleware ---
  const authMiddleware = createAuthMiddleware(tokenRepo);

  // --- Controllers ---
  const authController = new AuthController(authUsecase);
  const companyController = new CompanyController(companyUsecase);
  const branchController = new BranchController(branchUsecase);
  const deptController = new DepartmentController(deptUsecase);
  const employeeController = new EmployeeController(employeeUsecase);
  const membershipController = new MembershipController(membershipUsecase);
  const deviceController = new DeviceController(deviceUsecase);
  const locationController = new LocationController(locationUsecase);
  const wifiController = new WifiController(wifiUsecase);
  const shiftController = new ShiftController(shiftUsecase);
  const shiftAssignmentController = new ShiftAssignmentController(shiftAssignmentUsecase);
  const attendanceController = new AttendanceController(attendanceUsecase);
  const notifController = new NotificationController(notifUsecase);

  return {
    pool,
    authMiddleware,
    controllers: {
      auth: authController,
      company: companyController,
      branch: branchController,
      department: deptController,
      employee: employeeController,
      membership: membershipController,
      device: deviceController,
      location: locationController,
      wifi: wifiController,
      shift: shiftController,
      shiftAssignment: shiftAssignmentController,
      attendance: attendanceController,
      notification: notifController,
    },
  };
}
