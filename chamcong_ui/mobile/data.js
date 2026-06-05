/* Chấm Công — dữ liệu mẫu cho App nhân viên (tiếng Việt, dữ liệu chung chung) */
window.CC = (function () {
  const companies = [
    { id: "c1", name: "Công ty TNHH Minh Phúc", short: "MP", role: "Nhân viên", dept: "Phòng Kỹ thuật", branch: "Chi nhánh Hà Nội" },
    { id: "c2", name: "Công ty CP Đại Dương", short: "ĐD", role: "Trưởng nhóm", dept: "Phòng Vận hành", branch: "Chi nhánh Đà Nẵng" },
    { id: "c3", name: "Tập đoàn An Khang", short: "AK", role: "Nhân viên", dept: "Phòng Kinh doanh", branch: "Chi nhánh HCM" },
  ];

  const user = {
    name: "Nguyễn Minh Hiếu",
    code: "NV-0421",
    phone: "0987 654 321",
    title: "Kỹ sư phần mềm",
  };

  // Ca làm hôm nay
  const shift = {
    name: "Ca hành chính",
    start: "08:00",
    end: "17:30",
    method: "GPS + Wifi",
    location: "VP Tầng 8 — Tòa nhà Sông Đà",
    wifi: "MinhPhuc-Office",
    window: "06:00 – 09:00",
    lateThreshold: 10, // phút
    earlyThreshold: 10,
    credit: "1 ca = 1 công",
  };

  // Lịch sử trong tuần hiện tại (T2 → CN)
  // status: ontime | late | early | forgot | off | offline-pending
  const week = [
    { day: "T2", date: "26/05", in: "07:58", out: "17:35", lateMin: 0, earlyMin: 0, status: "ontime" },
    { day: "T3", date: "27/05", in: "08:14", out: "17:32", lateMin: 14, earlyMin: 0, status: "late" },
    { day: "T4", date: "28/05", in: "07:55", out: "16:48", lateMin: 0, earlyMin: 42, status: "early" },
    { day: "T5", date: "29/05", in: "08:02", out: "—", lateMin: 0, earlyMin: 0, status: "forgot" },
    { day: "T6", date: "30/05", in: "08:21", out: "17:40", lateMin: 21, earlyMin: 0, status: "offline-pending" },
    { day: "T7", date: "31/05", in: "—", out: "—", lateMin: 0, earlyMin: 0, status: "off" },
    { day: "CN", date: "01/06", in: "—", out: "—", lateMin: 0, earlyMin: 0, status: "off" },
  ];

  // Lịch sử tháng (rút gọn — mỗi phần tử 1 ngày làm việc)
  const month = [
    { date: "02/06", in: "07:54", out: "17:33", lateMin: 0, earlyMin: 0, status: "ontime" },
    { date: "30/05", in: "08:21", out: "17:40", lateMin: 21, earlyMin: 0, status: "offline-pending" },
    { date: "29/05", in: "08:02", out: "—", lateMin: 0, earlyMin: 0, status: "forgot" },
    { date: "28/05", in: "07:55", out: "16:48", lateMin: 0, earlyMin: 42, status: "early" },
    { date: "27/05", in: "08:14", out: "17:32", lateMin: 14, earlyMin: 0, status: "late" },
    { date: "26/05", in: "07:58", out: "17:35", lateMin: 0, earlyMin: 0, status: "ontime" },
    { date: "23/05", in: "07:49", out: "17:31", lateMin: 0, earlyMin: 0, status: "ontime" },
    { date: "22/05", in: "08:30", out: "17:30", lateMin: 30, earlyMin: 0, status: "late" },
    { date: "21/05", in: "07:58", out: "17:35", lateMin: 0, earlyMin: 0, status: "ontime" },
    { date: "20/05", in: "07:52", out: "16:20", lateMin: 0, earlyMin: 70, status: "early" },
    { date: "19/05", in: "07:55", out: "17:40", lateMin: 0, earlyMin: 0, status: "ontime" },
  ];

  // Thống kê tháng 06/2026
  const stats = {
    monthLabel: "Tháng 06/2026",
    workDays: 18,
    totalCredit: 17.3,
    lateMinutes: 65,
    lateCount: 3,
    earlyMinutes: 112,
    earlyCount: 2,
    daysOff: 2,
    forgotCount: 1,
  };

  return { companies, user, shift, week, month, stats };
})();
