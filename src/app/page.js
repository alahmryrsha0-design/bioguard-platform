/**
 * 🏠 الواجهة الرئيسية الترحيبية لمنصة BioGuard
 * -----------------------------------------------------------------
 * صفحة تعريفية عامة (Public) تشرح فكرة المنصة وتوجّه الزائر لتسجيل الدخول.
 */

import Link from 'next/link'

export default function HomePage() {
  const features = [
    {
      icon: '🔐',
      title: 'تشفير من طرف إلى طرف',
      desc: 'بياناتك الطبية تُشفَّر بمفتاحك الخاص قبل مغادرة جهازك، ولا يملك أحد غيرك مفتاح فك التشفير.',
    },
    {
      icon: '⏳',
      title: 'صلاحيات وصول مؤقتة',
      desc: 'أنت من يمنح الطبيب إذن الاطلاع، ولمدة محددة فقط تنتهي تلقائياً بعدها.',
    },
    {
      icon: '🏥',
      title: 'مساحات معزولة للمجمعات الطبية',
      desc: 'كل مجمع طبي يعمل في مساحته الخاصة المعزولة تماماً عن باقي الجهات.',
    },
  ]

  return (
    <main dir="rtl" className="min-h-screen bg-slate-950 text-slate-100">
      {/* 🌟 قسم البطل الرئيسي (Hero) */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm px-4 py-1.5 rounded-full mb-6">
          <span>🛡️</span>
          <span>خزنة طبية مشفرة بالكامل</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
          منصة <span className="text-emerald-400">BioGuard</span>
          <br />
          لحماية تقاريرك الطبية
        </h1>

        <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          منصة سحابية آمنة لتبادل ومشاركة التقارير الطبية بين المرضى والمجمعات
          الطبية والأطباء، مبنية على تشفير كامل من طرف إلى طرف وصلاحيات وصول
          مؤقتة يتحكم بها المريض وحده.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/login"
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            تسجيل الدخول
          </Link>
          <a
            href="#features"
            className="border border-slate-700 hover:border-slate-500 text-slate-200 font-medium px-8 py-3 rounded-lg transition-colors"
          >
            تعرّف على المنصة
          </a>
        </div>
      </section>

      {/* ⚙️ قسم المزايا */}
      <section id="features" className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-emerald-500/40 transition-colors"
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 🔻 تذييل بسيط */}
      <footer className="border-t border-slate-800 py-8 text-center text-slate-500 text-sm">
        © {new Date().getFullYear()} BioGuard — منصة آمنة لحماية بياناتك الطبية
      </footer>
    </main>
  )
}