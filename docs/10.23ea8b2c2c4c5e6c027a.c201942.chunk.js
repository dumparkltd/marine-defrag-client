(window.webpackJsonp = window.webpackJsonp || []).push([[10], {
  '8d9563bb381a9dca4c5d': function (t, e, n) {
    let r; const o = n('8af190b70a6bc55c6f1b'); const i = n.n(o); const c = (n('8a2d1b95e05b6a321e74'), n('0b3cb19af78752326f59')); const u = n('eb656803928a435bd3cc'); const f = n('4bbbd76528501909b843'); function a(t) { return (a = typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol' ? function (t) { return typeof t; } : function (t) { return t && typeof Symbol === 'function' && t.constructor === Symbol && t !== Symbol.prototype ? 'symbol' : typeof t; })(t); } function l(t, e, n, o) {
      r || (r = typeof Symbol === 'function' && Symbol.for && Symbol.for('react.element') || 60103); const i = t && t.defaultProps; const c = arguments.length - 3; if (e || c === 0 || (e = { children: void 0 }), c === 1)e.children = o; else if (c > 1) { for (var u = new Array(c), f = 0; f < c; f++)u[f] = arguments[f + 3]; e.children = u; } if (e && i) for (const a in i) void 0 === e[a] && (e[a] = i[a]); else e || (e = i || {}); return {
        $$typeof: r, type: t, key: void 0 === n ? null : `${n}`, ref: null, props: e, _owner: null,
      };
    } function p(t, e) { for (let n = 0; n < e.length; n++) { const r = e[n]; r.enumerable = r.enumerable || !1, r.configurable = !0, 'value' in r && (r.writable = !0), Object.defineProperty(t, r.key, r); } } function s(t, e) { return (s = Object.setPrototypeOf || function (t, e) { return t.__proto__ = e, t; })(t, e); } function b(t) { const e = (function () { if (typeof Reflect === 'undefined' || !Reflect.construct) return !1; if (Reflect.construct.sham) return !1; if (typeof Proxy === 'function') return !0; try { return Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], () => {})), !0; } catch (t) { return !1; } }()); return function () { let n; const r = y(t); if (e) { const o = y(this).constructor; n = Reflect.construct(r, arguments, o); } else n = r.apply(this, arguments); return (function (t, e) { if (e && (a(e) === 'object' || typeof e === 'function')) return e; if (void 0 !== e) throw new TypeError('Derived constructors may only return object or undefined'); return (function (t) { if (void 0 === t) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return t; }(t)); }(this, n)); }; } function y(t) { return (y = Object.setPrototypeOf ? Object.getPrototypeOf : function (t) { return t.__proto__ || Object.getPrototypeOf(t); })(t); } const d = Object(c.default)((t) => i.a.createElement(u.a, t)).withConfig({ displayName: 'ContentNarrow__Wrapper', componentId: 'sc-1s7ojjh-0' })(['max-width:90%;@media (min-width:', '){max-width:400px;}@media (min-width:', '){max-width:480px;}'], (t) => t.theme.breakpoints.medium, (t) => t.theme.breakpoints.large); const h = (function (t) { !(function (t, e) { if (typeof e !== 'function' && e !== null) throw new TypeError('Super expression must either be null or a function'); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), e && s(t, e); }(c, i.a.PureComponent)); let e; let n; let r; const o = b(c); function c() { return (function (t, e) { if (!(t instanceof e)) throw new TypeError('Cannot call a class as a function'); }(this, c)), o.apply(this, arguments); } return e = c, (n = [{ key: 'render', value() { return l(f.a, { isStatic: !0 }, void 0, l(u.a, { align: 'center', fill: 'horizontal' }, void 0, l(d, {}, void 0, this.props.children))); } }]) && p(e.prototype, n), r && p(e, r), c; }()); e.a = h;
  },
}]);
