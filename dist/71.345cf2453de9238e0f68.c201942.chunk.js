(window.webpackJsonp=window.webpackJsonp||[]).push([[71],{"3c7df427917793cee837":function(e,t,n){"use strict";n.r(t),n.d(t,"save",function(){return b}),n.d(t,"defaultSaga",function(){return d});var r=n("d782b72bc5b680c7122c"),c=n("3ad3c1378076e862aab0"),a=n("a72b40110d9c31c9b5c5"),u=n("2157bd598f2b425595ea"),o=n("b3e8f7eaebc6f355ea8d"),s=regeneratorRuntime.mark(b),i=regeneratorRuntime.mark(d);function b(e){var t;return regeneratorRuntime.wrap(function(n){for(;;)switch(n.prev=n.next){case 0:return t=e.data,n.next=3,Object(r.put)(Object(a.D)({path:u.n.ACTIONS,entity:t,redirect:"".concat(u.I.ACTION,"/").concat(t.id)}));case 3:case"end":return n.stop()}},s)}function d(){var e;return regeneratorRuntime.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,Object(r.takeLatest)(o.c,b);case 2:return e=t.sent,t.next=5,Object(r.take)(c.LOCATION_CHANGE);case 5:return t.next=7,Object(r.cancel)(e);case 7:case"end":return t.stop()}},i)}t.default=[d]}}]);