(window.webpackJsonp = window.webpackJsonp || []).push([[112], {
  '883b56ef841c5d351ac2': function (e, t, n) {
    n.r(t), n.d(t, 'save', () => i), n.d(t, 'defaultSaga', () => d); const r = n('d782b72bc5b680c7122c'); const a = n('3ad3c1378076e862aab0'); const c = n('a72b40110d9c31c9b5c5'); const u = n('2157bd598f2b425595ea'); const s = n('bdaacb84cf8e1bc70267'); const b = regeneratorRuntime.mark(i); const o = regeneratorRuntime.mark(d); function i(e) { let t; return regeneratorRuntime.wrap((n) => { for (;;) switch (n.prev = n.next) { case 0: return t = e.data, n.next = 3, Object(r.put)(Object(c.v)({ path: u.n.RESOURCES, entity: t, redirect: u.I.RESOURCE })); case 3: case 'end': return n.stop(); } }, b); } function d() { let e; return regeneratorRuntime.wrap((t) => { for (;;) switch (t.prev = t.next) { case 0: return t.next = 2, Object(r.takeLatest)(s.c, i); case 2: return e = t.sent, t.next = 5, Object(r.take)(a.LOCATION_CHANGE); case 5: return t.next = 7, Object(r.cancel)(e); case 7: case 'end': return t.stop(); } }, o); }t.default = [d];
  },
}]);
