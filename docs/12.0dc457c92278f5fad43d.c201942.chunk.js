(window.webpackJsonp = window.webpackJsonp || []).push([[12], {
  '0765c307dd1d0b7a1748': function (e, a, o) {
    let t; const n = o('8af190b70a6bc55c6f1b'); const i = o.n(n); const r = (o('8a2d1b95e05b6a321e74'), o('c15d1c9d30171dc8ff35')); const d = o('7f08b9dcf3783d315194'); const c = o('b2f996be87a0eb7861a3'); const l = o('4194b0d3ea4cea922437'); const f = o('8c0f5da1fda3a293f1e7'); const s = o('cdd651a88cf0164e1d73'); const b = o('18e010ab9840f465445e'); const u = o('5d79cd07814c7356dec5'); const p = o('08136e46427002abd20a'); const m = o('66158c2e843df8f7aec8'); const v = o('27f5226d38a42c2b666f'); function y(e, a, o, n) {
      t || (t = typeof Symbol === 'function' && Symbol.for && Symbol.for('react.element') || 60103); const i = e && e.defaultProps; const r = arguments.length - 3; if (a || r === 0 || (a = { children: void 0 }), r === 1)a.children = n; else if (r > 1) { for (var d = new Array(r), c = 0; c < r; c++)d[c] = arguments[c + 3]; a.children = d; } if (a && i) for (const l in i) void 0 === a[l] && (a[l] = i[l]); else a || (a = i || {}); return {
        $$typeof: t, type: e, key: void 0 === o ? null : `${o}`, ref: null, props: a, _owner: null,
      };
    } const h = function (e) { const a = !(arguments.length > 1 && void 0 !== arguments[1]) || arguments[1]; const o = arguments.length > 2 && void 0 !== arguments[2] && arguments[2]; const t = arguments.length > 3 && void 0 !== arguments[3] && arguments[3]; return y(s.a, { hasAside: a, bottom: o }, void 0, Object(d.a)(e).map((e, a) => e && (function (e) { return e.fields && Object(r.reduce)(e.fields, (e, a) => e || a, !1); }(e)) && y(c.a, { group: e, seamless: t, bottom: o }, a))); }; const g = function (e) {
      const a = arguments.length > 1 && void 0 !== arguments[1] && arguments[1]; const o = arguments.length > 2 ? arguments[2] : void 0; return y(b.a, { bottom: a }, void 0, Object(d.a)(e).map((e, t) => e && y(c.a, {
        group: e, seamless: o, bottom: a, aside: !0,
      }, t)));
    }; a.a = function (e) { const a = e.fields; const o = e.seamless; const t = e.header; const n = Object(f.b)(); const r = a.body && a.body.main && a.body.main[0] && a.body.main[0].fields; const d = a.body && a.body.aside && a.body.aside[0] && a.body.aside[0].fields; return y(u.a, { seamless: o }, void 0, n && y(l.a, { argsKeep: [] }), t && i.a.createElement(v.a, t), a.header && y(p.a, {}, void 0, y(m.a, {}, void 0, a.header.main && h(a.header.main, d, !1, o), a.header.aside && n && g(a.header.aside, !1))), (r || d) && y(p.a, {}, void 0, y(m.a, {}, void 0, a.body.main && h(a.body.main, d, !0, o), d && g(a.body.aside, !0)))); };
  },
  '27f5226d38a42c2b666f': function (e, a, o) {
    let t; const n = o('8af190b70a6bc55c6f1b'); const i = o.n(n); const r = (o('8a2d1b95e05b6a321e74'), o('0b3cb19af78752326f59')); const d = o('eb656803928a435bd3cc'); const c = o('66543f9bb6e90e461320'); const l = o('5ca68c6edf7ca33c5f8f'); const f = o('802d70543b9dfc1bb39e'); const s = o('7ae937c6e05b47aad319'); const b = o('d45f881f209f1eeec74d'); const u = o('b6581a750d79bdfb182d'); const p = o('8c0f5da1fda3a293f1e7'); const m = o('fcb99a06256635f70435'); const v = o('08136e46427002abd20a'); const y = o('66158c2e843df8f7aec8'); const h = o('cdd651a88cf0164e1d73'); function g(e, a, o, n) {
      t || (t = typeof Symbol === 'function' && Symbol.for && Symbol.for('react.element') || 60103); const i = e && e.defaultProps; const r = arguments.length - 3; if (a || r === 0 || (a = { children: void 0 }), r === 1)a.children = n; else if (r > 1) { for (var d = new Array(r), c = 0; c < r; c++)d[c] = arguments[c + 3]; a.children = d; } if (a && i) for (const l in i) void 0 === a[l] && (a[l] = i[l]); else a || (a = i || {}); return {
        $$typeof: t, type: e, key: void 0 === o ? null : `${o}`, ref: null, props: a, _owner: null,
      };
    } function w() { return (w = Object.assign || function (e) { for (let a = 1; a < arguments.length; a++) { const o = arguments[a]; for (const t in o)Object.prototype.hasOwnProperty.call(o, t) && (e[t] = o[t]); } return e; }).apply(this, arguments); } const O = r.default.div.withConfig({ displayName: 'ViewHeader__Styled', componentId: 'sc-13qurqo-0' })(['padding-top:', ';@media print{padding-top:40pt;}'], (e) => { const a = e.isPage; const o = e.isPrint; return a || o ? '40px' : 0; }); const j = Object(r.default)((e) => i.a.createElement(d.a, w({ plain: !0 }, e))).withConfig({ displayName: 'ViewHeader__Between', componentId: 'sc-13qurqo-1' })(['flex:0 0 auto;align-self:stretch;width:1px;position:relative;&:after{content:"";position:absolute;height:100%;left:0;border-left:1px solid rgba(0,0,0,0.15);}']); const k = Object(r.default)((e) => i.a.createElement(c.a, w({ plain: !0 }, e))).withConfig({ displayName: 'ViewHeader__MyButton', componentId: 'sc-13qurqo-2' })(['color:', ';stroke:', ';&:hover{color:', ';stroke:', ';}'], (e) => e.theme.global.colors.brand, (e) => e.theme.global.colors.brand, (e) => e.theme.global.colors.highlight, (e) => e.theme.global.colors.highlight); const P = r.default.h3.withConfig({ displayName: 'ViewHeader__TitleMedium', componentId: 'sc-13qurqo-3' })(['line-height:1;margin:15px 0;display:inline-block;@media print{margin-bottom:5px;}']); const x = g(d.a, { pad: 'xsmall' }, void 0, g(f.a, { size: 'xsmall', color: 'inherit' })); const q = g(j, {}); a.a = function (e) {
      const a = e.title; const o = e.buttons; const t = e.onClose; const n = e.onTypeClick; const i = e.type; const r = Object(p.b)(); return g(O, { isPrint: r, isPage: i === m.k }, void 0, g(v.a, {}, void 0, g(y.a, {}, void 0, g(h.a, {}, void 0, g(b.a, {}, void 0, g(d.a, {
        direction: 'row', pad: { top: 'medium', horizontal: i !== m.k ? 'medium' : 'none', bottom: 'small' }, align: 'center', justify: 'between',
      }, void 0, i !== m.k && g(d.a, { direction: 'row', align: 'center', gap: 'small' }, void 0, t && g(k, { onClick: t, title: 'Back to previous view' }, void 0, x), t && q, n && g(k, { onClick: n, title: a }, void 0, g(d.a, { pad: 'xsmall' }, void 0, g(l.a, { size: 'small' }, void 0, a))), !n && i !== m.k && g(d.a, { pad: 'xsmall' }, void 0, g(l.a, { size: 'small' }, void 0, a))), i === m.k && g(d.a, {}, void 0, g(P, {}, void 0, a)), o && o.length > 0 && g(d.a, { direction: 'row', align: 'center', gap: 'small' }, void 0, o.map((e, a) => g(d.a, { pad: 'xsmall' }, a, g(s.a, { button: e })))))), i === m.k && g(u.a, {}, void 0, g(d.a, {}, void 0, g(P, {}, void 0, a)))))));
    };
  },
  '5d79cd07814c7356dec5': function (e, a, o) {
    const t = o('0b3cb19af78752326f59'); const n = o('6760403a719c9b65e90c'); const i = t.default.div.withConfig({ displayName: 'ViewWrapper', componentId: 'sc-1eq8qgn-0' })(['box-shadow:', ';background:', ';@media print{box-shadow:none;}'], (e) => { const a = e.seamless; return e.isPrint || a ? 'none' : '0px 0px 10px 0px rgba(0,0,0,0.2)'; }, Object(n.palette)('background', 0)); a.a = i;
  },
  '66158c2e843df8f7aec8': function (e, a, o) {
    const t = o('0b3cb19af78752326f59').default.div.withConfig({ displayName: 'ViewPanelInside', componentId: 'sc-1j1p1qq-0' })(['display:table-row;']); a.a = t;
  },
  b2f996be87a0eb7861a3(e, a, o) {
    let t; const n = o('8af190b70a6bc55c6f1b'); const i = o.n(n); const r = (o('8a2d1b95e05b6a321e74'), o('ab039aecd4a1d4fedc0e')); const d = o('8621fc26a03429c323e4'); const c = o('69ae87f0386018f96a9f'); const l = o('7998895b264d19f839ad'); const f = o('015a3f229ddeb3c46a7e'); const s = o('d34426aca6c662deb548'); function b(e, a) { const o = Object.keys(e); if (Object.getOwnPropertySymbols) { let t = Object.getOwnPropertySymbols(e); a && (t = t.filter((a) => Object.getOwnPropertyDescriptor(e, a).enumerable)), o.push.apply(o, t); } return o; } function u(e) { for (let a = 1; a < arguments.length; a++) { var o = arguments[a] != null ? arguments[a] : {}; a % 2 ? b(Object(o), !0).forEach((a) => { p(e, a, o[a]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(o)) : b(Object(o)).forEach((a) => { Object.defineProperty(e, a, Object.getOwnPropertyDescriptor(o, a)); }); } return e; } function p(e, a, o) {
      return a in e ? Object.defineProperty(e, a, {
        value: o, enumerable: !0, configurable: !0, writable: !0,
      }) : e[a] = o, e;
    } function m(e, a, o, n) {
      t || (t = typeof Symbol === 'function' && Symbol.for && Symbol.for('react.element') || 60103); const i = e && e.defaultProps; const r = arguments.length - 3; if (a || r === 0 || (a = { children: void 0 }), r === 1)a.children = n; else if (r > 1) { for (var d = new Array(r), c = 0; c < r; c++)d[c] = arguments[c + 3]; a.children = d; } if (a && i) for (const l in i) void 0 === a[l] && (a[l] = i[l]); else a || (a = i || {}); return {
        $$typeof: t, type: e, key: void 0 === o ? null : `${o}`, ref: null, props: a, _owner: null,
      };
    }a.a = function (e) {
      const a = e.group; const o = e.seamless; const t = e.aside; const n = e.bottom; const b = a && a.fields && a.fields.reduce((e, a) => e || a, !1); return a && (b || a.custom) ? m(c.a, {
        groupType: a.type, seamless: o, aside: t, bottom: n,
      }, void 0, a.label && m(l.a, { basic: a.type === 'smartTaxonomy' }, void 0, m(f.a, {}, void 0, i.a.createElement(r.FormattedMessage, a.label))), a.title && m(l.a, {}, void 0, m(f.a, {}, void 0, a.title)), a.fields && a.fields.map((e, a) => e ? m(d.a, { field: u(u({}, e), {}, { aside: t }) }, a) : null), a.custom && m(s.a, {}, void 0, a.custom)) : null;
    };
  },
}]);
