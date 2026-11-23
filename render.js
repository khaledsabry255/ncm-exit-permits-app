/* ============================================================
   رسم التصريح: خلفية الورد نفسها + البيانات بولد في أماكنها
   الخلفية والأماكن جايين من templates.js (اتولّدوا من ملفات الورد)
   ============================================================ */

(function () {
  'use strict';

  var FONT = '"NCM Serif", "Times New Roman", serif';
  var bgCache = {};

  function loadBg(id) {
    if (bgCache[id]) return bgCache[id];
    bgCache[id] = new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = reject;
      img.src = window.TEMPLATES[id].bg;
    });
    return bgCache[id];
  }

  function fontReady() {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    return Promise.all([
      document.fonts.load('bold 40px "NCM Serif"', 'Aa'),
      document.fonts.load('bold 40px "NCM Serif"', 'ابت')
    ]).catch(function () {});
  }

  var AR = /[؀-ۿ]/;
  var LATIN = /[A-Za-z]/;
  function isRtl(s) {
    for (var i = 0; i < s.length; i++) {
      var c = s.charAt(i);
      if (AR.test(c)) return true;
      if (LATIN.test(c)) return false;
    }
    return false;
  }

  function dateText(d) {
    var dd = String(d.dateD || '').trim(), mm = String(d.dateM || '').trim(), yy = String(d.dateY || '').trim();
    if (!dd && !mm && !yy) return '';
    return (dd || '    ') + ' / ' + (mm || '    ') + ' / ' + yy;
  }

  /* قيمة كل خانة من البيانات */
  function valueFor(key, d) {
    if (key === 'date') return dateText(d);
    if (key === 'appNo') return d.appNo || '';
    if (key === 'unload') return d.unloadPlace || '';
    if (key === 'purpose') return d.purpose || '';
    var p = key.split('.');
    if (p[0] === 'items') {
      var it = (d.items || [])[+p[1]];
      return it ? (it[p[2]] || '') : '';
    }
    if (p[0] === 'driver') return (d.driver || {})[p[1]] || '';
    if (p[0] === 'sigNames') return (d.sigNames || [])[+p[1]] || '';
    return '';
  }

  function drawField(ctx, f, raw) {
    var text = String(raw == null ? '' : raw).replace(/\r/g, '');
    if (!text.trim()) return;
    var lines = text.split('\n').map(function (s) { return s.trim(); }).filter(function (s) { return s; });
    if (!lines.length) return;

    var size = f.size;
    var pad = f.size * 0.25;
    var maxW = (f.cell[2] - f.cell[0]) - pad * 2;
    var maxH = (f.cell[1] != null && f.cell[3] != null) ? (f.cell[3] - f.cell[1]) - pad : null;

    function fits(sz) {
      ctx.font = 'bold ' + sz + 'px ' + FONT;
      for (var i = 0; i < lines.length; i++) {
        if (ctx.measureText(lines[i]).width > maxW) return false;
      }
      if (maxH && lines.length > 1 && lines.length * sz * 1.15 > maxH) return false;
      return true;
    }
    while (!fits(size) && size > f.size * 0.45) size *= 0.95;

    ctx.font = 'bold ' + size + 'px ' + FONT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#000';
    var lh = size * 1.15;
    // لو الحجم صغر، نخلّي منتصف السطر في نفس المكان
    var shift = (f.size - size) * 0.35;
    var ys = [];
    if (f.lines && f.lines.length === lines.length) {
      // نفس عدد سطور الورد: كل سطر في مكانه بالظبط
      ys = f.lines.map(function (y) { return y - shift; });
    } else {
      var mid = f.lines ? (f.lines[0] + f.lines[f.lines.length - 1]) / 2 : f.by;
      for (var j = 0; j < lines.length; j++) ys.push(mid - shift + (j - (lines.length - 1) / 2) * lh);
    }
    for (var k = 0; k < lines.length; k++) {
      ctx.direction = isRtl(lines[k]) ? 'rtl' : 'ltr';
      if (f.align === 'right') {
        // بيبدأ من مكان ثابت يمين (زي التاريخ بعد «التاريخ :» في الإقرار)
        // ومن اليمين للشمال: اليوم جنب «التاريخ :» والسنة آخر حاجة — زي نقط الورد
        ctx.direction = 'rtl';
        ctx.textAlign = 'right';
        ctx.fillText(lines[k], f.rx, ys[k]);
        ctx.textAlign = 'center';
      } else {
        ctx.fillText(lines[k], f.cx, ys[k]);
      }
    }
  }

  /* يرجّع canvas بالحجم الكامل (300 dpi) */
  window.renderPermit = function (formId, data) {
    var T = window.TEMPLATES[formId];
    return Promise.all([loadBg(formId), fontReady()]).then(function (r) {
      var img = r[0];
      // الورقة بنفس مقاس صورة الورد بالبكسل بالظبط (من غير أي تكبير أو تصغير)
      var c = document.createElement('canvas');
      c.width = img.naturalWidth || T.w;
      c.height = img.naturalHeight || T.h;
      var ctx = c.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0);
      Object.keys(T.fields).forEach(function (key) {
        var f = T.fields[key];
        if (key === 'appNo') {
          f = { cx: f.cx, by: f.by - f.size * 0.08, size: f.size, cell: f.cell };
        }
        drawField(ctx, f, valueFor(key, data));
      });
      return c;
    });
  };

  /* عدد صفوف الأصناف والتوقيعات في كل ورقة */
  window.templateRows = function (formId) {
    var f = window.TEMPLATES[formId].fields, items = 0, sigs = 0;
    Object.keys(f).forEach(function (k) {
      var m = /^items\.(\d+)\.desc$/.exec(k);
      if (m) items = Math.max(items, +m[1] + 1);
      m = /^sigNames\.(\d+)$/.exec(k);
      if (m) sigs = Math.max(sigs, +m[1] + 1);
    });
    return { items: items, sigs: sigs };
  };
})();
