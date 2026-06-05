import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { buildContainer } from './infrastructure/container';
import { env } from './infrastructure/database/env';
import { checkPostgresConnection } from './infrastructure/database/postgres';
import { globalErrorHandler } from './presentation/middleware/error-handler';
import { swaggerSpec } from './presentation/swagger';
import {
  createAuthRouter,
  createCompanyRouter,
  createEmployeeRouter,
  createAttendanceRouter,
  createBranchRouter,
  createDepartmentRouter,
  createMembershipRouter,
  createDeviceRouter,
  createLocationRouter,
  createWifiRouter,
  createShiftRouter,
  createShiftAssignmentRouter,
  createNotificationRouter,
} from './presentation/routes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Hun Cham Cong API Docs',
  customfavIcon: 'https://raw.githubusercontent.com/swagger-api/swagger-ui/master/dist/favicon-32x32.png',
}));
// JSON spec
app.get('/api-docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json(swaggerSpec);
});

// Build container (DI)
const container = buildContainer();

// --- Routes không cần auth ---
app.use('/api/auth', createAuthRouter(container.controllers.auth));

// Health check (không cần auth)
app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'Server is running', timestamp: new Date().toISOString() });
});

// --- Routes cần auth middleware ---
// Api login /health không qua auth, còn lại tất cả đều cần token
const apiWithAuth = express.Router();
apiWithAuth.use(container.authMiddleware);

apiWithAuth.use('/companies', createCompanyRouter(container.controllers.company));
apiWithAuth.use('/branches', createBranchRouter(container.controllers.branch));
apiWithAuth.use('/departments', createDepartmentRouter(container.controllers.department));
apiWithAuth.use('/employees', createEmployeeRouter(container.controllers.employee));
apiWithAuth.use('/memberships', createMembershipRouter(container.controllers.membership));
apiWithAuth.use('/devices', createDeviceRouter(container.controllers.device));
apiWithAuth.use('/locations', createLocationRouter(container.controllers.location));
apiWithAuth.use('/wifis', createWifiRouter(container.controllers.wifi));
apiWithAuth.use('/shifts', createShiftRouter(container.controllers.shift));
apiWithAuth.use('/shift-assignments', createShiftAssignmentRouter(container.controllers.shiftAssignment));
apiWithAuth.use('/attendance', createAttendanceRouter(container.controllers.attendance));
apiWithAuth.use('/notifications', createNotificationRouter(container.controllers.notification));

app.use('/api', apiWithAuth);

// Error handler (phải đặt cuối cùng)
app.use(globalErrorHandler);

// Khởi động server
async function start(): Promise<void> {
  try {
    // Kết nối PostgreSQL
    await checkPostgresConnection();

    app.listen(env.port, () => {
      console.log(`[Server] Đang chạy trên cổng ${env.port} ở chế độ ${env.nodeEnv}`);
      console.log(`[Server] API base: http://localhost:${env.port}/api`);
    });
  } catch (err) {
    console.error('[Server] Khởi động thất bại:', (err as Error).message);
    process.exit(1);
  }
}

start();
