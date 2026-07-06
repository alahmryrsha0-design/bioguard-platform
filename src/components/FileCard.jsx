/**
 * 🗂️ بطاقة عرض الملف الطبي المشفر (Secure File Card Component)
 * ----------------------------------------------------------------------
 * هذا العنصر التفاعلي مسؤول عن عرض تفاصيل التقرير الطبي بشكل أنيق،
 * ويحتوي على مؤشرات أمان بصرية توضح حالة التشفير الحالية للملف.
 */

'use client' // تحديد أن هذا العنصر تفاعلي ويعتمد على حركات واجهة المستخدم

export default function FileCard({ reportName, providerName, date, isDecrypted, onDecryptClick }) {
  return (
    <div className="w-full max-w-md bg-slate-800 border border-slate-700 hover:border-slate-650 rounded-xl p-5 shadow-lg transition-all duration-200 flex flex-col gap-4">
      
      {/* 🔝 القسم العلوي: اسم الملف وحالة التشفير البصرية */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h4 className="text-base font-semibold text-white tracking-wide">{reportName}</h4>
          <span className="text-xs text-slate-400">بواسطة: {providerName}</span>
        </div>
        
        {/* 🔒 شارة حالة التشفير الذكية */}
        {isDecrypted ? (
          <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded border border-emerald-500/20 font-medium">
            🔓 مفكوك التشفير
          </span>
        ) : (
          <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-1 rounded border border-amber-500/20 font-medium">
            🔒 مشفر بالكامل
          </span>
        )}
      </div>

      {/* 📅 التاريخ وتفاصيل الحماية */}
      <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-750 pt-3">
        <span>تاريخ الرفع: {date}</span>
        <span className="text-slate-400 font-mono">AES-256</span>
      </div>

      {/* 🔑 زر تفاعلي لفك التشفير عند الحاجة */}
      {!isDecrypted && (
        <button
          onClick={onDecryptClick}
          className="w-full bg-slate-700 hover:bg-emerald-500 text-slate-200 hover:text-slate-950 text-sm font-medium py-2 rounded-lg transition-all duration-250 border border-slate-600 hover:border-emerald-500"
        >
          🔐 إدخال مفتاح فك التشفير الآمن
        </button>
      )}
    </div>
  )
}