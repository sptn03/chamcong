import {
  IAttendanceRecordRepository,
  IAttendanceEvidenceRepository,
  IShiftRepository,
  IEmployeeRepository,
  IShiftAssignmentRepository,
  IMembershipRepository,
  ILocationRepository,
  IWifiRepository,
} from '../../domain/repositories';
import {
  CreateAttendanceRecordInput,
  AttendanceSource,
  UpdateAttendanceRecordInput,
} from '../../domain/entities';
import { AttendanceRecordDto, attendanceRecordToDto, CheckinDto, CheckoutDto, AttendanceFilterDto, evidenceToDto } from '../dto';
import { ValidationError, NotFoundError } from '../../../../shared/errors';
import moment from 'moment';

const WEEKDAY_BITS = [
  64, // Sunday
  1,  // Monday
  2,  // Tuesday
  4,  // Wednesday
  8,  // Thursday
  16, // Friday
  32  // Saturday
];

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getMomentFromInterval(workDate: string, intervalValue: string | Record<string, number>): moment.Moment {
  let hours = 0, minutes = 0, seconds = 0;

  if (typeof intervalValue === 'string') {
    // HH:MM:SS string format
    const parts = intervalValue.split(':');
    hours = parseInt(parts[0] || '0', 10);
    minutes = parseInt(parts[1] || '0', 10);
    seconds = parseInt(parts[2] || '0', 10);
  } else if (intervalValue && typeof intervalValue === 'object') {
    // PostgresInterval object: { hours, minutes, seconds }
    hours = (intervalValue as any).hours || 0;
    minutes = (intervalValue as any).minutes || 0;
    seconds = (intervalValue as any).seconds || 0;
  }

  return moment(workDate, 'YYYY-MM-DD')
    .utcOffset('+07:00')
    .startOf('day')
    .add(hours, 'hours')
    .add(minutes, 'minutes')
    .add(seconds, 'seconds');
}

export class AttendanceUsecase {
  constructor(
    private readonly recordRepo: IAttendanceRecordRepository,
    private readonly evidenceRepo: IAttendanceEvidenceRepository,
    private readonly shiftRepo: IShiftRepository,
    private readonly employeeRepo: IEmployeeRepository,
    private readonly shiftAssignmentRepo: IShiftAssignmentRepository,
    private readonly membershipRepo: IMembershipRepository,
    private readonly locationRepo: ILocationRepository,
    private readonly wifiRepo: IWifiRepository,
  ) {}

  async checkin(input: CheckinDto): Promise<AttendanceRecordDto> {
    // 1. Kiểm tra nhân viên tồn tại
    const employee = await this.employeeRepo.findById(input.employeeId);
    if (!employee) throw new NotFoundError('Không tìm thấy nhân viên');

    // 2. Kiểm tra ca làm tồn tại
    const shift = await this.shiftRepo.findById(input.shiftId);
    if (!shift) throw new NotFoundError('Không tìm thấy ca làm');

    // 3. Kiểm tra ngày trong tuần của ca làm
    const dayOfWeek = moment(input.workDate, 'YYYY-MM-DD').day();
    const weekdayBit = WEEKDAY_BITS[dayOfWeek];
    if ((shift.weekdays & weekdayBit) === 0) {
      throw new ValidationError('Ca làm việc này không hoạt động vào ngày này trong tuần');
    }

    // 4. Kiểm tra gán ca
    const effectiveAssignments = await this.shiftAssignmentRepo.findEffective(input.employeeId, input.workDate);
    const isAssigned = effectiveAssignments.some(sa => Number(sa.shiftId) === Number(input.shiftId));
    if (!isAssigned) {
      throw new ValidationError('Nhân viên không được gán ca làm việc này trong ngày hôm nay');
    }

    // 5. Kiểm tra khung giờ checkin
    const checkinFromTime = getMomentFromInterval(input.workDate, shift.checkinFrom);
    const checkinToTime = getMomentFromInterval(input.workDate, shift.checkinTo);
    const checkinTime = input.clientTime ? new Date(input.clientTime) : new Date();
    const clientTimeMoment = moment(checkinTime).utcOffset('+07:00');

    if (clientTimeMoment.isBefore(checkinFromTime) || clientTimeMoment.isAfter(checkinToTime)) {
      throw new ValidationError('Không nằm trong khung giờ được phép check-in ca này');
    }

    // 6. Kiểm tra đã check-in ca này chưa
    const existingRecords = await this.recordRepo.findByEmployeeAndDate(
      input.employeeId,
      input.workDate,
    );
    if (existingRecords.some(r => Number(r.shiftId) === Number(input.shiftId) && r.checkinAt)) {
      throw new ValidationError('Đã check-in ca này rồi');
    }

    // 7. Xác thực vị trí (GPS) và/hoặc mạng (Wifi)
    const isOffline = input.photoPath !== undefined || (input as any).source === 'offline';
    let gpsValid = false;
    let wifiValid = false;
    let matchedLocationId: number | null = null;
    let matchedWifiId: number | null = null;
    let distanceM: number | null = null;
    let validationError: string | null = null;

    // Lưu danh sách để ghi vào thông báo lỗi nếu cần
    let allowedLocations: { name: string; radius_m: number }[] = [];
    let allowedWifis: { ssid: string; bssid: string | null; match_mode: number }[] = [];

    if (!isOffline) {
      const method = shift.attendanceMethod; // 'gps' | 'wifi' | 'gps_wifi' | 'gps_or_wifi'

      let minDistance: number | null = null;
      let closestLocationName: string = '';
      let closestLocationRadius: number = 0;

      // Xác thực GPS
      if (method === 'gps' || method === 'gps_wifi' || (method as string) === 'gps_or_wifi') {
        if (input.lat === undefined || input.lng === undefined) {
          throw new ValidationError('Thiếu tọa độ GPS để xác thực vị trí');
        }

        const locations = await this.locationRepo.findActiveLocationsForEmployee(
          employee.companyId,
          employee.id,
          employee.branchId
        );

        allowedLocations = locations.map(l => ({ name: l.name, radius_m: l.radiusM }));

        for (const loc of locations) {
          const dist = haversineDistance(input.lat, input.lng, parseFloat(loc.lat as any), parseFloat(loc.lng as any));
          if (minDistance === null || dist < minDistance) {
            minDistance = dist;
            closestLocationName = loc.name;
            closestLocationRadius = loc.radiusM;
          }
          if (dist <= loc.radiusM) {
            gpsValid = true;
            matchedLocationId = Number(loc.id);
            distanceM = Math.round(dist * 100) / 100;
            break;
          }
        }
      }

      // Xác thực Wifi
      if (method === 'wifi' || method === 'gps_wifi' || (method as string) === 'gps_or_wifi') {
        if (!input.wifiSsid) {
          throw new ValidationError('Thiếu thông tin Wifi SSID để xác thực mạng');
        }

        const wifis = await this.wifiRepo.findByBranchId(employee.branchId);

        allowedWifis = wifis.map(w => ({
          ssid: w.ssid,
          bssid: w.bssid,
          match_mode: w.matchMode === 'ssid' ? 1 : 2,
        }));

        for (const wifi of wifis) {
          if (wifi.matchMode === 'ssid') { // SSID
            if (input.wifiSsid === wifi.ssid) {
              wifiValid = true;
              matchedWifiId = Number(wifi.id);
              break;
            }
          } else { // SSID + BSSID
            if (input.wifiSsid === wifi.ssid && input.wifiBssid === wifi.bssid) {
              wifiValid = true;
              matchedWifiId = Number(wifi.id);
              break;
            }
          }
        }
      }

      // Kiểm tra xem có hợp lệ theo phương thức cấu hình ca không
      if (method === 'gps' && !gpsValid) {
        const locationList = allowedLocations.length > 0
          ? allowedLocations.map(l => `"${l.name}" (bán kính ${l.radius_m}m)`).join(', ')
          : 'chưa có vị trí nào được cấu hình';
        let details = '';
        if (minDistance !== null) {
          details = ` Bạn hiện cách vị trí "${closestLocationName}" khoảng ${Math.round(minDistance)}m (vượt quá bán kính cho phép ${closestLocationRadius}m).`;
        }
        throw new ValidationError(`Bạn không nằm trong vị trí chấm công cho phép.${details} Các vị trí hợp lệ: ${locationList}`);
      }
      if (method === 'wifi' && !wifiValid) {
        const wifiList = allowedWifis.length > 0
          ? allowedWifis.map(w => w.match_mode === 1 ? `"${w.ssid}"` : `"${w.ssid}" (BSSID: ${w.bssid})`).join(', ')
          : 'chưa có mạng Wifi nào được cấu hình';
        throw new ValidationError(`Bạn không kết nối đúng mạng Wifi được cấu hình. Các mạng hợp lệ: ${wifiList}`);
      }
      if (method === 'gps_wifi' && (!gpsValid || !wifiValid)) {
        const locationList = allowedLocations.length > 0
          ? allowedLocations.map(l => `"${l.name}" (bán kính ${l.radius_m}m)`).join(', ')
          : 'chưa có vị trí nào được cấu hình';
        const wifiList = allowedWifis.length > 0
          ? allowedWifis.map(w => w.match_mode === 1 ? `"${w.ssid}"` : `"${w.ssid}" (BSSID: ${w.bssid})`).join(', ')
          : 'chưa có mạng Wifi nào được cấu hình';
        let details = '';
        if (!gpsValid && minDistance !== null) {
          details = ` Bạn hiện cách vị trí "${closestLocationName}" khoảng ${Math.round(minDistance)}m (vượt quá bán kính cho phép ${closestLocationRadius}m).`;
        }
        throw new ValidationError(
          `Yêu cầu cả vị trí GPS và mạng Wifi đều phải hợp lệ.${details} ` +
          `Vị trí hợp lệ: ${locationList}. Mạng Wifi hợp lệ: ${wifiList}`
        );
      }
      if ((method as string) === 'gps_or_wifi' && !gpsValid && !wifiValid) {
        const locationList = allowedLocations.length > 0
          ? allowedLocations.map(l => `"${l.name}" (bán kính ${l.radius_m}m)`).join(', ')
          : 'chưa có vị trí nào được cấu hình';
        const wifiList = allowedWifis.length > 0
          ? allowedWifis.map(w => w.match_mode === 1 ? `"${w.ssid}"` : `"${w.ssid}" (BSSID: ${w.bssid})`).join(', ')
          : 'chưa có mạng Wifi nào được cấu hình';
        let details = '';
        if (minDistance !== null) {
          details = ` Bạn hiện cách vị trí "${closestLocationName}" khoảng ${Math.round(minDistance)}m (vượt quá bán kính cho phép ${closestLocationRadius}m).`;
        }
        throw new ValidationError(
          `Yêu cầu vị trí GPS hoặc mạng Wifi hợp lệ.${details} ` +
          `Vị trí hợp lệ: ${locationList}. Mạng Wifi hợp lệ: ${wifiList}`
        );
      }
    } else {
      // Offline check-in: Yêu cầu phải có ảnh chụp
      if (!input.photoPath) {
        throw new ValidationError('Chấm công offline bắt buộc phải chụp ảnh');
      }
    }

    // 8. Tính toán đi muộn
    const startTimeMoment = getMomentFromInterval(input.workDate, shift.startTime);
    let lateMin = 0;
    let workStatus = 'normal';

    if (clientTimeMoment.isAfter(startTimeMoment)) {
      const diff = clientTimeMoment.diff(startTimeMoment, 'minutes');
      if (diff > shift.lateThresholdMin) {
        lateMin = diff;
        workStatus = 'late';
      }
    }

    // 9. Tạo bản ghi công
    const record = await this.recordRepo.create({
      companyId: employee.companyId,
      employeeId: input.employeeId,
      branchId: employee.branchId,
      departmentId: employee.departmentId,
      shiftId: input.shiftId,
      workDate: input.workDate,
      checkinAt: checkinTime,
      source: isOffline ? 'offline' : 'online',
    } as CreateAttendanceRecordInput);

    // 10. Cập nhật các trường trạng thái, muộn, duyệt công
    const approvalStatus = isOffline ? 'pending' : 'approved';
    const updated = await this.recordRepo.update(record.id, {
      approvalStatus,
      workStatus: workStatus as any,
      lateMin,
    });

    // 11. Tạo evidence check-in
    await this.evidenceRepo.create({
      employeeId: input.employeeId,
      attendanceRecordId: record.id,
      punchType: 'in',
      deviceId: input.deviceId,
      clientTime: checkinTime,
      lat: input.lat,
      lng: input.lng,
      accuracyM: input.accuracyM,
      wifiSsid: input.wifiSsid,
      wifiBssid: input.wifiBssid,
      photoPath: input.photoPath,
      note: input.note,
      gpsValid,
      wifiValid,
      distanceM,
      matchedLocationId,
      matchedWifiId,
      validationError,
    });

    return attendanceRecordToDto(updated);
  }

  async checkout(input: CheckoutDto): Promise<AttendanceRecordDto> {
    // 1. Kiểm tra bản ghi công
    const record = await this.recordRepo.findById(input.attendanceRecordId);
    if (!record) throw new NotFoundError('Không tìm thấy bản ghi công');
    if (record.checkoutAt) throw new ValidationError('Đã check-out rồi');

    // 2. Lấy thông tin ca làm và nhân viên
    const shift = await this.shiftRepo.findById(record.shiftId);
    if (!shift) throw new NotFoundError('Không tìm thấy ca làm của bản ghi công');

    const employee = await this.employeeRepo.findById(record.employeeId);
    if (!employee) throw new NotFoundError('Không tìm thấy nhân viên');

    const checkoutTime = input.clientTime ? new Date(input.clientTime) : new Date();

    // 3. Kiểm tra khung giờ checkout
    const checkoutFromTime = getMomentFromInterval(record.workDate, shift.checkoutFrom);
    const checkoutToTime = getMomentFromInterval(record.workDate, shift.checkoutTo);
    const clientTimeMoment = moment(checkoutTime).utcOffset('+07:00');

    if (clientTimeMoment.isBefore(checkoutFromTime) || clientTimeMoment.isAfter(checkoutToTime)) {
      const hasNote = input.note && input.note.trim().length > 0;
      if (!hasNote) {
        throw new ValidationError('Không nằm trong khung giờ được phép check-out ca này. Vui lòng nhập ghi chú (lý do) để thực hiện check-out.');
      }
    }

    // 4. Xác thực vị trí (GPS) và/hoặc mạng (Wifi)
    const isOffline = input.photoPath !== undefined || (input as any).source === 'offline';
    let gpsValid = false;
    let wifiValid = false;
    let matchedLocationId: number | null = null;
    let matchedWifiId: number | null = null;
    let distanceM: number | null = null;
    let validationError: string | null = null;

    let allowedLocations: { name: string; radius_m: number }[] = [];
    let allowedWifis: { ssid: string; bssid: string | null; match_mode: number }[] = [];

    if (!isOffline) {
      const method = shift.attendanceMethod;

      let minDistance: number | null = null;
      let closestLocationName: string = '';
      let closestLocationRadius: number = 0;

      // Xác thực GPS
      if (method === 'gps' || method === 'gps_wifi' || (method as string) === 'gps_or_wifi') {
        if (input.lat === undefined || input.lng === undefined) {
          throw new ValidationError('Thiếu tọa độ GPS để xác thực vị trí');
        }

        const locations = await this.locationRepo.findActiveLocationsForEmployee(
          employee.companyId,
          employee.id,
          employee.branchId
        );

        allowedLocations = locations.map(l => ({ name: l.name, radius_m: l.radiusM }));

        for (const loc of locations) {
          const dist = haversineDistance(input.lat, input.lng, parseFloat(loc.lat as any), parseFloat(loc.lng as any));
          if (minDistance === null || dist < minDistance) {
            minDistance = dist;
            closestLocationName = loc.name;
            closestLocationRadius = loc.radiusM;
          }
          if (dist <= loc.radiusM) {
            gpsValid = true;
            matchedLocationId = Number(loc.id);
            distanceM = Math.round(dist * 100) / 100;
            break;
          }
        }
      }

      // Xác thực Wifi
      if (method === 'wifi' || method === 'gps_wifi' || (method as string) === 'gps_or_wifi') {
        if (!input.wifiSsid) {
          throw new ValidationError('Thiếu thông tin Wifi SSID để xác thực mạng');
        }

        const wifis = await this.wifiRepo.findByBranchId(employee.branchId);

        allowedWifis = wifis.map(w => ({
          ssid: w.ssid,
          bssid: w.bssid,
          match_mode: w.matchMode === 'ssid' ? 1 : 2,
        }));

        for (const wifi of wifis) {
          if (wifi.matchMode === 'ssid') { // SSID
            if (input.wifiSsid === wifi.ssid) {
              wifiValid = true;
              matchedWifiId = Number(wifi.id);
              break;
            }
          } else { // SSID + BSSID
            if (input.wifiSsid === wifi.ssid && input.wifiBssid === wifi.bssid) {
              wifiValid = true;
              matchedWifiId = Number(wifi.id);
              break;
            }
          }
        }
      }

      // Kiểm tra xem có hợp lệ theo phương thức cấu hình ca không
      if (method === 'gps' && !gpsValid) {
        const locationList = allowedLocations.length > 0
          ? allowedLocations.map(l => `"${l.name}" (bán kính ${l.radius_m}m)`).join(', ')
          : 'chưa có vị trí nào được cấu hình';
        let details = '';
        if (minDistance !== null) {
          details = ` Bạn hiện cách vị trí "${closestLocationName}" khoảng ${Math.round(minDistance)}m (vượt quá bán kính cho phép ${closestLocationRadius}m).`;
        }
        throw new ValidationError(`Bạn không nằm trong vị trí chấm công cho phép.${details} Các vị trí hợp lệ: ${locationList}`);
      }
      if (method === 'wifi' && !wifiValid) {
        const wifiList = allowedWifis.length > 0
          ? allowedWifis.map(w => w.match_mode === 1 ? `"${w.ssid}"` : `"${w.ssid}" (BSSID: ${w.bssid})`).join(', ')
          : 'chưa có mạng Wifi nào được cấu hình';
        throw new ValidationError(`Bạn không kết nối đúng mạng Wifi được cấu hình. Các mạng hợp lệ: ${wifiList}`);
      }
      if (method === 'gps_wifi' && (!gpsValid || !wifiValid)) {
        const locationList = allowedLocations.length > 0
          ? allowedLocations.map(l => `"${l.name}" (bán kính ${l.radius_m}m)`).join(', ')
          : 'chưa có vị trí nào được cấu hình';
        const wifiList = allowedWifis.length > 0
          ? allowedWifis.map(w => w.match_mode === 1 ? `"${w.ssid}"` : `"${w.ssid}" (BSSID: ${w.bssid})`).join(', ')
          : 'chưa có mạng Wifi nào được cấu hình';
        let details = '';
        if (!gpsValid && minDistance !== null) {
          details = ` Bạn hiện cách vị trí "${closestLocationName}" khoảng ${Math.round(minDistance)}m (vượt quá bán kính cho phép ${closestLocationRadius}m).`;
        }
        throw new ValidationError(
          `Yêu cầu cả vị trí GPS và mạng Wifi đều phải hợp lệ.${details} ` +
          `Vị trí hợp lệ: ${locationList}. Mạng Wifi hợp lệ: ${wifiList}`
        );
      }
      if ((method as string) === 'gps_or_wifi' && !gpsValid && !wifiValid) {
        const locationList = allowedLocations.length > 0
          ? allowedLocations.map(l => `"${l.name}" (bán kính ${l.radius_m}m)`).join(', ')
          : 'chưa có vị trí nào được cấu hình';
        const wifiList = allowedWifis.length > 0
          ? allowedWifis.map(w => w.match_mode === 1 ? `"${w.ssid}"` : `"${w.ssid}" (BSSID: ${w.bssid})`).join(', ')
          : 'chưa có mạng Wifi nào được cấu hình';
        let details = '';
        if (minDistance !== null) {
          details = ` Bạn hiện cách vị trí "${closestLocationName}" khoảng ${Math.round(minDistance)}m (vượt quá bán kính cho phép ${closestLocationRadius}m).`;
        }
        throw new ValidationError(
          `Yêu cầu vị trí GPS hoặc mạng Wifi hợp lệ.${details} ` +
          `Vị trí hợp lệ: ${locationList}. Mạng Wifi hợp lệ: ${wifiList}`
        );
      }
    } else {
      // Offline checkout: Yêu cầu phải có ảnh chụp
      if (!input.photoPath) {
        throw new ValidationError('Chấm công offline bắt buộc phải chụp ảnh');
      }
    }

    // 5. Tính toán về sớm
    const endTimeMoment = getMomentFromInterval(record.workDate, shift.endTime);
    let earlyMin = 0;

    if (clientTimeMoment.isBefore(endTimeMoment)) {
      const diff = endTimeMoment.diff(clientTimeMoment, 'minutes');
      if (diff > shift.earlyThresholdMin) {
        earlyMin = diff;
      }
    }

    // 6. Tính toán lại workStatus
    let finalWorkStatus = record.workStatus; // 'normal' hoặc 'late' hoặc 'leave' ...
    if (earlyMin > 0) {
      if (finalWorkStatus === 'late') {
        finalWorkStatus = 'late_early';
      } else if (finalWorkStatus === 'normal') {
        finalWorkStatus = 'early';
      }
    }

    // 7. Tính toán actualWorkMinutes
    const checkinTime = record.checkinAt;
    let actualWorkMinutes = 0;
    if (checkinTime) {
      actualWorkMinutes = Math.max(0, Math.floor((checkoutTime.getTime() - checkinTime.getTime()) / 60000));
    }

    // 8. Tính toán workCredit & approvalStatus tổng hợp
    const checkinOffline = record.source === 'offline';
    const checkoutOffline = isOffline;
    const isRecordOffline = checkinOffline || checkoutOffline;
    const isBypassedWindow = clientTimeMoment.isBefore(checkoutFromTime) || clientTimeMoment.isAfter(checkoutToTime);
    const finalApprovalStatus = (isRecordOffline || isBypassedWindow) ? 'pending' : 'approved';
    const workCredit = (finalApprovalStatus === 'approved') ? shift.workCredit : 0.0;

    // 9. Cập nhật bản ghi công
    const updated = await this.recordRepo.update(input.attendanceRecordId, {
      checkoutAt: checkoutTime,
      actualWorkMinutes: actualWorkMinutes,
      earlyMin,
      workStatus: finalWorkStatus as any,
      approvalStatus: finalApprovalStatus,
      workCredit: Number(workCredit),
    });

    // 10. Tạo evidence check-out
    await this.evidenceRepo.create({
      employeeId: record.employeeId,
      attendanceRecordId: record.id,
      punchType: 'out',
      deviceId: input.deviceId,
      clientTime: checkoutTime,
      lat: input.lat,
      lng: input.lng,
      accuracyM: input.accuracyM,
      wifiSsid: input.wifiSsid,
      wifiBssid: input.wifiBssid,
      photoPath: input.photoPath,
      note: input.note,
      gpsValid,
      wifiValid,
      distanceM,
      matchedLocationId,
      matchedWifiId,
      validationError,
    });

    return attendanceRecordToDto(updated);
  }

  async getById(id: number): Promise<AttendanceRecordDto> {
    const record = await this.recordRepo.findById(id);
    if (!record) throw new NotFoundError('Không tìm thấy bản ghi công');
    return attendanceRecordToDto(record);
  }

  async getRecords(
    filter: AttendanceFilterDto,
    context?: { userId: number; activeEmployeeId: number | null }
  ) {
    let isAdmin = false;
    if (context && filter.companyId) {
      const activeMembership = await this.membershipRepo.findActive(context.userId, filter.companyId);
      if (activeMembership && activeMembership.role === 'admin') {
        isAdmin = true;
      }
    }

    if (!isAdmin && context?.activeEmployeeId) {
      filter.employeeId = context.activeEmployeeId;
    }

    const result = await this.recordRepo.findFiltered(filter);
    const records = result.data.map(attendanceRecordToDto);
    // Lấy tên + mã từ bảng users & employees
    if (records.length > 0) {
      const ids = [...new Set(records.map(r => r.employeeId))];
      const employees = await this.employeeRepo.findByIds(ids);
      const nameMap: Record<number, { name: string; code: string }> = {};
      for (const emp of employees) {
        nameMap[emp.id] = { name: emp.fullName || '', code: emp.employeeCode };
      }

      // Lấy evidence cho từng record để đính kèm chi tiết vào ca/ra ca
      const recordIds = records.map(r => r.id);
      const evidences = await this.evidenceRepo.findByRecordIds(recordIds);
      
      interface RecordEvidenceData {
        checkinPhotoPath: string | null;
        checkoutPhotoPath: string | null;
        checkinLat: number | null;
        checkinLng: number | null;
        checkoutLat: number | null;
        checkoutLng: number | null;
        checkinNote: string | null;
        checkoutNote: string | null;
      }

      const evidenceMap: Record<number, RecordEvidenceData> = {};
      for (const ev of evidences) {
        const recId = ev.attendanceRecordId;
        if (!recId) continue;
        if (!evidenceMap[recId]) {
          evidenceMap[recId] = {
            checkinPhotoPath: null,
            checkoutPhotoPath: null,
            checkinLat: null,
            checkinLng: null,
            checkoutLat: null,
            checkoutLng: null,
            checkinNote: null,
            checkoutNote: null,
          };
        }
        
        const data = evidenceMap[recId];
        const isCheckin = ev.punchType === 'in';
        const latVal = ev.lat ? parseFloat(ev.lat as any) : null;
        const lngVal = ev.lng ? parseFloat(ev.lng as any) : null;
        
        if (isCheckin) {
          data.checkinPhotoPath = ev.photoPath || null;
          data.checkinLat = latVal;
          data.checkinLng = lngVal;
          data.checkinNote = ev.note || null;
        } else {
          data.checkoutPhotoPath = ev.photoPath || null;
          data.checkoutLat = latVal;
          data.checkoutLng = lngVal;
          data.checkoutNote = ev.note || null;
        }
      }

      for (const r of records) {
        const info = nameMap[r.employeeId];
        if (info) {
          r.employeeName = info.name;
          r.employeeCode = info.code;
        }

        const ev = evidenceMap[r.id];
        if (ev) {
          r.checkinPhotoPath = ev.checkinPhotoPath;
          r.checkoutPhotoPath = ev.checkoutPhotoPath;
          r.checkinLat = ev.checkinLat;
          r.checkinLng = ev.checkinLng;
          r.checkoutLat = ev.checkoutLat;
          r.checkoutLng = ev.checkoutLng;
          r.checkinNote = ev.checkinNote;
          r.checkoutNote = ev.checkoutNote;
          
          // Tổng hợp cho tương thích ngược
          r.photoPath = ev.checkinPhotoPath || ev.checkoutPhotoPath || null;
          r.lat = ev.checkinLat || ev.checkoutLat || null;
          r.lng = ev.checkinLng || ev.checkoutLng || null;
          
          if (ev.checkinNote && ev.checkoutNote) {
            r.note = `Vào ca: ${ev.checkinNote}\nRa ca: ${ev.checkoutNote}`;
          } else if (ev.checkinNote) {
            r.note = `Vào ca: ${ev.checkinNote}`;
          } else if (ev.checkoutNote) {
            r.note = `Ra ca: ${ev.checkoutNote}`;
          } else {
            r.note = null;
          }
        }
      }
    }
    return {
      data: records,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / result.limit),
      },
    };
  }

  async getEvidences(recordId: number) {
    const record = await this.recordRepo.findById(recordId);
    if (!record) throw new NotFoundError('Không tìm thấy bản ghi công');
    const evidences = await this.evidenceRepo.findByRecordId(recordId);
    return evidences.map(evidenceToDto);
  }

  async approve(id: number, approvedBy: number, status: string, rejectionReason?: string): Promise<void> {
    const record = await this.recordRepo.findById(id);
    if (!record) throw new NotFoundError('Không tìm thấy bản ghi công');
    await this.recordRepo.approve(id, approvedBy, status === 'rejected' ? rejectionReason : undefined);
    
    // Nếu được duyệt, tính toán lại work_credit
    if (status === 'approved') {
      const shift = await this.shiftRepo.findById(record.shiftId);
      if (shift) {
        await this.recordRepo.update(id, {
          workCredit: shift.workCredit,
          approvalStatus: 'approved'
        });
      }
    }
  }

  async edit(input: any, editedBy: number): Promise<AttendanceRecordDto> {
    const { id, reason, ...updateData } = input;
    if (!id || !reason) throw new ValidationError('id và reason là bắt buộc');

    const record = await this.recordRepo.findById(id);
    if (!record) throw new NotFoundError('Không tìm thấy bản ghi công');

    // Lưu log chỉnh sửa
    await this.recordRepo.logEdit(
      id,
      editedBy,
      JSON.stringify(record),
      JSON.stringify(updateData),
      reason,
    );

    let actualWorkMinutes: number | undefined = undefined;
    const newCheckin = updateData.checkinAt ? new Date(updateData.checkinAt) : record.checkinAt;
    const newCheckout = updateData.checkoutAt ? new Date(updateData.checkoutAt) : record.checkoutAt;
    if (newCheckin && newCheckout) {
      actualWorkMinutes = Math.max(0, Math.floor((newCheckout.getTime() - newCheckin.getTime()) / 60000));
    }

    const updated = await this.recordRepo.update(id, {
      checkinAt: updateData.checkinAt ? new Date(updateData.checkinAt) : undefined,
      checkoutAt: updateData.checkoutAt ? new Date(updateData.checkoutAt) : undefined,
      workStatus: updateData.workStatus,
      lateMin: updateData.lateMin,
      earlyMin: updateData.earlyMin,
      workCredit: updateData.workCredit,
      actualWorkMinutes: actualWorkMinutes,
    });

    return attendanceRecordToDto(updated);
  }
}
