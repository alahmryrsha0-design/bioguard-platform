/**
 * 🛡️ حارس أمان السيرفر (Route Guard Middleware)
 * -----------------------------------------------------------------
 * يعمل هذا الملف على مستوى السيرفر قبل تحميل أي صفحة، ومهمته:
 *  1. منع أي مستخدم غير مسجّل دخول من الوصول للصفحات الخاصة.
 *  2. توجيه كل مستخدم لواجهته الصحيحة حسب دوره (role) في جدول profiles.
 *  3. منع التداخل بين الواجهات (مثال: منع الطبيب من فتح خزنة مريض).
 *
 * ⚠️ يتطلب هذا الملف تثبيت الحزمة الخاصة بقراءة الجلسة داخل الـ Middleware:
 *     npm install @supabase/ssr
 */

import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// 🗺️ خريطة الأدوار ← المسار المخصص لكل دور
const ROLE_HOME = {
  patient: '/patient-vault',
  provider: '/provider-panel',
  doctor: '/doctor-view',
  admin: '/admin',
}

// 🔓 المسارات المفتوحة للجميع بدون تسجيل دخول
const PUBLIC_PATHS = ['/', '/login']

export async function middleware(request) {
  const response = NextResponse.next({
    request: { headers: request.headers },
  })

  // إنشاء عميل Supabase مخصص للعمل داخل الـ Middleware (قراءة/كتابة الكوكيز)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value
        },
        set(name, value, options) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name, options) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const path = request.nextUrl.pathname
  const isPublicPath = PUBLIC_PATHS.includes(path)

  // 1️⃣ لا يوجد جلسة ولا يحاول الدخول لمسار عام → ارمِه لصفحة الدخول
  if (!session && !isPublicPath) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // 2️⃣ يوجد جلسة → نجلب دوره ونتأكد إنه بالمكان الصحيح
  if (session) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    const role = profile?.role
    const homePath = ROLE_HOME[role]

    // مستخدم مسجّل دخول لكن يحاول الرجوع لصفحة تسجيل الدخول → وجّهه لواجهته
    if (path === '/login' && homePath) {
      return NextResponse.redirect(new URL(homePath, request.url))
    }

    // منع الدخول لمسار خاص بدور مختلف (مثال: طبيب يحاول فتح /patient-vault)
    const isPatientArea = path.startsWith('/patient-vault')
    const isProviderArea = path.startsWith('/provider-panel')
    const isDoctorArea = path.startsWith('/doctor-view')
    const isAdminArea = path.startsWith('/admin')

    const roleMismatch =
      (isPatientArea && role !== 'patient') ||
      (isProviderArea && role !== 'provider') ||
      (isDoctorArea && role !== 'doctor') ||
      (isAdminArea && role !== 'admin')

    if (roleMismatch) {
      const safeHome = homePath || '/login'
      return NextResponse.redirect(new URL(safeHome, request.url))
    }
  }

  return response
}

// 🎯 تحديد المسارات التي يعمل عليها هذا الحارس فقط (لتفادي إبطاء الملفات الثابتة)
export const config = {
  matcher: [
    '/login',
    '/patient-vault/:path*',
    '/provider-panel/:path*',
    '/doctor-view/:path*',
    '/admin/:path*',
  ],
}