import { IAttendanceRecordRepository, IAttendanceEvidenceRepository } from '../../domain/repositories';
import { IShiftRepository, IShiftAssignmentRepository } from '../../../shift/domain/repositories';
import { IEmployeeRepository, IMembershipRepository } from '../../../employee/domain/repositories';
import { ILocationRepository, IWifiRepository } from '../../../location/domain/repositories';
import { ICompanyRepository } from '../../../company/domain/repositories';
import { AttendanceRecord, CreateAttendanceRecordInput, AttendanceSource, UpdateAttendanceRecordInput } from '../../domain/entities';
import { Employee } from '../../../employee/domain/entities';
import { Shift, ShiftAssignment } from '../../../shift/domain/entities';
import { AttendanceRecordDto, attendanceRecordToDto, CheckinDto, CheckoutDto, AttendanceFilterDto, evidenceToDto } from '../dto';
import { shiftToDto, ShiftDto } from '../../../shift/application/dto';
import { shiftAssignmentToDto } from '../../../shift/application/dto';
import { companyToDto, CompanyDto } from '../../../company/application/dto';
import { ValidationError, NotFoundError } from '../../../../shared/errors';
import { haversineDistance } from '../../../../shared/utils/geo';
import { getMomentFromInterval, getShiftDurationMinutes, calculateWorkCredit } from '../../../../shared/utils/shift-time';
import moment from 'moment';

// BSSID cấu trúc lại thành dạng uppercase và có 2 chữ số mỗi octet
function normalizeBssid(bssid: string | null | undefined): string {
  if (!bssid) return '';
  return bssid.split(':').map(o => o.toUpperCase().padStart(2, '0')).join(':');
}

const WEEKDAY_BITS = [
  64, // Sunday
  1,  // Monday
  2,  // Tuesday
  4,  // Wednesday
  8,  // Thursday
  16, // Friday
  32  // Saturday
];

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
    private readonly companyRepo: ICompanyRepository,
  ) {}

  private async validateAttendanceLocation(
    input: { lat?: number; lng?: number; wifiSsid?: string; wifiBssid?: string; photoPath?: string; source?: string },
    employee: Employee,
    shift: Shift,
  ): Promise<{
    gpsValid: boolean;
    wifiValid: boolean;
    matchedLocationId: number | null;
    matchedWifiId: number | null;
    distanceM: number | null;
    validationError: string | null;
    isOffline: boolean;
  }> {
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
      const method = shift.attendanceMethod as string;

      const needsGps = method === 'gps' || method === 'gps_wifi' || method === 'gps_or_wifi';
      const needsWifi = method === 'wifi' || method === 'gps_wifi' || method === 'gps_or_wifi';

      if (needsGps && (input.lat === undefined || input.lng === undefined)) {
        throw new ValidationError('Thiếu tọa độ GPS để xác thực vị trí');
      }
      if (needsWifi && !input.wifiSsid) {
        throw new ValidationError('Thiếu thông tin Wifi SSID để xác thực mạng');
      }

      // Fetch locations và wifis song song
      const [locations, wifis] = await Promise.all([
        needsGps ? this.locationRepo.findActiveLocationsForEmployee(employee.companyId, employee.id, employee.branchId) : [],
        needsWifi ? this.wifiRepo.findByBranchId(employee.branchId) : [],
      ]);

      let minDistance: number | null = null;
      let closestLocationName: string = '';
      let closestLocationRadius: number = 0;

      // Xác thực GPS
      if (needsGps) {
        allowedLocations = locations.map(l => ({ name: l.name, radius_m: l.radiusM }));

        for (const loc of locations) {
          const dist = haversineDistance(input.lat!, input.lng!, parseFloat(loc.lat as any), parseFloat(loc.lng as any));
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
      if (needsWifi) {

        allowedWifis = wifis.map(w => ({
          ssid: w.ssid,
          bssid: w.bssid,
          match_mode: w.matchMode === 'ssid' ? 1 : 2,
        }));

        for (const wifi of wifis) {
          if (wifi.matchMode === 'ssid') {
            if (input.wifiSsid === wifi.ssid) {
              wifiValid = true;
              matchedWifiId = Number(wifi.id);
              break;
            }
          } else {
            if (input.wifiSsid === wifi.ssid && normalizeBssid(input.wifiBssid) === normalizeBssid(wifi.bssid)) {
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
      if (method === 'gps_or_wifi' && !gpsValid && !wifiValid) {
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
      if (!input.photoPath) {
        throw new ValidationError('Chấm công offline bắt buộc phải chụp ảnh');
      }
    }

    return { gpsValid, wifiValid, matchedLocationId, matchedWifiId, distanceM, validationError, isOffline };
  }

  async checkin(input: CheckinDto): Promise<AttendanceRecordDto> {
    if (!input.workDate) {
      input.workDate = moment().format('YYYY-MM-DD');
    }

    const [employee, shift, effectiveAssignments, existingRecords] = await Promise.all([
      this.employeeRepo.findById(input.employeeId),
      this.shiftRepo.findById(input.shiftId),
      this.shiftAssignmentRepo.findEffective(input.employeeId, input.workDate),
      this.recordRepo.findByEmployeeAndDate(input.employeeId, input.workDate),
    ]);

    if (!employee) throw new NotFoundError('Không tìm thấy nhân viên');
    if (!shift) throw new NotFoundError('Không tìm thấy ca làm');

    // 3. Kiểm tra ngày trong tuần của ca làm
    const dayOfWeek = moment(input.workDate, 'YYYY-MM-DD').day();
    const weekdayBit = WEEKDAY_BITS[dayOfWeek];
    if ((shift.weekdays & weekdayBit) === 0) {
      throw new ValidationError('Ca làm việc này không hoạt động vào ngày này trong tuần');
    }

    // 4. Kiểm tra gán ca
    const isAssigned = effectiveAssignments.some(sa => Number(sa.shiftId) === Number(input.shiftId));
    if (!isAssigned) {
      throw new ValidationError('Nhân viên không được gán ca làm việc này trong ngày hôm nay');
    }

    // 5. Kiểm tra khung giờ checkin
    const checkinFromTime = getMomentFromInterval(input.workDate, shift.checkinFrom);
    const checkinToTime = getMomentFromInterval(input.workDate, shift.checkinTo);
    const checkinTime = input.clientTime ? new Date(input.clientTime) : new Date();
    const clientTimeMoment = moment(checkinTime).utcOffset('+07:00');

    let isCheckinOutside = false;
    if (clientTimeMoment.isBefore(checkinFromTime) || clientTimeMoment.isAfter(checkinToTime)) {
      const hasNote = input.note && input.note.trim().length > 0;
      if (!hasNote) {
        throw new ValidationError('Không nằm trong khung giờ được phép check-in ca này. Vui lòng nhập ghi chú (lý do) để thực hiện check-in.');
      }
      isCheckinOutside = true;
    }

    // 6. Kiểm tra đã check-in ca này chưa (dữ liệu đã lấy ở parallel batch)
    if (existingRecords.some(r => Number(r.shiftId) === Number(input.shiftId) && r.checkinAt)) {
      throw new ValidationError('Đã check-in ca này rồi');
    }

    // 7. Xác thực vị trí (GPS) và/hoặc mạng (Wifi)
    const { gpsValid, wifiValid, matchedLocationId, matchedWifiId, distanceM, validationError, isOffline } =
      await this.validateAttendanceLocation(input, employee, shift);

    // 8. Tính toán đi muộn
    const startTimeMoment = getMomentFromInterval(input.workDate, shift.startTime);
    let lateMin = 0;
    let workStatus = 'normal';

    if (isCheckinOutside) {
      workStatus = 'forgot';
    } else if (clientTimeMoment.isAfter(startTimeMoment)) {
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

    // 2. Lấy thông tin ca làm và nhân viên (song song)
    const [shift, employee] = await Promise.all([
      this.shiftRepo.findById(record.shiftId),
      this.employeeRepo.findById(record.employeeId),
    ]);
    if (!shift) throw new NotFoundError('Không tìm thấy ca làm của bản ghi công');
    if (!employee) throw new NotFoundError('Không tìm thấy nhân viên');

    const checkoutTime = input.clientTime ? new Date(input.clientTime) : new Date();
    const checkoutFromTime = getMomentFromInterval(record.workDate, shift.checkoutFrom);
    const checkoutToTime = getMomentFromInterval(record.workDate, shift.checkoutTo);
    const clientTimeMoment = moment(checkoutTime).utcOffset('+07:00');

    let isCheckoutOutside = false;
    if (clientTimeMoment.isBefore(checkoutFromTime) || clientTimeMoment.isAfter(checkoutToTime)) {
      const hasNote = input.note && input.note.trim().length > 0;
      if (!hasNote) {
        throw new ValidationError('Không nằm trong khung giờ được phép check-out ca này. Vui lòng nhập ghi chú (lý do) để thực hiện check-out.');
      }
      isCheckoutOutside = true;
    }

    // 4. Xác thực vị trí (GPS) và/hoặc mạng (Wifi)
    const { gpsValid, wifiValid, matchedLocationId, matchedWifiId, distanceM, validationError, isOffline } =
      await this.validateAttendanceLocation(input, employee, shift);

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
    if (finalWorkStatus === 'forgot' || isCheckoutOutside) {
      finalWorkStatus = 'forgot';
    } else if (earlyMin > 0) {
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

    // Chỉ offline (chụp ảnh) mới cần duyệt.
    // Ra ngoài khung giờ (về sớm / ra muộn) vẫn tính công bình thường theo thực tế.
    const finalApprovalStatus = isRecordOffline ? 'pending' : 'approved';

    // Tính workCredit theo tỉ lệ thực tế, làm tròn 2 chữ số
    let workCredit = 0.0;
    if (finalApprovalStatus === 'approved') {
      const shiftDurationMin = getShiftDurationMinutes(record.workDate, shift.startTime, shift.endTime);
      workCredit = calculateWorkCredit(actualWorkMinutes, shiftDurationMin, shift.workCredit);
    }

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
    const dto = attendanceRecordToDto(record);
    const editLogs = await this.recordRepo.findLatestEditLogs([id]);
    dto.adminNote = editLogs[id]?.reason || null;
    return dto;
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
      const editLogs = await this.recordRepo.findLatestEditLogs(recordIds);
      
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

        r.adminNote = editLogs[r.id]?.reason || null;

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
    
    // Nếu được duyệt (offline), tính lại workCredit theo tỷ lệ thực tế làm việc
    if (status === 'approved') {
      const shift = await this.shiftRepo.findById(record.shiftId);
      if (shift) {
        const shiftDurationMin = getShiftDurationMinutes(record.workDate, shift.startTime, shift.endTime);
        const computedCredit = calculateWorkCredit(
          record.actualWorkMinutes,
          shiftDurationMin,
          shift.workCredit,
        );
        await this.recordRepo.update(id, {
          workCredit: computedCredit,
          approvalStatus: 'approved',
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

    const newCheckin = updateData.checkinAt ? new Date(updateData.checkinAt) : record.checkinAt;
    const newCheckout = updateData.checkoutAt ? new Date(updateData.checkoutAt) : record.checkoutAt;

    // Tính lại actualWorkMinutes
    let actualWorkMinutes: number | undefined = undefined;
    if (newCheckin && newCheckout) {
      actualWorkMinutes = Math.max(0, Math.floor((newCheckout.getTime() - newCheckin.getTime()) / 60000));
    }

    // Tự tính lại workCredit, lateMin, earlyMin theo ca
    let computedWorkCredit: number | undefined = updateData.workCredit;
    let computedLateMin: number | undefined = updateData.lateMin;
    let computedEarlyMin: number | undefined = updateData.earlyMin;

    if (actualWorkMinutes !== undefined) {
      const shift = await this.shiftRepo.findById(record.shiftId);
      if (shift) {
        const shiftDurationMin = getShiftDurationMinutes(record.workDate, shift.startTime, shift.endTime);
        computedWorkCredit = calculateWorkCredit(actualWorkMinutes, shiftDurationMin, shift.workCredit);

        // Tính lại lateMin nếu không truyền thủ công
        if (updateData.lateMin === undefined && newCheckin) {
          const shiftStart = getMomentFromInterval(record.workDate, shift.startTime);
          const checkinMoment = moment(newCheckin).utcOffset('+07:00');
          computedLateMin = Math.max(0, Math.floor(checkinMoment.diff(shiftStart, 'minutes')));
        }
        // Tính lại earlyMin nếu không truyền thủ công
        if (updateData.earlyMin === undefined && newCheckout) {
          let shiftEnd = getMomentFromInterval(record.workDate, shift.endTime);
          const shiftStart = getMomentFromInterval(record.workDate, shift.startTime);
          if (shiftEnd.isSameOrBefore(shiftStart)) shiftEnd = shiftEnd.add(1, 'day');
          const checkoutMoment = moment(newCheckout).utcOffset('+07:00');
          computedEarlyMin = Math.max(0, Math.floor(shiftEnd.diff(checkoutMoment, 'minutes')));
        }
      }
    }

    const updated = await this.recordRepo.update(id, {
      checkinAt: updateData.checkinAt ? new Date(updateData.checkinAt) : undefined,
      checkoutAt: updateData.checkoutAt ? new Date(updateData.checkoutAt) : undefined,
      workStatus: updateData.workStatus,
      lateMin: computedLateMin,
      earlyMin: computedEarlyMin,
      workCredit: computedWorkCredit,
      actualWorkMinutes,
      // Admin sửa thủ công → coi như đã approved
      approvalStatus: (newCheckin && newCheckout) ? 'approved' : undefined,
    });

    const dto = attendanceRecordToDto(updated);
    dto.adminNote = reason;
    return dto;
  }

  private buildCalendarDays(
    fromDate: string,
    toDate: string,
    shiftDetailMap: Record<number, Shift>,
    assignments: ShiftAssignment[],
    dateRecordMap: Record<string, Map<number, AttendanceRecord>>,
  ): any[] {
    const result: any[] = [];
    const current = moment(fromDate + 'T00:00:00+07:00').utcOffset('+07:00');
    const end = moment(toDate + 'T00:00:00+07:00').utcOffset('+07:00');

    while (current.isSameOrBefore(end)) {
      const dateStr = current.format('YYYY-MM-DD');
      const dayOfWeek = current.day();
      const weekdayBit = WEEKDAY_BITS[dayOfWeek];
      const dayRecordMap = dateRecordMap[dateStr] || new Map();

      const assignedShiftIds = new Set<number>();
      for (const a of assignments) {
        if (a.startsOn && a.startsOn > dateStr) continue;
        if (a.endsOn && a.endsOn < dateStr) continue;
        assignedShiftIds.add(a.shiftId);
      }

      const shiftsForDay: any[] = [];
      for (const shiftId of assignedShiftIds) {
        const shift = shiftDetailMap[shiftId];
        if (!shift) continue;
        if ((shift.weekdays & weekdayBit) === 0) continue;

        const record = dayRecordMap.get(shiftId);
        if (record) {
          shiftsForDay.push({
            shiftId: shift.id,
            shiftName: shift.name,
            workStatus: record.workStatus,
            lateMin: record.lateMin,
            earlyMin: record.earlyMin,
            checkinAt: record.checkinAt ? moment(record.checkinAt).utcOffset('+07:00').format('HH:mm') : null,
            checkoutAt: record.checkoutAt ? moment(record.checkoutAt).utcOffset('+07:00').format('HH:mm') : null,
            attendanceRecordId: record.id,
            approvalStatus: record.approvalStatus,
            actualWorkMinutes: record.actualWorkMinutes,
            workCredit: Number(record.workCredit),
          });
        } else {
          shiftsForDay.push({
            shiftId: shift.id,
            shiftName: shift.name,
            workStatus: 'absent',
            lateMin: 0,
            earlyMin: 0,
            checkinAt: null,
            checkoutAt: null,
            attendanceRecordId: null,
            approvalStatus: null,
            actualWorkMinutes: 0,
            workCredit: 0,
          });
        }
      }

      result.push({ date: dateStr, dayOfWeek, shifts: shiftsForDay, totalShifts: shiftsForDay.length });
      current.add(1, 'day');
    }

    return result;
  }

  /** GET /api/attendance/calendar?fromDate=&toDate=&employeeId=
   *  Trả về từng ngày có bao nhiêu ca được gán, trạng thái ca (muộn/sớm/bình thường) để làm lịch.
   */
  async getCalendar(
    filter: { fromDate: string; toDate: string; employeeId?: number },
    context?: { userId: number; activeEmployeeId: number | null }
  ) {
    // Xác định employeeId
    let employeeId = filter.employeeId;
    if (!employeeId && context?.activeEmployeeId) {
      employeeId = context.activeEmployeeId;
    }
    if (!employeeId) {
      throw new ValidationError('Thiếu thông tin nhân viên');
    }

    // Lấy thông tin nhân viên (để biết companyId)
    const employee = await this.employeeRepo.findById(employeeId);
    if (!employee) throw new NotFoundError('Không tìm thấy nhân viên');

    // Lấy tất cả bản ghi công trong khoảng ngày
    const records = await this.recordRepo.findByEmployeeAndDateRange(
      employeeId,
      filter.fromDate,
      filter.toDate,
    );

    // Lấy tất cả ca của công ty (để có weekdays bitmask)
    const companyShifts = await this.shiftRepo.findByCompanyId(employee.companyId);
    const shiftDetailMap: Record<number, Shift> = {};
    for (const s of companyShifts) {
      shiftDetailMap[s.id] = s;
    }

    // Lấy tất cả shift assignments hiệu lực trong khoảng ngày
    const assignments = await this.shiftAssignmentRepo.findEffectiveForRange(
      employeeId,
      filter.fromDate,
      filter.toDate,
    );

    // Nhóm records theo ngày
    const dateRecordMap: Record<string, Map<number, AttendanceRecord>> = {};
    for (const r of records) {
      if (!dateRecordMap[r.workDate]) {
        dateRecordMap[r.workDate] = new Map();
      }
      dateRecordMap[r.workDate].set(r.shiftId, r);
    }

    return this.buildCalendarDays(filter.fromDate, filter.toDate, shiftDetailMap, assignments, dateRecordMap);
  }

  /**
   * GET /api/attendance/home - Dữ liệu tổng hợp cho màn hình Home
   * Trả về danh sách ca làm + chấm công trong ca + lịch tháng trong 1 lần gọi
   */
  async getHomeData(context: { userId: number; activeEmployeeId: number | null; activeCompanyId: number | null; startDate?: string; endDate?: string }) {
    const now = moment().utcOffset('+07:00');
    const today = now.format('YYYY-MM-DD');
    const firstOfMonth = context.startDate || now.clone().startOf('isoWeek').format('YYYY-MM-DD');
    const lastOfMonth = context.endDate || now.clone().endOf('isoWeek').format('YYYY-MM-DD');

    // 1. Lấy tất cả ca làm (có lọc theo giờ như ShiftAssignmentUsecase.getEffective)
    let shifts: ShiftDto[] = [];
    let activeRecords: AttendanceRecordDto[] = [];
    if (context.activeEmployeeId) {
      const entities = await this.shiftAssignmentRepo.findEffective(context.activeEmployeeId, today);
      const activeRecs = await this.recordRepo.findByEmployeeAndDate(context.activeEmployeeId, today);

      const shiftIds = [...new Set(entities.map(e => e.shiftId))];
      const shiftEntities = await this.shiftRepo.findByIds(shiftIds);
      const shiftMap = new Map(shiftEntities.map(s => [s.id, s]));

      for (const entity of entities) {
        const shift = shiftMap.get(entity.shiftId);
        if (!shift) continue;

        // Nếu có check-in chưa checkout → luôn hiển thị ca này
        const hasUnfinishedCheckin = activeRecs.some(
          r => Number(r.shiftId) === Number(shift.id) && r.checkinAt && !r.checkoutAt
        );
        if (hasUnfinishedCheckin) {
          shifts.push(shiftToDto(shift));
          continue;
        }

        // Lọc theo khung giờ hiện tại
        const checkinFromTime = getMomentFromInterval(today, shift.checkinFrom as any);
        const checkoutToTime = getMomentFromInterval(today, shift.checkoutTo as any);
        if (now.isSameOrAfter(checkinFromTime) && now.isSameOrBefore(checkoutToTime)) {
          shifts.push(shiftToDto(shift));
        }
      }

      // Sắp xếp ca theo giờ bắt đầu (sáng → chiều)
      shifts.sort((a, b) => (a.startTime || '00:00').localeCompare(b.startTime || '00:00'));

      // Lấy records đang dở (checkin chưa checkout)
      if (shifts.length > 0) {
        const attResult = await this.recordRepo.findFiltered({ fromDate: today, toDate: today, employeeId: context.activeEmployeeId });
        const records = attResult.data.map(attendanceRecordToDto);
        activeRecords = records.filter(r => r.checkinAt && !r.checkoutAt && shifts.some(s => Number(s.id) === Number(r.shiftId)));
      }
    }

    // 2. Lịch tháng (calendar)
    let calendar: any[] = [];
    if (context.activeEmployeeId) {
      const employee = await this.employeeRepo.findById(context.activeEmployeeId);
      if (employee) {
        const companyShifts = await this.shiftRepo.findByCompanyId(employee.companyId);
        const shiftDetailMap: Record<number, Shift> = {};
        for (const s of companyShifts) shiftDetailMap[s.id] = s;

        const records = await this.recordRepo.findByEmployeeAndDateRange(context.activeEmployeeId, firstOfMonth, lastOfMonth);

        const assignments = await this.shiftAssignmentRepo.findEffectiveForRange(context.activeEmployeeId, firstOfMonth, lastOfMonth);

        const dateRecordMap: Record<string, Map<number, AttendanceRecord>> = {};
        for (const r of records) {
          if (!dateRecordMap[r.workDate]) dateRecordMap[r.workDate] = new Map();
          dateRecordMap[r.workDate].set(r.shiftId, r);
        }

        calendar = this.buildCalendarDays(firstOfMonth, lastOfMonth, shiftDetailMap, assignments, dateRecordMap);
      }
    }

    // 3. Lấy thông tin công ty hiện tại
    let company: CompanyDto | null = null;
    if (context.activeCompanyId) {
      const companyEntity = await this.companyRepo.findById(context.activeCompanyId);
      if (companyEntity) {
        company = companyToDto(companyEntity);
      }
    }

    return {
      company,
      shifts,
      activeRecords,
      calendar,
    };
  }

}
