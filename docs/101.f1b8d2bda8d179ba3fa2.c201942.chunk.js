(window.webpackJsonp = window.webpackJsonp || []).push([[101], {
  '7b2bb0b307ac961db0ed': function (e, t, n) {
    n.r(t), n.d(t, 'save', () => d), n.d(t, 'defaultSaga', () => i); const r = n('d782b72bc5b680c7122c'); const a = n('3ad3c1378076e862aab0'); const c = n('a72b40110d9c31c9b5c5'); const u = n('2157bd598f2b425595ea'); const b = n('0a53423d610cdbe226ba'); const o = regeneratorRuntime.mark(d); const s = regeneratorRuntime.mark(i); function d(e) { let t; return regeneratorRuntime.wrap((n) => { for (;;) switch (n.prev = n.next) { case 0: return t = e.data, n.next = 3, Object(r.put)(Object(c.D)({ path: u.n.PAGES, entity: t, redirect: ''.concat(u.I.PAGES, '/').concat(t.id) })); case 3: case 'end': return n.stop(); } }, o); } function i() { let e; return regeneratorRuntime.wrap((t) => { for (;;) switch (t.prev = t.next) { case 0: return t.next = 2, Object(r.takeLatest)(b.c, d); case 2: return e = t.sent, t.next = 5, Object(r.take)(a.LOCATION_CHANGE); case 5: return t.next = 7, Object(r.cancel)(e); case 7: case 'end': return t.stop(); } }, s); }t.default = [i];
  },
}]);
