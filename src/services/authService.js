/**
 * 🔐 خدمة إدارة الحسابات والصلاحيات (Authentication & Roles Service)
 * ----------------------------------------------------------------------
 * هذا الملف مسؤول عن تسجيل دخول المستخدمين، والتحقق من أدوارهم (Roles)
 * في قاعدة البيانات لضمان التوجيه الآمن ومنع التداخل بين الواجهات.
 */

import { supabase } from '../lib/supabase'

/**
 * 1️⃣ دالة تسجيل الدخول (Sign In)
 * تقوم بالتحقق من البريد وكلمة المرور، ثم جلب دور المستخدم من جدول profiles لقاعدة البيانات
 * @param {string} email - البريد الإلكتروني للمستخدم
 * @param {string} password - كلمة المرور
 */
export const signInUser = async (email, password) => {
  try {
    // تسجيل الدخول عبر نظام التحقق الخاص بـ Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) throw authError

    // جلب بيانات الصلاحية (role) وجدول المجمع المرتبط به (tenant_id) من جدول profiles
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role, tenant_id')
      .eq('id', authData.user.id)
      .single()

    if (profileError) throw profileError

    // إرجاع بيانات المستخدم كاملة مع صلاحياته للتوجيه الذكي
    return {
      user: authData.user,
      role: profileData.role,
      tenantId: profileData.tenant_id,
      error: null
    }

  } catch (error) {
    console.error('خطأ في عملية تسجيل الدخول:', error.message)
    return { user: null, role: null, tenantId: null, error: error.message }
  }
}

/**
 * 2️⃣ دالة تسجيل الخروج (Sign Out)
 * تقوم بإنهاء الجلسة الحالية للمستخدم بأمان وإزالته من الذاكرة المؤقتة للموقع
 */
export const signOutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { success: true, error: null }
  } catch (error) {
    console.error('خطأ في عملية تسجيل الخروج:', error.message)
    return { success: false, error: error.message }
  }
}