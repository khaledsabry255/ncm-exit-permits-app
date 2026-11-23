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

  /* ============================================================
     مقاس الطباعة جوّه ملف الصورة نفسه (pHYs)
     عشان الصورة تتطبع A4 بالملّي لما تختار «الحجم الفعلي»
     ============================================================ */
  var CRC = (function () {
    var t = new Uint32Array(256);
    for (var n = 0; n < 256; n++) {
      var c = n;
      for (var k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })();
  function crc32(bytes) {
    var c = 0xFFFFFFFF;
    for (var i = 0; i < bytes.length; i++) c = CRC[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }

  window.pngWithDpi = function (pngB64, dpi) {
    var png = b64ToBytes(pngB64);
    var ppm = Math.round(dpi / 0.0254);
    var chunk = new Uint8Array(21);
    var v = new DataView(chunk.buffer);
    v.setUint32(0, 9);
    chunk.set([0x70, 0x48, 0x59, 0x73], 4);      // pHYs
    v.setUint32(8, ppm);
    v.setUint32(12, ppm);
    chunk[16] = 1;                               // الوحدة: متر
    v.setUint32(17, crc32(chunk.subarray(4, 17)));
    // بعد التوقيع (8) والـ IHDR (25)
    var out = new Uint8Array(png.length + 21);
    out.set(png.subarray(0, 33), 0);
    out.set(chunk, 33);
    out.set(png.subarray(33), 54);
    return window.bytesToB64(out);
  };

  window.bytesToB64 = function (bytes) {
    var s = '', step = 0x8000;
    for (var i = 0; i < bytes.length; i += step) {
      s += String.fromCharCode.apply(null, bytes.subarray(i, i + step));
    }
    return btoa(s);
  };
})();
