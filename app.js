/* ============================================================
   تصاريح الخروج — الشاشات والإدخال والحفظ
   ============================================================ */

(function () {
  'use strict';

  /* خط الورد للكتابة على الورقة */
  var fst = document.createElement('style');
  fst.textContent = window.FONT_CSS || '';
  document.head.appendChild(fst);

  var $ = function (id) { return document.getElementById(id); };
  var el = {
    back: $('btn-back'), title: $('title'),
    home: $('screen-home'), form: $('screen-form'), prev: $('screen-preview'),
    wrap: $('sheet-wrap'), actForm: $('actions-form'), actPrev: $('actions-preview'),
    toast: $('toast'), next: $('btn-next'), nextLabel: $('next-label')
  };
  var state = { screen: 'home', form: null, data: null, canvas: null, busy: false,
                saved: false, claimed: null, formSeq: 0 };

  var ICONS = {
    doc: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
    truck: '<path d="M2 7h12v9H2zM14 10h4.5l3.5 3.5V16h-8z"/><circle cx="6.5" cy="17.5" r="2"/><circle cx="17.5" cy="17.5" r="2"/>',
    drop: '<path d="M12 3s6.5 6.6 6.5 11.2a6.5 6.5 0 0 1-13 0C5.5 9.6 12 3 12 3z"/><path d="M9 15a3 3 0 0 0 3 3"/>',
    bin: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    reject: '<circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/>',
    wrench: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3.5 17.5a2.1 2.1 0 0 0 3 3l5.8-5.8a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/>',
    done: '<circle cx="12" cy="12" r="9"/><path d="M8 12.4l2.8 2.8L16.2 9.8"/>'
  };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  var NL = String.fromCharCode(10);   // سطر جديد جوّه خانة واحدة

  /* أي رقم عربي (٠-٩ أو ۰-۹) يتحوّل إنجليزي 0-9 */
  var AR_DIGITS = /[٠-٩۰-۹]/g;
  function toEn(v) {
    return String(v == null ? '' : v).replace(AR_DIGITS, function (c) {
      var n = c.charCodeAt(0);
      return String(n >= 0x06F0 ? n - 0x06F0 : n - 0x0660);
    });
  }
  function enDeep(o) {
    if (typeof o === 'string') return toEn(o);
    if (Array.isArray(o)) return o.map(enDeep);
    if (o && typeof o === 'object') {
      var r = {};
      Object.keys(o).forEach(function (k) { r[k] = enDeep(o[k]); });
      return r;
    }
    return o;
  }
  function fmtDate(iso) {
    var p = splitISO(iso);
    return p ? p.d + ' / ' + p.m + ' / ' + p.y : '';
  }
  function esc(v) {
    return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/"/g, '&quot;')
      .replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function toast(msg) {
    el.toast.textContent = msg;
    el.toast.classList.add('on');
    clearTimeout(el.toast._t);
    el.toast._t = setTimeout(function () { el.toast.classList.remove('on'); }, 2200);
  }
  function todayISO() {
    var d = new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  function pad(n) { n = String(n); return n.length < 2 ? '0' + n : n; }
  function splitISO(iso) {
    var m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(iso || '');
    return m ? { y: m[1], m: pad(m[2]), d: pad(m[3]) } : null;
  }

  /* ============================================================
     الرئيسية
     ============================================================ */
  function renderHome() {
    var permits = window.FORMS.filter(function (f) { return f.kind !== 'decl'; });
    var decls = window.FORMS.filter(function (f) { return f.kind === 'decl'; });
    var n = 0;
    function tile(f, label, wide) {
      return '<button class="tile rise' + (wide ? ' wide' : '') + '" data-id="' + f.id + '" style="--c:' + f.color +
        ';animation-delay:' + (n++ * 70) + 'ms">' +
        '<span class="ico"><svg viewBox="0 0 24 24">' + ICONS[f.icon] + '</svg></span>' +
        '<span class="tt"><span class="k">' + label + '</span><span class="n">' + f.short + '</span></span>' +
        '</button>';
    }
    var h = '<div class="hero rise"><img src="logo.png" alt="NCM"></div>';
    h += '<h2 class="sect-h rise" style="animation-delay:' + (n++ * 70) + 'ms">تصاريح الخروج</h2>';
    h += '<div class="grid permits">';
    permits.forEach(function (f) { h += tile(f, 'تصريح خروج'); });
    h += '</div>';
    if (decls.length) {
      h += '<h2 class="sect-h rise" style="animation-delay:' + (n * 70) + 'ms">الإقرارات</h2>';
      h += '<div class="grid decls">';
      decls.forEach(function (f) { h += tile(f, 'إقرار تصريح خروج', true); });
      h += '</div>';
    }
    // التوقيع
    h += '<div class="credit rise" style="animation-delay:' + (n * 70) + 'ms">' +
      '<span class="credit-by">Designed by</span>' +
      '<span class="credit-sig">' +
      '<span class="credit-name">KHALED SABRY</span></span></div>';
    el.home.innerHTML = h;
    Array.prototype.forEach.call(el.home.querySelectorAll('.tile'), function (b) {
      b.addEventListener('click', function () { openForm(b.getAttribute('data-id')); });
    });
  }

  /* ============================================================
     رقم التصريح: سجل بآخر رقم اتعمل في كل نوع لوحده

     لو sync.js موجود (جوّه الـ APK): السجل مشترك بين كل الموبايلات —
     الرقم بيتقرا من السيرفر أول ما التصريح يتفتح ، وبيترسل لما الورقة تتحفظ.
     مفيش نت = الخانة تفضل فاضية واللي شغال يكتب الرقم بإيده (طلب خالد).
     من غير sync.js: كل موبايل بيعدّ لوحده من localStorage.
     ============================================================ */
  var LS_LASTNO = 'exitpermit.lastNo.';
  var LS_PEND = 'exitpermit.pending';
  var SY = (window.SYNC && window.SYNC.url && window.SYNC.key) ? window.SYNC : null;

  // بيزوّد واحد على آخر رقم في النص ، والأصفار اللي قدامه زي ما هي (001 ← 002)
  function bumpNo(s) {
    var m = toEn(String(s == null ? '' : s).trim()).match(/^(.*?)(\d+)(\D*)$/);
    if (!m) return '';
    var n = String(Number(m[2]) + 1);
    while (n.length < m[2].length) n = '0' + n;
    return m[1] + n + m[3];
  }

  // قيمة الرقم نفسه للمقارنة (نفس الجزء اللي bumpNo بيزوّده)
  function noVal(s) {
    var m = toEn(String(s == null ? '' : s).trim()).match(/^(.*?)(\d+)(\D*)$/);
    return m ? Number(m[2]) : null;
  }

  function startNoOf(f) { return f.startNo == null ? '' : String(f.startNo); }

  function nextNoFor(f) {
    if (f.kind === 'decl') return '';            // الإقرارات ملهاش أرقام
    var last = null;
    try { last = localStorage.getItem(LS_LASTNO + f.id); } catch (e) {}
    if (last === null || last === '') return startNoOf(f);
    return bumpNo(last);
  }

  /* ---------- الكلام مع السيرفر ---------- */
  function syncCall(fn, body) {
    return new Promise(function (resolve, reject) {
      var over = false;
      var t = setTimeout(function () { if (!over) { over = true; x.abort(); reject(new Error('timeout')); } }, 7000);
      var x = new XMLHttpRequest();
      x.open('POST', SY.url + '/rest/v1/rpc/' + fn, true);
      x.setRequestHeader('apikey', SY.key);
      x.setRequestHeader('Authorization', 'Bearer ' + SY.key);
      x.setRequestHeader('Content-Type', 'application/json');
      x.onload = function () {
        if (over) return;
        over = true; clearTimeout(t);
        if (x.status >= 200 && x.status < 300) {
          try { resolve(JSON.parse(x.responseText)); } catch (e) { resolve(null); }
        } else { reject(new Error('http ' + x.status)); }
      };
      x.onerror = function () { if (!over) { over = true; clearTimeout(t); reject(new Error('net')); } };
      x.send(JSON.stringify(body));
    });
  }

  /* أرقام اتعملت والنت كان قاطع — بتتبعت أول ما النت يرجع */
  function pendList() { try { return JSON.parse(localStorage.getItem(LS_PEND) || '[]'); } catch (e) { return []; } }
  function pendSave(a) { try { localStorage.setItem(LS_PEND, JSON.stringify(a.slice(-20))); } catch (e) {} }
  function pendAdd(form, no) { var a = pendList(); a.push([form, no]); pendSave(a); }
  function pendFlush() {
    var a = pendList();
    if (!SY || !a.length) return Promise.resolve();
    pendSave([]);
    return a.reduce(function (p, it) {
      return p.then(function () { return syncCall('exitp_no_used', { p_form: it[0], p_no: it[1] }); })
        .catch(function () { pendAdd(it[0], it[1]); });
    }, Promise.resolve());
  }

  var claimWait = Promise.resolve();   // آخر رقم اتبعت لسه في السكة

  // الرقم ده اتعمل — التصريح اللي بعده ياخد اللي بعده
  function rememberNo() {
    var f = state.form;
    if (!f || f.kind === 'decl') return;
    var no = toEn(String(state.data.appNo || '').trim());
    if (!/\d/.test(no)) return;
    state.claimed = no;
    try { localStorage.setItem(LS_LASTNO + f.id, no); } catch (e) {}
    if (!SY) return;
    claimWait = syncCall('exitp_no_used', { p_form: f.id, p_no: no })
      .catch(function () { pendAdd(f.id, no); });
  }

  // بيجيب الرقم من السجل المشترك ويحطه في الخانة (الفورم بيفضل شغال طول الوقت)
  function fillSharedNo(f, seq) {
    claimWait.then(pendFlush).then(function () {
      return syncCall('exitp_no_get', { p_form: f.id });
    }).then(function (last) {
      if (seq !== state.formSeq || state.form !== f) return;
      var no = (last === null || last === undefined || last === '') ? startNoOf(f) : bumpNo(String(last));
      if (String(state.data.appNo || '').trim()) return;   // كتب رقم بإيده قبل ما الرد يوصل
      state.data.appNo = no;
      var inp = el.form.querySelector('[data-k="appNo"]');
      if (inp && !inp.value) inp.value = no;
      // لو كان سابق الرد وفتح الورقة ، تترسم تاني بالرقم
      if (state.screen === 'preview') { updateNextBtn(); renderPreview(); }
    }).catch(function () {
      if (seq !== state.formSeq || state.form !== f) return;
      toast('مفيش نت — اكتب رقم التصريح بإيدك');
    });
  }

  // قبل ما الورقة تتعرض: لو حد تاني اخد الرقم ده ، الرقم بيتصحّح
  function refreshNoIfTaken() {
    var f = state.form;
    if (!SY || !f || f.kind === 'decl' || state.saved) return;
    var no = toEn(String(state.data.appNo || '').trim());
    if (!/\d/.test(no) || no === state.claimed) return;
    var seq = state.formSeq;
    syncCall('exitp_no_get', { p_form: f.id }).then(function (last) {
      if (seq !== state.formSeq || state.form !== f || state.saved) return;
      if (last === null || last === undefined || last === '') return;
      var mine = noVal(no), theirs = noVal(String(last));
      if (mine === null || theirs === null || mine > theirs) return;
      var fixed = bumpNo(String(last));
      if (!fixed || fixed === state.data.appNo) return;
      state.data.appNo = fixed;
      var inp = el.form.querySelector('[data-k="appNo"]');
      if (inp) inp.value = fixed;
      toast('رقم ' + no + ' اتاخد — بقى ' + fixed);
      if (state.screen === 'preview') { updateNextBtn(); renderPreview(); }
    }).catch(function () {});
  }

  /* ============================================================
     الفورم — كل تصريح بيبدأ جديد من بياناته الثابتة
     ============================================================ */
  function openForm(id) {
    var f = window.FORMS.filter(function (x) { return x.id === id; })[0];
    state.form = f;
    state.formSeq = (state.formSeq || 0) + 1;
    state.claimed = null;
    state.data = {
      // السجل المشترك: الخانة بتفضل فاضية لحد ما الرقم يوصل من السيرفر
      appNo: SY ? '' : nextNoFor(f),
      date: todayISO(),
      unloadPlace: f.unloadPlace,
      purpose: f.purpose,
      items: clone(f.items),
      driver: clone(fixedDriver(f)),
      sigTitles: clone(f.sigTitles || [])
    };
    state.rows = 1; // التصريح العام والإقرارات بيبدأوا بصنف واحد
    state.saved = false;
    document.body.style.setProperty('--c', f.color);
    renderForm();
    show('form');
    if (SY && f.kind !== 'decl') fillSharedNo(f, state.formSeq);
  }

  function field(label, key, value, opts) {
    opts = opts || {};
    var attrs = ' data-k="' + key + '" enterkeyhint="next"';
    if (opts.mode) attrs += ' inputmode="' + opts.mode + '"';
    if (opts.list) attrs += ' list="' + opts.list + '"';
    if (opts.ltr) attrs += ' class="ltr"';
    var input;
    if (opts.type === 'date') {
      // التقويم بتاع الموبايل بيكتب بأرقام عربي، فاحنا اللي بنعرض التاريخ بأرقام إنجليزي
      return '<div class="f"><label>' + label + '</label><div class="datebox">' +
        '<span class="dv">' + fmtDate(value) + '</span>' +
        '<input type="date" value="' + esc(value) + '"' + attrs + '></div></div>';
    }
    if (opts.area) {
      input = '<textarea rows="2"' + attrs + '>' + esc(value) + '</textarea>';
    } else {
      input = '<input type="' + (opts.type || 'text') + '" value="' + esc(value) + '"' +
        ' autocomplete="off"' + attrs + '>';
      // وحدة ثابتة جنب الرقم (زي KG) — بتتكتب لوحدها على الورقة
      if (opts.suffix) input = '<div class="sfx">' + input + '<span>' + opts.suffix + '</span></div>';
    }
    return '<div class="f' + (opts.big ? ' big' : '') + (opts.narrow ? ' narrow' : '') + '"><label>' +
      label + '</label>' + input + '</div>';
  }

  function card(title, body, delay) {
    return '<div class="card rise" style="animation-delay:' + delay + 'ms">' +
      '<div class="card-h">' + title + '</div>' + body + '</div>';
  }

  function driverCard(d, delay) {
    var dr = d.driver;
    return card('السائق والعربية',
      // التصريح العام: السائق بيتكتب بإيد اللي شغال عليه ، من غير أسماء السواقين الثابتين
      field('اسم السائق رباعي', 'driver.name', dr.name, state.form.fixed ? { list: 'drivers' } : {}) +
      field('الرقم القومي', 'driver.id', dr.id, { mode: 'numeric', ltr: true }) +
      '<div class="row">' +
        field('نوع المركبة', 'driver.brand', dr.brand) +
        field('اللون / الموديل', 'driver.color', dr.color) +
      '</div>' +
      '<div class="row">' +
        field('رقم المركبة', 'driver.tractor', dr.tractor) +
        field('رقم المقطورة', 'driver.trailer', dr.trailer) +
      '</div>' +
      field('تليفون السائق', 'driver.phone', dr.phone, { mode: 'tel', ltr: true }) +
      (state.form.fixed ?
        '<button type="button" class="addrow savefixed" id="btn-save-fixed"' +
        (sameDriver(dr, fixedDriver(state.form)) ? ' hidden' : '') + '>' +
        '<svg viewBox="0 0 24 24"><path d="M5 12l5 5L20 7"/></svg>حفظ كسائق ثابت</button>' : ''),
      delay);
  }

  /* ============================================================
     السواقين الثابتين: الأصلي جوّه الـ APK (drivers.js)
     ولو اتغيّر من التطبيق بيتحفظ على الموبايل ويبقى هو الثابت
     ============================================================ */
  var LS_FIXED = 'exitpermit.fixed.';
  var DRIVER_KEYS = ['name', 'id', 'brand', 'color', 'tractor', 'trailer', 'phone'];

  function fixedDriver(f) {
    try {
      var s = localStorage.getItem(LS_FIXED + f.id);
      if (s) return JSON.parse(s);
    } catch (e) {}
    return f.driver;
  }
  function sameDriver(a, b) {
    return DRIVER_KEYS.every(function (k) { return String(a[k] || '').trim() === String(b[k] || '').trim(); });
  }
  function saveFixed() {
    var d = {};
    DRIVER_KEYS.forEach(function (k) { d[k] = toEn(String(state.data.driver[k] || '').trim()); });
    try {
      localStorage.setItem(LS_FIXED + state.form.id, JSON.stringify(d));
    } catch (e) {
      toast('مش قادر يحفظ');
      return;
    }
    var b = $('btn-save-fixed');
    if (b) b.hidden = true;
    toast('اتحفظ كسائق ثابت');
  }

  function knownDrivers() {
    var seen = {}, list = [];
    window.FORMS.forEach(function (f) {
      [fixedDriver(f), f.driver].forEach(function (dr) {
        if (dr.name && !seen[dr.name]) { seen[dr.name] = 1; list.push(dr); }
      });
    });
    return list;
  }

  /* quiet: من غير ما الصناديق تتحرك تاني (بعد إضافة/حذف صنف) ، newRow: الصف اللي لسه ضايفه */
  function delBtn(i) {
    return '<button type="button" class="item-del" data-del="' + i + '" aria-label="حذف">' +
      '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>';
  }
  function addBtn() {
    return '<button type="button" class="addrow" id="btn-add-row">' +
      '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>إضافة صنف</button>';
  }

  // الوظايف اللي بتوقّع تحت التصريح: مكتوبة جاهزة وتتعدّل لو احتاج
  function sigCard(d, delay) {
    var h = '';
    (d.sigTitles || []).forEach(function (t, i) {
      h += '<div class="item" data-sig="' + i + '">' +
        '<div class="item-top"><span class="item-no">' + (i + 1) + '</span></div>' +
        field('الوظيفة', 'sigTitles.' + i + '.ar', t.ar) +
        field('بالإنجليزي', 'sigTitles.' + i + '.en', t.en, { ltr: true }) +
        '</div>';
    });
    return h ? card('التوقيعات', h, delay) : '';
  }

  function renderForm(quiet, newRow) {
    var f = state.form, d = state.data, h = '';

    if (f.kind === 'decl') {
      // الإقرار: التاريخ + الأصناف + السائق بس
      h += card('الإقرار', field('التاريخ', 'date', d.date, { type: 'date' }), 0);
      var its = '';
      d.items.slice(0, state.rows).forEach(function (it, i) {
        its += '<div class="item' + (i === newRow ? ' pop' : '') + '" data-item="' + i + '">' +
          '<div class="item-top"><span class="item-no">' + (i + 1) + '</span>' + (i > 0 ? delBtn(i) : '') + '</div>' +
          field('الصنف', 'items.' + i + '.desc', it.desc) +
          '</div>';
      });
      if (state.rows < d.items.length) its += addBtn();
      h += card('الأصناف', its, 70);
      h += card('السائق',
        // الإقرار: السائق بيتكتب بالإيد ، من غير أسماء السواقين الثابتين
        field('اسم السائق', 'driver.name', d.driver.name) +
        field('الرقم القومي', 'driver.id', d.driver.id, { mode: 'numeric', ltr: true }) +
        field('رقم السيارة', 'driver.car', d.driver.car), 140);
    } else if (f.fixed) {
      h += card('التصريح',
        field('رقم التصريح', 'appNo', d.appNo, { mode: 'numeric', big: true }) +
        '<div class="row">' +
          field('التاريخ', 'date', d.date, { type: 'date' }) +
          field('العدد / الكمية', 'items.0.qty', d.items[0].qty, { mode: 'decimal', suffix: 'kg' }) +
        '</div>', 0);
      h += driverCard(d, 70);
      h += card('الحمولة',
        field('الصنف', 'items.0.desc', d.items[0].desc) +
        field('ملاحظة', 'items.0.note', d.items[0].note, { area: true }) +
        field('مكان التفريغ', 'unloadPlace', d.unloadPlace) +
        field('غرض الخروج', 'purpose', d.purpose), 140);
      h += sigCard(d, 210);
    } else {
      h += card('التصريح',
        field('رقم التصريح', 'appNo', d.appNo, { mode: 'numeric', big: true }) +
        field('التاريخ', 'date', d.date, { type: 'date' }) +
        field('مكان التفريغ', 'unloadPlace', d.unloadPlace) +
        field('غرض الخروج', 'purpose', d.purpose), 0);

      // بيظهر بس الصفوف اللي بتكتب فيها ، والورقة بتطلع بنفس العدد
      var items = '';
      d.items.slice(0, state.rows).forEach(function (it, i) {
        items += '<div class="item' + (i === newRow ? ' pop' : '') + '" data-item="' + i + '">' +
          '<div class="item-top"><span class="item-no">' + (i + 1) + '</span>' +
          (i > 0 ? '<button type="button" class="item-del" data-del="' + i + '" aria-label="حذف">' +
            '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' : '') +
          '</div>' +
          field('الصنف', 'items.' + i + '.desc', it.desc) +
          '<div class="row">' +
            field('العدد', 'items.' + i + '.qty', it.qty, { narrow: true }) +
            '<div class="f wide"><label>الخروج</label><div class="seg" data-i="' + i + '">' +
              '<button type="button" data-v="noreturn"' + (it.mode === 'noreturn' ? ' class="on"' : '') + '>بدون عودة</button>' +
              '<button type="button" data-v="return"' + (it.mode === 'return' ? ' class="on"' : '') + '>عودة</button>' +
            '</div></div>' +
          '</div>' +
          '<div class="reveal' + (it.mode === 'return' ? ' on' : '') + '" data-ret="' + i + '">' +
            field('تاريخ العودة', 'items.' + i + '.retDate', it.retDate) +
          '</div>' +
          field('ملاحظة', 'items.' + i + '.note', it.note) +
          '</div>';
      });
      if (state.rows < d.items.length) {
        items += '<button type="button" class="addrow" id="btn-add-row">' +
          '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>إضافة صنف</button>';
      }
      h += card('الأصناف', items, 70);
      h += driverCard(d, 140);
      h += sigCard(d, 210);
    }

    // قائمة السواقين الثابتين للتلاتة الثابتين بس
    if (f.fixed) h += '<datalist id="drivers">' + knownDrivers().map(function (dr) {
      return '<option value="' + esc(dr.name) + '">';
    }).join('') + '</datalist>';

    el.form.classList.toggle('quiet', !!quiet);
    el.form.innerHTML = h;
    bindForm();
  }

  function emptyItem() { return { desc: '', qty: '', mode: '', retDate: '', note: '' }; }

  function addRow() {
    if (state.rows >= state.data.items.length) return;
    state.saved = false;
    state.rows++;
    var y = window.scrollY;
    renderForm(true, state.rows - 1);
    window.scrollTo(0, y);
    var box = el.form.querySelector('[data-item="' + (state.rows - 1) + '"]');
    if (box) {
      box.scrollIntoView({ behavior: 'smooth', block: 'center' });
      var first = box.querySelector('input');
      if (first) setTimeout(function () { first.focus(); }, 250);
    }
  }

  // حذف صف: اللي بعده بيطلع مكانه
  function delRow(i) {
    state.saved = false;
    state.data.items.splice(i, 1);
    state.data.items.push(emptyItem());
    state.rows--;
    var y = window.scrollY;
    renderForm(true);
    window.scrollTo(0, y);
  }

  function refreshSaveFixed() {
    var b = $('btn-save-fixed');
    if (b) b.hidden = sameDriver(state.data.driver, fixedDriver(state.form));
  }

  function setPath(obj, path, val) {
    var p = path.split('.'), o = obj;
    for (var i = 0; i < p.length - 1; i++) o = o[p[i]];
    o[p[p.length - 1]] = val;
  }

  function bindForm() {
    var inputs = Array.prototype.slice.call(el.form.querySelectorAll('[data-k]'));

    inputs.forEach(function (inp, idx) {
      inp.addEventListener('input', function () {
        if (AR_DIGITS.test(inp.value)) {
          AR_DIGITS.lastIndex = 0;
          var pos = inp.selectionStart;
          inp.value = toEn(inp.value);
          try { inp.setSelectionRange(pos, pos); } catch (e) {}
        }
        AR_DIGITS.lastIndex = 0;
        state.saved = false;
        setPath(state.data, inp.getAttribute('data-k'), inp.value);
        if (inp.type === 'date') {
          inp.parentNode.querySelector('.dv').textContent = fmtDate(inp.value);
        }
        if (inp.getAttribute('data-k').indexOf('driver.') === 0) refreshSaveFixed();
      });
      inp.addEventListener('change', function () {
        if (inp.type === 'date') inp.parentNode.querySelector('.dv').textContent = fmtDate(inp.value);
      });
      // Enter = الخانة اللي بعدها
      inp.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' || inp.tagName === 'TEXTAREA') return;
        e.preventDefault();
        var next = inputs[idx + 1];
        if (next) next.focus(); else inp.blur();
      });
    });

    // اختيار سائق معروف من القائمة بيملا باقي بياناته
    var nameInp = el.form.querySelector('[data-k="driver.name"][list]');
    if (nameInp) nameInp.addEventListener('change', function () {
      var hit = knownDrivers().filter(function (x) { return x.name === nameInp.value.trim(); })[0];
      if (!hit) return;
      // في الإقرار «رقم السيارة» = رقم المركبة بتاع السائق
      var map = state.form.kind === 'decl' ? { id: 'id', car: 'tractor' } :
        { id: 'id', brand: 'brand', color: 'color', tractor: 'tractor', phone: 'phone' };
      Object.keys(map).forEach(function (k) {
        state.data.driver[k] = hit[map[k]];
        var box = el.form.querySelector('[data-k="driver.' + k + '"]');
        if (box) box.value = hit[map[k]];
      });
      refreshSaveFixed();
    });

    // زرار «حفظ كسائق ثابت» بيظهر بس لما بيانات السائق تختلف عن الثابت
    var sf = $('btn-save-fixed');
    if (sf) sf.addEventListener('click', saveFixed);

    var add = document.getElementById('btn-add-row');
    if (add) add.addEventListener('click', addRow);
    Array.prototype.forEach.call(el.form.querySelectorAll('.item-del'), function (b) {
      b.addEventListener('click', function () { delRow(+b.getAttribute('data-del')); });
    });

    Array.prototype.forEach.call(el.form.querySelectorAll('.seg'), function (seg) {
      var i = +seg.getAttribute('data-i');
      Array.prototype.forEach.call(seg.querySelectorAll('button'), function (b) {
        b.addEventListener('click', function () {
          var it = state.data.items[i];
          state.saved = false;
          it.mode = it.mode === b.getAttribute('data-v') ? '' : b.getAttribute('data-v');
          Array.prototype.forEach.call(seg.querySelectorAll('button'), function (x) {
            x.classList.toggle('on', x.getAttribute('data-v') === it.mode);
          });
          el.form.querySelector('[data-ret="' + i + '"]').classList.toggle('on', it.mode === 'return');
        });
      });
    });
  }

  /* ============================================================
     الورقة
     ============================================================ */
  function sheetData() {
    var f = state.form, d = state.data, dt = splitISO(d.date) || { d: '', m: '', y: '' };
    if (f.kind === 'decl') {
      return enDeep({
        dateD: dt.d, dateM: dt.m, dateY: dt.y,
        items: d.items.map(function (it) { return { desc: it.desc }; }),
        driver: { name: d.driver.name, id: d.driver.id, car: d.driver.car }
      });
    }
    var items = d.items.map(function (it) {
      if (f.fixed) {
        // التلاتة الثابتين: الكمية بالكيلو — kg بتتكتب بعد الرقم لوحدها (زي الورق المطبوع)
        var q = String(it.qty || '').trim().replace(/\s*k\.?g\.?$/i, '').replace(/\s*كيلو(جرام)?$/, '').trim();
        return Object.assign({}, it, { qty: q ? q + ' kg' : '' });
      }
      return {
        desc: it.desc, qty: it.qty, note: it.note,
        // الخانة اللي متختارتش بيتكتب فيها × (يعني مفيش): بدون عودة ← × في «عودة» و«تاريخ العودة»
        noReturn: it.mode === 'noreturn' ? 'بدون عودة' : it.mode === 'return' ? '×' : '',
        ret: it.mode === 'return' ? 'عودة' : it.mode === 'noreturn' ? '×' : '',
        // تاريخ العودة بيتكتب زي ما هو (تاريخ أو أي كلام)
        retDate: it.mode === 'return' ? String(it.retDate || '').trim() : it.mode === 'noreturn' ? '×' : ''
      };
    });
    return enDeep({
      appNo: d.appNo, dateD: dt.d, dateM: dt.m, dateY: dt.y,
      unloadPlace: d.unloadPlace, purpose: d.purpose,
      items: items, driver: d.driver, sigNames: [],
      // سطر عربي وسطر إنجليزي في نفس الخانة ، واللي يتساب فاضي مبيتكتبش
      sigTitles: (d.sigTitles || []).map(function (t) {
        return [String(t.ar || '').trim(), String(t.en || '').trim()]
          .filter(function (x) { return x; }).join(NL);
      })
    });
  }

  /* الورقة اللي هتطلع: التصريح العام بعدد الصفوف اللي اتكتبت بس (من الورد نفسه)
     والصفحة كلها زي ما هي ، الصفوف الزيادة بس هي اللي مش موجودة */
  function sheetId() {
    var id = state.form.id;
    var multi = id === 'general' || state.form.kind === 'decl';
    if (multi && state.rows < 4 && window.TEMPLATES[id + state.rows]) {
      return id + state.rows;
    }
    return id;
  }

  function renderPreview() {
    state.canvas = null;
    viewer.cv = null;
    el.wrap.innerHTML = '<div class="loading"><div class="spin"></div></div>';
    var formId = state.form.id, id = sheetId();
    window.renderPermit(id, sheetData()).then(function (c) {
      if (state.screen !== 'preview' || state.form.id !== formId) return;
      state.sheetId = id;
      state.canvas = c;            // النسخة الكاملة (400 dpi) — دي اللي بتتحفظ
      // نسخة للعرض بس: الورقة الكاملة أعرض من اللي كارت الشاشة في موبايلات كتير يقدر يعرضه
      var k = Math.min(1, 3200 / c.width);
      var pv = document.createElement('canvas');
      pv.width = Math.round(c.width * k);
      pv.height = Math.round(c.height * k);
      var px = pv.getContext('2d');
      px.imageSmoothingEnabled = true;
      px.imageSmoothingQuality = 'high';
      px.drawImage(c, 0, 0, pv.width, pv.height);
      el.wrap.innerHTML = '';
      el.wrap.appendChild(pv);
      viewerReset(pv);
    }).catch(function () {
      el.wrap.innerHTML = '';
      toast('حصلت مشكلة في تجهيز الورقة');
    });
  }

  /* ============================================================
     عارض الصورة: التكبير جوّه المعاينة بس (التطبيق نفسه ميتكبّرش)
     صباعين = تكبير وتصغير ، صباع واحد = تحريك ، لمستين = تكبير / رجوع
     ============================================================ */
  var viewer = { cv: null, s: 1, tx: 0, ty: 0, fw: 0, fh: 0, pts: {}, last: null, tap: null };
  var MAX_ZOOM = 5;

  function viewerReset(cv) {
    viewer.cv = cv;
    var W = el.wrap.clientWidth, H = el.wrap.clientHeight;
    var ar = cv.width / cv.height;
    viewer.fw = Math.min(W, H * ar);
    viewer.fh = viewer.fw / ar;
    cv.style.width = viewer.fw + 'px';
    cv.style.height = viewer.fh + 'px';
    viewer.s = 1;
    viewer.pts = {};
    viewerClamp();
  }
  function viewerClamp() {
    var W = el.wrap.clientWidth, H = el.wrap.clientHeight;
    var w = viewer.fw * viewer.s, h = viewer.fh * viewer.s;
    viewer.tx = w <= W ? (W - w) / 2 : Math.min(0, Math.max(W - w, viewer.tx));
    viewer.ty = h <= H ? (H - h) / 2 : Math.min(0, Math.max(H - h, viewer.ty));
    if (viewer.cv) {
      viewer.cv.style.transform = 'translate(' + viewer.tx + 'px,' + viewer.ty + 'px) scale(' + viewer.s + ')';
    }
  }
  function viewerZoomAt(px, py, s1) {
    s1 = Math.max(1, Math.min(MAX_ZOOM, s1));
    var k = s1 / viewer.s;
    viewer.tx = px - (px - viewer.tx) * k;
    viewer.ty = py - (py - viewer.ty) * k;
    viewer.s = s1;
    viewerClamp();
  }
  function localPoint(e) {
    var r = el.wrap.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }
  function twoPoints() {
    var ids = Object.keys(viewer.pts);
    return ids.length >= 2 ? [viewer.pts[ids[0]], viewer.pts[ids[1]]] : null;
  }

  el.wrap.addEventListener('pointerdown', function (e) {
    if (!viewer.cv) return;
    try { el.wrap.setPointerCapture(e.pointerId); } catch (err) {}
    viewer.pts[e.pointerId] = localPoint(e);
    var two = twoPoints();
    viewer.last = two ? {
      d: Math.hypot(two[0].x - two[1].x, two[0].y - two[1].y),
      mx: (two[0].x + two[1].x) / 2, my: (two[0].y + two[1].y) / 2
    } : { mx: viewer.pts[e.pointerId].x, my: viewer.pts[e.pointerId].y };
  });
  el.wrap.addEventListener('pointermove', function (e) {
    if (!viewer.cv || !viewer.pts[e.pointerId]) return;
    viewer.pts[e.pointerId] = localPoint(e);
    var two = twoPoints();
    if (two) {
      var d = Math.hypot(two[0].x - two[1].x, two[0].y - two[1].y);
      var mx = (two[0].x + two[1].x) / 2, my = (two[0].y + two[1].y) / 2;
      if (viewer.last && viewer.last.d) {
        viewer.tx += mx - viewer.last.mx;
        viewer.ty += my - viewer.last.my;
        viewerZoomAt(mx, my, viewer.s * d / viewer.last.d);
      }
      viewer.last = { d: d, mx: mx, my: my };
    } else if (viewer.last) {
      var p = viewer.pts[e.pointerId];
      viewer.tx += p.x - viewer.last.mx;
      viewer.ty += p.y - viewer.last.my;
      viewer.last = { mx: p.x, my: p.y };
      viewerClamp();
    }
  });
  function pointerEnd(e) {
    if (!viewer.pts[e.pointerId]) return;
    var p = viewer.pts[e.pointerId];
    var wasSingle = Object.keys(viewer.pts).length === 1;
    delete viewer.pts[e.pointerId];
    var rest = Object.keys(viewer.pts);
    viewer.last = rest.length ? { mx: viewer.pts[rest[0]].x, my: viewer.pts[rest[0]].y } : null;
    // لمستين ورا بعض = تكبير عند المكان ، أو رجوع للحجم الطبيعي
    if (wasSingle && e.type === 'pointerup') {
      var now = Date.now();
      if (viewer.tap && now - viewer.tap.t < 320 && Math.hypot(p.x - viewer.tap.x, p.y - viewer.tap.y) < 30) {
        viewerZoomAt(p.x, p.y, viewer.s > 1.05 ? 1 : 2.5);
        viewer.tap = null;
      } else {
        viewer.tap = { t: now, x: p.x, y: p.y };
      }
    }
  }
  el.wrap.addEventListener('pointerup', pointerEnd);
  el.wrap.addEventListener('pointercancel', pointerEnd);
  // عجلة الماوس (للتجربة على الكمبيوتر)
  el.wrap.addEventListener('wheel', function (e) {
    if (!viewer.cv) return;
    e.preventDefault();
    var p = localPoint(e);
    viewerZoomAt(p.x, p.y, viewer.s * (e.deltaY < 0 ? 1.15 : 1 / 1.15));
  }, { passive: false });
  window.addEventListener('resize', function () {
    if (state.screen === 'preview' && viewer.cv) viewerReset(viewer.cv);
  });

  /* للاختبار من الكمبيوتر */
  window.__viewer = viewer;
  window.__viewerZoomAt = viewerZoomAt;

  // اسم الملف: نوع الورقة + الرقم + التاريخ — من غير أي علامة الموبايل يرفضها في اسم ملف (زي / في الرقم)
  function fileName(ext) {
    var dt = splitISO(state.data.date);
    var no = toEn(String(state.data.appNo || '').trim()).replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, '_');
    return state.form.name.replace(/\s+/g, '_') + (no ? '_' + no : '') +
      (dt ? '_' + dt.y + '-' + dt.m + '-' + dt.d : '') + '.' + ext;
  }

  function deliver(b64, name, mime) {
    if (window.AndroidBridge && window.AndroidBridge.saveFile) {
      window.AndroidBridge.saveFile(b64, name, mime);
      return;
    }
    var bin = atob(b64), arr = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    var url = URL.createObjectURL(new Blob([arr], { type: mime }));
    var a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 1500);
    toast('اتحفظ');
  }

  function exportAs(kind) {
    if (state.busy || !state.canvas) return;
    state.busy = true;
    var btn = $(kind === 'pdf' ? 'btn-pdf' : 'btn-png');
    btn.disabled = true;
    function done() { btn.disabled = false; state.busy = false; }
    // الورقة اتحفظت فعلاً: دلوقتي بس الرقم بيتحسب ، والزرار بيبقى على اللي بعده
    function saved() {
      state.saved = true;
      rememberNo();
      if (state.screen === 'preview') updateNextBtn();
    }
    setTimeout(function () {
      try {
        var c = state.canvas, T = window.TEMPLATES[state.sheetId || state.form.id];
        var pt = T.pt || [841.89, 595.28];
        var a4Landscape = Math.abs(pt[0] - 841.9) < 2 && Math.abs(pt[1] - 595.3) < 2;
        if (kind === 'png') {
          deliver(window.pngWithDpi(c.toDataURL('image/png').split(',')[1], T.dpi || 400), fileName('png'), 'image/png');
        } else if (a4Landscape && window.AndroidBridge && window.AndroidBridge.savePdf) {
          // التصاريح: الموبايل بيعمل الـ PDF من الصورة نفسها من غير أي ضغط
          window.AndroidBridge.savePdf(c.toDataURL('image/png').split(',')[1], fileName('pdf'));
        } else {
          // الإقرارات (ورقة طولي): PDF بمقاس ورقة الورد بالظبط ومن غير ضغط
          window.makePdfLossless(c, pt[0], pt[1]).then(function (bytes) {
            deliver(window.bytesToB64(bytes), fileName('pdf'), 'application/pdf');
            saved();
            done();
          }).catch(function () { toast('مش قادر يحفظ'); done(); });
          return;
        }
        saved();
      } catch (e) {
        toast('مش قادر يحفظ');
      }
      done();
    }, 40);
  }

  /* ============================================================
     التنقل
     ============================================================ */
  function show(s) {
    state.screen = s;
    el.home.classList.toggle('on', s === 'home');
    el.form.classList.toggle('on', s === 'form');
    el.prev.classList.toggle('on', s === 'preview');
    el.actForm.classList.toggle('on', s === 'form');
    el.actPrev.classList.toggle('on', s === 'preview');
    document.body.classList.toggle('at-home', s === 'home');
    el.back.classList.toggle('hidden', s === 'home');
    el.title.textContent = s === 'home' ? 'تصاريح الخروج' : state.form.name;
    if (s === 'preview') updateNextBtn();
    if (s === 'home') document.body.style.removeProperty('--c');
    window.scrollTo(0, 0);
  }

  el.back.addEventListener('click', function () {
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    if (state.screen === 'preview') show('form');
    else if (state.screen === 'form') { show('home'); renderHome(); }
  });
  $('btn-preview').addEventListener('click', function () {
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    refreshNoIfTaken();
    show('preview');
    renderPreview();
  });
  /* «تصريح جديد» — بيفتح ورقة جديدة من نفس النوع.
     **الرقم مبيتحسبش غير لما الورقة تتحفظ** (طلب خالد) ، فلو ده لسه متحفظش
     الورقة الجديدة بتاخد نفس الرقم ، ولو اتحفظ بتاخد اللي بعده.
     ولو لسه متحفظش بيستنى لمسة تانية عشان اللي مكتوب ميروحش. */
  function updateNextBtn() {
    var decl = state.form.kind === 'decl';
    var no = decl ? '' : (state.saved ? bumpNo(state.data.appNo) : toEn(String(state.data.appNo || '').trim()));
    el.nextLabel.textContent = (decl ? 'إقرار جديد' : 'تصريح جديد') + (no ? ' رقم ' + no : '');
  }
  var nextArmed = 0;
  el.next.addEventListener('click', function () {
    // اللمسة التانية لازم تكون مقصودة: مش لمستين ورا بعض بالغلط ، ومش بعد وقت طويل
    var gap = Date.now() - nextArmed;
    if (!state.saved && (gap < 400 || gap > 5000)) {
      if (gap > 5000) {
        nextArmed = Date.now();
        toast('لسه متحفظش — دوس تاني لو عايز تبدأ واحد جديد');
      }
      return;
    }
    nextArmed = 0;
    openForm(state.form.id);
  });

  $('btn-png').addEventListener('click', function () { exportAs('png'); });
  $('btn-pdf').addEventListener('click', function () { exportAs('pdf'); });

  /* للاختبار من الكمبيوتر */
  window.__state = state;

  renderHome();
  show('home');
})();
