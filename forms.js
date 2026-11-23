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
    color: '#2d5f99',
    icon: 'doc',
    fixed: false,
    unloadPlace: '',
    purpose: '',
    items: [
      { desc: '', qty: '', mode: '', retDate: '', note: '' },
      { desc: '', qty: '', mode: '', retDate: '', note: '' },
      { desc: '', qty: '', mode: '', retDate: '', note: '' },
      { desc: '', qty: '', mode: '', retDate: '', note: '' }
    ],
    driver: { name: '', id: '', brand: '', color: '', tractor: '', trailer: '', phone: '' }
  },
  {
    id: 'radsh',
    short: 'الردش',
    name: 'تصريح خروج الردش',
    color: '#3b9b4f',
    icon: 'truck',
    fixed: true,
    unloadPlace: 'المقلب الصحى العمومى لمدينة الضبعة',
    purpose: 'التخلص الأمن من المخلفات',
    items: [{
      desc: 'Concrete Water / المخلفات الخرسانية', qty: '',
      noReturn: 'بدون عوده', ret: '---------------', retDate: '-----------------',
      note: 'Non - Hazardous Solid water\nمخلفات صلبة غير خطرة'
    }],
    driver: driverFor('radsh')
  },
  {
    id: 'kasah',
    short: 'الكسح',
    name: 'تصريح خروج الكسح',
    color: '#1f8aa6',
    icon: 'drop',
    fixed: true,
    unloadPlace: 'مركز العربية للتخلص الأمن من المخلفات الخطرة والغير خطرة',
    purpose: 'التخلص الأمن من المخلفات',
    items: [{
      desc: 'Waste Water / مخلفات مياه الصرف', qty: '',
      noReturn: 'بدون عوده', ret: '----------------', retDate: '---------------',
      note: 'Hazardous Waste water\nمخلفات سائلة خطرة'
    }],
    driver: driverFor('kasah')
  },
  {
    id: 'waste',
    short: 'المخلفات',
    name: 'تصريح خروج المخلفات',
    color: '#c27c1e',
    icon: 'bin',
    fixed: true,
    unloadPlace: 'المقلب الصحى العمومى لمدينة الضبعة',
    purpose: 'التخلص الأمن من المخلفات',
    items: [{
      desc: 'General Water / المخلفات العامة', qty: '',
      noReturn: 'بدون عوده', ret: '---------------', retDate: '-----------------',
      note: 'Non - Hazardous Solid water\nمخلفات صلبة غير خطرة'
    }],
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
    color: '#b5483b',
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
    color: '#6a55a8',
    icon: 'wrench',
    fixed: false,
    items: emptyDeclItems(),
    driver: { name: '', id: '', car: '' }
  }
);
