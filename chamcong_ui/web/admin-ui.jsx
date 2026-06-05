/* Web Admin — UI dùng chung: Sidebar, Topbar, Table, Badge, Button, Toolbar, Modal, StatCard */
(function () {
  const { useState } = React;
  const T = window.AT;
  const Icon = window.Icon;

  const NAV = [
    { group: "Tổng quan", items: [{ id: "dashboard", icon: "grid", label: "Dashboard" }] },
    {
      group: "Quản trị", items: [
        { id: "hr", icon: "people", label: "Nhân sự" },
        { id: "shifts", icon: "clock", label: "Ca làm" },
        { id: "locations", icon: "pin", label: "Vị trí (GPS)" },
        { id: "wifi", icon: "wifi", label: "Wifi" },
        { id: "org", icon: "org", label: "Cơ cấu tổ chức" },
      ],
    },
    {
      group: "Phê duyệt", items: [
        { id: "offline", icon: "camera", label: "Duyệt offline", badge: "3" },
        { id: "logins", icon: "device", label: "Xác nhận đăng nhập", badge: "3" },
      ],
    },
    { group: "Báo cáo", items: [{ id: "reports", icon: "chart", label: "Thống kê & Báo cáo" }] },
  ];

  function Sidebar({ active, onNav }) {
    return React.createElement("aside", {
      style: {
        width: 256, flexShrink: 0, background: T.sideBg, color: "#fff", height: "100vh",
        position: "sticky", top: 0, display: "flex", flexDirection: "column", padding: "20px 14px",
      },
    }, [
      // logo
      React.createElement("div", { key: "logo", style: { display: "flex", alignItems: "center", gap: 11, padding: "4px 8px 18px" } }, [
        React.createElement("div", { key: "m", style: { width: 40, height: 40, borderRadius: 12, background: `linear-gradient(150deg, ${T.green}, ${T.greenDeep})`, display: "flex", alignItems: "center", justifyContent: "center" } }, React.createElement(Icon, { name: "clock", size: 22, color: "#fff", sw: 2.2 })),
        React.createElement("div", { key: "t" }, [
          React.createElement("div", { key: "1", style: { fontSize: 16, fontWeight: 800 } }, "Chấm Công"),
          React.createElement("div", { key: "2", style: { fontSize: 11.5, color: T.sideText } }, "Bảng quản trị"),
        ]),
      ]),
      React.createElement("div", { key: "nav", style: { flex: 1, overflow: "auto", display: "flex", flexDirection: "column", gap: 4 } },
        NAV.map((sec, si) => React.createElement("div", { key: si, style: { marginTop: si ? 14 : 4 } }, [
          React.createElement("div", { key: "g", style: { fontSize: 11, fontWeight: 700, letterSpacing: .6, textTransform: "uppercase", color: "rgba(255,255,255,.4)", padding: "0 10px 7px" } }, sec.group),
          ...sec.items.map(it => {
            const on = active === it.id;
            return React.createElement("button", {
              key: it.id, onClick: () => onNav(it.id),
              style: {
                width: "100%", display: "flex", alignItems: "center", gap: 11, padding: "10px 11px", marginBottom: 2,
                border: "none", borderRadius: 11, cursor: "pointer", textAlign: "left",
                background: on ? T.green : "transparent", color: on ? "#fff" : T.sideText, fontSize: 14, fontWeight: on ? 700 : 500,
              },
            }, [
              React.createElement(Icon, { key: "i", name: it.icon, size: 19, sw: on ? 2.3 : 2 }),
              React.createElement("span", { key: "l", style: { flex: 1 } }, it.label),
              it.badge ? React.createElement("span", { key: "b", style: { fontSize: 11, fontWeight: 800, background: on ? "rgba(255,255,255,.25)" : T.st.pending, color: "#fff", borderRadius: 999, padding: "1px 7px" } }, it.badge) : null,
            ]);
          }),
        ]))),
      // footer admin
      React.createElement("div", { key: "ft", style: { display: "flex", alignItems: "center", gap: 11, padding: "12px 8px 2px", borderTop: `1px solid ${T.sideLine}`, marginTop: 8 } }, [
        React.createElement("div", { key: "a", style: { width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,.15)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14 } }, "QA"),
        React.createElement("div", { key: "t", style: { flex: 1, minWidth: 0 } }, [
          React.createElement("div", { key: "1", style: { fontSize: 13.5, fontWeight: 700 } }, "Quản trị viên"),
          React.createElement("div", { key: "2", style: { fontSize: 11.5, color: T.sideText } }, "admin@minhphuc.vn"),
        ]),
        React.createElement(Icon, { key: "i", name: "logout", size: 18, color: T.sideText }),
      ]),
    ]);
  }

  function Topbar({ title, subtitle }) {
    return React.createElement("header", {
      style: {
        height: 70, background: "#fff", borderBottom: `1px solid ${T.line}`, display: "flex", alignItems: "center",
        padding: "0 28px", gap: 18, position: "sticky", top: 0, zIndex: 20,
      },
    }, [
      React.createElement("div", { key: "t", style: { flex: 1 } }, [
        React.createElement("h1", { key: "1", style: { fontSize: 19, fontWeight: 800, color: T.ink, margin: 0 } }, title),
        subtitle ? React.createElement("div", { key: "2", style: { fontSize: 12.5, color: T.faint, marginTop: 1 } }, subtitle) : null,
      ]),
      // company switcher
      React.createElement("button", { key: "co", style: { display: "flex", alignItems: "center", gap: 9, background: T.bg, border: `1px solid ${T.line}`, borderRadius: 11, padding: "8px 12px", cursor: "pointer" } }, [
        React.createElement("div", { key: "d", style: { width: 24, height: 24, borderRadius: 7, background: T.green100, color: T.greenDeep, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800 } }, "MP"),
        React.createElement("span", { key: "n", style: { fontSize: 13.5, fontWeight: 700, color: T.ink } }, window.AD.company.name),
        React.createElement(Icon, { key: "c", name: "chevronDown", size: 16, color: T.faint }),
      ]),
      React.createElement("button", { key: "b", style: iconBtn() }, [
        React.createElement(Icon, { key: "i", name: "bell", size: 20, color: T.ink }),
        React.createElement("span", { key: "d", style: { position: "absolute", top: 8, right: 8, width: 8, height: 8, borderRadius: "50%", background: T.st.reject, border: "2px solid #fff" } }),
      ]),
    ]);
    function iconBtn() { return { position: "relative", width: 42, height: 42, borderRadius: 11, border: `1px solid ${T.line}`, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }; }
  }

  // nút
  function Btn({ variant = "ghost", icon, children, onClick, color }) {
    const base = { display: "inline-flex", alignItems: "center", gap: 8, height: 40, padding: "0 16px", borderRadius: 11, fontSize: 13.5, fontWeight: 700, cursor: "pointer", border: "none", whiteSpace: "nowrap", fontFamily: "inherit" };
    const styles = {
      primary: { background: `linear-gradient(135deg, ${T.green}, ${T.greenDark})`, color: "#fff", boxShadow: `0 8px 18px ${T.green}38` },
      ghost: { background: "#fff", color: T.ink, border: `1px solid ${T.line}` },
      soft: { background: T.green50, color: T.greenDeep },
      danger: { background: "#fff", color: T.st.reject, border: `1px solid ${T.st.reject}40` },
      success: { background: T.green, color: "#fff" },
    };
    return React.createElement("button", { onClick, style: { ...base, ...styles[variant] } },
      icon ? React.createElement(Icon, { key: "i", name: icon, size: 17, sw: 2.2 }) : null,
      children);
  }

  function Badge({ color, children, dot }) {
    return React.createElement("span", {
      style: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color, background: color + "18", borderRadius: 999, padding: "4px 11px" },
    }, [
      dot ? React.createElement("span", { key: "d", style: { width: 7, height: 7, borderRadius: "50%", background: color } }) : null,
      children,
    ]);
  }

  // thanh công cụ: tìm kiếm + lọc + sắp xếp + actions
  function Toolbar({ searchValue, onSearch, placeholder, filters, activeFilter, onFilter, onSort, sortLabel, right }) {
    return React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 16 } }, [
      // search
      React.createElement("div", { key: "s", style: { display: "flex", alignItems: "center", gap: 9, background: "#fff", border: `1px solid ${T.line}`, borderRadius: 11, padding: "0 14px", height: 40, minWidth: 260, flex: "0 1 320px" } }, [
        React.createElement(Icon, { key: "i", name: "search", size: 18, color: T.faint }),
        React.createElement("input", { key: "in", value: searchValue, onChange: e => onSearch(e.target.value), placeholder: placeholder || "Tìm kiếm...", style: { border: "none", outline: "none", flex: 1, fontSize: 13.5, color: T.ink, background: "transparent", fontFamily: "inherit" } }),
      ]),
      // filters
      filters ? React.createElement("div", { key: "f", style: { display: "flex", gap: 7, flexWrap: "wrap" } },
        filters.map(f => {
          const on = activeFilter === f.value;
          return React.createElement("button", {
            key: f.value, onClick: () => onFilter(f.value),
            style: { height: 40, padding: "0 14px", borderRadius: 11, border: `1px solid ${on ? T.green : T.line}`, background: on ? T.green50 : "#fff", color: on ? T.greenDeep : T.sub, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },
          }, f.label);
        })) : null,
      onSort ? React.createElement("button", { key: "sort", onClick: onSort, style: { display: "inline-flex", alignItems: "center", gap: 7, height: 40, padding: "0 14px", borderRadius: 11, border: `1px solid ${T.line}`, background: "#fff", color: T.sub, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" } }, [
        React.createElement(Icon, { key: "i", name: "sort", size: 16 }), sortLabel || "Sắp xếp",
      ]) : null,
      React.createElement("div", { key: "sp", style: { flex: 1 } }),
      right || null,
    ]);
  }

  // bảng dữ liệu
  function Table({ columns, rows, renderCell, onRow, empty }) {
    return React.createElement("div", { style: { background: "#fff", border: `1px solid ${T.line}`, borderRadius: 16, overflow: "hidden" } },
      React.createElement("div", { style: { overflowX: "auto" } },
        React.createElement("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: 13.5 } }, [
          React.createElement("thead", { key: "h" },
            React.createElement("tr", {},
              columns.map((c, i) => React.createElement("th", {
                key: i, style: { textAlign: c.align || "left", padding: "13px 18px", fontSize: 11.5, fontWeight: 700, letterSpacing: .4, textTransform: "uppercase", color: T.faint, background: "#FAFBFA", borderBottom: `1px solid ${T.line}`, whiteSpace: "nowrap" },
              }, c.label)))),
          React.createElement("tbody", { key: "b" },
            rows.length === 0
              ? React.createElement("tr", {}, React.createElement("td", { colSpan: columns.length, style: { padding: 40, textAlign: "center", color: T.faint } }, empty || "Không có dữ liệu"))
              : rows.map((r, ri) => React.createElement("tr", {
                  key: ri, onClick: onRow ? () => onRow(r) : undefined,
                  style: { borderBottom: ri < rows.length - 1 ? `1px solid ${T.line}` : "none", cursor: onRow ? "pointer" : "default" },
                  onMouseEnter: e => e.currentTarget.style.background = "#FAFCFB",
                  onMouseLeave: e => e.currentTarget.style.background = "transparent",
                },
                columns.map((c, ci) => React.createElement("td", {
                  key: ci, style: { padding: "13px 18px", textAlign: c.align || "left", color: T.ink, verticalAlign: "middle" },
                }, renderCell(r, c.key, ri))))),
          ),
        ])));
  }

  function StatCard({ icon, color, value, label, sub }) {
    return React.createElement("div", { style: { background: "#fff", border: `1px solid ${T.line}`, borderRadius: 16, padding: "18px 20px" } }, [
      React.createElement("div", { key: "top", style: { display: "flex", alignItems: "center", justifyContent: "space-between" } }, [
        React.createElement("div", { key: "i", style: { width: 42, height: 42, borderRadius: 12, background: color + "18", color, display: "flex", alignItems: "center", justifyContent: "center" } }, React.createElement(Icon, { name: icon, size: 22 })),
        sub ? React.createElement("span", { key: "s", style: { fontSize: 12, fontWeight: 700, color: T.faint } }, sub) : null,
      ]),
      React.createElement("div", { key: "v", style: { fontSize: 30, fontWeight: 800, color: T.ink, marginTop: 14, letterSpacing: -.5 } }, value),
      React.createElement("div", { key: "l", style: { fontSize: 13.5, color: T.sub, marginTop: 2 } }, label),
    ]);
  }

  // modal trung tâm
  function Modal({ open, title, subtitle, onClose, children, footer, width = 560 }) {
    if (!open) return null;
    return React.createElement("div", { style: { position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "48px 20px", overflow: "auto" } }, [
      React.createElement("div", { key: "scrim", onClick: onClose, style: { position: "fixed", inset: 0, background: "rgba(12,30,20,.45)", animation: "aFade .18s ease" } }),
      React.createElement("div", { key: "panel", style: { position: "relative", width, maxWidth: "100%", background: "#fff", borderRadius: 20, boxShadow: "0 30px 80px rgba(0,0,0,.28)", animation: "aPop .2s cubic-bezier(.2,.8,.2,1)" } }, [
        React.createElement("div", { key: "h", style: { display: "flex", alignItems: "flex-start", gap: 12, padding: "20px 24px", borderBottom: `1px solid ${T.line}` } }, [
          React.createElement("div", { key: "t", style: { flex: 1 } }, [
            React.createElement("h3", { key: "1", style: { fontSize: 17.5, fontWeight: 800, color: T.ink, margin: 0 } }, title),
            subtitle ? React.createElement("div", { key: "2", style: { fontSize: 13, color: T.faint, marginTop: 3 } }, subtitle) : null,
          ]),
          React.createElement("button", { key: "x", onClick: onClose, style: { width: 36, height: 36, borderRadius: 10, border: "none", background: T.bg, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: T.sub } }, React.createElement(Icon, { name: "x", size: 19 })),
        ]),
        React.createElement("div", { key: "body", style: { padding: 24, maxHeight: "62vh", overflow: "auto" } }, children),
        footer ? React.createElement("div", { key: "f", style: { display: "flex", justifyContent: "flex-end", gap: 10, padding: "16px 24px", borderTop: `1px solid ${T.line}`, background: "#FAFBFA", borderRadius: "0 0 20px 20px" } }, footer) : null,
      ]),
    ]);
  }

  // field form
  function Field({ label, children, full }) {
    return React.createElement("div", { style: { gridColumn: full ? "1 / -1" : "auto" } }, [
      React.createElement("label", { key: "l", style: { display: "block", fontSize: 12.5, fontWeight: 700, color: T.sub, marginBottom: 6 } }, label),
      children,
    ]);
  }
  function Input(props) {
    return React.createElement("input", { ...props, style: { width: "100%", boxSizing: "border-box", border: `1.5px solid ${T.line}`, borderRadius: 11, padding: "10px 13px", fontSize: 14, color: T.ink, outline: "none", fontFamily: "inherit", background: "#fff", ...(props.style || {}) } });
  }
  function Select({ options, ...props }) {
    return React.createElement("select", { ...props, style: { width: "100%", boxSizing: "border-box", border: `1.5px solid ${T.line}`, borderRadius: 11, padding: "10px 13px", fontSize: 14, color: T.ink, outline: "none", fontFamily: "inherit", background: "#fff", cursor: "pointer", ...(props.style || {}) } },
      options.map((o, i) => React.createElement("option", { key: i, value: o }, o)));
  }

  function Avatar({ initials, color, size = 36 }) {
    return React.createElement("div", { style: { width: size, height: size, borderRadius: "50%", flexShrink: 0, background: (color || T.green) + "1F", color: color || T.greenDeep, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: size * 0.36 } }, initials);
  }

  Object.assign(window, {
    A_Sidebar: Sidebar, A_Topbar: Topbar, A_Btn: Btn, A_Badge: Badge, A_Toolbar: Toolbar,
    A_Table: Table, A_StatCard: StatCard, A_Modal: Modal, A_Field: Field, A_Input: Input, A_Select: Select, A_Avatar: Avatar,
  });
})();
