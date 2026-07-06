/**
 * 🗺️ الهيكل العام والتنسيق الثابت للموقع (Root Layout)
 * ----------------------------------------------------------------------
 * هذا الملف يمثل الغلاف الخارجي للمنصة بأكملها. أي عنصر نضعه هنا
 * (مثل شريط التنقل Navbar) سيظهر تلقائياً في جميع صفحات الموقع.
 */

import "./globals.css" // استيراد ملف التنسيقات العالمي لـ Tailwind CSS
import Navbar from "../components/Navbar" // استيراد شريط التنقل الذكي الذي صممناه

// إعداد نصوص الميتا (Meta Data) لظهور الموقع بشكل احترافي في محركات البحث
export const metadata = {
  title: "BioGuard - Secure Medical Platform",
  description: "منصة سحابية متقدمة لتبادل وتشفير التقارير الطبية بأمان مطلق",
}

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl"> 
      {/* 🖤 تهيئة الخلفية العامة للموقع باللون الداكن الفخم لراحة العين وطابع الأمان */}
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-emerald-550 selection:text-slate-955">
        
        {/* 🧭 عرض شريط التنقل العلوي في أعلى الموقع بشكل ثابت */}
        {/* في النسخة التجريبية الحالية نمرر قيم فارغة للمستخدم حتى نربط صفحة الدخول الفعالة */}
        <Navbar user={null} role={null} />
        
        {/* 🖥️ هنا سيتم عرض محتوى كل صفحة ننتقل إليها ديناميكياً */}
        <main className="w-full min-h-[calc(100vh-4rem)] flex flex-col">
          {children}
        </main>

      </body>
    </html>
  )
}