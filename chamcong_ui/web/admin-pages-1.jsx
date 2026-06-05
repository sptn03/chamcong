/* Web Admin — Trang: Dashboard, Nhân sự, Ca làm */
(function () {
  const { useState, useMemo } = React;
  const T = window.AT;
  const Icon = window.Icon;
  const { A_Table, A_Toolbar, A_Badge, A_StatCard, A_Btn, A_Modal, A_Field, A_Input, A_Select, A_Avatar } = window;
  const e = React.createElement;

  const PALETTE = ["#15B86B", "#2BA4E0", "#F0941A", "#8B5CF6", "#EF4444", "#0E9E58", "#E0A21A", "#14B8A6"];
  const colorFor = (i) => PALETTE[i % PALETTE.length];

  function PageWrap({ children }) { return e("div", { style: { padding: "24px 28px 60px" } }, children); }

  // ======================= DASHBOARD =======================
  function Dashboard({ onNav }) {
    const D = window.AD.today;
    const maxV = Math.max(...D.byHour.map(h => h.v));
    const statusKind = { present: T.st.present, late: T.st.late, early: T.st.early, pending: T.st.pending, info: T.st.info };
    const kindLabel = { present: "Đúng giờ", late: "Đi muộn", early: "Về sớm", pending: "Chờ duyệt", info: "Hệ thống" };

    // donut tình trạng
    const seg = [
      { label: "Có mặt", v: D.present, c: T.st.present },
      { label: "Đi muộn", v: D.late, c: T.st.late },
      { label: "Về sớm", v: D.early, c: T.st.early },
      { label: "Vắng", v: D.absent, c: T.st.absent },
    ];
    const tot = seg.reduce((s, x) => s + x.v, 0);
    let acc = 0;
    const stops = seg.map(s => { const a = acc / tot * 360; acc += s.v; const b = acc / tot * 360; return `${s.c} ${a}deg ${b}deg`; }).join(",");

    return e(PageWrap, {}, [
      // stat cards
      e("div", { key: "stats", style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 18 } }, [
        e(A_StatCard, { key: 1, icon: "people", color: T.green, value: D.total, label: "Tổng nhân viên", sub: window.AD.branches.length + " chi nhánh" }),
        e(A_StatCard, { key: 2, icon: "checkCircle", color: T.st.present, value: D.present, label: "Có mặt hôm nay", sub: Math.round(D.present / D.total * 100) + "%" }),
        e(A_StatCard, { key: 3, icon: "clock", color: T.st.late, value: D.late, label: "Đi muộn", sub: "hôm nay" }),
        e(A_StatCard, { key: 4, icon: "moon", color: T.st.absent, value: D.absent, label: "Vắng / nghỉ", sub: "hôm nay" }),
        e(A_StatCard, { key: 5, icon: "camera", color: T.st.pending, value: D.offlinePending + D.loginPending, label: "Chờ phê duyệt", sub: "offline + đăng nhập" }),
      ]),
      // charts row
      e("div", { key: "charts", style: { display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16, marginBottom: 18 } }, [
        // bar chart
        e("div", { key: "bar", style: card() }, [
          cardHead("Điểm danh theo giờ", "Hôm nay · 02/06/2026", "b1"),
          e("div", { key: "c", style: { display: "flex", alignItems: "flex-end", gap: 14, height: 200, padding: "20px 6px 0" } },
            D.byHour.map((h, i) => e("div", { key: i, style: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 } }, [
              e("div", { key: "v", style: { fontSize: 12, fontWeight: 700, color: T.sub } }, h.v),
              e("div", { key: "b", style: { width: "70%", maxWidth: 38, height: Math.max(6, h.v / maxV * 150), borderRadius: 8, background: `linear-gradient(180deg, ${T.green}, ${T.greenDark})` } }),
              e("div", { key: "t", style: { fontSize: 11.5, color: T.faint } }, h.t),
            ]))),
        ]),
        // donut
        e("div", { key: "donut", style: card() }, [
          cardHead("Tình trạng hôm nay", null, "d1"),
          e("div", { key: "c", style: { display: "flex", alignItems: "center", gap: 22, marginTop: 10 } }, [
            e("div", { key: "ring", style: { width: 130, height: 130, borderRadius: "50%", background: `conic-gradient(${stops})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 } },
              e("div", { style: { width: 86, height: 86, borderRadius: "50%", background: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" } }, [
                e("div", { key: "1", style: { fontSize: 26, fontWeight: 800, color: T.ink } }, tot),
                e("div", { key: "2", style: { fontSize: 11.5, color: T.faint } }, "điểm danh"),
              ])),
            e("div", { key: "leg", style: { display: "flex", flexDirection: "column", gap: 10, flex: 1 } },
              seg.map((s, i) => e("div", { key: i, style: { display: "flex", alignItems: "center", gap: 9 } }, [
                e("span", { key: "d", style: { width: 10, height: 10, borderRadius: 3, background: s.c } }),
                e("span", { key: "l", style: { fontSize: 13, color: T.sub, flex: 1 } }, s.label),
                e("span", { key: "v", style: { fontSize: 13.5, fontWeight: 700, color: T.ink } }, s.v),
              ]))),
          ]),
        ]),
      ]),
      // feed + approvals
      e("div", { key: "row2", style: { display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16 } }, [
        e("div", { key: "feed", style: card() }, [
          cardHead("Hoạt động gần đây", null, "f1"),
          e("div", { key: "c", style: { marginTop: 6 } },
            D.feed.map((f, i) => e("div", { key: i, style: { display: "flex", alignItems: "center", gap: 13, padding: "11px 0", borderBottom: i < D.feed.length - 1 ? `1px solid ${T.line}` : "none" } }, [
              e(A_Avatar, { key: "a", initials: f.who.split(" ").slice(-1)[0][0], color: statusKind[f.kind] }),
              e("div", { key: "t", style: { flex: 1 } }, [
                e("div", { key: "1", style: { fontSize: 14, color: T.ink } }, [e("b", { key: "b" }, f.who), " " + f.act]),
              ]),
              e(A_Badge, { key: "b", color: statusKind[f.kind], dot: true }, kindLabel[f.kind]),
              e("span", { key: "t2", style: { fontSize: 12.5, color: T.faint, width: 44, textAlign: "right" } }, f.at),
            ]))),
        ]),
        e("div", { key: "appr", style: card() }, [
          cardHead("Cần xử lý", null, "a1"),
          e("div", { key: "c", style: { marginTop: 6, display: "flex", flexDirection: "column", gap: 10 } }, [
            apprItem("camera", T.st.pending, "Chấm offline chờ duyệt", window.AD.today.offlinePending, () => onNav("offline"), "i1"),
            apprItem("device", T.st.info, "Xác nhận đăng nhập/thiết bị", window.AD.today.loginPending, () => onNav("logins"), "i2"),
          ]),
        ]),
      ]),
    ]);
    function apprItem(icon, color, label, count, onClick, key) {
      return e("button", { key, onClick, style: { display: "flex", alignItems: "center", gap: 13, background: T.bg, border: "none", borderRadius: 14, padding: "14px 15px", cursor: "pointer", textAlign: "left", width: "100%" } }, [
        e("div", { key: "i", style: { width: 42, height: 42, borderRadius: 12, background: color + "1A", color, display: "flex", alignItems: "center", justifyContent: "center" } }, e(Icon, { name: icon, size: 21 })),
        e("div", { key: "t", style: { flex: 1 } }, [
          e("div", { key: "1", style: { fontSize: 14, fontWeight: 700, color: T.ink } }, label),
          e("div", { key: "2", style: { fontSize: 12.5, color: T.faint } }, count + " mục đang chờ"),
        ]),
        e(Icon, { key: "c", name: "chevronRight", size: 18, color: T.faint }),
      ]);
    }
  }

  function card() { return { background: "#fff", border: `1px solid ${T.line}`, borderRadius: 16, padding: 20 }; }
  function cardHead(title, sub, key) {
    return e("div", { key, style: { display: "flex", alignItems: "center", justifyContent: "space-between" } }, [
      e("div", { key: "t" }, [
        e("h3", { key: "1", style: { fontSize: 15.5, fontWeight: 800, color: T.ink, margin: 0 } }, title),
        sub ? e("div", { key: "2", style: { fontSize: 12.5, color: T.faint, marginTop: 2 } }, sub) : null,
      ]),
    ]);
  }

  // ======================= NHÂN SỰ =======================
  function HR() {
    const [q, setQ] = useState("");
    const [branch, setBranch] = useState("all");
    const [sortAsc, setSortAsc] = useState(true);
    const [modal, setModal] = useState(null); // {mode, emp}

    const filters = [{ label: "Tất cả", value: "all" }, ...window.AD.branches.map(b => ({ label: b.replace("Chi nhánh ", ""), value: b }))];
    const rows = useMemo(() => {
      let r = window.AD.employees.filter(e2 =>
        (branch === "all" || e2.branch === branch) &&
        (e2.name.toLowerCase().includes(q.toLowerCase()) || e2.code.toLowerCase().includes(q.toLowerCase()) || e2.phone.includes(q)));
      r = [...r].sort((a, b) => sortAsc ? a.name.localeCompare(b.name, "vi") : b.name.localeCompare(a.name, "vi"));
      return r;
    }, [q, branch, sortAsc]);

    const columns = [
      { key: "emp", label: "Nhân viên" }, { key: "contact", label: "Liên hệ" },
      { key: "dept", label: "Phòng / Chi nhánh" }, { key: "title", label: "Chức vụ" },
      { key: "role", label: "Quyền" }, { key: "status", label: "Trạng thái" },
      { key: "act", label: "", align: "right" },
    ];
    const render = (r, key, i) => {
      if (key === "emp") return e("div", { style: { display: "flex", alignItems: "center", gap: 11 } }, [
        e(A_Avatar, { key: "a", initials: r.initials, color: colorFor(i) }),
        e("div", { key: "t" }, [e("div", { key: "1", style: { fontWeight: 700, whiteSpace: "nowrap" } }, r.name), e("div", { key: "2", style: { fontSize: 12, color: T.faint } }, r.code)]),
      ]);
      if (key === "contact") return e("div", {}, [e("div", { key: "1" }, r.phone), e("div", { key: "2", style: { fontSize: 12.5, color: T.faint } }, r.email)]);
      if (key === "dept") return e("div", {}, [e("div", { key: "1" }, r.dept), e("div", { key: "2", style: { fontSize: 12.5, color: T.faint } }, r.branch)]);
      if (key === "title") return r.title;
      if (key === "role") return e(A_Badge, { color: r.role === "Admin" ? T.st.pending : T.st.info }, r.role);
      if (key === "status") return e(A_Badge, { color: r.status === "Đang hoạt động" ? T.st.present : T.st.absent, dot: true }, r.status);
      if (key === "act") return e("div", { style: { display: "flex", gap: 6, justifyContent: "flex-end" } }, [
        iconAct("edit", T.sub, (ev) => { ev.stopPropagation(); setModal({ mode: "edit", emp: r }); }, "e"),
        iconAct("trash", T.st.reject, (ev) => ev.stopPropagation(), "d"),
      ]);
      return null;
    };

    return e(PageWrap, {}, [
      e(A_Toolbar, {
        key: "tb", searchValue: q, onSearch: setQ, placeholder: "Tìm theo tên, mã, SĐT...",
        filters, activeFilter: branch, onFilter: setBranch,
        onSort: () => setSortAsc(s => !s), sortLabel: "Tên " + (sortAsc ? "A→Z" : "Z→A"),
        right: e(A_Btn, { variant: "primary", icon: "plus", onClick: () => setModal({ mode: "add" }) }, "Thêm nhân viên"),
      }),
      e("div", { key: "count", style: { fontSize: 13, color: T.faint, marginBottom: 12 } }, `${rows.length} nhân viên`),
      e(A_Table, { key: "t", columns, rows, renderCell: render, onRow: (r) => setModal({ mode: "edit", emp: r }), empty: "Không tìm thấy nhân viên" }),
      modal ? e(EmployeeModal, { key: "m", modal, onClose: () => setModal(null) }) : null,
    ]);
  }

  function EmployeeModal({ modal, onClose }) {
    const emp = modal.emp || {};
    const isAdd = modal.mode === "add";
    return e(A_Modal, {
      open: true, onClose, width: 620,
      title: isAdd ? "Thêm nhân viên" : "Sửa nhân viên",
      subtitle: isAdd ? "Tài khoản do Admin cấp (SĐT + mật khẩu)" : emp.code,
      footer: [e(A_Btn, { key: "c", variant: "ghost", onClick: onClose }, "Huỷ"), e(A_Btn, { key: "s", variant: "primary", icon: "check", onClick: onClose }, isAdd ? "Tạo nhân viên" : "Lưu thay đổi")],
    },
      e("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 } }, [
        e(A_Field, { key: "1", label: "Họ và tên" }, e(A_Input, { defaultValue: emp.name, placeholder: "Nguyễn Văn A" })),
        e(A_Field, { key: "2", label: "Mã nhân viên" }, e(A_Input, { defaultValue: emp.code, placeholder: "NV-001" })),
        e(A_Field, { key: "3", label: "Số điện thoại" }, e(A_Input, { defaultValue: emp.phone, placeholder: "09xxxxxxxx" })),
        e(A_Field, { key: "4", label: "Email" }, e(A_Input, { defaultValue: emp.email, placeholder: "a@congty.vn" })),
        e(A_Field, { key: "5", label: "Ngày sinh" }, e(A_Input, { defaultValue: emp.dob, placeholder: "dd/mm/yyyy" })),
        e(A_Field, { key: "6", label: "Giới tính" }, e(A_Select, { defaultValue: emp.gender || "Nam", options: ["Nam", "Nữ", "Khác"] })),
        e(A_Field, { key: "7", label: "Chi nhánh" }, e(A_Select, { defaultValue: emp.branch, options: window.AD.branches })),
        e(A_Field, { key: "8", label: "Phòng ban" }, e(A_Select, { defaultValue: emp.dept, options: ["Phòng Kỹ thuật", "Phòng Kinh doanh", "Phòng Nhân sự", "Phòng Vận hành", "Phòng Hỗ trợ", "Phòng Marketing"] })),
        e(A_Field, { key: "9", label: "Chức vụ" }, e(A_Select, { defaultValue: emp.title, options: window.AD.titles })),
        e(A_Field, { key: "10", label: "Quyền truy cập" }, e(A_Select, { defaultValue: emp.role || "Nhân viên", options: ["Nhân viên", "Admin"] })),
        isAdd ? e(A_Field, { key: "11", label: "Mật khẩu", full: true }, e(A_Input, { type: "text", placeholder: "Mật khẩu khởi tạo cho nhân viên" })) : null,
      ]));
  }

  // ======================= CA LÀM =======================
  function Shifts() {
    const [q, setQ] = useState("");
    const [modal, setModal] = useState(null);
    const rows = window.AD.shifts.filter(s => s.name.toLowerCase().includes(q.toLowerCase()));
    const methodColor = (m) => m.includes("+") ? T.st.pending : m.includes("GPS") ? T.green : T.st.info;

    return e(PageWrap, {}, [
      e(A_Toolbar, { key: "tb", searchValue: q, onSearch: setQ, placeholder: "Tìm ca làm...", right: e(A_Btn, { variant: "primary", icon: "plus", onClick: () => setModal({ mode: "add" }) }, "Thêm ca làm") }),
      e("div", { key: "grid", style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 } },
        rows.map((s, i) => e("div", { key: s.id, style: { background: "#fff", border: `1px solid ${T.line}`, borderRadius: 16, padding: 20, cursor: "pointer" }, onClick: () => setModal({ mode: "edit", shift: s }) }, [
          e("div", { key: "h", style: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 } }, [
            e("div", { key: "l", style: { display: "flex", alignItems: "center", gap: 12 } }, [
              e("div", { key: "i", style: { width: 46, height: 46, borderRadius: 13, background: T.green50, color: T.green, display: "flex", alignItems: "center", justifyContent: "center" } }, e(Icon, { name: "clock", size: 24 })),
              e("div", { key: "t" }, [
                e("div", { key: "1", style: { fontSize: 16, fontWeight: 800, color: T.ink } }, s.name),
                e("div", { key: "2", style: { fontSize: 13, color: T.sub, marginTop: 1 } }, `${s.start} – ${s.end} · ${s.days}`),
              ]),
            ]),
            e(A_Badge, { key: "b", color: methodColor(s.method) }, s.method),
          ]),
          e("div", { key: "rows", style: { display: "flex", flexDirection: "column", gap: 9, marginTop: 6 } }, [
            kv("pin", "Vị trí áp dụng", s.location, "k1"),
            kv("wifi", "Wifi áp dụng", s.wifi, "k2"),
            kv("clock", "Khung giờ chấm", s.window, "k3"),
            kv("info", "Ngưỡng muộn / sớm", `${s.late}' / ${s.early}'`, "k4"),
            kv("checkCircle", "Quy đổi công", s.credit, "k5"),
          ]),
          e("div", { key: "ft", style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, paddingTop: 14, borderTop: `1px solid ${T.line}` } }, [
            e("span", { key: "p", style: { fontSize: 13, color: T.sub, display: "flex", alignItems: "center", gap: 7 } }, [e(Icon, { key: "i", name: "people", size: 16, color: T.faint }), `${s.people} nhân viên`]),
            e("span", { key: "e", style: { fontSize: 13, fontWeight: 700, color: T.green, display: "flex", alignItems: "center", gap: 5 } }, ["Cấu hình", e(Icon, { key: "i", name: "chevronRight", size: 15 })]),
          ]),
        ]))),
      modal ? e(ShiftModal, { key: "m", modal, onClose: () => setModal(null) }) : null,
    ]);
    function kv(icon, label, value, key) {
      return e("div", { key, style: { display: "flex", alignItems: "center", gap: 9, fontSize: 13.5 } }, [
        e(Icon, { key: "i", name: icon, size: 16, color: T.faint }),
        e("span", { key: "l", style: { color: T.sub, flex: 1 } }, label),
        e("span", { key: "v", style: { fontWeight: 700, color: T.ink } }, value),
      ]);
    }
  }

  function ShiftModal({ modal, onClose }) {
    const s = modal.shift || {};
    const isAdd = modal.mode === "add";
    const [method, setMethod] = useState(s.method || "GPS + Wifi");
    const DAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
    const [days, setDays] = useState(["T2", "T3", "T4", "T5", "T6"]);
    return e(A_Modal, {
      open: true, onClose, width: 640,
      title: isAdd ? "Thêm ca làm" : "Cấu hình ca làm",
      subtitle: isAdd ? "Thiết lập giờ, vị trí, phương thức và quy đổi công" : s.name,
      footer: [e(A_Btn, { key: "c", variant: "ghost", onClick: onClose }, "Huỷ"), e(A_Btn, { key: "s", variant: "primary", icon: "check", onClick: onClose }, "Lưu ca làm")],
    }, e("div", { style: { display: "flex", flexDirection: "column", gap: 18 } }, [
      e("div", { key: "g1", style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 } }, [
        e(A_Field, { key: "1", label: "Tên ca làm", full: true }, e(A_Input, { defaultValue: s.name, placeholder: "VD: Ca hành chính" })),
        e(A_Field, { key: "2", label: "Giờ vào ca" }, e(A_Input, { defaultValue: s.start, placeholder: "08:00" })),
        e(A_Field, { key: "3", label: "Giờ ra ca" }, e(A_Input, { defaultValue: s.end, placeholder: "17:30" })),
      ]),
      // ngày áp dụng
      e(A_Field, { key: "days", label: "Ngày áp dụng trong tuần" },
        e("div", { style: { display: "flex", gap: 8 } }, DAYS.map(d => {
          const on = days.includes(d);
          return e("button", { key: d, onClick: () => setDays(p => on ? p.filter(x => x !== d) : [...p, d]), style: { width: 44, height: 40, borderRadius: 11, border: `1.5px solid ${on ? T.green : T.line}`, background: on ? T.green : "#fff", color: on ? "#fff" : T.sub, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" } }, d);
        }))),
      e(A_Field, { key: "win", label: "Khung giờ được phép chấm vào/ra" },
        e("div", { style: { display: "flex", alignItems: "center", gap: 10 } }, [e(A_Input, { key: 1, defaultValue: "06:00", style: { width: 110 } }), e("span", { key: 2, style: { color: T.faint } }, "đến"), e(A_Input, { key: 3, defaultValue: "09:00", style: { width: 110 } })])),
      // phương thức
      e(A_Field, { key: "method", label: "Phương thức điểm danh" },
        e("div", { style: { display: "flex", gap: 9 } }, ["Chỉ GPS", "Chỉ Wifi", "GPS + Wifi"].map(m => {
          const on = method === m;
          return e("button", { key: m, onClick: () => setMethod(m), style: { flex: 1, height: 42, borderRadius: 11, border: `1.5px solid ${on ? T.green : T.line}`, background: on ? T.green50 : "#fff", color: on ? T.greenDeep : T.sub, fontWeight: 700, fontSize: 13.5, cursor: "pointer", fontFamily: "inherit" } }, m);
        }))),
      method.includes("+") ? e("div", { key: "note2", style: { fontSize: 12.5, color: T.st.warn, background: "#FFF6E8", borderRadius: 10, padding: "9px 12px", marginTop: -8 } }, "Khi chọn cả hai: nhân viên phải thoả mãn ĐÚNG CẢ GPS lẫn Wifi mới chấm được.") : null,
      e("div", { key: "g2", style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 } }, [
        method.includes("GPS") ? e(A_Field, { key: "loc", label: "Vị trí (GPS) áp dụng" }, e(A_Select, { defaultValue: s.location, options: window.AD.locations.map(l => l.name) })) : null,
        method.includes("Wifi") ? e(A_Field, { key: "wf", label: "Wifi áp dụng" }, e(A_Select, { defaultValue: s.wifi, options: window.AD.wifis.map(w => w.ssid) })) : null,
      ]),
      e("div", { key: "g3", style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 } }, [
        e(A_Field, { key: "late", label: "Phút cho phép muộn" }, e(A_Input, { defaultValue: s.late || 10, type: "number" })),
        e(A_Field, { key: "early", label: "Phút cho phép sớm" }, e(A_Input, { defaultValue: s.early || 10, type: "number" })),
        e(A_Field, { key: "credit", label: "Số ca = 1 công" }, e(A_Select, { defaultValue: "1 ca = 1 công", options: ["1 ca = 1 công", "2 ca = 1 công", "3 ca = 1 công"] })),
      ]),
      // gán ca
      e(A_Field, { key: "scope", label: "Phạm vi gán ca" },
        e("div", { style: { display: "flex", gap: 9, flexWrap: "wrap" } }, ["Cá nhân", "1 phòng ban", "1 chi nhánh", "Toàn công ty"].map((sc, i) =>
          e("button", { key: sc, style: { height: 40, padding: "0 15px", borderRadius: 11, border: `1.5px solid ${i === 1 ? T.green : T.line}`, background: i === 1 ? T.green50 : "#fff", color: i === 1 ? T.greenDeep : T.sub, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" } }, sc)))),
    ]));
  }

  function iconAct(icon, color, onClick, key) {
    return e("button", { key, onClick, style: { width: 34, height: 34, borderRadius: 9, border: `1px solid ${T.line}`, background: "#fff", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", color } }, e(Icon, { name: icon, size: 16 }));
  }

  Object.assign(window, { A_Dashboard: Dashboard, A_HR: HR, A_Shifts: Shifts, A_PageWrap: PageWrap, A_card: card, A_cardHead: cardHead, A_iconAct: iconAct, A_colorFor: colorFor });
})();
