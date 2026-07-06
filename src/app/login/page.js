/**
 * 🔐 واجهة تسجيل الدخول الموحدة الذكية (Unified Login Page)
 * ----------------------------------------------------------------------
 * هذه الصفحة تتيح لجميع أنواع المستخدمين تسجيل الدخول من مكان واحد.
 * عند نجاح العملية، يتم قراءة الـ Role وتوجيه المستخدم لواجهته فوراً.
 */

'use client' // تحديد أن الصفحة تفاعلية وتتعامل مع تفاعلات المستخدم والأزرار

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signInUser } from '../../services/authService'

export default function LoginPage() {
  const router = useRouter()
  
  // 📝 تهيئة حالات المدخلات (State Management) لشاشات النصوص والأخطاء
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  // 🚀 دالة معالجة إرسال الفورم وتجربة تسجيل الدخول
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // استدعاء خدمة التحقق التي برمجناها في طبقة الـ services
    const result = await signInUser(email, password)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      // 🎯 التوجيه الذكي للمسار الصحيح حسب دور المستخدم في النظام (Role-Based Routing)
      if (result.role === 'patient') {
        router.push('/patient-vault')
      } else if (result.role === 'doctor') {
        router.push('/doctor-view')
      } else if (result.role === 'provider') {
        router.push('/provider-panel')
      } else {
        setError('عذراً، لم يتم التعرف على صلاحيات هذا الحساب.')
        setLoading(false)
      }
    }
  }

  return (
    <div className="w-full flex-1 flex items-center justify-center bg-slate-950 px-4 py-12 relative">
      
      {/* تأثير الإضاءة الخلفي الفخم المتناسق مع الهوية */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* 📦 صندوق بطاقة تسجيل الدخول (Login Card) */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl z-10 backdrop-blur-md">
        
        {/* العناوين والترحيب */}
        <div className="text-center flex flex-col gap-2 mb-8">
          <h2 className="text-2xl font-bold text-white tracking-wide">مرحباً بك في BioGuard</h2>
          <p className="text-sm text-slate-400">سجل دخولك للوصول إلى خزنتك الطبية المشفرة</p>
        </div>

        {/* 🚨 عرض الأخطاء إن وجدت بشكل واضح ومحمي */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg mb-6 text-center font-medium">
            ⚠️ {error}
          </div>
        )}

        {/* 📝 استمارة الدخول الفردية */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          
          {/* حقل البريد الإلكتروني */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-300 font-medium">البريد الإلكتروني</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-white placeholder-slate-600 outline-none transition-all duration-200"
            />
          </div>

          {/* حقل كلمة المرور */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-300 font-medium">كلمة المرور</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-white placeholder-slate-600 outline-none transition-all duration-200"
            />
          </div>

          {/* 🔘 زر إرسال الدخول مع تأثير التحميل (Loading state) */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 text-slate-950 disabled:text-slate-500 font-bold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/5 mt-2 flex items-center justify-center gap-2"
          >
            {loading ? 'جاري التحقق الآمن...' : 'تسجيل الدخول الآمن'}
          </button>

        </form>

      </div>
    </div>
  )
}