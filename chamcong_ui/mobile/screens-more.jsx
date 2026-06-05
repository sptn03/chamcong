/* Màn hình: Lịch sử, Thống kê cá nhân, Tài khoản, Bottom sheet đổi công ty */
(function () {
  const { useState } = React;
  const T = window.CCT;
  const Icon = window.Icon;
  const header = window.CC_header;
  const SectionTitle = window.CC_SectionTitle;
  const LBL = window.CC_STATUS_LABEL;

  function statusColor(s) {
    if (s === "offline-pending") return T.st.pending;
    return T.st[s] || T.faint;
  }
  function statusIcon(s) {
    return { ontime: "checkCircle", late: "clock", early: "logout", forgot: "info", off: "moon", "offline-pending": "camera" }[s] || "info";
  }

  // thẻ một bản ghi chấm công
  function RecordRow({ r, showDay, key }) {
    const c = statusColor(r.status);
    return React.createElement("div", {
      key, style: { display: "flex", alignItems: "center", gap: 13, background: "#fff", borderRadius: 16, padding: "13px 15px", boxShadow: "0 4px 14px rgba(20,40,30,.04)" },
    }, [
      React.createElement("div", { key: "ic", style: { width: 44, height: 44, borderRadius: 13, flexShrink: 0, background: c + "1A", color: c, display: "flex", alignItems: "center", justifyContent: "center" } }, React.createElement(Icon, { name: statusIcon(r.status), size: 21 })),
      React.createElement("div", { key: "mid", style: { flex: 1, minWidth: 0 } }, [
        React.createElement("div", { key: "d", style: { fontSize: 14.5, fontWeight: 700, color: T.ink } }, showDay && r.day ? `${r.day} · ${r.date}` : (r.date || r.day)),
        React.createElement("div", { key: "t", style: { fontSize: 12.5, color: T.sub, marginTop: 2, display: "flex", gap: 10 } }, [
          React.createElement("span", { key: "i" }, `Vào ${r.in}`),
          React.createElement("span", { key: "o" }, `Ra ${r.out}`),
        ]),
      ]),
      React.createElement("div", { key: "right", style: { textAlign: "right" } }, [
        React.createElement("span", { key: "chip", style: { display: "inline-block", fontSize: 11.5, fontWeight: 700, color: c, background: c + "18", borderRadius: 999, padding: "4px 10px" } }, LBL[r.status]),
        (r.lateMin > 0 || r.earlyMin > 0) ? React.createElement("div", { key: "m", style: { fontSize: 11.5, color: T.faint, marginTop: 4 } }, r.lateMin > 0 ? `Muộn ${r.lateMin}'` : `Sớm ${r.earlyMin}'`) : null,
      ]),
    ]);
  }

  // ======================================================================
  // LỊCH SỬ CHẤM CÔNG
  // ======================================================================
  function HistoryScreen({ onBack }) {
    const D = window.CC;
    const [view, setView] = useState("week");
    const dotColor = (s) => statusColor(s);

    return React.createElement("div", { style: { background: T.bg, minHeight: "100%", paddingBottom: 16 } }, [
      header("Lịch sử chấm công", onBack, "h"),
      // toggle tuần/tháng
      React.createElement("div", { key: "tg", style: { display: "flex", gap: 6, background: "#fff", borderRadius: 999, padding: 5, margin: "0 18px 16px", boxShadow: "0 4px 14px rgba(20,40,30,.04)" } }, [
        toggleBtn("Theo tuần", view === "week", () => setView("week"), "tw"),
        toggleBtn("Theo tháng", view === "month", () => setView("month"), "tm"),
      ]),

      view === "week"
        ? React.createElement("div", { key: "week" }, [
            // dải ngày trong tuần
            React.createElement("div", { key: "strip", style: { display: "flex", gap: 7, padding: "0 18px", marginBottom: 18 } },
              D.week.map((d, i) => React.createElement("div", {
                key: i, style: {
                  flex: 1, background: "#fff", borderRadius: 14, padding: "10px 4px 9px", textAlign: "center",
                  boxShadow: "0 4px 12px rgba(20,40,30,.04)", border: d.status !== "off" && d.in !== "—" ? `1.5px solid transparent` : "1.5px solid transparent",
                },
              }, [
                React.createElement("div", { key: "d", style: { fontSize: 11.5, color: T.sub, fontWeight: 600 } }, d.day),
                React.createElement("div", { key: "n", style: { fontSize: 14, fontWeight: 800, color: T.ink, margin: "3px 0 6px" } }, d.date.split("/")[0]),
                React.createElement("div", { key: "dot", style: { width: 8, height: 8, borderRadius: "50%", background: dotColor(d.status), margin: "0 auto" } }),
              ]))),
            React.createElement("div", { key: "list", style: { padding: "0 18px", display: "flex", flexDirection: "column", gap: 10 } },
              D.week.filter(d => d.in !== "—").map((d, i) => React.createElement(RecordRow, { key: i, r: d, showDay: true }))),
          ])
        : React.createElement("div", { key: "month", style: { padding: "0 18px" } }, [
            React.createElement(SectionTitle, { key: "st" }, "Tháng 06/2026"),
            React.createElement("div", { key: "list", style: { display: "flex", flexDirection: "column", gap: 10 } },
              D.month.map((d, i) => React.createElement(RecordRow, { key: i, r: d, showDay: false }))),
          ]),

      // chú thích
      React.createElement("div", { key: "legend", style: { display: "flex", flexWrap: "wrap", gap: "8px 16px", padding: "20px 22px 4px" } },
        ["ontime", "late", "early", "forgot", "offline-pending", "off"].map((s, i) =>
          React.createElement("div", { key: i, style: { display: "flex", alignItems: "center", gap: 6 } }, [
            React.createElement("span", { key: "d", style: { width: 9, height: 9, borderRadius: "50%", background: statusColor(s) } }),
            React.createElement("span", { key: "l", style: { fontSize: 12, color: T.sub } }, LBL[s]),
          ]))),
    ]);

    function toggleBtn(label, active, onClick, key) {
      return React.createElement("button", {
        key, onClick, style: {
          flex: 1, height: 38, borderRadius: 999, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700,
          background: active ? T.green : "transparent", color: active ? "#fff" : T.sub,
        },
      }, label);
    }
  }

  // ======================================================================
  // THỐNG KÊ CÁ NHÂN
  // ======================================================================
  function StatsScreen({ onBack }) {
    const s = window.CC.stats;
    const bigCard = (icon, color, value, unit, label, sub, key) =>
      React.createElement("div", { key, style: { background: "#fff", borderRadius: 20, padding: "16px 16px 15px", boxShadow: "0 5px 16px rgba(20,40,30,.04)" } }, [
        React.createElement("div", { key: "i", style: { width: 40, height: 40, borderRadius: 12, background: color + "1A", color, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 } }, React.createElement(Icon, { name: icon, size: 21 })),
        React.createElement("div", { key: "v", style: { display: "flex", alignItems: "baseline", gap: 4 } }, [
          React.createElement("span", { key: "n", style: { fontSize: 30, fontWeight: 800, color: T.ink, letterSpacing: -1 } }, value),
          unit ? React.createElement("span", { key: "u", style: { fontSize: 14, fontWeight: 700, color: T.sub } }, unit) : null,
        ]),
        React.createElement("div", { key: "l", style: { fontSize: 14, fontWeight: 700, color: T.ink, marginTop: 2 } }, label),
        sub ? React.createElement("div", { key: "s", style: { fontSize: 12, color: T.faint, marginTop: 1 } }, sub) : null,
      ]);

    return React.createElement("div", { style: { background: T.bg, minHeight: "100%", paddingBottom: 16 } }, [
      header("Thống kê cá nhân", onBack, "h"),
      // chọn tháng
      React.createElement("div", { key: "mo", style: { display: "flex", alignItems: "center", justifyContent: "center", gap: 16, margin: "0 18px 18px" } }, [
        React.createElement("button", { key: "p", style: navArrow() }, React.createElement(Icon, { name: "chevronLeft", size: 20, color: T.ink })),
        React.createElement("span", { key: "l", style: { fontSize: 16, fontWeight: 700, color: T.ink } }, s.monthLabel),
        React.createElement("button", { key: "n", style: navArrow() }, React.createElement(Icon, { name: "chevronRight", size: 20, color: T.ink })),
      ]),
      // thẻ tổng quan công
      React.createElement("div", {
        key: "credit", style: {
          margin: "0 18px 16px", borderRadius: 22, padding: "18px 20px", color: "#fff",
          background: `linear-gradient(150deg, ${T.green}, ${T.greenDeep})`, boxShadow: `0 14px 28px ${T.green}38`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        },
      }, [
        React.createElement("div", { key: "l" }, [
          React.createElement("div", { key: "1", style: { fontSize: 13.5, opacity: .9 } }, "Tổng công trong tháng"),
          React.createElement("div", { key: "2", style: { fontSize: 38, fontWeight: 800, letterSpacing: -1, lineHeight: 1.1, marginTop: 4 } }, s.totalCredit),
          React.createElement("div", { key: "3", style: { fontSize: 13, opacity: .9, marginTop: 2 } }, `${s.workDays} ngày công`),
        ]),
        React.createElement("div", { key: "r", style: { width: 64, height: 64, borderRadius: "50%", background: "rgba(255,255,255,.18)", display: "flex", alignItems: "center", justifyContent: "center" } }, React.createElement(Icon, { name: "checkCircle", size: 34, color: "#fff", sw: 2 })),
      ]),
      // lưới thống kê
      React.createElement("div", { key: "grid", style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "0 18px" } }, [
        bigCard("clock", T.st.late, s.lateMinutes, "phút", "Đi muộn", `${s.lateCount} lần`, "g1"),
        bigCard("logout", T.st.early, s.earlyMinutes, "phút", "Về sớm", `${s.earlyCount} lần`, "g2"),
        bigCard("moon", T.st.off, s.daysOff, "ngày", "Ngày nghỉ", "Không chấm vào", "g3"),
        bigCard("info", T.st.forgot, s.forgotCount, "lần", "Quên chấm ra", "Chỉ chấm 1 đầu", "g4"),
      ]),
      // giải thích ranh giới
      React.createElement("div", { key: "ex", style: { margin: "16px 18px 0", background: T.green50, borderRadius: 16, padding: "13px 15px", display: "flex", gap: 10 } }, [
        React.createElement("span", { key: "i", style: { color: T.green, display: "flex", marginTop: 1 } }, React.createElement(Icon, { name: "info", size: 18 })),
        React.createElement("div", { key: "t", style: { fontSize: 12.5, color: T.greenDeep, lineHeight: 1.55 } }, "Có chấm vào nhưng thiếu chấm ra → tính “quên chấm ra”. Không chấm vào → tính “ngày nghỉ”."),
      ]),
    ]);
    function navArrow() { return { width: 38, height: 38, borderRadius: 11, border: "none", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(20,40,30,.05)" }; }
  }

  // ======================================================================
  // TÀI KHOẢN / MENU
  // ======================================================================
  function AccountScreen({ onOpenCompany, onLogout, company }) {
    const D = window.CC;
    const item = (icon, color, title, value, key, onClick) =>
      React.createElement("button", {
        key, onClick, style: { width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 14, background: "#fff", border: "none", borderRadius: 18, padding: "15px 16px", cursor: "pointer", boxShadow: "0 4px 14px rgba(20,40,30,.04)" },
      }, [
        React.createElement("div", { key: "i", style: { width: 40, height: 40, borderRadius: 12, background: color + "1A", color, display: "flex", alignItems: "center", justifyContent: "center" } }, React.createElement(Icon, { name: icon, size: 20 })),
        React.createElement("span", { key: "t", style: { flex: 1, fontSize: 15, fontWeight: 600, color: T.ink } }, title),
        value ? React.createElement("span", { key: "v", style: { fontSize: 13.5, color: T.sub, fontWeight: 600 } }, value) : null,
        React.createElement("span", { key: "c", style: { color: T.faint, display: "flex" } }, React.createElement(Icon, { name: "chevronRight", size: 18 })),
      ]);

    return React.createElement("div", { style: { background: T.bg, minHeight: "100%", padding: "10px 18px 24px" } }, [
      // thẻ hồ sơ (giống style header app gốc)
      React.createElement("div", {
        key: "prof", style: {
          borderRadius: 24, padding: "20px 22px", color: "#fff", marginBottom: 18, position: "relative", overflow: "hidden",
          background: `linear-gradient(150deg, ${T.green}, ${T.greenDeep})`, boxShadow: `0 16px 30px ${T.green}38`,
        },
      }, [
        React.createElement("div", { key: "g", style: { position: "absolute", right: -30, top: -40, width: 130, height: 130, borderRadius: "50%", background: "rgba(255,255,255,.10)" } }),
        React.createElement("div", { key: "top", style: { display: "flex", alignItems: "center", gap: 14, position: "relative" } }, [
          React.createElement("div", { key: "av", style: { width: 58, height: 58, borderRadius: "50%", background: "rgba(255,255,255,.22)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 21, fontWeight: 800 } }, "MH"),
          React.createElement("div", { key: "n", style: { flex: 1 } }, [
            React.createElement("div", { key: "1", style: { fontSize: 19, fontWeight: 800 } }, D.user.name),
            React.createElement("div", { key: "2", style: { fontSize: 13.5, opacity: .9 } }, `${D.user.title} · ${D.user.code}`),
          ]),
          React.createElement("button", { key: "g", style: { width: 40, height: 40, borderRadius: "50%", border: "none", background: "rgba(255,255,255,.2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" } }, React.createElement(Icon, { name: "gear", size: 20 })),
        ]),
        React.createElement("div", { key: "hr", style: { height: 1, background: "rgba(255,255,255,.25)", margin: "16px 0 14px", position: "relative" } }),
        infoLine("building", "Công ty", company.name, "i1"),
        infoLine("org", "Phòng ban", company.dept, "i2"),
        infoLine("user", "Vai trò", company.role, "i3", true),
      ]),

      React.createElement("div", { key: "list", style: { display: "flex", flexDirection: "column", gap: 11 } }, [
        item("swap", T.green, "Chuyển đổi công ty", company.short, "a1", onOpenCompany),
        item("user", T.early, "Thông tin cá nhân", null, "a2"),
        item("clock", T.st.late, "Quy định ca làm", D.shift.name, "a3"),
        item("device", T.st.pending, "Thiết bị đăng nhập", "1 thiết bị", "a4"),
        item("bell", T.st.forgot, "Thông báo", null, "a5"),
        item("sun", T.faint, "Giao diện", "Sáng", "a6"),
      ]),

      React.createElement("button", {
        key: "logout", onClick: onLogout, style: {
          width: "100%", marginTop: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
          background: "#fff", border: `1.5px solid ${T.st.reject}33`, color: T.st.reject, borderRadius: 16, padding: "14px", fontSize: 15, fontWeight: 700, cursor: "pointer",
        },
      }, [React.createElement(Icon, { key: "i", name: "logout", size: 19 }), "Đăng xuất"]),
      React.createElement("div", { key: "ver", style: { textAlign: "center", fontSize: 12, color: T.faint, marginTop: 18 } }, "Chấm Công · v1.0.0"),
    ]);

    function infoLine(icon, label, value, key, last) {
      return React.createElement("div", { key, style: { display: "flex", alignItems: "center", gap: 10, padding: "6px 0", position: "relative" } }, [
        React.createElement(Icon, { key: "i", name: icon, size: 17, color: "rgba(255,255,255,.85)" }),
        React.createElement("span", { key: "l", style: { fontSize: 13.5, opacity: .9 } }, label),
        React.createElement("span", { key: "v", style: { marginLeft: "auto", fontSize: 14.5, fontWeight: 700 } }, value),
      ]);
    }
  }

  // ======================================================================
  // BOTTOM SHEET — ĐỔI CÔNG TY
  // ======================================================================
  function CompanySheet({ open, onClose, current, onSelect }) {
    const [q, setQ] = useState("");
    if (!open) return null;
    const list = window.CC.companies.filter(c => c.name.toLowerCase().includes(q.toLowerCase()));
    return React.createElement("div", {
      style: { position: "absolute", inset: 0, zIndex: 50, display: "flex", flexDirection: "column", justifyContent: "flex-end" },
    }, [
      React.createElement("div", { key: "scrim", onClick: onClose, style: { position: "absolute", inset: 0, background: "rgba(15,30,22,.4)", animation: "ccFade .2s ease" } }),
      React.createElement("div", {
        key: "sheet", style: {
          position: "relative", background: "#fff", borderRadius: "26px 26px 0 0", padding: "10px 0 22px",
          maxHeight: "78%", display: "flex", flexDirection: "column", animation: "ccSlideUp .26s cubic-bezier(.2,.8,.2,1)",
        },
      }, [
        React.createElement("div", { key: "grab", style: { width: 44, height: 5, borderRadius: 3, background: T.line, margin: "6px auto 12px" } }),
        React.createElement("h3", { key: "t", style: { textAlign: "center", fontSize: 18, fontWeight: 700, color: T.ink, margin: "0 0 14px" } }, "Chọn công ty"),
        React.createElement("div", { key: "hr", style: { height: 1, background: T.line } }),
        // tìm kiếm
        React.createElement("div", { key: "search", style: { padding: "14px 20px 6px" } },
          React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, background: T.bg, borderRadius: 999, padding: "0 16px", height: 48 } }, [
            React.createElement(Icon, { key: "i", name: "search", size: 19, color: T.faint }),
            React.createElement("input", { key: "in", value: q, onChange: (e) => setQ(e.target.value), placeholder: "Tìm kiếm công ty...", style: { border: "none", outline: "none", background: "transparent", flex: 1, fontSize: 15, color: T.ink, fontFamily: "inherit" } }),
          ])),
        React.createElement("div", { key: "list", style: { overflow: "auto", padding: "6px 12px 0" } },
          list.map((c) => {
            const active = c.id === current.id;
            return React.createElement("button", {
              key: c.id, onClick: () => { onSelect(c); onClose(); },
              style: { width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 13, padding: "13px 12px", border: "none", background: active ? T.green50 : "transparent", borderRadius: 16, cursor: "pointer" },
            }, [
              React.createElement("div", { key: "d", style: { width: 42, height: 42, borderRadius: 13, background: active ? T.green : T.green100, color: active ? "#fff" : T.greenDeep, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 15 } }, c.short),
              React.createElement("div", { key: "n", style: { flex: 1, minWidth: 0 } }, [
                React.createElement("div", { key: "1", style: { fontSize: 15, fontWeight: 700, color: T.ink } }, c.name),
                React.createElement("div", { key: "2", style: { fontSize: 12.5, color: T.sub } }, `${c.dept} · ${c.role}`),
              ]),
              active ? React.createElement("span", { key: "c", style: { color: T.green, display: "flex" } }, React.createElement(Icon, { name: "checkCircle", size: 22 })) : null,
            ]);
          })),
      ]),
    ]);
  }

  Object.assign(window, { CC_HistoryScreen: HistoryScreen, CC_StatsScreen: StatsScreen, CC_AccountScreen: AccountScreen, CC_CompanySheet: CompanySheet });
})();
