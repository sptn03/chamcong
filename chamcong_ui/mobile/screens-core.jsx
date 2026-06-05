/* Màn hình cốt lõi: Đăng nhập, Trang chủ chấm công, Chấm công offline */
(function () {
  const { useState, useEffect, useRef } = React;
  const T = window.CCT;
  const Icon = window.Icon;

  // ---------- helpers dùng chung ----------
  function useNow() {
    const [now, setNow] = useState(new Date());
    useEffect(() => {
      const id = setInterval(() => setNow(new Date()), 1000);
      return () => clearInterval(id);
    }, []);
    return now;
  }
  const pad = (n) => String(n).padStart(2, "0");
  const fmtTime = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const fmtSec = (d) => pad(d.getSeconds());
  const VN_DAY = ["Chủ nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
  const fmtDate = (d) => `${VN_DAY[d.getDay()]}, ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;

  // chip xác thực (GPS / Wifi)
  function VerifyChip({ icon, label, ok }) {
    return React.createElement("div", {
      style: {
        display: "flex", alignItems: "center", gap: 6,
        background: ok ? "rgba(255,255,255,.22)" : "rgba(255,255,255,.12)",
        borderRadius: 999, padding: "6px 12px 6px 9px", color: "#fff",
      },
    }, [
      React.createElement(Icon, { key: "i", name: icon, size: 15, sw: 2.4 }),
      React.createElement("span", { key: "l", style: { fontSize: 13, fontWeight: 600 } }, label),
      React.createElement(Icon, { key: "c", name: ok ? "check" : "x", size: 14, sw: 3 }),
    ]);
  }

  function SectionTitle({ children, action }) {
    return React.createElement("div", {
      style: { display: "flex", alignItems: "center", justifyContent: "space-between", margin: "2px 2px 10px" },
    }, [
      React.createElement("h3", { key: "t", style: { fontSize: 16, fontWeight: 700, color: T.ink, margin: 0 } }, children),
      action || null,
    ]);
  }

  // placeholder ảnh có sọc
  function StripePlaceholder({ label, h = 150 }) {
    return React.createElement("div", {
      style: {
        height: h, borderRadius: 16, border: `1.5px dashed ${T.faint}`,
        backgroundImage: "repeating-linear-gradient(45deg, #F4F7F5 0 10px, #EAEFEC 10px 20px)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: 8, color: T.sub,
      },
    }, [
      React.createElement(Icon, { key: "i", name: "camera", size: 26, color: T.faint }),
      React.createElement("span", { key: "l", style: { fontFamily: "ui-monospace, monospace", fontSize: 12.5 } }, label),
    ]);
  }

  // ======================================================================
  // ĐĂNG NHẬP
  // ======================================================================
  function LoginScreen({ onLogin }) {
    const [show, setShow] = useState(false);
    const inputWrap = {
      display: "flex", alignItems: "center", gap: 10, background: "#fff",
      border: `1.5px solid ${T.line}`, borderRadius: 14, padding: "0 14px", height: 54,
    };
    const inputEl = { border: "none", outline: "none", flex: 1, fontSize: 15.5, color: T.ink, background: "transparent", fontFamily: "inherit" };
    const oauthBtn = {
      flex: 1, height: 52, borderRadius: 14, border: `1.5px solid ${T.line}`, background: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontSize: 15, fontWeight: 600, color: T.ink, cursor: "pointer",
    };
    return React.createElement("div", {
      style: { minHeight: "100%", background: T.bg, padding: "10px 22px 30px", display: "flex", flexDirection: "column" },
    }, [
      // logo
      React.createElement("div", { key: "logo", style: { textAlign: "center", marginTop: 40, marginBottom: 30 } }, [
        React.createElement("div", {
          key: "m", style: {
            width: 74, height: 74, borderRadius: 22, margin: "0 auto 18px",
            background: `linear-gradient(150deg, ${T.green}, ${T.greenDeep})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 14px 30px ${T.green}40`,
          },
        }, React.createElement(Icon, { name: "clock", size: 38, color: "#fff", sw: 2.2 })),
        React.createElement("h1", { key: "t", style: { fontSize: 26, fontWeight: 800, color: T.ink, margin: "0 0 6px" } }, "Chấm Công"),
        React.createElement("p", { key: "s", style: { fontSize: 14.5, color: T.sub, margin: 0 } }, "Đăng nhập để bắt đầu ngày làm việc"),
      ]),
      // form
      React.createElement("div", { key: "form", style: { display: "flex", flexDirection: "column", gap: 14 } }, [
        React.createElement("div", { key: "ph", style: inputWrap }, [
          React.createElement(Icon, { key: "i", name: "phone", size: 19, color: T.faint }),
          React.createElement("input", { key: "in", style: inputEl, placeholder: "Số điện thoại", defaultValue: "0987 654 321" }),
        ]),
        React.createElement("div", { key: "pw", style: inputWrap }, [
          React.createElement(Icon, { key: "i", name: "lock", size: 19, color: T.faint }),
          React.createElement("input", { key: "in", style: inputEl, type: show ? "text" : "password", placeholder: "Mật khẩu", defaultValue: "123456" }),
          React.createElement("button", {
            key: "e", onClick: () => setShow(!show),
            style: { border: "none", background: "transparent", cursor: "pointer", color: show ? T.green : T.faint, display: "flex", padding: 4 },
          }, React.createElement(Icon, { name: "eye", size: 19 })),
        ]),
        React.createElement("button", {
          key: "go", onClick: onLogin,
          style: {
            height: 54, borderRadius: 14, border: "none", marginTop: 4,
            background: `linear-gradient(135deg, ${T.green}, ${T.greenDark})`, color: "#fff",
            fontSize: 16.5, fontWeight: 700, cursor: "pointer", boxShadow: `0 12px 24px ${T.green}40`,
          },
        }, "Đăng nhập"),
      ]),
      // divider
      React.createElement("div", { key: "div", style: { display: "flex", alignItems: "center", gap: 12, margin: "22px 0" } }, [
        React.createElement("div", { key: "l", style: { flex: 1, height: 1, background: T.line } }),
        React.createElement("span", { key: "t", style: { fontSize: 13, color: T.faint } }, "hoặc"),
        React.createElement("div", { key: "r", style: { flex: 1, height: 1, background: T.line } }),
      ]),
      React.createElement("div", { key: "oauth", style: { display: "flex", gap: 12 } }, [
        React.createElement("button", { key: "g", style: oauthBtn, onClick: onLogin }, [
          React.createElement(Icon, { key: "i", name: "google", size: 20 }), "Google",
        ]),
        React.createElement("button", { key: "a", style: oauthBtn, onClick: onLogin }, [
          React.createElement(Icon, { key: "i", name: "apple", size: 20 }), "Apple",
        ]),
      ]),
      React.createElement("div", { key: "spacer", style: { flex: 1, minHeight: 24 } }),
      React.createElement("div", {
        key: "note", style: {
          display: "flex", gap: 9, alignItems: "flex-start", background: T.green50,
          borderRadius: 14, padding: "13px 15px", color: T.greenDeep,
        },
      }, [
        React.createElement(Icon, { key: "i", name: "info", size: 18, color: T.green }),
        React.createElement("span", { key: "t", style: { fontSize: 13, lineHeight: 1.5 } },
          "Tài khoản do Admin cấp. Lần đăng nhập đầu trên thiết bị mới cần Admin xác nhận."),
      ]),
    ]);
  }

  // ======================================================================
  // TRANG CHỦ — CHẤM CÔNG VÀO / RA CA
  // ======================================================================
  function HomeScreen({ onOpenCompany, onOffline, onTab, company }) {
    const now = useNow();
    const D = window.CC;
    // phase: idle -> in -> out (đã hoàn tất)
    const [phase, setPhase] = useState("idle");
    const [inTime, setInTime] = useState(null);
    const [outTime, setOutTime] = useState(null);
    const [pulse, setPulse] = useState(false);

    const doPunch = () => {
      setPulse(true);
      setTimeout(() => setPulse(false), 600);
      if (phase === "idle") { setInTime(fmtTime(new Date())); setPhase("in"); }
      else if (phase === "in") { setOutTime(fmtTime(new Date())); setPhase("out"); }
    };

    const btnLabel = phase === "idle" ? "Chấm vào ca" : phase === "in" ? "Chấm ra ca" : "Đã hoàn tất";
    const heroSub = phase === "idle" ? "Chạm để điểm danh vào ca" :
      phase === "in" ? "Đang trong ca làm việc" : "Cảm ơn, hẹn gặp lại ngày mai!";

    return React.createElement("div", { style: { background: T.bg, minHeight: "100%", paddingBottom: 16 } }, [
      // ---- thanh trên: avatar + lời chào + tìm kiếm ----
      React.createElement("div", { key: "top", style: { display: "flex", alignItems: "center", gap: 12, padding: "12px 18px 8px" } }, [
        React.createElement("div", {
          key: "av", style: {
            width: 52, height: 52, borderRadius: 16, flexShrink: 0,
            background: `linear-gradient(145deg, ${T.green}, ${T.greenDeep})`, color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 19,
          },
        }, "MH"),
        React.createElement("div", {
          key: "hi", style: { flex: 1, background: "#fff", borderRadius: 16, padding: "8px 16px", boxShadow: "0 4px 14px rgba(20,40,30,.05)" },
        }, [
          React.createElement("div", { key: "1", style: { fontSize: 12.5, color: T.sub } }, "Xin chào 👋"),
          React.createElement("div", { key: "2", style: { fontSize: 16, fontWeight: 700, color: T.ink } }, D.user.name),
        ]),
        React.createElement("button", {
          key: "s", style: {
            width: 50, height: 50, borderRadius: "50%", border: "none", background: "#fff", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(20,40,30,.05)",
          },
        }, React.createElement(Icon, { name: "search", size: 22, color: T.ink })),
      ]),

      // ---- chip công ty (đổi công ty) ----
      React.createElement("button", {
        key: "co", onClick: onOpenCompany, style: {
          display: "flex", alignItems: "center", gap: 9, margin: "6px 18px 4px",
          background: "#fff", border: `1.5px solid ${T.line}`, borderRadius: 999, padding: "7px 8px 7px 13px", cursor: "pointer",
        },
      }, [
        React.createElement("div", { key: "d", style: { width: 22, height: 22, borderRadius: 7, background: T.green100, color: T.greenDeep, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800 } }, company.short),
        React.createElement("span", { key: "n", style: { fontSize: 13.5, fontWeight: 600, color: T.ink } }, company.name),
        React.createElement("span", { key: "sw", style: { display: "flex", color: T.green } }, React.createElement(Icon, { name: "swap", size: 16 })),
      ]),

      // ---- thẻ HERO chấm công ----
      React.createElement("div", {
        key: "hero", style: {
          margin: "12px 18px 0", borderRadius: 28, padding: "22px 22px 26px",
          background: `linear-gradient(155deg, ${T.green} 0%, ${T.greenDark} 55%, ${T.greenDeep} 100%)`,
          boxShadow: `0 18px 36px ${T.green}40`, position: "relative", overflow: "hidden",
        },
      }, [
        // họa tiết
        React.createElement("div", { key: "g1", style: { position: "absolute", right: -40, top: -50, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,.10)" } }),
        React.createElement("div", { key: "g2", style: { position: "absolute", right: 30, bottom: -60, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,.07)" } }),
        // ngày + đồng hồ
        React.createElement("div", { key: "date", style: { color: "rgba(255,255,255,.9)", fontSize: 13.5, fontWeight: 600, position: "relative" } }, fmtDate(now)),
        React.createElement("div", { key: "clock", style: { display: "flex", alignItems: "baseline", gap: 4, color: "#fff", marginTop: 2, position: "relative" } }, [
          React.createElement("span", { key: "t", style: { fontSize: 46, fontWeight: 800, letterSpacing: -1, lineHeight: 1 } }, fmtTime(now)),
          React.createElement("span", { key: "s", style: { fontSize: 18, fontWeight: 700, opacity: .8 } }, fmtSec(now)),
        ]),
        // ca làm
        React.createElement("div", { key: "shift", style: { display: "flex", alignItems: "center", gap: 8, marginTop: 12, position: "relative" } }, [
          React.createElement(Icon, { key: "i", name: "clock", size: 15, color: "rgba(255,255,255,.9)" }),
          React.createElement("span", { key: "n", style: { color: "#fff", fontSize: 14, fontWeight: 700 } }, D.shift.name),
          React.createElement("span", { key: "h", style: { color: "rgba(255,255,255,.85)", fontSize: 13.5 } }, `${D.shift.start} – ${D.shift.end}`),
        ]),
        React.createElement("div", { key: "loc", style: { display: "flex", alignItems: "center", gap: 7, marginTop: 6, position: "relative" } }, [
          React.createElement(Icon, { key: "i", name: "pin", size: 14, color: "rgba(255,255,255,.8)" }),
          React.createElement("span", { key: "n", style: { color: "rgba(255,255,255,.82)", fontSize: 12.5 } }, D.shift.location),
        ]),

        // nút tròn chấm
        React.createElement("div", { key: "btnwrap", style: { display: "flex", justifyContent: "center", margin: "20px 0 8px", position: "relative" } },
          React.createElement("button", {
            onClick: phase === "out" ? undefined : doPunch,
            style: {
              width: 168, height: 168, borderRadius: "50%", border: "6px solid rgba(255,255,255,.28)",
              background: phase === "out" ? "rgba(255,255,255,.18)" : "#fff", cursor: phase === "out" ? "default" : "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
              transform: pulse ? "scale(.94)" : "scale(1)", transition: "transform .25s",
              boxShadow: "0 10px 26px rgba(0,0,0,.18)",
            },
          }, [
            React.createElement(Icon, { key: "i", name: phase === "out" ? "checkCircle" : "login", size: 40, color: phase === "out" ? "#fff" : T.green, sw: 2 }),
            React.createElement("span", { key: "l", style: { fontSize: 15.5, fontWeight: 800, color: phase === "out" ? "#fff" : T.greenDeep } }, btnLabel),
          ])
        ),
        React.createElement("div", { key: "herosub", style: { textAlign: "center", color: "rgba(255,255,255,.92)", fontSize: 13.5, fontWeight: 600, marginBottom: 14, position: "relative" } }, heroSub),

        // chip xác thực
        React.createElement("div", { key: "verify", style: { display: "flex", justifyContent: "center", gap: 10, position: "relative" } }, [
          React.createElement(VerifyChip, { key: "g", icon: "pin", label: "GPS", ok: true }),
          React.createElement(VerifyChip, { key: "w", icon: "wifi", label: D.shift.wifi, ok: true }),
        ]),
      ]),

      // ---- dòng thời gian vào/ra hôm nay ----
      React.createElement("div", { key: "today", style: { display: "flex", gap: 12, margin: "16px 18px 0" } }, [
        timeCard("login", "Giờ vào ca", inTime || "--:--", inTime ? T.green : T.faint, inTime ? "Đúng giờ" : "Chưa chấm"),
        timeCard("logout", "Giờ ra ca", outTime || "--:--", outTime ? T.early : T.faint, outTime ? "Đúng giờ" : "Chưa chấm"),
      ]),

      // ---- hành động nhanh ----
      React.createElement("div", { key: "qa", style: { margin: "18px 18px 0" } }, [
        React.createElement(SectionTitle, { key: "t" }, "Lối tắt"),
        React.createElement("div", { key: "row", style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } }, [
          quickAction("camera", "Chấm offline", "Khi mất mạng", T.st.pending, onOffline, "qa1"),
          quickAction("calendar", "Lịch sử", "Tuần / tháng", T.early, () => onTab("history"), "qa2"),
          quickAction("chart", "Thống kê", "Muộn / sớm / nghỉ", T.green, () => onTab("stats"), "qa3"),
          quickAction("info", "Quy định ca", D.shift.window, T.st.late, () => onTab("account"), "qa4"),
        ]),
      ]),
    ]);

    function timeCard(icon, label, value, color, sub) {
      return React.createElement("div", {
        key: label, style: { flex: 1, background: "#fff", borderRadius: 18, padding: "14px 16px", boxShadow: "0 5px 16px rgba(20,40,30,.04)" },
      }, [
        React.createElement("div", { key: "h", style: { display: "flex", alignItems: "center", gap: 7, color: T.sub, fontSize: 12.5, fontWeight: 600 } }, [
          React.createElement("span", { key: "i", style: { display: "flex", color } }, React.createElement(Icon, { name: icon, size: 15 })),
          label,
        ]),
        React.createElement("div", { key: "v", style: { fontSize: 26, fontWeight: 800, color: T.ink, marginTop: 4 } }, value),
        React.createElement("div", { key: "s", style: { fontSize: 12, color: T.faint, marginTop: 1 } }, sub),
      ]);
    }
    function quickAction(icon, title, sub, color, onClick, key) {
      return React.createElement("button", {
        key, onClick, style: {
          textAlign: "left", display: "flex", alignItems: "center", gap: 12, background: "#fff", border: "none",
          borderRadius: 18, padding: "14px 14px", cursor: "pointer", boxShadow: "0 5px 16px rgba(20,40,30,.04)",
        },
      }, [
        React.createElement("div", { key: "i", style: { width: 42, height: 42, borderRadius: 13, flexShrink: 0, background: color + "1A", color, display: "flex", alignItems: "center", justifyContent: "center" } }, React.createElement(Icon, { name: icon, size: 21 })),
        React.createElement("div", { key: "t", style: { minWidth: 0 } }, [
          React.createElement("div", { key: "1", style: { fontSize: 14.5, fontWeight: 700, color: T.ink } }, title),
          React.createElement("div", { key: "2", style: { fontSize: 11.5, color: T.faint, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, sub),
        ]),
      ]);
    }
  }

  // ======================================================================
  // CHẤM CÔNG OFFLINE
  // ======================================================================
  function OfflineScreen({ onBack }) {
    const [captured, setCaptured] = useState(false);
    const [sent, setSent] = useState(false);
    const now = new Date();

    if (sent) {
      return React.createElement("div", { style: { background: T.bg, minHeight: "100%", padding: "0 0 24px" } }, [
        header("Chấm công offline", onBack, "h"),
        React.createElement("div", { key: "ok", style: { textAlign: "center", padding: "60px 30px" } }, [
          React.createElement("div", { key: "i", style: { width: 96, height: 96, borderRadius: "50%", background: T.green50, color: T.green, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 22px" } }, React.createElement(Icon, { name: "checkCircle", size: 52, sw: 1.8 })),
          React.createElement("h2", { key: "t", style: { fontSize: 22, fontWeight: 800, color: T.ink, margin: "0 0 10px" } }, "Đã gửi chờ duyệt"),
          React.createElement("p", { key: "p", style: { fontSize: 14.5, color: T.sub, lineHeight: 1.6, margin: "0 0 26px" } }, "Bản ghi kèm ảnh và toạ độ đã được lưu lên server. Admin sẽ duyệt để tính hợp lệ."),
          React.createElement("button", { key: "b", onClick: onBack, style: primaryBtn() }, "Về trang chủ"),
        ]),
      ]);
    }

    return React.createElement("div", { style: { background: T.bg, minHeight: "100%", padding: "0 0 24px" } }, [
      header("Chấm công offline", onBack, "h"),
      React.createElement("div", { key: "body", style: { padding: "4px 18px" } }, [
        // banner
        React.createElement("div", {
          key: "banner", style: { display: "flex", gap: 11, alignItems: "flex-start", background: "#FFF6E8", border: "1px solid #FCE3BA", borderRadius: 16, padding: "13px 15px", marginBottom: 18 },
        }, [
          React.createElement("span", { key: "i", style: { display: "flex", color: T.st.late, marginTop: 1 } }, React.createElement(Icon, { name: "info", size: 19 })),
          React.createElement("div", { key: "t" }, [
            React.createElement("div", { key: "1", style: { fontSize: 13.5, fontWeight: 700, color: "#8A5A12" } }, "Chế độ mất mạng"),
            React.createElement("div", { key: "2", style: { fontSize: 12.5, color: "#9A6A22", lineHeight: 1.5, marginTop: 2 } }, "Cần chụp ảnh tại chỗ + toạ độ GPS. Bản ghi sẽ ở trạng thái chờ Admin duyệt."),
          ]),
        ]),
        // camera
        React.createElement(SectionTitle, { key: "ct" }, "Ảnh xác minh"),
        captured
          ? React.createElement("div", {
              key: "cap", style: {
                height: 200, borderRadius: 16, position: "relative", overflow: "hidden",
                background: `linear-gradient(135deg, ${T.green}, ${T.greenDeep})`,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff",
              },
            }, [
              React.createElement(Icon, { key: "i", name: "user", size: 54, color: "rgba(255,255,255,.85)" }),
              React.createElement("span", { key: "l", style: { marginTop: 10, fontSize: 13, fontWeight: 600 } }, `Đã chụp lúc ${fmtTime(now)}`),
              React.createElement("button", { key: "re", onClick: () => setCaptured(false), style: { position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,.3)", border: "none", color: "#fff", borderRadius: 999, padding: "6px 12px", fontSize: 12.5, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 } }, [React.createElement(Icon, { key: "i", name: "refresh", size: 14 }), "Chụp lại"]),
            ])
          : React.createElement("button", { key: "shot", onClick: () => setCaptured(true), style: { width: "100%", border: "none", padding: 0, background: "transparent", cursor: "pointer" } },
              React.createElement(StripePlaceholder, { label: "Chạm để chụp ảnh", h: 200 })),

        // GPS
        React.createElement("div", { key: "gpst", style: { marginTop: 20 } }, React.createElement(SectionTitle, {}, "Toạ độ GPS")),
        React.createElement("div", { key: "gps", style: { background: "#fff", borderRadius: 16, padding: 16, boxShadow: "0 5px 16px rgba(20,40,30,.04)" } }, [
          React.createElement("div", { key: "map", style: { height: 96, borderRadius: 12, background: "repeating-linear-gradient(45deg,#EAF3EE 0 12px,#E2EEE7 12px 24px)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, position: "relative" } }, [
            React.createElement("span", { key: "p", style: { color: T.green } }, React.createElement(Icon, { name: "pin", size: 30 })),
          ]),
          row("Vĩ độ (lat)", "21.028511", "g1"),
          row("Kinh độ (lng)", "105.804817", "g2"),
          row("Độ chính xác", "± 8 m", "g3", true),
        ]),
        // ghi chú
        React.createElement("div", { key: "notet", style: { marginTop: 20 } }, React.createElement(SectionTitle, {}, "Ghi chú (tuỳ chọn)")),
        React.createElement("textarea", {
          key: "note", placeholder: "VD: Mạng yếu tại kho hàng...", rows: 2,
          style: { width: "100%", boxSizing: "border-box", border: `1.5px solid ${T.line}`, borderRadius: 14, padding: "12px 14px", fontSize: 14.5, fontFamily: "inherit", color: T.ink, outline: "none", resize: "none" },
        }),
        React.createElement("button", {
          key: "send", disabled: !captured, onClick: () => setSent(true),
          style: { ...primaryBtn(), width: "100%", marginTop: 18, opacity: captured ? 1 : .5, cursor: captured ? "pointer" : "not-allowed" },
        }, captured ? "Gửi chấm công chờ duyệt" : "Vui lòng chụp ảnh trước"),
      ]),
    ]);

    function row(label, value, key, last) {
      return React.createElement("div", {
        key, style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: last ? "none" : `1px solid ${T.line}` },
      }, [
        React.createElement("span", { key: "l", style: { fontSize: 13.5, color: T.sub } }, label),
        React.createElement("span", { key: "v", style: { fontSize: 14, fontWeight: 700, color: T.ink, fontFamily: "ui-monospace, monospace" } }, value),
      ]);
    }
  }

  // header chung cho màn phụ
  function header(title, onBack, key) {
    return React.createElement("div", {
      key, style: { display: "flex", alignItems: "center", gap: 10, padding: "8px 14px 14px" },
    }, [
      React.createElement("button", { key: "b", onClick: onBack, style: { width: 42, height: 42, borderRadius: 13, border: "none", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(20,40,30,.05)" } }, React.createElement(Icon, { name: "arrowLeft", size: 21, color: T.ink })),
      React.createElement("h2", { key: "t", style: { fontSize: 18.5, fontWeight: 700, color: T.ink, margin: 0 } }, title),
    ]);
  }
  function primaryBtn() {
    return { height: 52, padding: "0 26px", borderRadius: 14, border: "none", background: `linear-gradient(135deg, ${T.green}, ${T.greenDark})`, color: "#fff", fontSize: 15.5, fontWeight: 700, cursor: "pointer", boxShadow: `0 12px 24px ${T.green}40` };
  }

  Object.assign(window, { CC_LoginScreen: LoginScreen, CC_HomeScreen: HomeScreen, CC_OfflineScreen: OfflineScreen, CC_header: header, CC_SectionTitle: SectionTitle, CC_useNow: useNow, CC_primaryBtn: primaryBtn });
})();
