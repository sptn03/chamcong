/* Bộ icon line (stroke) cho app — phong cách bo tròn, khớp ảnh tham chiếu */
(function () {
  const S = ({ children, size = 24, sw = 2, color = "currentColor", fill = "none", ...p }) =>
    React.createElement(
      "svg",
      { width: size, height: size, viewBox: "0 0 24 24", fill, stroke: color, strokeWidth: sw, strokeLinecap: "round", strokeLinejoin: "round", ...p },
      children
    );
  let _k = 0;
  const P = (d, extra) => React.createElement("path", { key: "k" + _k++, d, ...(extra || {}) });
  const C = (cx, cy, r, extra) => React.createElement("circle", { key: "k" + _k++, cx, cy, r, ...(extra || {}) });
  const L = (x1, y1, x2, y2) => React.createElement("line", { key: "k" + _k++, x1, y1, x2, y2 });
  const R = (x, y, w, h, rx) => React.createElement("rect", { key: "k" + _k++, x, y, width: w, height: h, rx });

  const Icons = {
    home: (p) => S({ ...p, children: [P("M3 11.5 12 4l9 7.5", { key: 1 }), P("M5 10v10h14V10", { key: 2 }), P("M9.5 20v-5h5v5", { key: 3 })] }),
    bell: (p) => S({ ...p, children: [P("M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9", { key: 1 }), P("M13.7 21a2 2 0 0 1-3.4 0", { key: 2 })] }),
    news: (p) => S({ ...p, children: [R(3, 4, 18, 16, 2), L(7, 9, 17, 9), L(7, 13, 17, 13), L(7, 17, 13, 17)] }),
    people: (p) => S({ ...p, children: [P("M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1", { key: 1 }), C(9, 8, 3, { key: 2 }), P("M22 19v-1a4 4 0 0 0-3-3.87", { key: 3 }), P("M16 5.13A4 4 0 0 1 16 13", { key: 4 })] }),
    menu: (p) => S({ ...p, children: [L(3, 6, 21, 6), L(3, 12, 21, 12), L(3, 18, 21, 18)] }),
    search: (p) => S({ ...p, children: [C(11, 11, 7, { key: 1 }), L(21, 21, 16.5, 16.5)] }),
    gear: (p) => S({ ...p, children: [C(12, 12, 3, { key: 1 }), P("M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z", { key: 2 })] }),
    clock: (p) => S({ ...p, children: [C(12, 12, 9, { key: 1 }), P("M12 7v5l3 2", { key: 2 })] }),
    calendar: (p) => S({ ...p, children: [R(3, 4.5, 18, 16, 3), L(3, 9, 21, 9), L(8, 2.5, 8, 6), L(16, 2.5, 16, 6)] }),
    chart: (p) => S({ ...p, children: [L(4, 20, 20, 20), R(6, 11, 3, 7, 1), R(11, 7, 3, 11, 1), R(16, 13, 3, 5, 1)] }),
    pin: (p) => S({ ...p, children: [P("M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z", { key: 1 }), C(12, 10, 3, { key: 2 }) ] }),
    wifi: (p) => S({ ...p, children: [P("M2 8.5a16 16 0 0 1 20 0", { key: 1 }), P("M5 12a11 11 0 0 1 14 0", { key: 2 }), P("M8.5 15.5a6 6 0 0 1 7 0", { key: 3 }), C(12, 19, 0.6, { key: 4, fill: "currentColor" })] }),
    camera: (p) => S({ ...p, children: [P("M3 8a2 2 0 0 1 2-2h2l1.5-2h7L19 6h0a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z", { key: 1 }), C(12, 13, 3.5, { key: 2 })] }),
    check: (p) => S({ ...p, children: [P("M20 6 9 17l-5-5", { key: 1 })] }),
    checkCircle: (p) => S({ ...p, children: [C(12, 12, 9, { key: 1 }), P("m8.5 12 2.5 2.5 4.5-5", { key: 2 })] }),
    x: (p) => S({ ...p, children: [L(18, 6, 6, 18), L(6, 6, 18, 18)] }),
    xCircle: (p) => S({ ...p, children: [C(12, 12, 9, { key: 1 }), L(15, 9, 9, 15), L(9, 9, 15, 15)] }),
    chevronRight: (p) => S({ ...p, children: [P("m9 6 6 6-6 6", { key: 1 })] }),
    chevronLeft: (p) => S({ ...p, children: [P("m15 6-6 6 6 6", { key: 1 })] }),
    chevronDown: (p) => S({ ...p, children: [P("m6 9 6 6 6-6", { key: 1 })] }),
    arrowRight: (p) => S({ ...p, children: [L(5, 12, 19, 12), P("m13 6 6 6-6 6", { key: 1 })] }),
    arrowLeft: (p) => S({ ...p, children: [L(19, 12, 5, 12), P("m11 6-6 6 6 6", { key: 1 })] }),
    plus: (p) => S({ ...p, children: [L(12, 5, 12, 19), L(5, 12, 19, 12)] }),
    login: (p) => S({ ...p, children: [P("M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3", { key: 1 }), P("m14 8 4 4-4 4", { key: 2 }), L(18, 12, 9, 12)] }),
    logout: (p) => S({ ...p, children: [P("M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3", { key: 1 }), P("m16 8 4 4-4 4", { key: 2 }), L(20, 12, 10, 12)] }),
    swap: (p) => S({ ...p, children: [P("M7 4 4 7l3 3", { key: 1 }), P("M4 7h11a5 5 0 0 1 5 5", { key: 2 }), P("m17 20 3-3-3-3", { key: 3 }), P("M20 17H9a5 5 0 0 1-5-5", { key: 4 })] }),
    phone: (p) => S({ ...p, children: [P("M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z", { key: 1 })] }),
    lock: (p) => S({ ...p, children: [R(4, 11, 16, 9, 2.5), P("M8 11V8a4 4 0 0 1 8 0v3", { key: 1 }), C(12, 15.5, 1, { key: 2, fill: "currentColor" })] }),
    eye: (p) => S({ ...p, children: [P("M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z", { key: 1 }), C(12, 12, 3, { key: 2 })] }),
    building: (p) => S({ ...p, children: [R(4, 3, 16, 18, 2), L(9, 8, 9, 8.01), L(15, 8, 15, 8.01), L(9, 12, 9, 12.01), L(15, 12, 15, 12.01), P("M10 21v-3a2 2 0 0 1 4 0v3", { key: 1 })] }),
    user: (p) => S({ ...p, children: [C(12, 8, 4, { key: 1 }), P("M5 21a7 7 0 0 1 14 0", { key: 2 })] }),
    doc: (p) => S({ ...p, children: [P("M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z", { key: 1 }), P("M14 3v5h5", { key: 2 }), L(9, 13, 15, 13), L(9, 17, 13, 17)] }),
    excel: (p) => S({ ...p, children: [P("M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z", { key: 1 }), P("M14 3v5h5", { key: 2 }), P("m9.5 12.5 4 5m0-5-4 5", { key: 3 })] }),
    filter: (p) => S({ ...p, children: [P("M3 5h18l-7 8v6l-4-2v-4Z", { key: 1 })] }),
    sort: (p) => S({ ...p, children: [P("M8 4v16m0 0-3-3m3 3 3-3", { key: 1 }), P("M16 20V4m0 0-3 3m3-3 3 3", { key: 2 })] }),
    edit: (p) => S({ ...p, children: [P("M11 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-6", { key: 1 }), P("M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4Z", { key: 2 })] }),
    trash: (p) => S({ ...p, children: [P("M4 7h16", { key: 1 }), P("M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2", { key: 2 }), P("M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13", { key: 3 }), L(10, 11, 10, 17), L(14, 11, 14, 17)] }),
    org: (p) => S({ ...p, children: [R(9, 3, 6, 5, 1.5), R(3, 16, 6, 5, 1.5), R(15, 16, 6, 5, 1.5), P("M12 8v4M6 16v-2h12v2", { key: 1 })] }),
    grid: (p) => S({ ...p, children: [R(3, 3, 7, 7, 2), R(14, 3, 7, 7, 2), R(3, 14, 7, 7, 2), R(14, 14, 7, 7, 2)] }),
    device: (p) => S({ ...p, children: [R(6, 2, 12, 20, 3), L(11, 18, 13, 18)] }),
    google: (p) => React.createElement("svg", { width: p && p.size || 24, height: p && p.size || 24, viewBox: "0 0 24 24" }, [
      React.createElement("path", { key: 1, fill: "#4285F4", d: "M21.6 12.2c0-.6-.1-1.3-.2-1.9H12v3.6h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.2Z" }),
      React.createElement("path", { key: 2, fill: "#34A853", d: "M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22Z" }),
      React.createElement("path", { key: 3, fill: "#FBBC05", d: "M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1a10 10 0 0 0 0 9z" }),
      React.createElement("path", { key: 4, fill: "#EA4335", d: "M12 5.9c1.5 0 2.8.5 3.8 1.5l2.8-2.8A10 10 0 0 0 3.1 7.4L6.4 10c.8-2.3 3-4.1 5.6-4.1Z" }),
    ]),
    apple: (p) => React.createElement("svg", { width: p && p.size || 24, height: p && p.size || 24, viewBox: "0 0 24 24", fill: (p && p.color) || "#000" }, [
      React.createElement("path", { key: 1, d: "M16.4 12.7c0-2.2 1.8-3.3 1.9-3.3-1-1.5-2.6-1.7-3.2-1.7-1.4-.1-2.6.8-3.3.8s-1.7-.8-2.9-.8c-1.5 0-2.9.9-3.6 2.2-1.6 2.7-.4 6.7 1.1 8.9.7 1.1 1.6 2.3 2.8 2.2 1.1 0 1.5-.7 2.9-.7s1.7.7 2.9.7c1.2 0 2-1.1 2.7-2.1.8-1.2 1.2-2.4 1.2-2.4s-2.3-.9-2.4-3.5Z" }),
      React.createElement("path", { key: 2, d: "M14.3 6.3c.6-.7 1-1.7.9-2.7-.9 0-2 .6-2.6 1.3-.6.6-1.1 1.6-1 2.6 1 .1 2-.5 2.7-1.2Z" }),
    ]),
    refresh: (p) => S({ ...p, children: [P("M21 12a9 9 0 1 1-3-6.7L21 8", { key: 1 }), P("M21 3v5h-5", { key: 2 })] }),
    info: (p) => S({ ...p, children: [C(12, 12, 9, { key: 1 }), L(12, 11, 12, 16), L(12, 8, 12, 8.01)] }),
    sun: (p) => S({ ...p, children: [C(12, 12, 4, { key: 1 }), P("M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19", { key: 2 })] }),
    moon: (p) => S({ ...p, children: [P("M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z", { key: 1 })] }),
    play: (p) => S({ ...p, children: [C(12, 12, 9, { key: 1 }), P("M10 8.5v7l5-3.5Z", { key: 2, fill: "currentColor" })] }),
  };

  window.Icon = function Icon({ name, ...rest }) {
    const fn = Icons[name];
    if (!fn) return null;
    return fn(rest);
  };
})();
