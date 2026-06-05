/* Web Admin — root: layout + routing */
(function () {
  const { useState } = React;
  const T = window.AT;
  const e = React.createElement;

  const META = {
    dashboard: { title: "Dashboard", sub: "Tổng quan chấm công hôm nay", comp: () => window.A_Dashboard },
    hr: { title: "Quản lý nhân sự", sub: "Thêm, sửa, xoá nhân viên và phân quyền", comp: () => window.A_HR },
    shifts: { title: "Cài đặt ca làm", sub: "Giờ, ngày, phương thức điểm danh và quy đổi công", comp: () => window.A_Shifts },
    locations: { title: "Quản lý vị trí (GPS)", sub: "Toạ độ, bán kính và phạm vi áp dụng", comp: () => window.A_Locations },
    wifi: { title: "Quản lý Wifi", sub: "SSID, BSSID và chế độ đối chiếu", comp: () => window.A_Wifi },
    org: { title: "Cơ cấu tổ chức", sub: "Công ty · chi nhánh · phòng ban", comp: () => window.A_Org },
    offline: { title: "Duyệt chấm công offline", sub: "Ảnh xác minh + toạ độ GPS chờ duyệt", comp: () => window.A_OfflineApproval },
    logins: { title: "Xác nhận đăng nhập / thiết bị", sub: "Duyệt đăng nhập và thiết bị mới", comp: () => window.A_Logins },
    reports: { title: "Thống kê & Báo cáo", sub: "Theo người / phòng ban · xuất Excel", comp: () => window.A_Reports },
  };

  function App() {
    const [route, setRoute] = useState("dashboard");
    const m = META[route];
    const Page = m.comp();
    return e("div", { style: { display: "flex", minHeight: "100vh", background: T.bg } }, [
      e(window.A_Sidebar, { key: "side", active: route, onNav: setRoute }),
      e("div", { key: "main", style: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column" } }, [
        e(window.A_Topbar, { key: "top", title: m.title, subtitle: m.sub }),
        e("div", { key: "page", style: { flex: 1 } }, e(Page, { onNav: setRoute })),
      ]),
    ]);
  }
  window.A_App = App;
})();
