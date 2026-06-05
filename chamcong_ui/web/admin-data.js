/* Web Admin — tokens + dữ liệu mẫu (tiếng Việt, chung chung) */
window.AT = {
  green: "#15B86B", greenDark: "#0E9E58", greenDeep: "#0A7D46",
  green50: "#EAF7F0", green100: "#D6F0E0",
  ink: "#16241D", sub: "#5E6F66", faint: "#93A199",
  line: "#E9EDEB", bg: "#F3F6F4", card: "#FFFFFF",
  sideBg: "#0C2A1D", sideLine: "rgba(255,255,255,.10)", sideText: "#B7C9BF", sideActive: "#15B86B",
  st: {
    present: "#16B86B", late: "#F0941A", early: "#2BA4E0", absent: "#AEB7B2",
    pending: "#8B5CF6", reject: "#EF4444", info: "#2BA4E0", warn: "#F0941A",
  },
};

window.AD = (function () {
  const company = { name: "Công ty TNHH Minh Phúc", code: "MINHPHUC", taxId: "0101234567" };
  const branches = ["Chi nhánh Hà Nội", "Chi nhánh Đà Nẵng", "Chi nhánh HCM"];
  const depts = {
    "Chi nhánh Hà Nội": ["Phòng Kỹ thuật", "Phòng Kinh doanh", "Phòng Nhân sự"],
    "Chi nhánh Đà Nẵng": ["Phòng Vận hành", "Phòng Hỗ trợ"],
    "Chi nhánh HCM": ["Phòng Kinh doanh", "Phòng Marketing"],
  };
  const titles = ["Nhân viên", "Trưởng nhóm", "Kỹ sư", "Chuyên viên", "Trưởng phòng"];

  const FN = ["Nguyễn Minh Hiếu", "Trần Thu Hà", "Lê Quốc Bảo", "Phạm Thuỳ Linh", "Hoàng Anh Tuấn",
    "Vũ Thị Mai", "Đỗ Văn Khôi", "Bùi Khánh Vy", "Đặng Hữu Phước", "Ngô Thanh Tâm",
    "Cao Bá Long", "Lý Diệu Hương"];

  const employees = FN.map((name, i) => {
    const br = branches[i % 3];
    const dp = depts[br][i % depts[br].length];
    const initials = name.split(" ").slice(-2).map(w => w[0]).join("");
    return {
      id: "NV" + String(421 + i),
      code: "NV-" + String(421 + i),
      name, initials,
      phone: "09" + (10000000 + i * 73511).toString().slice(0, 8),
      email: "user" + (i + 1) + "@minhphuc.vn",
      dob: ["12/03/1994", "08/11/1990", "25/07/1996", "30/01/1992", "19/09/1988", "02/06/1995",
        "14/12/1993", "27/04/1997", "06/08/1991", "21/02/1989", "11/10/1994", "03/05/1996"][i],
      gender: i % 3 === 0 ? "Nữ" : "Nam",
      branch: br, dept: dp,
      title: titles[i % titles.length],
      role: i === 0 ? "Admin" : "Nhân viên",
      shifts: i % 4 === 0 ? ["Ca hành chính", "Ca tối"] : ["Ca hành chính"],
      status: i === 9 ? "Tạm khoá" : "Đang hoạt động",
    };
  });

  const shifts = [
    { id: "s1", name: "Ca hành chính", start: "08:00", end: "17:30", days: "T2 – T6", window: "06:00 – 09:00", method: "GPS + Wifi", location: "VP Hà Nội", wifi: "MinhPhuc-Office", late: 10, early: 10, credit: "1 ca = 1 công", people: 9 },
    { id: "s2", name: "Ca sáng nhà máy", start: "06:00", end: "14:00", days: "T2 – T7", window: "05:00 – 07:00", method: "Chỉ GPS", location: "Nhà máy Đà Nẵng", wifi: "—", late: 5, early: 5, credit: "1 ca = 1 công", people: 6 },
    { id: "s3", name: "Ca tối", start: "14:00", end: "22:00", days: "T2 – T7", window: "13:00 – 15:00", method: "GPS + Wifi", location: "Nhà máy Đà Nẵng", wifi: "Factory-5G", late: 5, early: 5, credit: "3 ca = 1 công", people: 4 },
    { id: "s4", name: "Ca cuối tuần", start: "08:00", end: "12:00", days: "T7, CN", window: "07:00 – 09:00", method: "Chỉ Wifi", location: "—", wifi: "MinhPhuc-Office", late: 15, early: 10, credit: "2 ca = 1 công", people: 3 },
  ];

  const locations = [
    { id: "l1", name: "VP Hà Nội", address: "Tầng 8, Toà nhà Sông Đà, Mỹ Đình, Hà Nội", lat: "21.028511", lng: "105.804817", radius: 80, branch: "Chi nhánh Hà Nội" },
    { id: "l2", name: "Nhà máy Đà Nẵng", address: "KCN Hoà Khánh, Liên Chiểu, Đà Nẵng", lat: "16.073270", lng: "108.149870", radius: 150, branch: "Chi nhánh Đà Nẵng" },
    { id: "l3", name: "VP HCM", address: "Số 12 Nguyễn Huệ, Quận 1, TP.HCM", lat: "10.774160", lng: "106.703450", radius: 60, branch: "Chi nhánh HCM" },
    { id: "l4", name: "Kho Long Biên", address: "Số 5 Ngọc Lâm, Long Biên, Hà Nội", lat: "21.041500", lng: "105.873200", radius: 100, branch: "Chi nhánh Hà Nội" },
  ];

  const wifis = [
    { id: "w1", ssid: "MinhPhuc-Office", bssid: "A4:2B:8C:11:90:01", mode: "Tên + BSSID", branch: "Chi nhánh Hà Nội" },
    { id: "w2", ssid: "Factory-5G", bssid: "B8:27:EB:55:23:7F", mode: "Tên + BSSID", branch: "Chi nhánh Đà Nẵng" },
    { id: "w3", ssid: "MP-HCM", bssid: "—", mode: "Chỉ tên wifi", branch: "Chi nhánh HCM" },
  ];

  const offline = [
    { id: "o1", emp: "Trần Thu Hà", code: "NV-422", dept: "Phòng Kỹ thuật", time: "08:21", date: "30/05/2026", lat: "21.028503", lng: "105.804790", note: "Mất mạng tại sảnh toà nhà", status: "pending" },
    { id: "o2", emp: "Lê Quốc Bảo", code: "NV-423", dept: "Phòng Vận hành", time: "06:04", date: "30/05/2026", lat: "16.073310", lng: "108.149900", note: "Wifi nhà máy lỗi", status: "pending" },
    { id: "o3", emp: "Vũ Thị Mai", code: "NV-426", dept: "Phòng Kinh doanh", time: "08:12", date: "29/05/2026", lat: "10.774200", lng: "106.703400", note: "", status: "pending" },
    { id: "o4", emp: "Đỗ Văn Khôi", code: "NV-427", dept: "Phòng Hỗ trợ", time: "13:58", date: "29/05/2026", lat: "16.073280", lng: "108.149850", note: "Đang đi công tác kho", status: "approved" },
    { id: "o5", emp: "Cao Bá Long", code: "NV-431", dept: "Phòng Kỹ thuật", time: "17:40", date: "28/05/2026", lat: "21.041480", lng: "105.873250", note: "", status: "rejected" },
  ];

  const logins = [
    { id: "g1", emp: "Phạm Thuỳ Linh", code: "NV-424", device: "iPhone 14 · iOS 18.2", type: "Thiết bị mới", time: "Hôm nay · 08:02", ip: "113.161.x.x", status: "pending" },
    { id: "g2", emp: "Hoàng Anh Tuấn", code: "NV-425", device: "Samsung S23 · Android 15", type: "Đăng nhập mới", time: "Hôm nay · 07:48", ip: "27.72.x.x", status: "pending" },
    { id: "g3", emp: "Bùi Khánh Vy", code: "NV-428", device: "Xiaomi 13T · Android 14", type: "Thiết bị mới", time: "Hôm qua · 18:20", ip: "171.224.x.x", status: "pending" },
    { id: "g4", emp: "Ngô Thanh Tâm", code: "NV-430", device: "iPhone 13 · iOS 17.6", type: "Đăng nhập mới", time: "Hôm qua · 09:11", ip: "118.70.x.x", status: "approved" },
  ];

  // báo cáo công theo người (tháng 06/2026)
  const reports = employees.map((e, i) => {
    const work = [18, 20, 19, 17, 21, 18, 16, 20, 19, 0, 18, 17][i];
    return {
      code: e.code, name: e.name, dept: e.dept, branch: e.branch,
      workDays: work, credit: +(work * (i % 4 === 2 ? 0.92 : 1)).toFixed(1),
      lateMin: [65, 12, 0, 88, 5, 30, 0, 44, 18, 0, 120, 9][i],
      lateCount: [3, 1, 0, 4, 1, 2, 0, 3, 1, 0, 5, 1][i],
      earlyMin: [112, 0, 40, 0, 22, 70, 0, 15, 60, 0, 0, 33][i],
      forgot: [1, 0, 0, 2, 0, 1, 0, 1, 0, 0, 3, 0][i],
    };
  });

  // dashboard
  const today = {
    total: employees.length,
    present: 9, late: 3, early: 2, absent: 1, offlinePending: 3, loginPending: 3,
    // điểm danh theo giờ trong ngày (cho biểu đồ)
    byHour: [
      { t: "06h", v: 6 }, { t: "07h", v: 14 }, { t: "08h", v: 31 }, { t: "09h", v: 8 },
      { t: "10h", v: 2 }, { t: "13h", v: 5 }, { t: "14h", v: 9 }, { t: "17h", v: 22 },
    ],
    // hoạt động gần đây
    feed: [
      { who: "Nguyễn Minh Hiếu", act: "chấm vào ca", at: "07:58", kind: "present" },
      { who: "Trần Thu Hà", act: "gửi chấm offline", at: "08:21", kind: "pending" },
      { who: "Hoàng Anh Tuấn", act: "đăng nhập thiết bị mới", at: "07:48", kind: "info" },
      { who: "Phạm Thuỳ Linh", act: "đi muộn 14 phút", at: "08:14", kind: "late" },
      { who: "Lê Quốc Bảo", act: "chấm ra ca", at: "14:02", kind: "early" },
    ],
  };

  return { company, branches, depts, titles, employees, shifts, locations, wifis, offline, logins, reports, today };
})();
