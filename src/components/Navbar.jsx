/**
 * 🧭 شريط التنقل العلوي الذكي (Dynamic Navbar Component)
 * ----------------------------------------------------------------------
 * هذا العنصر يمثل الشاشه العلوية للموقع، مبرمج ليتغير ديناميكياً:
 * - إذا كان الزائر غير مسجل: يظهر زر "تسجيل الدخول".
 * - إذا كان مسجلاً: يظهر اسم المنصة "BioGuard" وزر "تسجيل الخروج" الآمن.
 */

'use client' // تحديد أن هذا العنصر يتعامل مع واجهة المستخدم والتفاعل الحي

import { useRouter } from 'next/navigation'
import { signOutUser } from '../services/authService'

export default function Navbar({ user, role }) {
  const router = useRouter()

  // دالة معالجة ضغط زر تسجيل الخروج
  const handleLogout = async () => {
    const { success } = await signOutUser()
    if (success) {
      // توجيه المستخدم لصفحة الرئسية بعد الخروج بنجاح
      router.push('/')
    }
  }

  return (
    <nav className="w-full h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 text-white">
      {/* 🛡️ الشعار واسم المنصة */}
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
        <span className="text-xl font-bold tracking-wider text-emerald-400">BioGuard</span>
        <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">Secure</span>
      </div>

      {/* 👤 الأزرار والقوائم الحية حسب حالة المستخدم */}
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4">
            {/* عرض نوع الحساب الحالي للمستخدم لزيادة الطمأنينة والأمان */}
            <span className="text-sm text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
              {role === 'patient' ? 'خزنة المريض' : role === 'doctor' ? 'لوحة الطبيب' : 'المجمع الطبي'}
            </span>
            
            {/* زر تسجيل الخروج الفعلي */}
            <button 
              onClick={handleLogout}
              className="text-sm bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white px-4 py-2 rounded-lg transition-all duration-200 border border-red-500/20"
            >
              تسجيل الخروج
            </button>
          </div>
        ) : (
          // إذا كان زائر طبيعي، يظهر له زر الانتقال لصفحة تسجيل الدخول
          <button 
            onClick={() => router.push('/login')}
            className="text-sm bg-emerald-500 hover:bg-emerald-650 text-slate-950 font-semibold px-4 py-2 rounded-lg transition-all duration-200"
          >
            تسجيل الدخول
          </button>
        )}
      </div>
    </nav>
  )
}