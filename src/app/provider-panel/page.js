/**
 * 🏥 واجهة المجمع الطبي (Provider Panel)
 * -----------------------------------------------------------------
 * تتيح للمجمع الطبي/المختبر رفع تقرير طبي جديد لمريض معيّن، بعد تشفيره
 * بمفتاح المريض السري (يُدخله المريض بنفسه أثناء الزيارة، ولا يُخزَّن أبداً).
 */

'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { uploadReport } from '../../services/vaultService'

export default function ProviderPanelPage() {
  const [tenantId, setTenantId] = useState(null)
  const [patientId, setPatientId] = useState('')
  const [title, setTitle] = useState('')
  const [secretKey, setSecretKey] = useState('')
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')

  // جلب tenant_id الخاص بحساب المجمع الطبي الحالي
  useEffect(() => {
    const loadTenant = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', session.user.id)
        .single()

      setTenantId(profile?.tenant_id || null)
    }

    loadTenant()
  }, [])

  const handleUpload = async (e) => {
    e.preventDefault()
    setStatusMsg('')

    if (!file || !patientId || !title || !secretKey) {
      setStatusMsg('⚠️ الرجاء تعبئة جميع الحقول واختيار ملف')
      return
    }

    setUploading(true)

    const { report, error } = await uploadReport({
      file,
      patientId,
      tenantId,
      secretKey,
      title,
    })

    setUploading(false)

    if (error) {
      setStatusMsg(`❌ فشل الرفع: ${error}`)
    } else {
      setStatusMsg(`✅ تم رفع التقرير "${report.title}" وتشفيره بنجاح`)
      setPatientId('')
      setTitle('')
      setSecretKey('')
      setFile(null)
      e.target.reset()
    }
  }

  return (
    <main dir="rtl" className="min-h-screen bg-slate-950 text-slate-100 px-6 py-10">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">🏥 لوحة المجمع الطبي</h1>
        <p className="text-slate-400 text-sm mb-8">
          ارفعي تقرير المريض الآن ليتم تشفيره تلقائياً قبل رفعه للسيرفر
        </p>

        <form
          onSubmit={handleUpload}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-5"
        >
          {/* معرّف المريض */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-300 font-medium">
              معرّف المريض (Patient ID)
            </label>
            <input
              type="text"
              required
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              placeholder="أدخلي معرّف المريض من ملفه"
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 outline-none rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-600"
            />
          </div>

          {/* عنوان التقرير */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-300 font-medium">
              عنوان التقرير
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: تحليل دم شامل - يوليو 2026"
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 outline-none rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-600"
            />
          </div>

          {/* مفتاح تشفير المريض (يُدخله المريض بنفسه) */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-300 font-medium">
              مفتاح تشفير المريض
            </label>
            <input
              type="password"
              required
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder="يُدخله المريض بنفسه أثناء الزيارة"
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 outline-none rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-600"
            />
            <p className="text-xs text-slate-500">
              هذا المفتاح لا يُخزَّن في أي مكان، ويُستخدم فقط لحظة التشفير
            </p>
          </div>

          {/* اختيار الملف */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-300 font-medium">
              ملف التقرير (PDF أو صورة)
            </label>
            <input
              type="file"
              required
              accept="application/pdf,image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-300 file:mr-3 file:bg-slate-800 file:text-slate-200 file:border-0 file:rounded-md file:px-3 file:py-1.5"
            />
          </div>

          {statusMsg && (
            <p className="text-sm text-slate-300 bg-slate-800/60 rounded-lg px-3 py-2">
              {statusMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-semibold py-3 rounded-lg transition-colors"
          >
            {uploading ? 'جاري التشفير والرفع...' : 'تشفير ورفع التقرير'}
          </button>
        </form>
      </div>
    </main>
  )
}