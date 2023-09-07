var N = Object.defineProperty;
var Q = (e, t, n) => t in e ? N(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var A = (e, t, n) => (Q(e, typeof t != "symbol" ? t + "" : t, n), n);
function I(e, t) {
  return e.canvas.width = t.displayWidth_px, e.canvas.height = t.displayHeight_px, {
    ctx: e,
    dm: t
  };
}
function E(e) {
  const [t, n, r] = e;
  return `rgb(${t},${n},${r})`;
}
function Z(e, t) {
  const {
    borderColor: n,
    borderWidth_du: r,
    scale: o,
    displayHeight_du: i,
    displayWidth_du: a
  } = t;
  if (r < 1)
    return;
  const { strokeRect_du: c, ctx: l } = e(o);
  return l.strokeStyle = E(n), l.lineWidth = r * o, c(
    r / 2,
    r / 2,
    a - r,
    i - r
  ), { ctx: l, dm: t };
}
const v = {
  scale: 2,
  displayRows: 8,
  gridSpaceX_du: -3,
  // measured in DUs
  gridSpaceY_du: 5,
  // measured in DUs
  borderColor: [200, 0, 120],
  borderWidth_du: 0,
  borderGutter_du: 5
};
function L(e, t, n) {
  const {
    scale: r,
    displayRows: o,
    gridSpaceX_du: i,
    gridSpaceY_du: a,
    borderColor: c,
    borderWidth_du: l,
    borderGutter_du: f
  } = n, h = l * 2 + f * 2, p = t.clientWidth - h * r, Y = tt(
    p,
    r,
    e,
    i
  ), y = e + a, C = o - 1, d = Y - 1, b = h + o * e + C * a, x = b * r, T = e, P = e, X = Y * T + d * i + h, u = X * r, s = l + f, _ = l + f, g = X - (f + l) * 2, m = b - (f + l), S = g - s, w = m - _;
  return {
    displayWidth_px: u,
    displayHeight_px: x,
    displayWidth_du: X,
    displayHeight_du: b,
    displayUnitsPerRow_du: y,
    displayColumns: Y,
    displayRows: o,
    borderWidth_du: l,
    totalBorderWidth_du: h,
    borderGutter_du: f,
    remainingWidthXPx: p,
    scale: r,
    gridSpaceX_du: i,
    gridSpaceY_du: a,
    borderColor: c,
    drawAreaLeft_du: s,
    drawAreaTop_du: _,
    drawAreaRight_du: g,
    drawAreaBottom_du: m,
    drawAreaWidth_du: S,
    drawAreaHeight_du: w,
    cellWidth_du: T,
    cellHeight_du: P,
    getColumnXCoord_du(R) {
      return R * T + i * R + s;
    },
    getColumnFromXCoord_du(R) {
      let D = 0, G = 0;
      for (; G !== R - s; )
        G += T + i, D += 1;
      return D;
    },
    getRemainingRowSpace_du(R) {
      return X - R - s;
    },
    measureText(R) {
      return R.length * T + (R.length - 1) * i;
    },
    textFits(R, D) {
      return this.measureText(R) <= this.getRemainingRowSpace_du(D);
    }
  };
}
function tt(e, t, n, r) {
  let o = e, i = 0;
  const a = n * t + r * t;
  for (; o + r * t > a; )
    o -= a, i++;
  return i;
}
function M(e, t, n, r = null, o = 0) {
  const i = t(n, e, r, o);
  return e.children.length > 0 ? e.children.reduce((c, l) => M(l, t, c, e, o + 1), i) : i;
}
const et = ["highlight", "color", "outline"];
class z {
  constructor(t, n) {
    A(this, "__text");
    A(this, "__parent");
    A(this, "__children");
    this.__text = t, this.__parent = n, this.__children = [];
  }
  get text() {
    return this.__text;
  }
  get parent() {
    return this.__parent;
  }
  get children() {
    return this.__children;
  }
  toString() {
    return `${this.__text}`.trim();
  }
  get nextSibling() {
    if (this.parent) {
      const t = this.parent.children.findIndex((r) => r === this);
      return this.parent.children[t + 1];
    }
  }
  get ancestorAttributes() {
    return K(this, {});
  }
}
function K(e, t) {
  return e.parent ? K(
    e.parent,
    e instanceof j ? { ...e.attributes, ...t } : t
  ) : t;
}
class j {
  constructor(t, n, r) {
    A(this, "__tagName");
    A(this, "__attributes");
    A(this, "__parent");
    A(this, "__children");
    this.__tagName = t, this.__attributes = r, this.__parent = n, this.__children = [];
  }
  get tag() {
    return this.__tagName;
  }
  get attributes() {
    return this.__attributes;
  }
  get parent() {
    return this.__parent;
  }
  get children() {
    return this.__children;
  }
  toString() {
    return `<${this.__tagName} ${Object.entries(this.__attributes).map(([t, n]) => `${t}=${n}`).join(" ")}>`.trim();
  }
  get nextSibling() {
    if (this.parent) {
      const t = this.parent.children.findIndex((r) => r === this);
      return this.parent.children[t + 1];
    }
  }
}
function H(e) {
  let t = "";
  const n = [];
  let r = !1;
  for (const i of e.trim())
    i === "<" ? (r = !0, t && ($(n, t.trim()), t = "")) : i === ">" ? (r = !1, n.length === 0 && t !== "root" && O(n, "root"), O(n, t), t = "") : t += i;
  return !r && t && $(n, t), nt(n);
}
function $(e, t) {
  if (t.trim().length === 0)
    return;
  const n = e.at(-1);
  if (n) {
    const r = new z(
      t,
      n
      /* parent.attributes */
    );
    n.children.push(r);
  } else
    O(e, "root"), $(e, t);
}
function O(e, t) {
  if (t.startsWith("/")) {
    if (e.length === 1)
      return;
    const n = e.pop(), r = e.at(-1);
    n && (r == null || r.children.push(n));
  } else {
    const [n, r] = rt(t), o = e.at(-1), i = new j(n, o, r);
    e.push(i);
  }
}
function nt(e) {
  for (e.length === 0 && O(e, "root"); e.length > 1; ) {
    const t = e.pop(), n = e.at(-1);
    t && n instanceof j && (n == null || n.children.push(t));
  }
  return e.pop();
}
function rt(e) {
  const [t, ...n] = e.split(" "), r = n.reduce((o, i) => {
    const [a, c] = i.split("=");
    return ot(a) && (o[a] = st(
      c
    )), o;
  }, {});
  return [t, r];
}
function ot(e) {
  return et.includes(e);
}
function it(e) {
  return M(
    e,
    (n, r, o, i) => (n.out = n.out + `
` + " ".repeat(i * 2) + r.toString(), n),
    { out: "" }
  ).out;
}
function st(e) {
  switch (e) {
    case "true":
      return !0;
    case "false":
      return !1;
    case "null":
      return null;
    default:
      return e;
  }
}
function ut(e) {
  const { dm: t, simpleText: n } = e, r = [], o = t.cellWidth_du + t.gridSpaceX_du, i = t.cellHeight_du + t.gridSpaceY_du, a = t.getColumnXCoord_du(t.displayColumns - 1);
  let c = t.drawAreaLeft_du, l = t.drawAreaTop_du;
  "initialCursor" in e && (c = e.initialCursor.x, l = e.initialCursor.y);
  for (const f of n) {
    if (r.push({ x: c, y: l, char: f }), f === `
`) {
      c = t.drawAreaLeft_du, l += i;
      continue;
    }
    c === t.getColumnXCoord_du(0) && f === " " || (c >= a ? (c = t.drawAreaLeft_du, l += i) : c += o);
  }
  return "initialCursor" in e ? { layoutList: r, x: c, y: l } : r;
}
function k({
  tree: e,
  dm: t,
  initCursorX_du: n,
  initCursorY_du: r
}) {
  it(e);
  const o = {
    layoutList: [],
    xStep: t.cellWidth_du + t.gridSpaceX_du,
    yStep: t.cellHeight_du + t.gridSpaceY_du,
    cursorX_du: n ?? t.drawAreaLeft_du,
    cursorY_du: r ?? t.drawAreaTop_du
  };
  return M(
    e,
    (i, a) => (a.tag === "p" && (i.cursorY_du += i.yStep, i.cursorX_du = t.drawAreaLeft_du), a instanceof z && ct(a, i, t), i),
    o
  ).layoutList;
}
function ct(e, t, n) {
  const r = e.text.split(" ");
  for (const [o, i] of r.entries()) {
    if (i.length === 0)
      continue;
    /* jump to start of next line if there isn't room in current row for the word */
    !n.textFits(i, t.cursorX_du) && t.cursorX_du !== n.drawAreaLeft_du && (t.cursorX_du = n.drawAreaLeft_du, t.cursorY_du += t.yStep);
    const {
      layoutList: a,
      x: c,
      y: l
    } = ut({
      simpleText: i,
      dm: n,
      initialCursor: { x: t.cursorX_du, y: t.cursorY_du }
    });
    a.forEach(
      (h) => t.layoutList.push({
        ...h,
        attributes: e.ancestorAttributes
      })
    ), t.cursorX_du = c, t.cursorY_du = l, t.cursorX_du !== n.drawAreaLeft_du && (t.layoutList.push({
      x: t.cursorX_du,
      y: t.cursorY_du,
      char: " ",
      attributes: o === r.length - 1 ? {} : e.ancestorAttributes
    }), t.cursorX_du += t.xStep);
  }
}
function lt(e, t) {
  function n(u) {
    if (u < 1)
      throw new Error("cannot set scale less than 1");
    if (u > 10)
      throw new Error("cannot set scale greater than 10");
    e.setState((s) => ({
      ...s,
      dm: L(s.dm.cellWidth_du, s.root, {
        ...t,
        scale: u,
        displayRows: s.dm.displayRows,
        gridSpaceX_du: s.dm.gridSpaceX_du,
        gridSpaceY_du: s.dm.gridSpaceY_du
      })
    }));
  }
  function r(u) {
    if (u < 1)
      throw new Error("cannot set display rows less than 1");
    if (u > 40)
      throw new Error("cannot set display rows greater than 40");
    e.setState((s) => ({
      ...s,
      dm: L(s.dm.cellWidth_du, s.root, {
        ...t,
        scale: s.dm.scale,
        displayRows: u,
        gridSpaceX_du: s.dm.gridSpaceX_du,
        gridSpaceY_du: s.dm.gridSpaceY_du
      })
    }));
  }
  function o(u) {
    if (u < 0)
      throw new Error("cannot set negative gridSpace");
    if (u > 5)
      throw new Error("cannot set gridSpace greater than 5");
    e.setState((s) => ({
      ...s,
      dm: L(s.dm.cellWidth_du, s.root, {
        ...t,
        scale: s.dm.scale,
        displayRows: s.dm.displayRows,
        gridSpaceX_du: u,
        gridSpaceY_du: u
      })
    }));
  }
  function i(u) {
    e.setState((s) => ({
      ...s,
      dm: L(s.dm.cellWidth_du, s.root, {
        ...t,
        scale: s.dm.scale,
        displayRows: s.dm.displayRows,
        gridSpaceX_du: u
      })
    }));
  }
  function a(u) {
    e.setState((s) => ({
      ...s,
      dm: L(s.dm.cellWidth_du, s.root, {
        ...t,
        scale: s.dm.scale,
        displayRows: s.dm.displayRows,
        gridSpaceY_du: u
      })
    }));
  }
  function c(u) {
    e.setState((s) => ({
      ...s,
      scrollY_du: u
    }));
  }
  function l(u = 1) {
    e.setState((s) => {
      const { drawAreaTop_du: _ } = s.dm, { scrollY_du: g, layoutList: m } = s, S = m.at(-1).y - _;
      return {
        ...s,
        scrollY_du: g >= S ? g : g + u
      };
    });
  }
  function f(u = 1) {
    e.setState((s) => ({
      ...s,
      scrollY_du: s.scrollY_du - u >= 0 ? s.scrollY_du - u : s.scrollY_du
    }));
  }
  function h(u = 1) {
    const { layoutList: s, scrollY_du: _, dm: g } = e.getState(), m = g.cellHeight_du + g.gridSpaceY_du, S = Math.min(
      _ + m,
      s.at(-1).y - g.drawAreaTop_du
    );
    function w() {
      e.getState().scrollY_du >= S || (l(u), requestAnimationFrame(w));
    }
    requestAnimationFrame(w);
  }
  function p(u = 1) {
    const { scrollY_du: s, dm: _ } = e.getState(), g = _.cellHeight_du + _.gridSpaceY_du, m = Math.max(0, s - g);
    function S() {
      e.getState().scrollY_du <= m || (f(u), requestAnimationFrame(S));
    }
    requestAnimationFrame(S);
  }
  function Y(u) {
    return u < 0.5 ? 4 * u * u * u : (u - 1) * (2 * u - 2) * (2 * u - 2) + 1;
  }
  function y(u) {
    const s = e.getState().scrollY_du, _ = s < u ? "down" : "up";
    let g = 0;
    e.setState({ isScrolling: !0 });
    function m() {
      const S = Y(g / 60);
      if (_ === "down") {
        const w = s + S * (u - s);
        if (w >= u) {
          e.setState({
            scrollY_du: u,
            isScrolling: !1
          });
          return;
        } else
          e.setState({
            scrollY_du: w
          });
      } else if (_ === "up") {
        const w = s - S * (s - u);
        if (w <= u) {
          e.setState({
            scrollY_du: u,
            isScrolling: !1
          });
          return;
        } else
          e.setState({
            scrollY_du: w
          });
      }
      g++, requestAnimationFrame(m);
    }
    requestAnimationFrame(m);
  }
  function C() {
    const { dm: u, scrollY_du: s, isScrolling: _ } = e.getState(), { displayRows: g, gridSpaceY_du: m, cellHeight_du: S } = u, w = s + g * (m + S);
    _ || y(w);
  }
  function d() {
    const { dm: u, scrollY_du: s, isScrolling: _ } = e.getState(), { displayRows: g, gridSpaceY_du: m, cellHeight_du: S } = u, w = s - g * (m + S);
    _ || y(w < 0 ? 0 : w);
  }
  function b() {
    const { isScrolling: u } = e.getState();
    u || y(0);
  }
  function x() {
    const { dm: u, isScrolling: s, layoutList: _ } = e.getState(), { borderGutter_du: g, borderWidth_du: m } = u, S = _.at(-1).y - g - m;
    s || y(S);
  }
  function T(u) {
    const { layoutList: s, dm: _, scrollY_du: g } = e.getState(), { y: m } = s.at(-1) ?? {
      y: _.drawAreaTop_du
    }, S = H(`<p>${u}</p>`), w = k({
      tree: S,
      dm: _,
      initCursorX_du: _.drawAreaLeft_du,
      initCursorY_du: m
    });
    w[0].y - 4 > g + _.drawAreaHeight_du && y(w[0].y - 4), e.setState((R) => ({
      ...R,
      layoutList: R.layoutList.concat(w),
      documentSource: R.documentSource + `<p>${u}</p>`
    }));
  }
  function P(u) {
    const s = H(u), { dm: _ } = e.getState();
    e.setState({
      layoutList: k({ dm: _, tree: s }),
      documentSource: u,
      scrollY_du: 0
    });
  }
  return {
    setScale: n,
    setRows: r,
    setGridSpace: o,
    setGridSpaceX: i,
    setGridSpaceY: a,
    setScroll: c,
    scrollDown: l,
    scrollUp: f,
    pageDown: C,
    pageUp: d,
    home: b,
    end: x,
    appendText: T,
    setText: P,
    animatedScrollDown: h,
    animatedScrollUp: p
  };
}
function at({
  index: e,
  columns: t
}) {
  if (e >= 0) {
    const n = Math.floor(e / t);
    return {
      x: e % t,
      y: n
    };
  }
  if (e < 0) {
    const n = Math.floor(e / t);
    return {
      x: e % t === 0 ? e % t : e % t + t,
      y: n
    };
  }
  return { x: 0, y: 0 };
}
function dt(e, t) {
  const n = [];
  for (let r = 0; r < t * t; r++)
    e.includes(r) || n.push(r);
  return n;
}
function U(...e) {
  return (...t) => e.reduceRight((n, r) => r(n), ...t);
}
function ft(e, t, n) {
  switch (n) {
    case "start":
      return _t(e, t);
    case "middle":
      return gt(e, t);
    case "end":
      return ht(e, t);
    default:
      return e;
  }
}
function _t(e, t) {
  const n = [...e];
  return U(
    B,
    q,
    pt
  )([n, t])[0];
}
function gt(e, t) {
  const n = [...e];
  return U(B, q)([n, t])[0];
}
function ht(e, t) {
  const n = [...e];
  return U(
    B,
    q,
    mt
  )([n, t])[0];
}
function B(e) {
  const [t, n] = e, r = -n, o = -1, i = 1;
  return [t.concat(F(r, o, i)), n];
}
function q(e) {
  const [t, n] = e, r = n * n, o = n * n + (n - 1), i = 1;
  return [
    t.concat(F(r, o, i)),
    n
  ];
}
function pt(e) {
  const [t, n] = e, r = 0, o = n * n, i = n;
  return [t.concat(F(r, o, i)), n];
}
function mt(e) {
  const [t, n] = e, r = n - 1, o = n * n + (n - 1), i = n;
  return [
    t.concat(F(r, o, i)),
    n
  ];
}
function F(e, t, n) {
  const r = [];
  for (let o = e; o < t + 1; o += n)
    r.push(o);
  return r;
}
function St(e) {
  return function(o) {
    const { getTools: i, charDefs: a, dm: c, scrollY_du: l } = e.getState(), { ctx: f, clearRect_du: h } = i(c.scale);
    f.fillStyle = E(c.borderColor), h(
      c.drawAreaLeft_du,
      c.drawAreaTop_du - 2,
      c.drawAreaRight_du,
      c.drawAreaHeight_du + 3
    );
    for (let p = 0; p < o.length; p++) {
      const { x: Y, y, char: C, attributes: d } = o[p];
      if (y > l + c.drawAreaBottom_du || y + c.cellHeight_du < l)
        continue;
      const b = C.toUpperCase() in a ? C.toUpperCase() : " ", x = d != null && d.highlight ? dt(a[b], a.charWidth) : a[b];
      if (f.fillStyle = (d == null ? void 0 : d.color) ?? E(c.borderColor), t(x, Y, y), d != null && d.outline) {
        f.fillStyle = typeof (d == null ? void 0 : d.outline) == "string" ? d == null ? void 0 : d.outline : E(c.borderColor);
        const T = ft(
          [],
          a.charWidth,
          n(o, p)
        );
        t(T, Y, y);
      }
    }
  };
  function t(r, o, i) {
    const { getTools: a, dm: c, scrollY_du: l } = e.getState(), { fillRect_du: f } = a(c.scale);
    r.forEach((h) => {
      const { x: p, y: Y } = at({
        index: h,
        columns: c.cellWidth_du
      }), y = p + o, C = Y + i - l;
      c.drawAreaBottom_du < C || C < c.drawAreaTop_du - 2 || y > c.drawAreaRight_du + 2 || f(y, C, 1, 1);
    });
  }
  function n(r, o) {
    var c, l, f, h;
    const i = r[o - 1], a = r[o + 1];
    return (c = i == null ? void 0 : i.attributes) != null && c.outline ? (l = i == null ? void 0 : i.attributes) != null && l.outline && ((f = a == null ? void 0 : a.attributes) != null && f.outline) ? "middle" : (h = a == null ? void 0 : a.attributes) != null && h.outline ? null : "end" : "start";
  }
}
function V(e, t) {
  if (e === t)
    return !0;
  if (e && t && typeof e == "object" && typeof t == "object") {
    const n = Object.keys(e), r = Object.keys(t);
    if (n.length === 0 && r.length === 0)
      return !0;
    if (n.length !== r.length || r.some((o) => !n.includes(o)))
      return !1;
    for (const o of n)
      if (!r.includes(o) || !V(e[o], t[o]))
        return !1;
    return !0;
  }
  return typeof e != typeof t ? !1 : typeof e == "function" && typeof t == "function" ? e.toString() === t.toString() : !1;
}
function wt(e) {
  let t = e;
  const n = /* @__PURE__ */ new Map();
  function r(c, l) {
    for (const f of n.keys())
      if (f.toString() === l.toString())
        throw new Error("duplicate subscriber implementation found");
    return n.set(l, {
      selector: c,
      prevSelectorResult: c(t)
    }), () => {
      n.delete(l);
    };
  }
  function o() {
    const c = [];
    for (const [l, { selector: f, prevSelectorResult: h }] of n) {
      const p = f(t);
      V(p, h) || (n.set(l, {
        selector: f,
        prevSelectorResult: p
      }), c.push(l));
    }
    c.forEach((l) => {
      var f;
      l((f = n.get(l)) == null ? void 0 : f.prevSelectorResult);
    });
  }
  function i(c) {
    let l;
    typeof c == "function" ? l = c(t) : l = { ...t, ...c }, t = l, o();
  }
  function a() {
    return t;
  }
  return {
    getState: a,
    setState: i,
    subscribe: r
  };
}
function yt(e) {
  const t = document.createElement("canvas");
  return t.setAttribute("id", "__PTRwindow_canvas_element"), t.style.background = "black", e.appendChild(t), t;
}
function bt(e, t) {
  const n = document.createElement("div");
  return n.setAttribute("id", `__PTRwindow_root_element-${t}`), n.classList.add("PTRwindow_root_element"), n.style.boxSizing = "border-box", e.appendChild(n), n;
}
const W = 3;
function Rt(e) {
  const { charWidth: t } = e;
  return Object.fromEntries(
    Object.entries(e).map(([n, r]) => n === "charWidth" && typeof r == "number" ? [n, r + W * 2] : typeof r == "number" ? [n, r] : [
      n,
      r.map((o) => {
        const i = Math.floor(o / t), l = (t + W * 2) * W + W + i * W * 2;
        return o += l;
      })
    ])
  );
}
const Yt = {
  0: [2, 3, 4, 8, 12, 15, 18, 19, 22, 24, 26, 29, 30, 33, 36, 40, 44, 45, 46],
  1: [3, 9, 10, 17, 24, 31, 38, 43, 44, 45, 46, 47],
  2: [2, 3, 4, 8, 12, 19, 24, 25, 30, 36, 43, 44, 45, 46, 47],
  3: [2, 3, 4, 8, 12, 19, 24, 25, 26, 33, 36, 40, 44, 45, 46],
  4: [4, 10, 11, 16, 18, 22, 25, 29, 30, 31, 32, 33, 39, 46],
  5: [1, 2, 3, 4, 5, 8, 15, 16, 17, 18, 26, 33, 36, 40, 44, 45, 46],
  6: [2, 3, 4, 8, 12, 15, 22, 23, 24, 25, 29, 33, 36, 40, 44, 45, 46],
  7: [1, 2, 3, 4, 5, 12, 18, 24, 30, 37, 44],
  8: [2, 3, 4, 8, 12, 15, 19, 23, 24, 25, 29, 33, 36, 40, 44, 45, 46],
  9: [2, 3, 4, 8, 12, 15, 19, 23, 24, 25, 26, 33, 40, 44, 45, 46],
  charWidth: 7,
  " ": [],
  ".": [36],
  ",": [36, 43],
  "'": [3, 10],
  A: [3, 9, 11, 15, 19, 22, 26, 29, 30, 31, 32, 33, 36, 40, 43, 47],
  B: [
    1,
    2,
    3,
    4,
    8,
    12,
    15,
    19,
    22,
    23,
    24,
    25,
    29,
    33,
    36,
    40,
    43,
    44,
    45,
    46
  ],
  C: [2, 3, 4, 8, 12, 15, 22, 29, 36, 40, 44, 45, 46],
  D: [1, 2, 3, 8, 11, 15, 19, 22, 26, 29, 33, 36, 39, 43, 44, 45],
  E: [1, 2, 3, 4, 5, 8, 15, 22, 23, 24, 25, 29, 36, 43, 44, 45, 46, 47],
  F: [1, 2, 3, 4, 5, 8, 15, 22, 23, 24, 25, 29, 36, 43],
  G: [2, 3, 4, 8, 12, 15, 22, 29, 31, 32, 33, 36, 40, 44, 45, 46],
  H: [1, 5, 8, 12, 15, 19, 22, 23, 24, 25, 26, 29, 33, 36, 40, 43, 47],
  I: [1, 2, 3, 4, 5, 10, 17, 24, 31, 38, 43, 44, 45, 46, 47],
  J: [5, 12, 19, 26, 29, 33, 36, 40, 44, 45, 46, 47],
  K: [1, 5, 8, 11, 15, 17, 22, 23, 29, 31, 36, 39, 43, 47],
  L: [1, 8, 15, 22, 29, 36, 43, 44, 45, 46, 47],
  M: [1, 5, 8, 9, 11, 12, 15, 17, 19, 22, 26, 29, 33, 36, 40, 43, 47],
  N: [1, 5, 8, 9, 12, 15, 17, 19, 22, 24, 26, 29, 31, 33, 36, 39, 40, 43, 47],
  O: [2, 3, 4, 8, 12, 15, 19, 22, 26, 29, 33, 36, 40, 44, 45, 46],
  P: [1, 2, 3, 4, 8, 12, 15, 19, 22, 23, 24, 25, 29, 36, 43],
  Q: [2, 3, 4, 8, 12, 15, 19, 22, 26, 29, 31, 33, 36, 39, 44, 45, 47],
  R: [1, 2, 3, 4, 8, 12, 15, 19, 22, 23, 24, 25, 29, 31, 36, 39, 43, 47],
  S: [2, 3, 4, 8, 12, 15, 23, 24, 25, 33, 36, 40, 44, 45, 46],
  T: [1, 2, 3, 4, 5, 10, 17, 24, 31, 38, 45],
  U: [1, 5, 8, 12, 15, 19, 22, 26, 29, 33, 36, 40, 44, 45, 46],
  V: [1, 5, 8, 12, 15, 19, 22, 26, 29, 33, 37, 39, 45],
  W: [1, 5, 8, 12, 15, 19, 22, 26, 29, 31, 33, 36, 37, 39, 40, 43, 47],
  X: [0, 6, 8, 12, 16, 18, 24, 30, 32, 36, 40, 42, 48],
  Y: [1, 5, 8, 12, 16, 18, 24, 31, 38, 45],
  Z: [1, 2, 3, 4, 5, 12, 18, 24, 30, 36, 43, 44, 45, 46, 47],
  "!": [8, 15, 22, 36],
  "-": [23, 24, 25],
  "+": [10, 17, 22, 23, 24, 25, 26, 31, 38],
  _: [37, 38, 39],
  ">": [2, 10, 18, 26, 32, 32, 38, 44],
  "<": [4, 10, 16, 22, 30, 30, 38, 46],
  "(": [3, 9, 15, 22, 29, 37, 45],
  ")": [3, 11, 19, 26, 33, 39, 45],
  "?": [2, 3, 4, 8, 12, 15, 19, 25, 31, 45],
  $: [3, 9, 10, 11, 12, 15, 17, 22, 23, 24, 25, 31, 33, 36, 37, 38, 39, 45],
  "*": [3, 8, 10, 12, 16, 17, 18, 24, 30, 32, 36, 40],
  "/": [12, 18, 24, 30, 36],
  "\\": [8, 16, 24, 32, 40],
  "|": [3, 10, 17, 24, 31, 38, 45],
  "^": [3, 9, 11, 15, 19],
  "{": [3, 4, 9, 16, 22, 30, 37, 45, 46],
  ":": [22, 36],
  ";": [22, 36, 43],
  "}": [1, 2, 10, 17, 25, 31, 38, 43, 44],
  '"': [2, 4, 9, 11],
  "%": [8, 12, 18, 24, 30, 36, 40],
  "@": [
    1,
    2,
    3,
    4,
    5,
    7,
    13,
    14,
    16,
    17,
    18,
    20,
    21,
    23,
    25,
    27,
    28,
    30,
    31,
    32,
    33,
    35,
    43,
    44,
    45,
    46
  ],
  "#": [9, 11, 15, 16, 17, 18, 19, 23, 25, 29, 30, 31, 32, 33, 37, 39],
  "&": [2, 3, 4, 8, 12, 15, 22, 23, 25, 26, 27, 29, 33, 36, 40, 44, 45, 46],
  "`": [0, 8],
  "~": [19, 23, 24, 25, 29]
};
function Ct(e) {
  return (...t) => t.map((n) => n * e);
}
function Tt(e) {
  let t, n, r;
  return (o) => {
    if (t === e && n === o && r)
      return r;
    const i = At(e, o);
    return t = e, n = o, r = i, i;
  };
}
function At(e, t) {
  const n = Ct(t), r = (o) => (...i) => {
    const a = n(...i);
    return o.call(e, ...a);
  };
  return {
    ctx: e,
    /**
     * @remarks inputs are adjusted by the current scale value
     */
    moveTo_du(...o) {
      return r(e.moveTo)(...o);
    },
    /**
     * @remarks inputs are adjusted by the current scale value
     */
    lineTo_du(...o) {
      return r(e.lineTo)(...o);
    },
    /**
     * @remarks inputs are adjusted by the current scale value
     */
    drawRect_du(...o) {
      return r(e.rect)(...o);
    },
    /**
     * @remarks inputs are adjusted by the current scale value
     */
    fillRect_du(...o) {
      return r(e.fillRect)(...o);
    },
    /**
     * @remarks inputs are adjusted by the current scale value
     */
    strokeRect_du(...o) {
      return r(e.strokeRect)(...o);
    },
    /**
     * @remarks inputs are adjusted by the current scale value
     */
    clearRect_du(...o) {
      return r(e.clearRect)(...o);
    }
  };
}
const Lt = (e) => {
  const t = Rt(Yt), n = bt(e.containerElement), r = yt(n).getContext("2d"), o = L(
    t.charWidth,
    n,
    e.displayOptions
  ), i = Tt(r);
  return wt({ ...{
    dm: o,
    charDefs: t,
    root: n,
    ctx: r,
    getTools: i,
    documentSource: "",
    scrollY_du: 0,
    layoutList: [],
    isScrolling: !1
  }, ...e });
};
function xt(e, t) {
  const n = {
    ...v,
    ...t
  }, r = Lt({ displayOptions: n, containerElement: e }), o = lt(r, n), i = St(r), {
    getTools: a,
    ctx: c,
    charDefs: l,
    root: f,
    documentSource: h
  } = r.getState(), p = L(l.charWidth, f, n);
  I(c, p), Z(a, p);
  const Y = H(h), y = k({ tree: Y, dm: p });
  i(y), window.addEventListener("resize", C), r.setState((d) => ({ ...d, dm: p, layoutList: y })), r.subscribe(
    ({ dm: d, ctx: b }) => ({ dm: d, ctx: b }),
    ({ dm: d, ctx: b }) => {
      I(b, d);
      const x = H(r.getState().documentSource);
      r.setState({
        layoutList: k({ dm: d, tree: x })
      });
    }
  ), r.subscribe(
    ({ layoutList: d, dm: b }) => ({ layoutList: d, dm: b }),
    ({ layoutList: d }) => {
      i(d);
    }
  ), r.subscribe(
    ({ scrollY_du: d }) => ({ scrollY_du: d }),
    () => {
      i(r.getState().layoutList);
    }
  );
  function C() {
    const d = L(
      r.getState().dm.cellWidth_du,
      r.getState().root,
      {
        ...n,
        scale: r.getState().dm.scale,
        displayRows: r.getState().dm.displayRows
      }
    );
    r.getState().dm.displayColumns !== d.displayColumns && r.setState((b) => ({ ...b, dm: d }));
  }
  return { actions: o, store: r };
}
window._createPTR = xt;
export {
  xt as createPTR
};
