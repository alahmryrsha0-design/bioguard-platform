/**
 * 🗄️ خدمة إدارة الخزنة الطبية (Vault Service)
 * -----------------------------------------------------------------
 * هذا الملف مسؤول عن:
 *  - تشفير ورفع التقارير الطبية إلى Supabase Storage.
 *  - جلب تقارير المريض وفك تشفيرها محلياً.
 *  - إدارة طلبات وصول الأطباء والموافقة عليها لمدة 24 ساعة فقط.
 *
 * 🧱 الجداول المفترضة في قاعدة البيانات (Supabase):
 *  - profiles          (id, role, tenant_id, full_name)
 *  - reports           (id, patient_id, tenant_id, title, storage_path, created_at)
 *  - access_requests   (id, doctor_id, patient_id, report_id, status, expires_at, created_at)
 *  - Storage bucket باسم: medical-reports (خاص/Private)
 */

import { supabase } from '../lib/supabase'
import { encryptData, decryptData } from './cryptoService'

/**
 * 🔧 دالة مساعدة: تحويل ملف (ArrayBuffer) إلى نص Base64
 * نستخدمها بدل Buffer لأن الكود يعمل داخل المتصفح (Client Component)
 */
const arrayBufferToBase64 = (buffer) => {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

/**
 * 🔧 دالة مساعدة: تحويل نص Base64 إلى Blob قابل للتحميل/العرض
 */
const base64ToBlob = (base64, mimeType = 'application/octet-stream') => {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new Blob([bytes], { type: mimeType })
}

/**
 * 1️⃣ رفع تقرير طبي مشفر (Upload Encrypted Report)
 * @param {File} file - الملف الأصلي (PDF أو صورة أشعة)
 * @param {string} patientId - معرّف المريض صاحب التقرير
 * @param {string} tenantId - معرّف المجمع الطبي الرافع للتقرير
 * @param {string} secretKey - مفتاح تشفير المريض السري
 * @param {string} title - عنوان/وصف التقرير
 */
export const uploadReport = async ({ file, patientId, tenantId, secretKey, title }) => {
  try {
    // تحويل الملف إلى Base64 تمهيداً لتشفيره
    const fileBuffer = await file.arrayBuffer()
    const base64Data = arrayBufferToBase64(fileBuffer)

    // تشفير محتوى الملف بالكامل بمفتاح المريض قبل أي رفع للسيرفر
    const encryptedContent = encryptData(base64Data, secretKey)
    if (!encryptedContent) throw new Error('فشلت عملية التشفير قبل الرفع')

    // رفع النص المشفر كملف .enc إلى مساحة تخزين خاصة بالمريض
    const fileName = `${patientId}/${Date.now()}_${file.name}.enc`
    const { error: uploadError } = await supabase.storage
      .from('medical-reports')
      .upload(fileName, encryptedContent, {
        contentType: 'text/plain',
        upsert: false,
      })

    if (uploadError) throw uploadError

    // تسجيل بيانات التقرير (بدون أي محتوى حساس) في جدول reports
    const { data, error: insertError } = await supabase
      .from('reports')
      .insert({
        patient_id: patientId,
        tenant_id: tenantId,
        title,
        storage_path: fileName,
        original_name: file.name,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (insertError) throw insertError

    return { report: data, error: null }
  } catch (error) {
    console.error('خطأ أثناء رفع التقرير:', error.message)
    return { report: null, error: error.message }
  }
}

/**
 * 2️⃣ جلب قائمة تقارير مريض معيّن (Get Patient Reports)
 */
export const getPatientReports = async (patientId) => {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { reports: data, error: null }
  } catch (error) {
    console.error('خطأ في جلب التقارير:', error.message)
    return { reports: [], error: error.message }
  }
}

/**
 * 3️⃣ تنزيل وفك تشفير تقرير (Decrypt Report)
 * تُرجع Blob جاهز للعرض أو التحميل داخل المتصفح
 * @param {string} storagePath - مسار الملف في التخزين السحابي
 * @param {string} secretKey - مفتاح فك التشفير الخاص بالمريض
 * @param {string} mimeType - نوع الملف الأصلي لعرضه بشكل صحيح (مثال: application/pdf)
 */
export const decryptReport = async (storagePath, secretKey, mimeType = 'application/pdf') => {
  try {
    const { data, error } = await supabase.storage
      .from('medical-reports')
      .download(storagePath)

    if (error) throw error

    const encryptedText = await data.text()
    const decryptedBase64 = decryptData(encryptedText, secretKey)

    if (!decryptedBase64) {
      throw new Error('فشل فك التشفير - تأكد من صحة المفتاح السري')
    }

    const blob = base64ToBlob(decryptedBase64, mimeType)
    const objectUrl = URL.createObjectURL(blob)

    return { fileUrl: objectUrl, error: null }
  } catch (error) {
    console.error('خطأ أثناء فك تشفير التقرير:', error.message)
    return { fileUrl: null, error: error.message }
  }
}

/**
 * 4️⃣ إنشاء طلب وصول من طبيب لتقرير مريض (Request Doctor Access)
 */
export const requestDoctorAccess = async ({ doctorId, patientId, reportId }) => {
  try {
    const { data, error } = await supabase
      .from('access_requests')
      .insert({
        doctor_id: doctorId,
        patient_id: patientId,
        report_id: reportId,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return { request: data, error: null }
  } catch (error) {
    console.error('خطأ في إرسال طلب الوصول:', error.message)
    return { request: null, error: error.message }
  }
}

/**
 * 5️⃣ جلب طلبات الوصول المعلّقة لمريض معيّن (لعرضها له للموافقة)
 */
export const getPendingRequestsForPatient = async (patientId) => {
  try {
    const { data, error } = await supabase
      .from('access_requests')
      .select('*, reports(title)')
      .eq('patient_id', patientId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) throw error
    return { requests: data, error: null }
  } catch (error) {
    console.error('خطأ في جلب طلبات الوصول:', error.message)
    return { requests: [], error: error.message }
  }
}

/**
 * 6️⃣ موافقة المريض على طلب وصول الطبيب (فتح صلاحية 24 ساعة فقط)
 */
export const approveDoctorAccess = async (requestId) => {
  try {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 ساعة بالضبط

    const { data, error } = await supabase
      .from('access_requests')
      .update({ status: 'approved', expires_at: expiresAt })
      .eq('id', requestId)
      .select()
      .single()

    if (error) throw error
    return { request: data, error: null }
  } catch (error) {
    console.error('خطأ في الموافقة على الطلب:', error.message)
    return { request: null, error: error.message }
  }
}

/**
 * 7️⃣ رفض طلب وصول الطبيب
 */
export const rejectDoctorAccess = async (requestId) => {
  try {
    const { data, error } = await supabase
      .from('access_requests')
      .update({ status: 'rejected' })
      .eq('id', requestId)
      .select()
      .single()

    if (error) throw error
    return { request: data, error: null }
  } catch (error) {
    console.error('خطأ في رفض الطلب:', error.message)
    return { request: null, error: error.message }
  }
}

/**
 * 8️⃣ جلب طلبات الوصول الخاصة بطبيب معيّن مع حالتها الحالية
 */
export const getDoctorRequests = async (doctorId) => {
  try {
    const { data, error } = await supabase
      .from('access_requests')
      .select('*, reports(title)')
      .eq('doctor_id', doctorId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { requests: data, error: null }
  } catch (error) {
    console.error('خطأ في جلب طلبات الطبيب:', error.message)
    return { requests: [], error: error.message }
  }
}

/**
 * 9️⃣ التحقق من صلاحية وصول الطبيب لحظياً (منتهية أم فعّالة)
 * ترجع isValid = true فقط إذا كانت الحالة approved ولم تنتهِ الـ 24 ساعة بعد
 */
export const checkAccessValidity = async (requestId) => {
  try {
    const { data, error } = await supabase
      .from('access_requests')
      .select('*')
      .eq('id', requestId)
      .single()

    if (error) throw error

    const isValid = data.status === 'approved' && new Date(data.expires_at) > new Date()
    return { isValid, request: data, error: null }
  } catch (error) {
    console.error('خطأ في التحقق من الصلاحية:', error.message)
    return { isValid: false, request: null, error: error.message }
  }
}