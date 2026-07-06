/**
 * 🔐 ملف إعداد الاتصال بالسيرفر السحابي (Supabase Client Configuration)
 * ----------------------------------------------------------------------
 * هذا الملف يقوم بإنشاء اتصال آمن ومستمر بين تطبيقنا وقاعدة بيانات Supabase.
 * يُستخدم هذا العميل (Client) في كل مرة نحتاج فيها لجلب أو تعديل البيانات.
 */

import { createClient } from '@supabase/supabase-js'

// 1. جلب رابط المشروع السري من متغيرات البيئة لضمان الحماية المطلقة
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

// 2. جلب مفتاح الأمان العام (Anon Key) الذي يسمح لنا بالاتصال بالسيرفر
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

/**
 * 🚀 إنشاء وتصدير عميل Supabase (supabase client)
 * نقوم بفحص المتغيرات أولاً، ثم نطلق العميل ليكون جاهزاً للاستخدام في أي ملف آخر.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey)