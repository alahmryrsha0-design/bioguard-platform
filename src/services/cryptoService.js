/**
 * 🛡️ محرك التشفير الآمن للمنصة (End-to-End Encryption Service)
 * -----------------------------------------------------------------
 * هذا الملف مسؤول بالكامل عن تشفير التقارير الطبية (PDFs أو النصوص) 
 * قبل إرسالها للسيرفر، وفك تشفيرها فقط عند عرضها للمستخدم المصرح له.
 */

import CryptoJS from 'crypto-js'

/**
 * 1️⃣ دالة تشفير البيانات (Encrypt Data)
 * تأخذ النص المراد حمايته ومفتاح التشفير السري، وتُرجع نصاً مشفراً بالكامل.
 * @param {string} data - النص أو التقرير الطبي المراد تشفيره
 * @param {string} secretKey - المفتاح السري الخاص بالمريض
 */
export const encryptData = (data, secretKey) => {
  try {
    // استخدام خوارزمية AES العالمية لتشفير البيانات
    const encrypted = CryptoJS.AES.encrypt(data, secretKey).toString()
    return encrypted
  } catch (error) {
    console.error('خطأ أثناء عملية التشفير:', error)
    return null
  }
}

/**
 * 2️⃣ دالة فك تشفير البيانات (Decrypt Data)
 * تأخذ النص المشفر والمفتاح السري، وتُرجع التقرير الطبي الأصلي وقابلاً للقراءة.
 * @param {string} cipherText - النص المشفر القادم من قاعدة البيانات
 * @param {string} secretKey - المفتاح السري لفك القفل
 */
export const decryptData = (cipherText, secretKey) => {
  try {
    // فك تشفير النص باستخدام نفس الخوارزمية والمفتاح
    const bytes = CryptoJS.AES.decrypt(cipherText, secretKey)
    const originalText = bytes.toString(CryptoJS.enc.Utf8)
    
    return originalText
  } catch (error) {
    console.error('خطأ أثناء عملية فك التشفير (قد يكون المفتاح خاطئاً):', error)
    return null
  }
}