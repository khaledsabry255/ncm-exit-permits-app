/* ============================================================
   التصاريح الأربعة وبياناتها الثابتة
   (شكل الورقة نفسه جاي من ملف الورد — templates.js)
   ============================================================ */

function driverFor(id) {
  var d = (window.FIXED_DRIVERS || {})[id];
  return d ? JSON.parse(JSON.stringify(d)) :
    { name: '', id: '', brand: '', color: '', tractor: '', trailer: '', phone: '' };
}

window.FORMS = [
  {
    id: 'general',
    short: 'عام',
    name: 'تصريح خروج عام',
    color: '#1f4e79',
    icon: 'doc',
    fixed: false,
    startNo: 1,
    unloadPlace: '',
    purpose: '',
    items: [
      { desc: '', qty: '', mode: '', retDate: '', note: '' },
      { desc: '', qty: '', mode: '', retDate: '', note: '' },
      { desc: '', qty: '', mode: '', retDate: '', note: '' },
      { desc: '', qty: '', mode: '', retDate: '', note: '' }
    ],
    sigTitles: [
      { ar: 'المسؤول عن التحميل', en: 'Waste Removal Officer' },
      { ar: 'مدير الصيانة', en: 'Maintenance Manager' },
      { ar: 'مدير المحطات', en: 'Plants Manager' },
      { ar: 'مسؤول الامن', en: 'Security Officer' }
    ],
    driver: { name: '', id: '', brand: '', color: '', tractor: '', trailer: '', phone: '' }
  },
  {
    id: 'radsh',
    short: 'الردش',
    name: 'تصريح خروج الردش',
    color: '#3d8f3b',
    icon: 'truck',
    fixed: true,
    startNo: 1,
    unloadPlace: 'المقلب الصحى العمومى لمدينة الضبعة',
    purpose: 'التخلص الأمن من المخلفات',
    items: [{
      desc: 'Concrete Water / المخلفات الخرسانية', qty: '',
      noReturn: 'بدون عوده', ret: '---------------', retDate: '-----------------',
      note: 'Non - Hazardous Solid water\nمخلفات صلبة غير خطرة'
    }],
    sigTitles: [
      { ar: 'المسؤول عن التحميل', en: 'Waste Removal Officer' },
      { ar: 'مسؤول البيئة', en: 'Environmental Officer' },
      { ar: 'مسؤول الامن', en: 'Security Officer' }
    ],
    driver: driverFor('radsh')
  },
  {
    id: 'kasah',
    short: 'الكسح',
    name: 'تصريح خروج الكسح',
    color: '#1565c0',
    icon: 'drop',
    fixed: true,
    startNo: 20,
    unloadPlace: 'مركز العربية للتخلص الأمن من المخلفات الخطرة والغير خطرة',
    purpose: 'التخلص الأمن من المخلفات',
    items: [{
      desc: 'Waste Water / مخلفات مياه الصرف', qty: '',
      noReturn: 'بدون عوده', ret: '----------------', retDate: '---------------',
      note: 'Hazardous Waste water\nمخلفات سائلة خطرة'
    }],
    sigTitles: [
      { ar: 'المسؤول عن التحميل', en: 'Waste Removal Officer' },
      { ar: 'مسؤول البيئة', en: 'Environmental Officer' },
      { ar: 'مسؤول الامن', en: 'Security Officer' }
    ],
    driver: driverFor('kasah')
  },
  {
    id: 'waste',
    short: 'المخلفات',
    name: 'تصريح خروج المخلفات',
    color: '#0e7c86',
    icon: 'bin',
    fixed: true,
    startNo: 4,
    unloadPlace: 'المقلب الصحى العمومى لمدينة الضبعة',
    purpose: 'التخلص الأمن من المخلفات',
    items: [{
      desc: 'General Water / المخلفات العامة', qty: '',
      noReturn: 'بدون عوده', ret: '---------------', retDate: '-----------------',
      note: 'Non - Hazardous Solid water\nمخلفات صلبة غير خطرة'
    }],
    sigTitles: [
      { ar: 'المسؤول عن التحميل', en: 'Waste Removal Officer' },
      { ar: 'مسؤول البيئة', en: 'Environmental Officer' },
      { ar: 'مسؤول الامن', en: 'Security Officer' }
    ],
    driver: driverFor('waste')
  }
];

/* ============================================================
   الإقرارات — بيتكتب فيها التاريخ والجداول بس
   ============================================================ */
function emptyDeclItems() {
  return [{ desc: '' }, { desc: '' }, { desc: '' }, { desc: '' }];
}

window.FORMS.push(
  {
    id: 'nonconf',
    kind: 'decl',
    short: 'غير مطابق للمواصفات',
    name: 'إقرار غير مطابق للمواصفات',
    color: '#c22f2f',
    icon: 'reject',
    fixed: false,
    items: emptyDeclItems(),
    driver: { name: '', id: '', car: '' }
  },
  {
    id: 'maint',
    kind: 'decl',
    short: 'للصيانة والعودة',
    name: 'إقرار للصيانة والعودة',
    color: '#b5701b',
    icon: 'wrench',
    fixed: false,
    items: emptyDeclItems(),
    driver: { name: '', id: '', car: '' }
  },
  {
    id: 'endwork',
    kind: 'decl',
    short: 'لإنتهاء الأعمال',
    name: 'إقرار لإنتهاء الأعمال',
    color: '#13866f',
    icon: 'done',
    fixed: false,
    items: emptyDeclItems(),
    driver: { name: '', id: '', car: '' }
  }
);
