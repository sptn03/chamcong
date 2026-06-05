/* Web Admin — Trang: Vị trí, Wifi, Cơ cấu tổ chức, Duyệt offline, Xác nhận đăng nhập, Báo cáo */
(function () {
  const { useState, useMemo } = React;
  const T = window.AT;
  const Icon = window.Icon;
  const { A_Table, A_Toolbar, A_Badge, A_StatCard, A_Btn, A_Modal, A_Field, A_Input, A_Select, A_Avatar, A_PageWrap, A_card, A_cardHead, A_iconAct, A_colorFor } = window;
  const e = React.createElement;

  function chips(arr, color) {
    return e("div", { style: { display: "flex", gap: 6, flexWrap: "wrap" } },
      arr.map((x, i) => e("span", { key: i, style: { fontSize: 12, fontWeight: 600, color: color || T.sub, background: (color || T.sub) + "14", borderRadius: 8, padding: "3px 9px" } }, x.replace("Chi nhánh ", "").replace("Phòng ", ""))));
  }

  // ======================= VỊ TRÍ (GPS) =======================
  function Locations() {
    const [q, setQ] = useState("");
    const [modal, setModal] = useState(null);
    const rows = window.AD.locations.filter(l => l.name.toLowerCase().includes(q.toLowerCase()) || l.address.toLowerCase().includes(q.toLowerCase()));
    const columns = [
      { key: "name", label: "Vị trí" }, { key: "coord", label: "Toạ độ" },
      { key: "radius", label: "Bán kính", align: "center" }, { key: "scope", label: "Áp dụng" },
      { key: "act", label: "", align: "right" },
    ];
    const render = (r, key, i) => {
      if (key === "name") return e("div", { style: { display: "flex", alignItems: "center", gap: 11 } }, [
        e("div", { key: "i", style: { width: 38, height: 38, borderRadius: 11, background: T.green50, color: T.green, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 } }, e(Icon, { name: "pin", size: 19 })),
        e("div", { key: "t" }, [e("div", { key: "1", style: { fontWeight: 700 } }, r.name), e("div", { key: "2", style: { fontSize: 12, color: T.faint, maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, r.address)]),
      ]);
      if (key === "coord") return e("span", { style: { fontFamily: "ui-monospace, monospace", fontSize: 12.5, color: T.sub } }, `${r.lat}, ${r.lng}`);
      if (key === "radius") return e(A_Badge, { color: T.st.info }, r.radius + " m");
      if (key === "scope") return chips([r.branch].filter(Boolean), T.green);
      if (key === "act") return e("div", { style: { display: "flex", gap: 6, justifyContent: "flex-end" } }, [iconAct2("edit", T.sub, () => setModal({ mode: "edit", loc: r }), "e"), iconAct2("trash", T.st.reject, () => {}, "d")]);
    };
    return e(A_PageWrap, {}, [
      e(A_Toolbar, { key: "tb", searchValue: q, onSearch: setQ, placeholder: "Tìm vị trí, địa chỉ...", right: e(A_Btn, { variant: "primary", icon: "plus", onClick: () => setModal({ mode: "add" }) }, "Thêm vị trí") }),
      e(A_Table, { key: "t", columns, rows, renderCell: render, onRow: (r) => setModal({ mode: "edit", loc: r }) }),
      modal ? e(LocationModal, { key: "m", modal, onClose: () => setModal(null) }) : null,
    ]);
  }
  function LocationModal({ modal, onClose }) {
    const l = modal.loc || {};
    const [radius, setRadius] = useState(l.radius || 80);
    return e(A_Modal, { open: true, onClose, width: 620, title: modal.mode === "add" ? "Thêm vị trí (GPS)" : "Sửa vị trí", subtitle: "Vị trí luôn dùng GPS · chọn toạ độ trên bản đồ",
      footer: [e(A_Btn, { key: "c", variant: "ghost", onClick: onClose }, "Huỷ"), e(A_Btn, { key: "s", variant: "primary", icon: "check", onClick: onClose }, "Lưu vị trí")] },
      e("div", { style: { display: "flex", flexDirection: "column", gap: 16 } }, [
        e("div", { key: "map", style: { height: 150, borderRadius: 14, background: "repeating-linear-gradient(45deg,#EAF3EE 0 14px,#E2EEE7 14px 28px)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" } }, [
          e("div", { key: "r", style: { position: "absolute", width: 90, height: 90, borderRadius: "50%", background: T.green + "22", border: `2px solid ${T.green}` } }),
          e("span", { key: "p", style: { color: T.green, position: "relative" } }, e(Icon, { name: "pin", size: 30 })),
          e("span", { key: "h", style: { position: "absolute", bottom: 10, fontSize: 12, color: T.sub, fontFamily: "ui-monospace,monospace" } }, "Chọn điểm trên Google Map"),
        ]),
        e("div", { key: "g", style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 } }, [
          e(A_Field, { key: "1", label: "Tên vị trí", full: true }, e(A_Input, { defaultValue: l.name, placeholder: "VD: VP Hà Nội" })),
          e(A_Field, { key: "2", label: "Địa chỉ", full: true }, e(A_Input, { defaultValue: l.address })),
          e(A_Field, { key: "3", label: "Vĩ độ (lat)" }, e(A_Input, { defaultValue: l.lat, placeholder: "21.0285" })),
          e(A_Field, { key: "4", label: "Kinh độ (lng)" }, e(A_Input, { defaultValue: l.lng, placeholder: "105.8048" })),
        ]),
        e(A_Field, { key: "rad", label: `Bán kính cho phép chấm công: ${radius} m` },
          e("input", { type: "range", min: 20, max: 300, step: 10, value: radius, onChange: ev => setRadius(+ev.target.value), style: { width: "100%", accentColor: T.green } })),
        e(A_Field, { key: "br", label: "Chi nhánh" }, e(A_Select, { options: window.AD.branches, defaultValue: l.branch || window.AD.branches[0] })),
        e(A_Field, { key: "emp", label: "Cá nhân đặc cách (tuỳ chọn)" }, e(EmployeePicker, { selected: l.employees || [] })),
        e("div", { key: "ehint", style: { fontSize: 12.5, color: T.faint, marginTop: -8 } }, "Gán riêng cho người hay đi công tác — VD chỉ một số người được chấm ở cả văn phòng lẫn nhà máy."),
      ]));
  }

  // chọn nhân viên (có tìm kiếm) — dùng cho gán vị trí riêng cho cá nhân
  function EmployeePicker({ selected }) {
    const [q, setQ] = useState("");
    const [sel, setSel] = useState(selected);
    const list = window.AD.employees.filter(em => em.name.toLowerCase().includes(q.toLowerCase()) || em.code.toLowerCase().includes(q.toLowerCase()));
    const toggle = (code) => setSel(p => p.includes(code) ? p.filter(x => x !== code) : [...p, code]);
    return e("div", { style: { border: `1.5px solid ${T.line}`, borderRadius: 12, overflow: "hidden" } }, [
      // chips đã chọn
      sel.length ? e("div", { key: "chips", style: { display: "flex", flexWrap: "wrap", gap: 7, padding: "10px 12px", borderBottom: `1px solid ${T.line}`, background: T.green50 } },
        sel.map(code => {
          const em = window.AD.employees.find(x => x.code === code);
          return e("span", { key: code, style: { display: "inline-flex", alignItems: "center", gap: 6, background: "#fff", border: `1px solid ${T.green100}`, borderRadius: 999, padding: "4px 6px 4px 11px", fontSize: 12.5, fontWeight: 600, color: T.greenDeep } }, [
            em ? em.name : code,
            e("button", { key: "x", onClick: () => toggle(code), style: { border: "none", background: "transparent", cursor: "pointer", color: T.green, display: "flex", padding: 0 } }, e(Icon, { name: "x", size: 13, sw: 3 })),
          ]);
        })) : null,
      // ô tìm
      e("div", { key: "s", style: { display: "flex", alignItems: "center", gap: 9, padding: "0 12px", height: 42, borderBottom: `1px solid ${T.line}` } }, [
        e(Icon, { key: "i", name: "search", size: 17, color: T.faint }),
        e("input", { key: "in", value: q, onChange: ev => setQ(ev.target.value), placeholder: "Tìm nhân viên theo tên / mã...", style: { border: "none", outline: "none", flex: 1, fontSize: 13.5, color: T.ink, background: "transparent", fontFamily: "inherit" } }),
      ]),
      // danh sách
      e("div", { key: "list", style: { maxHeight: 168, overflow: "auto" } },
        list.length === 0 ? e("div", { style: { padding: 18, textAlign: "center", fontSize: 13, color: T.faint } }, "Không tìm thấy")
        : list.map((em, i) => {
          const on = sel.includes(em.code);
          return e("button", { key: em.code, onClick: () => toggle(em.code), style: { width: "100%", display: "flex", alignItems: "center", gap: 11, padding: "9px 12px", border: "none", borderTop: i ? `1px solid ${T.line}` : "none", background: on ? T.green50 : "#fff", cursor: "pointer", textAlign: "left" } }, [
            e("span", { key: "ck", style: { width: 20, height: 20, borderRadius: 6, flexShrink: 0, border: `1.5px solid ${on ? T.green : T.line}`, background: on ? T.green : "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" } }, on ? e(Icon, { name: "check", size: 13, sw: 3.2 }) : null),
            e(A_Avatar, { key: "a", initials: em.initials, color: A_colorFor(i), size: 30 }),
            e("div", { key: "t", style: { flex: 1, minWidth: 0 } }, [
              e("div", { key: "1", style: { fontSize: 13.5, fontWeight: 600, color: T.ink } }, em.name),
              e("div", { key: "2", style: { fontSize: 11.5, color: T.faint } }, `${em.code} · ${em.dept}`),
            ]),
          ]);
        })),
    ]);
  }

  function multiSelect(options, selected) {
    return e(MultiSelect, { options, selected });
  }
  function MultiSelect({ options, selected }) {
    const [sel, setSel] = useState(selected);
    return e("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" } }, options.map(o => {
      const on = sel.includes(o);
      return e("button", { key: o, onClick: () => setSel(p => on ? p.filter(x => x !== o) : [...p, o]), style: { display: "inline-flex", alignItems: "center", gap: 6, height: 36, padding: "0 13px", borderRadius: 10, border: `1.5px solid ${on ? T.green : T.line}`, background: on ? T.green50 : "#fff", color: on ? T.greenDeep : T.sub, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" } }, [
        on ? e(Icon, { key: "c", name: "check", size: 14, sw: 3 }) : null,
        o.replace("Chi nhánh ", "").replace("Phòng ", ""),
      ]);
    }));
  }

  // ======================= WIFI =======================
  function Wifi() {
    const [q, setQ] = useState("");
    const [modal, setModal] = useState(null);
    const rows = window.AD.wifis.filter(w => w.ssid.toLowerCase().includes(q.toLowerCase()));
    const columns = [{ key: "ssid", label: "Wifi (SSID)" }, { key: "bssid", label: "BSSID" }, { key: "mode", label: "Chế độ đối chiếu" }, { key: "scope", label: "Áp dụng" }, { key: "act", label: "", align: "right" }];
    const render = (r, key) => {
      if (key === "ssid") return e("div", { style: { display: "flex", alignItems: "center", gap: 11 } }, [
        e("div", { key: "i", style: { width: 38, height: 38, borderRadius: 11, background: T.st.info + "18", color: T.st.info, display: "flex", alignItems: "center", justifyContent: "center" } }, e(Icon, { name: "wifi", size: 19 })),
        e("span", { key: "n", style: { fontWeight: 700 } }, r.ssid),
      ]);
      if (key === "bssid") return e("span", { style: { fontFamily: "ui-monospace, monospace", fontSize: 12.5, color: T.sub } }, r.bssid);
      if (key === "mode") return e(A_Badge, { color: r.mode.includes("BSSID") ? T.st.pending : T.st.info }, r.mode);
      if (key === "scope") return chips([r.branch].filter(Boolean), T.st.info);
      if (key === "act") return e("div", { style: { display: "flex", gap: 6, justifyContent: "flex-end" } }, [iconAct2("edit", T.sub, () => setModal({ mode: "edit", wf: r }), "e"), iconAct2("trash", T.st.reject, () => {}, "d")]);
    };
    return e(A_PageWrap, {}, [
      e(A_Toolbar, { key: "tb", searchValue: q, onSearch: setQ, placeholder: "Tìm wifi (SSID)...", right: e(A_Btn, { variant: "primary", icon: "plus", onClick: () => setModal({ mode: "add" }) }, "Thêm wifi") }),
      e(A_Table, { key: "t", columns, rows, renderCell: render, onRow: (r) => setModal({ mode: "edit", wf: r }) }),
      modal ? e(WifiModal, { key: "m", modal, onClose: () => setModal(null) }) : null,
    ]);
  }
  function WifiModal({ modal, onClose }) {
    const w = modal.wf || {};
    const [mode, setMode] = useState(w.mode || "Tên + BSSID");
    return e(A_Modal, { open: true, onClose, width: 600, title: modal.mode === "add" ? "Thêm Wifi" : "Sửa Wifi", subtitle: "Đối chiếu theo tên wifi hoặc tên + BSSID",
      footer: [e(A_Btn, { key: "c", variant: "ghost", onClick: onClose }, "Huỷ"), e(A_Btn, { key: "s", variant: "primary", icon: "check", onClick: onClose }, "Lưu wifi")] },
      e("div", { style: { display: "flex", flexDirection: "column", gap: 16 } }, [
        e("div", { key: "g", style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 } }, [
          e(A_Field, { key: "1", label: "Tên wifi (SSID)" }, e(A_Input, { defaultValue: w.ssid, placeholder: "Office-5G" })),
          e(A_Field, { key: "2", label: "BSSID (MAC)" }, e(A_Input, { defaultValue: w.bssid, placeholder: "A4:2B:8C:.." })),
        ]),
        e(A_Field, { key: "mode", label: "Chế độ đối chiếu" },
          e("div", { style: { display: "flex", gap: 9 } }, ["Chỉ tên wifi", "Tên + BSSID"].map(m => {
            const on = mode === m;
            return e("button", { key: m, onClick: () => setMode(m), style: { flex: 1, height: 42, borderRadius: 11, border: `1.5px solid ${on ? T.green : T.line}`, background: on ? T.green50 : "#fff", color: on ? T.greenDeep : T.sub, fontWeight: 700, fontSize: 13.5, cursor: "pointer", fontFamily: "inherit" } }, m);
          }))),
        e(A_Field, { key: "br", label: "Chi nhánh" }, e(A_Select, { options: window.AD.branches, defaultValue: w.branch || window.AD.branches[0] })),
      ]));
  }

  // ======================= CƠ CẤU TỔ CHỨC =======================
  function Org() {
    const [modal, setModal] = useState(null);
    const D = window.AD;
    const countByBranch = (b) => D.employees.filter(e2 => e2.branch === b).length;
    const countByDept = (b, d) => D.employees.filter(e2 => e2.branch === b && e2.dept === d).length;
    return e(A_PageWrap, {}, [
      e("div", { key: "tb", style: { display: "flex", justifyContent: "flex-end", marginBottom: 16, gap: 10 } }, [
        e(A_Btn, { key: "b", variant: "ghost", icon: "plus", onClick: () => setModal({ t: "branch" }) }, "Thêm chi nhánh"),
        e(A_Btn, { key: "d", variant: "primary", icon: "plus", onClick: () => setModal({ t: "dept" }) }, "Thêm phòng ban"),
      ]),
      // company node
      e("div", { key: "tree", style: { ...A_card() } }, [
        e("div", { key: "co", style: { display: "flex", alignItems: "center", gap: 13, paddingBottom: 16, borderBottom: `1px solid ${T.line}` } }, [
          e("div", { key: "i", style: { width: 50, height: 50, borderRadius: 14, background: `linear-gradient(150deg, ${T.green}, ${T.greenDeep})`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" } }, e(Icon, { name: "building", size: 26 })),
          e("div", { key: "t", style: { flex: 1 } }, [
            e("div", { key: "1", style: { fontSize: 17, fontWeight: 800, color: T.ink } }, D.company.name),
            e("div", { key: "2", style: { fontSize: 13, color: T.faint } }, `MST ${D.company.taxId} · ${D.employees.length} nhân viên · ${D.branches.length} chi nhánh`),
          ]),
          e(A_Badge, { key: "b", color: T.green }, "Công ty"),
        ]),
        e("div", { key: "branches", style: { paddingLeft: 18, marginTop: 8 } },
          D.branches.map((b, bi) => e("div", { key: bi, style: { borderLeft: `2px solid ${T.line}`, paddingLeft: 22, position: "relative", paddingTop: 14, paddingBottom: 4 } }, [
            e("div", { key: "dot", style: { position: "absolute", left: -7, top: 26, width: 12, height: 12, borderRadius: "50%", background: "#fff", border: `3px solid ${T.green}` } }),
            e("div", { key: "br", style: { display: "flex", alignItems: "center", gap: 12, background: T.bg, borderRadius: 13, padding: "12px 15px" } }, [
              e("div", { key: "i", style: { width: 40, height: 40, borderRadius: 11, background: "#fff", color: T.green, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${T.line}` } }, e(Icon, { name: "org", size: 20 })),
              e("div", { key: "t", style: { flex: 1 } }, [
                e("div", { key: "1", style: { fontSize: 15, fontWeight: 700, color: T.ink } }, b),
                e("div", { key: "2", style: { fontSize: 12.5, color: T.faint } }, `${D.depts[b].length} phòng ban · ${countByBranch(b)} nhân viên`),
              ]),
              iconAct2("edit", T.sub, () => setModal({ t: "branch", v: b }), "e"),
            ]),
            e("div", { key: "depts", style: { display: "flex", flexDirection: "column", gap: 8, marginTop: 10, paddingLeft: 14 } },
              D.depts[b].map((d, di) => e("div", { key: di, style: { display: "flex", alignItems: "center", gap: 11, padding: "9px 14px", borderRadius: 11, border: `1px solid ${T.line}` } }, [
                e("span", { key: "i", style: { color: T.faint, display: "flex" } }, e(Icon, { name: "people", size: 17 })),
                e("span", { key: "n", style: { flex: 1, fontSize: 14, color: T.ink, fontWeight: 600 } }, d),
                e("span", { key: "c", style: { fontSize: 12.5, color: T.faint } }, `${countByDept(b, d)} người`),
              ]))),
          ]))),
      ]),
      modal ? e(A_Modal, { key: "m", open: true, onClose: () => setModal(null), width: 480, title: modal.t === "branch" ? (modal.v ? "Sửa chi nhánh" : "Thêm chi nhánh") : "Thêm phòng ban",
        footer: [e(A_Btn, { key: "c", variant: "ghost", onClick: () => setModal(null) }, "Huỷ"), e(A_Btn, { key: "s", variant: "primary", icon: "check", onClick: () => setModal(null) }, "Lưu")] },
        e("div", { style: { display: "flex", flexDirection: "column", gap: 16 } }, [
          modal.t === "dept" ? e(A_Field, { key: "b", label: "Thuộc chi nhánh" }, e(A_Select, { options: D.branches })) : null,
          e(A_Field, { key: "n", label: modal.t === "branch" ? "Tên chi nhánh" : "Tên phòng ban" }, e(A_Input, { defaultValue: modal.v || "", placeholder: modal.t === "branch" ? "VD: Chi nhánh Hải Phòng" : "VD: Phòng Kế toán" })),
        ])) : null,
    ]);
  }

  // ======================= DUYỆT OFFLINE =======================
  function OfflineApproval() {
    const [items, setItems] = useState(window.AD.offline);
    const [f, setF] = useState("pending");
    const filters = [{ label: "Chờ duyệt", value: "pending" }, { label: "Đã duyệt", value: "approved" }, { label: "Từ chối", value: "rejected" }, { label: "Tất cả", value: "all" }];
    const list = items.filter(o => f === "all" || o.status === f);
    const set = (id, status) => setItems(p => p.map(o => o.id === id ? { ...o, status } : o));
    const stColor = { pending: T.st.pending, approved: T.st.present, rejected: T.st.reject };
    const stLabel = { pending: "Chờ duyệt", approved: "Đã duyệt", rejected: "Từ chối" };
    return e(A_PageWrap, {}, [
      e(A_Toolbar, { key: "tb", searchValue: "", onSearch: () => {}, placeholder: "Tìm nhân viên...", filters, activeFilter: f, onFilter: setF }),
      e("div", { key: "grid", style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 16 } },
        list.map((o, i) => e("div", { key: o.id, style: { background: "#fff", border: `1px solid ${T.line}`, borderRadius: 16, overflow: "hidden" } }, [
          // ảnh
          e("div", { key: "ph", style: { height: 150, background: `linear-gradient(135deg, ${A_colorFor(i)}, ${A_colorFor(i + 2)})`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" } }, [
            e(Icon, { key: "u", name: "user", size: 46, color: "rgba(255,255,255,.85)" }),
            e("span", { key: "t", style: { position: "absolute", top: 12, left: 12, background: "rgba(0,0,0,.35)", color: "#fff", borderRadius: 8, padding: "4px 10px", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 } }, [e(Icon, { key: "i", name: "camera", size: 14 }), "Ảnh xác minh"]),
            e("span", { key: "s", style: { position: "absolute", top: 12, right: 12, background: "#fff", color: stColor[o.status], borderRadius: 999, padding: "4px 12px", fontSize: 12, fontWeight: 700, boxShadow: "0 2px 8px rgba(0,0,0,.15)" } }, stLabel[o.status]),
          ]),
          e("div", { key: "body", style: { padding: 16 } }, [
            e("div", { key: "head", style: { display: "flex", alignItems: "center", gap: 11, marginBottom: 12 } }, [
              e(A_Avatar, { key: "a", initials: o.emp.split(" ").slice(-1)[0][0], color: A_colorFor(i) }),
              e("div", { key: "t", style: { flex: 1 } }, [
                e("div", { key: "1", style: { fontSize: 14.5, fontWeight: 700, color: T.ink } }, o.emp),
                e("div", { key: "2", style: { fontSize: 12.5, color: T.faint } }, `${o.code} · ${o.dept}`),
              ]),
            ]),
            e("div", { key: "meta", style: { display: "flex", flexDirection: "column", gap: 7, fontSize: 13, marginBottom: o.note ? 12 : 14 } }, [
              metaRow("clock", `${o.date} · lúc ${o.time}`, "m1"),
              metaRow("pin", `${o.lat}, ${o.lng}`, "m2"),
            ]),
            o.note ? e("div", { key: "note", style: { fontSize: 12.5, color: T.sub, background: T.bg, borderRadius: 10, padding: "9px 12px", marginBottom: 14 } }, `“${o.note}”`) : null,
            o.status === "pending"
              ? e("div", { key: "act", style: { display: "flex", gap: 10 } }, [
                  e("button", { key: "r", onClick: () => set(o.id, "rejected"), style: btn(T.st.reject, true) }, [e(Icon, { key: "i", name: "x", size: 16, sw: 2.6 }), "Từ chối"]),
                  e("button", { key: "a", onClick: () => set(o.id, "approved"), style: btn(T.green) }, [e(Icon, { key: "i", name: "check", size: 16, sw: 2.6 }), "Duyệt"]),
                ])
              : e("div", { key: "done", style: { textAlign: "center", fontSize: 13, fontWeight: 700, color: stColor[o.status], padding: "8px 0" } }, o.status === "approved" ? "✓ Đã duyệt — tính hợp lệ" : "✕ Đã từ chối"),
          ]),
        ]))),
    ]);
    function btn(color, outline) { return { flex: 1, height: 42, borderRadius: 11, border: outline ? `1.5px solid ${color}40` : "none", background: outline ? "#fff" : color, color: outline ? color : "#fff", fontWeight: 700, fontSize: 13.5, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, fontFamily: "inherit" }; }
    function metaRow(icon, text, key) { return e("div", { key, style: { display: "flex", alignItems: "center", gap: 9, color: T.sub } }, [e(Icon, { key: "i", name: icon, size: 15, color: T.faint }), e("span", { key: "t", style: { fontFamily: icon === "pin" ? "ui-monospace,monospace" : "inherit", fontSize: icon === "pin" ? 12 : 13 } }, text)]); }
  }

  // ======================= XÁC NHẬN ĐĂNG NHẬP / THIẾT BỊ =======================
  function Logins() {
    const [items, setItems] = useState(window.AD.logins);
    const [f, setF] = useState("pending");
    const filters = [{ label: "Chờ xác nhận", value: "pending" }, { label: "Đã duyệt", value: "approved" }, { label: "Tất cả", value: "all" }];
    const list = items.filter(g => f === "all" || g.status === f);
    const set = (id, status) => setItems(p => p.map(g => g.id === id ? { ...g, status } : g));
    const columns = [{ key: "emp", label: "Nhân viên" }, { key: "type", label: "Loại yêu cầu" }, { key: "device", label: "Thiết bị" }, { key: "time", label: "Thời gian" }, { key: "status", label: "", align: "right" }];
    const render = (g, key, i) => {
      if (key === "emp") return e("div", { style: { display: "flex", alignItems: "center", gap: 11 } }, [e(A_Avatar, { key: "a", initials: g.emp.split(" ").slice(-1)[0][0], color: A_colorFor(i) }), e("div", { key: "t" }, [e("div", { key: 1, style: { fontWeight: 700 } }, g.emp), e("div", { key: 2, style: { fontSize: 12, color: T.faint } }, g.code)])]);
      if (key === "type") return e(A_Badge, { color: g.type.includes("Thiết bị") ? T.st.warn : T.st.info }, g.type);
      if (key === "device") return e("div", {}, [e("div", { key: 1, style: { display: "flex", alignItems: "center", gap: 7 } }, [e(Icon, { key: "i", name: "device", size: 15, color: T.faint }), g.device]), e("div", { key: 2, style: { fontSize: 12, color: T.faint, marginTop: 2 } }, "IP " + g.ip)]);
      if (key === "time") return e("span", { style: { color: T.sub } }, g.time);
      if (key === "status") return g.status === "pending"
        ? e("div", { style: { display: "flex", gap: 8, justifyContent: "flex-end" } }, [
            e(A_Btn, { key: "r", variant: "danger", onClick: () => set(g.id, "rejected") }, "Từ chối"),
            e(A_Btn, { key: "a", variant: "success", icon: "check", onClick: () => set(g.id, "approved") }, "Xác nhận"),
          ])
        : e(A_Badge, { color: g.status === "approved" ? T.st.present : T.st.reject, dot: true }, g.status === "approved" ? "Đã xác nhận" : "Đã từ chối");
    };
    return e(A_PageWrap, {}, [
      e("div", { key: "banner", style: { display: "flex", gap: 11, alignItems: "center", background: T.green50, borderRadius: 14, padding: "13px 16px", marginBottom: 16 } }, [
        e(Icon, { key: "i", name: "info", size: 19, color: T.green }),
        e("span", { key: "t", style: { fontSize: 13.5, color: T.greenDeep } }, "Mỗi tài khoản chỉ đăng nhập trên 1 phòng tại một thời điểm. Đăng nhập mới hoặc thiết bị mới đều cần Admin xác nhận."),
      ]),
      e(A_Toolbar, { key: "tb", searchValue: "", onSearch: () => {}, placeholder: "Tìm nhân viên...", filters, activeFilter: f, onFilter: setF }),
      e(A_Table, { key: "t", columns, rows: list, renderCell: render }),
    ]);
  }

  // ======================= THỐNG KÊ & BÁO CÁO =======================
  // trạng thái 1 ngày
  const DAY_LBL = { ontime: "Đúng giờ", late: "Đi muộn", early: "Về sớm", forgot: "Quên chấm ra", off: "Nghỉ" };
  const VN_WD = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const p2 = (n) => String(n).padStart(2, "0");
  function dayColor(s) { return { ontime: T.st.present, late: T.st.late, early: T.st.early, forgot: T.st.warn, off: T.st.absent }[s]; }

  // sinh lịch sử chấm công 1 tháng cho 1 người (deterministic theo số liệu báo cáo)
  function genHistory(rec, year, mi) {
    const days = new Date(year, mi + 1, 0).getDate();
    const work = [];
    for (let d = 1; d <= days; d++) { const wd = new Date(year, mi, d).getDay(); if (wd !== 0 && wd !== 6) work.push({ d, wd }); }
    const N = work.length;
    const status = new Array(N).fill("ontime");
    const early = rec.earlyMin > 0 ? Math.max(1, Math.round(rec.earlyMin / 45)) : 0;
    const specials = [];
    for (let i = 0; i < rec.lateCount; i++) specials.push("late");
    for (let i = 0; i < early; i++) specials.push("early");
    for (let i = 0; i < rec.forgot; i++) specials.push("forgot");
    specials.forEach((s, idx) => {
      let p = Math.floor((idx + 0.5) * N / Math.max(1, specials.length));
      let q = p; while (q < N && status[q] !== "ontime") q++;
      if (q >= N) { q = p; while (q >= 0 && status[q] !== "ontime") q--; }
      if (q >= 0 && q < N) status[q] = s;
    });
    const lateEach = rec.lateCount ? Math.round(rec.lateMin / rec.lateCount) : 0;
    const earlyEach = early ? Math.round(rec.earlyMin / early) : 0;
    return work.map((w, i) => {
      const s = status[i];
      let tin = "—", tout = "—", diff = "";
      if (s === "ontime") { tin = "07:5" + (2 + i % 7); tout = "17:3" + (i % 6); }
      else if (s === "late") { const m = Math.min(58, lateEach); tin = "08:" + p2(m); tout = "17:3" + (i % 5); diff = "+" + m + "′"; }
      else if (s === "early") { const m = Math.min(120, earlyEach); const tot = 17 * 60 + 30 - m; tin = "07:5" + (1 + i % 6); tout = p2(Math.floor(tot / 60)) + ":" + p2(tot % 60); diff = "-" + m + "′"; }
      else if (s === "forgot") { tin = "08:0" + (1 + i % 7); tout = "—"; }
      return { date: `${p2(w.d)}/${p2(mi + 1)}/${year}`, wd: VN_WD[w.wd], in: tin, out: tout, status: s, diff };
    });
  }

  function Reports() {
    const [q, setQ] = useState("");
    const [dept, setDept] = useState("all");
    const [histRec, setHistRec] = useState(null);
    const [editRec, setEditRec] = useState(null);
    const D = window.AD;
    const deptList = ["all", ...Array.from(new Set(D.reports.map(r => r.dept)))];
    const filters = deptList.map(d => ({ label: d === "all" ? "Tất cả phòng" : d.replace("Phòng ", ""), value: d }));
    const rows = D.reports.filter(r => (dept === "all" || r.dept === dept) && (r.name.toLowerCase().includes(q.toLowerCase()) || r.code.toLowerCase().includes(q.toLowerCase())));
    const sum = (k) => rows.reduce((s, r) => s + r[k], 0);

    const columns = [
      { key: "emp", label: "Nhân viên" }, { key: "dept", label: "Phòng ban" },
      { key: "work", label: "Ngày công", align: "center" }, { key: "credit", label: "Tổng công", align: "center" },
      { key: "late", label: "Đi muộn", align: "center" }, { key: "early", label: "Về sớm", align: "center" },
      { key: "forgot", label: "Quên chấm", align: "center" }, { key: "act", label: "", align: "right" },
    ];
    const render = (r, key, i) => {
      if (key === "emp") return e("div", { style: { display: "flex", alignItems: "center", gap: 11 } }, [e(A_Avatar, { key: "a", initials: r.name.split(" ").slice(-2).map(w => w[0]).join(""), color: A_colorFor(i) }), e("div", { key: "t" }, [e("div", { key: 1, style: { fontWeight: 700, whiteSpace: "nowrap" } }, r.name), e("div", { key: 2, style: { fontSize: 12, color: T.faint } }, r.code)])]);
      if (key === "dept") return e("span", { style: { color: T.sub } }, r.dept);
      if (key === "work") return e("b", {}, r.workDays);
      if (key === "credit") return e("span", { style: { fontWeight: 800, color: T.green } }, r.credit);
      if (key === "late") return r.lateMin ? e("span", { style: { color: T.st.late, fontWeight: 700 } }, `${r.lateMin}' · ${r.lateCount}l`) : e("span", { style: { color: T.faint } }, "—");
      if (key === "early") return r.earlyMin ? e("span", { style: { color: T.st.early, fontWeight: 700 } }, `${r.earlyMin}'`) : e("span", { style: { color: T.faint } }, "—");
      if (key === "forgot") return r.forgot ? e(A_Badge, { color: T.st.warn }, r.forgot + " lần") : e("span", { style: { color: T.faint } }, "—");
      if (key === "act") return e("div", { style: { display: "flex", gap: 6, justifyContent: "flex-end" } }, [
        e("button", { key: "v", onClick: (ev) => { ev.stopPropagation(); setHistRec(r); }, style: { display: "inline-flex", alignItems: "center", gap: 6, height: 34, padding: "0 12px", borderRadius: 9, border: `1px solid ${T.green}40`, background: T.green50, color: T.greenDeep, fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" } }, [e(Icon, { key: "i", name: "calendar", size: 14 }), "Lịch sử"]),
      ]);
    };

    return e(A_PageWrap, {}, [
      // summary
      e("div", { key: "stats", style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 16, marginBottom: 18 } }, [
        e(A_StatCard, { key: 1, icon: "checkCircle", color: T.green, value: sum("credit").toFixed(1), label: "Tổng công (tháng)", sub: rows.length + " người" }),
        e(A_StatCard, { key: 2, icon: "clock", color: T.st.late, value: sum("lateMin"), label: "Tổng phút đi muộn", sub: sum("lateCount") + " lần" }),
        e(A_StatCard, { key: 3, icon: "logout", color: T.st.early, value: sum("earlyMin"), label: "Tổng phút về sớm" }),
        e(A_StatCard, { key: 4, icon: "info", color: T.st.warn, value: sum("forgot"), label: "Số lần quên chấm" }),
      ]),
      e(A_Toolbar, {
        key: "tb", searchValue: q, onSearch: setQ, placeholder: "Tìm nhân viên...", filters, activeFilter: dept, onFilter: setDept,
        right: e("div", { style: { display: "flex", gap: 10 } }, [
          e(A_Btn, { key: "m", variant: "ghost", icon: "calendar" }, "Tháng 06/2026"),
          e(A_Btn, { key: "x", variant: "primary", icon: "excel" }, "Xuất Excel"),
        ]),
      }),
      e("div", { key: "exnote", style: { fontSize: 12.5, color: T.faint, marginBottom: 12 } }, (dept === "all" ? "Phạm vi xuất: toàn công ty" : "Phạm vi xuất: " + dept) + " · bấm một người để xem lịch sử chấm công theo tháng"),
      e(A_Table, { key: "t", columns, rows, renderCell: render, onRow: (r) => setHistRec(r) }),
      histRec ? e(EmployeeHistoryModal, { key: "h", rec: histRec, onClose: () => setHistRec(null), onEditDay: (day) => setEditRec({ name: histRec.name, code: histRec.code, ...day }) }) : null,
      editRec ? e(EditRecordModal, { key: "m", rec: editRec, onClose: () => setEditRec(null) }) : null,
    ]);
  }

  // lịch sử chấm công theo tháng của 1 người
  function EmployeeHistoryModal({ rec, onClose, onEditDay }) {
    const [ym, setYm] = useState({ y: 2026, m: 5 }); // 0-index tháng (5 = tháng 6)
    const MONTHS = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
    const data = genHistory(rec, ym.y, ym.m);
    const shift = (dir) => setYm(p => { let m = p.m + dir, y = p.y; if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; } return { y, m }; });
    const cnt = (s) => data.filter(d => d.status === s).length;
    const workCount = data.filter(d => d.status !== "off" && d.in !== "—").length;
    const lateMinSum = data.filter(d => d.status === "late").reduce((a, d) => a + parseInt(d.diff) || 0, 0);

    const summary = [
      { label: "Ngày công", value: workCount, color: T.green },
      { label: "Đi muộn", value: cnt("late") + " lần", color: T.st.late },
      { label: "Về sớm", value: cnt("early") + " lần", color: T.st.early },
      { label: "Quên chấm", value: cnt("forgot") + " lần", color: T.st.warn },
    ];

    return e(A_Modal, {
      open: true, onClose, width: 760,
      title: rec.name, subtitle: `${rec.code} · ${rec.dept}`,
      footer: [e(A_Btn, { key: "x", variant: "primary", icon: "excel", onClick: onClose }, "Xuất Excel cá nhân")],
    }, e("div", { style: { display: "flex", flexDirection: "column", gap: 16 } }, [
      // chọn tháng
      e("div", { key: "month", style: { display: "flex", alignItems: "center", justifyContent: "center", gap: 18 } }, [
        e("button", { key: "p", onClick: () => shift(-1), style: navBtn() }, e(Icon, { name: "chevronLeft", size: 18, color: T.ink })),
        e("span", { key: "l", style: { fontSize: 15.5, fontWeight: 800, color: T.ink, minWidth: 150, textAlign: "center" } }, `Tháng ${MONTHS[ym.m]}/${ym.y}`),
        e("button", { key: "n", onClick: () => shift(1), style: navBtn() }, e(Icon, { name: "chevronRight", size: 18, color: T.ink })),
      ]),
      // mini summary
      e("div", { key: "sum", style: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 } },
        summary.map((s, i) => e("div", { key: i, style: { background: T.bg, borderRadius: 12, padding: "11px 14px" } }, [
          e("div", { key: "v", style: { fontSize: 20, fontWeight: 800, color: s.color } }, s.value),
          e("div", { key: "l", style: { fontSize: 12, color: T.sub, marginTop: 1 } }, s.label),
        ]))),
      // bảng ngày
      e("div", { key: "tbl", style: { border: `1px solid ${T.line}`, borderRadius: 12, overflow: "hidden" } },
        e("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: 13 } }, [
          e("thead", { key: "h" }, e("tr", {}, ["Ngày", "Thứ", "Giờ vào", "Giờ ra", "Chênh lệch", "Trạng thái", ""].map((c, i) =>
            e("th", { key: i, style: { textAlign: i >= 2 && i <= 4 ? "center" : "left", padding: "10px 14px", fontSize: 11, fontWeight: 700, letterSpacing: .4, textTransform: "uppercase", color: T.faint, background: "#FAFBFA", borderBottom: `1px solid ${T.line}` } }, c)))),
          e("tbody", { key: "b" }, data.map((d, i) => e("tr", { key: i, style: { borderBottom: i < data.length - 1 ? `1px solid ${T.line}` : "none", background: d.status === "off" ? "#FBFCFB" : "#fff" } }, [
            e("td", { key: "d", style: td() }, e("b", {}, d.date.slice(0, 5))),
            e("td", { key: "w", style: { ...td(), color: T.faint } }, d.wd),
            e("td", { key: "i", style: { ...td(), textAlign: "center", fontFamily: "ui-monospace,monospace" } }, d.in),
            e("td", { key: "o", style: { ...td(), textAlign: "center", fontFamily: "ui-monospace,monospace", color: d.out === "—" ? T.st.warn : T.ink } }, d.out),
            e("td", { key: "x", style: { ...td(), textAlign: "center", color: d.status === "late" ? T.st.late : d.status === "early" ? T.st.early : T.faint, fontWeight: 700 } }, d.diff || "—"),
            e("td", { key: "s", style: td() }, e(A_Badge, { color: dayColor(d.status), dot: true }, DAY_LBL[d.status])),
            e("td", { key: "e", style: { ...td(), textAlign: "right" } }, d.status !== "off" ? e("button", { onClick: () => onEditDay(d), title: "Sửa bản ghi", style: { width: 30, height: 30, borderRadius: 8, border: `1px solid ${T.line}`, background: "#fff", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", color: T.sub } }, e(Icon, { name: "edit", size: 14 })) : null),
          ]))),
        ])),
    ]));
    function navBtn() { return { width: 36, height: 36, borderRadius: 10, border: `1px solid ${T.line}`, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }; }
    function td() { return { padding: "10px 14px", color: T.ink, verticalAlign: "middle" }; }
  }

  function EditRecordModal({ rec, onClose }) {
    const stLabel = rec.status ? DAY_LBL[rec.status] : "Quên chấm ra";
    return e(A_Modal, { open: true, onClose, width: 540, title: "Sửa bản ghi chấm công", subtitle: `${rec.name} · ${rec.code}${rec.date ? " · " + rec.date : ""}`,
      footer: [e(A_Btn, { key: "c", variant: "ghost", onClick: onClose }, "Huỷ"), e(A_Btn, { key: "s", variant: "primary", icon: "check", onClick: onClose }, "Lưu bản ghi")] },
      e("div", { style: { display: "flex", flexDirection: "column", gap: 16 } }, [
        e("div", { key: "banner", style: { fontSize: 12.5, color: T.st.warn, background: "#FFF6E8", borderRadius: 10, padding: "10px 13px" } }, "Dùng khi nhân viên quên chấm hoặc thiết bị lỗi. Mọi chỉnh sửa được ghi nhận."),
        e(A_Field, { key: "d", label: "Ngày" }, e(A_Input, { defaultValue: rec.date || "29/05/2026" })),
        e("div", { key: "g", style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 } }, [
          e(A_Field, { key: "1", label: "Giờ vào ca" }, e(A_Input, { defaultValue: rec.in && rec.in !== "—" ? rec.in : "", placeholder: "--:--" })),
          e(A_Field, { key: "2", label: "Giờ ra ca" }, e(A_Input, { defaultValue: rec.out && rec.out !== "—" ? rec.out : "", placeholder: "--:--" })),
        ]),
        e(A_Field, { key: "st", label: "Trạng thái" }, e(A_Select, { options: ["Đúng giờ", "Đi muộn", "Về sớm", "Quên chấm ra", "Nghỉ"], defaultValue: stLabel })),
        e(A_Field, { key: "note", label: "Lý do chỉnh sửa", full: true }, e(A_Input, { placeholder: "VD: Nhân viên quên chấm ra, xác nhận qua trưởng phòng" })),
      ]));
  }

  function iconAct2(icon, color, onClick, key) {
    return e("button", { key, onClick: (ev) => { ev.stopPropagation(); onClick(); }, style: { width: 34, height: 34, borderRadius: 9, border: `1px solid ${T.line}`, background: "#fff", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", color } }, e(Icon, { name: icon, size: 16 }));
  }

  Object.assign(window, { A_Locations: Locations, A_Wifi: Wifi, A_Org: Org, A_OfflineApproval: OfflineApproval, A_Logins: Logins, A_Reports: Reports });
})();
