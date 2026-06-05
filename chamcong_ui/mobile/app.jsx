/* Root app mobile: khung điện thoại + điều hướng + bottom nav */
(function () {
  const { useState } = React;
  const T = window.CCT;
  const Icon = window.Icon;

  // ---- khung điện thoại nhẹ (status bar trắng giống ảnh) ----
  function PhoneShell({ children, dark }) {
    return React.createElement("div", {
      style: {
        width: 390, height: 820, borderRadius: 46, background: "#000", padding: 11,
        boxShadow: "0 40px 90px rgba(0,0,0,.32), 0 8px 24px rgba(0,0,0,.18)", flexShrink: 0,
      },
    },
      React.createElement("div", {
        style: { width: "100%", height: "100%", borderRadius: 36, overflow: "hidden", background: T.bg, position: "relative", display: "flex", flexDirection: "column" },
      }, [
        // status bar
        React.createElement("div", { key: "sb", style: { height: 44, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", flexShrink: 0, background: "transparent", position: "relative", zIndex: 5 } }, [
          React.createElement("span", { key: "t", style: { fontSize: 15, fontWeight: 700, color: T.ink } }, "9:41"),
          React.createElement("div", { key: "notch", style: { position: "absolute", left: "50%", top: 9, transform: "translateX(-50%)", width: 96, height: 26, borderRadius: 14, background: "#000" } }),
          React.createElement("div", { key: "icons", style: { display: "flex", alignItems: "center", gap: 6, color: T.ink } }, [
            React.createElement("svg", { key: "s", width: 17, height: 12, viewBox: "0 0 17 12" }, React.createElement("path", { d: "M1 9h2v3H1zM5 6h2v6H5zM9 3.5h2V12H9zM13 1h2v11h-2z", fill: "currentColor" })),
            React.createElement("svg", { key: "w", width: 16, height: 12, viewBox: "0 0 16 12" }, React.createElement("path", { d: "M8 2.2c2 0 3.9.8 5.3 2.1l1.2-1.3A9.5 9.5 0 0 0 8 .4 9.5 9.5 0 0 0 1.5 3l1.2 1.3A7.5 7.5 0 0 1 8 2.2Zm0 3.2c1.1 0 2.2.4 3 1.2l1.2-1.3A6 6 0 0 0 8 3.6 6 6 0 0 0 3.8 5.3L5 6.6c.8-.8 1.9-1.2 3-1.2Zm0 3.1c.5 0 1 .2 1.4.6L8 10.8 6.6 8.7c.4-.4.9-.6 1.4-.6Z", fill: "currentColor" })),
            React.createElement("svg", { key: "b", width: 26, height: 13, viewBox: "0 0 26 13" }, [
              React.createElement("rect", { key: 1, x: 1, y: 1.5, width: 21, height: 10, rx: 3, fill: "none", stroke: "currentColor", strokeOpacity: .4 }),
              React.createElement("rect", { key: 2, x: 3, y: 3.5, width: 16, height: 6, rx: 1.5, fill: "currentColor" }),
              React.createElement("rect", { key: 3, x: 23, y: 4.5, width: 2, height: 4, rx: 1, fill: "currentColor", fillOpacity: .4 }),
            ]),
          ]),
        ]),
        children,
      ])
    );
  }

  function BottomNav({ tab, onTab, onFab }) {
    const items = [
      { id: "home", icon: "home", label: "Chấm công" },
      { id: "history", icon: "calendar", label: "Lịch sử" },
      { id: "stats", icon: "chart", label: "Thống kê" },
      { id: "account", icon: "user", label: "Tài khoản" },
    ];
    return React.createElement("div", { style: { position: "relative", flexShrink: 0, padding: "0 14px 14px" } }, [
      // FAB
      React.createElement("button", {
        key: "fab", onClick: onFab, style: {
          position: "absolute", left: "50%", top: -26, transform: "translateX(-50%)", zIndex: 3,
          width: 60, height: 60, borderRadius: "50%", border: "4px solid " + T.bg,
          background: `linear-gradient(145deg, ${T.green}, ${T.greenDark})`, color: "#fff", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 12px 24px ${T.green}55`,
        },
      }, React.createElement(Icon, { name: "camera", size: 26, sw: 2.2 })),
      React.createElement("div", {
        key: "bar", style: {
          background: "#fff", borderRadius: 26, height: 66, display: "flex", alignItems: "center",
          boxShadow: "0 8px 28px rgba(20,40,30,.10)", paddingTop: 4,
        },
      }, items.map((it, i) => {
        const active = tab === it.id;
        const insertGap = i === 2; // chừa chỗ cho FAB ở giữa
        return React.createElement(React.Fragment, { key: it.id }, [
          insertGap ? React.createElement("div", { key: "gap", style: { width: 56 } }) : null,
          React.createElement("button", {
            key: "b", onClick: () => onTab(it.id), style: {
              flex: 1, height: "100%", border: "none", background: "transparent", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3,
              color: active ? T.green : T.faint,
            },
          }, [
            React.createElement(Icon, { key: "i", name: it.icon, size: 23, sw: active ? 2.4 : 2 }),
            React.createElement("span", { key: "l", style: { fontSize: 10.5, fontWeight: active ? 700 : 600 } }, it.label),
          ]),
        ]);
      })),
      React.createElement("div", { key: "hb", style: { width: 130, height: 5, borderRadius: 3, background: T.ink, opacity: .18, margin: "9px auto 0" } }),
    ]);
  }

  function App() {
    const [logged, setLogged] = useState(false);
    const [tab, setTab] = useState("home");
    const [overlay, setOverlay] = useState(null); // "offline" | null
    const [sheet, setSheet] = useState(false);
    const [company, setCompany] = useState(window.CC.companies[0]);

    if (!logged) {
      return React.createElement(PhoneShell, {}, React.createElement("div", { style: { flex: 1, overflow: "auto" } }, React.createElement(window.CC_LoginScreen, { onLogin: () => setLogged(true) })));
    }

    let screen;
    if (overlay === "offline") {
      screen = React.createElement(window.CC_OfflineScreen, { onBack: () => setOverlay(null) });
    } else if (tab === "home") {
      screen = React.createElement(window.CC_HomeScreen, { company, onOpenCompany: () => setSheet(true), onOffline: () => setOverlay("offline"), onTab: setTab });
    } else if (tab === "history") {
      screen = React.createElement(window.CC_HistoryScreen, { onBack: () => setTab("home") });
    } else if (tab === "stats") {
      screen = React.createElement(window.CC_StatsScreen, { onBack: () => setTab("home") });
    } else if (tab === "account") {
      screen = React.createElement(window.CC_AccountScreen, { company, onOpenCompany: () => setSheet(true), onLogout: () => { setLogged(false); setTab("home"); } });
    }

    return React.createElement(PhoneShell, {}, [
      React.createElement("div", { key: "content", style: { flex: 1, overflow: "auto" } }, screen),
      overlay === "offline" ? null : React.createElement(BottomNav, { key: "nav", tab, onTab: setTab, onFab: () => setOverlay("offline") }),
      React.createElement(window.CC_CompanySheet, { key: "sheet", open: sheet, onClose: () => setSheet(false), current: company, onSelect: setCompany }),
    ]);
  }

  window.CC_MobileApp = App;
})();
