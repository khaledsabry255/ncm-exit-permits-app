/* ============================================================
   PDF صغير من غير أي مكتبة: صفحة A4 أفقي فيها صورة الورقة
   ============================================================ */

(function () {
  'use strict';

  function b64ToBytes(b64) {
    var bin = atob(b64), out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  /* jpegB64 : الصورة JPEG كـ base64 ، w/h : أبعادها بالبكسل */
  window.makePdf = function (jpegB64, w, h) {
    var jpg = b64ToBytes(jpegB64);
    var PW = 841.89, PH = 595.28; // A4 أفقي بالنقاط
    var chunks = [], size = 0, offsets = [];

    function str(s) {
      var b = new Uint8Array(s.length);
      for (var i = 0; i < s.length; i++) b[i] = s.charCodeAt(i) & 0xff;
      return b;
    }
    function push(b) { if (typeof b === 'string') b = str(b); chunks.push(b); size += b.length; }
    function obj(n, body) { offsets[n] = size; push(n + ' 0 obj\n' + body + '\nendobj\n'); }

    push('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
    obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
    obj(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
    obj(3, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + PW + ' ' + PH + '] ' +
      '/Resources << /XObject << /Im0 4 0 R >> /ProcSet [/PDF /ImageC] >> /Contents 5 0 R >>');

    offsets[4] = size;
    push('4 0 obj\n<< /Type /XObject /Subtype /Image /Width ' + w + ' /Height ' + h +
      ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + jpg.length + ' >>\nstream\n');
    push(jpg);
    push('\nendstream\nendobj\n');

    var content = 'q ' + PW + ' 0 0 ' + PH + ' 0 0 cm /Im0 Do Q';
    obj(5, '<< /Length ' + content.length + ' >>\nstream\n' + content + '\nendstream');

    var xref = size;
    var x = 'xref\n0 6\n0000000000 65535 f \n';
    for (var n = 1; n <= 5; n++) x += ('0000000000' + offsets[n]).slice(-10) + ' 00000 n \n';
    push(x);
    push('trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF\n');

    var out = new Uint8Array(size), pos = 0;
    chunks.forEach(function (c) { out.set(c, pos); pos += c.length; });
    return out;
  };

  window.bytesToB64 = function (bytes) {
    var s = '', step = 0x8000;
    for (var i = 0; i < bytes.length; i += step) {
      s += String.fromCharCode.apply(null, bytes.subarray(i, i + step));
    }
    return btoa(s);
  };
})();
