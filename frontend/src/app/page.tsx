import Link from "next/link";
import {
  ShieldCheck,
  BellRing,
  Brain,
  Lock,
  ChevronRight,
  MessageCircleWarning,
  Users,
  BarChart3,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Yapay Zeka Analizi",
    desc: "GPT-4o destekli Türkçe içerik analizi. Küfür, zorbalık, tehdit ve riskli ifadeleri milisaniyeler içinde tespit eder.",
    color: "bg-violet-100 text-violet-600",
  },
  {
    icon: BellRing,
    title: "Anında Bildirim",
    desc: "Riskli içerik tespit edildiğinde ebeveyni push bildirim ve e-posta ile anında uyarır.",
    color: "bg-orange-100 text-orange-600",
  },
  {
    icon: ShieldCheck,
    title: "KVKK Uyumlu",
    desc: "Türk veri koruma mevzuatına tam uyumlu. Yalnızca riskli kısımlar işlenir, tüm konuşmalar saklanmaz.",
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    icon: Lock,
    title: "Şeffaf Koruma",
    desc: "Çocuğunuz uygulamanın varlığından haberdardır. Gizli gözetim değil, güvenli ebeveynlik.",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: MessageCircleWarning,
    title: "6 Risk Kategorisi",
    desc: "Zorbalık, şiddet, cinsel risk, tehdit, küfür ve aşırı öfke kategorileri ayrı ayrı takip edilir.",
    color: "bg-rose-100 text-rose-600",
  },
  {
    icon: BarChart3,
    title: "Detaylı Raporlar",
    desc: "Haftalık ve aylık trend raporları ile çocuğunuzun dijital ortamını bütünsel olarak görebilirsiniz.",
    color: "bg-amber-100 text-amber-600",
  },
];

const stats = [
  { value: "18 yaş", label: "Altındaki çocuklar için" },
  { value: "%94", label: "Tespit doğruluğu" },
  { value: "<2sn", label: "Ortalama analiz süresi" },
  { value: "KVKK", label: "Tam uyumlu" },
];

const categories = [
  { label: "Zorbalık", color: "bg-rose-500" },
  { label: "Şiddet Dili", color: "bg-red-600" },
  { label: "Cinsel Risk", color: "bg-purple-600" },
  { label: "Tehdit", color: "bg-orange-500" },
  { label: "Küfür", color: "bg-yellow-500" },
  { label: "Aşırı Öfke", color: "bg-pink-500" },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-white font-[family-name:var(--font-inter)]">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-violet-600" />
            <span className="text-xl font-bold text-gray-900">Mivvo</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a href="#ozellikler" className="hover:text-violet-600 transition-colors">Özellikler</a>
            <a href="#nasil-calisir" className="hover:text-violet-600 transition-colors">Nasıl Çalışır?</a>
            <a href="#kvkk" className="hover:text-violet-600 transition-colors">KVKK</a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/giris"
              className="text-sm text-gray-700 hover:text-violet-600 font-medium transition-colors"
            >
              Giriş Yap
            </Link>
            <Link
              href="/kayit"
              className="text-sm bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Ücretsiz Başla
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-white to-blue-50 pt-20 pb-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative">
          <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <ShieldCheck className="w-3.5 h-3.5" />
            18 yaş altı için ebeveyn koruma sistemi
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            Çocuğunuzu Dijital
            <br />
            <span className="text-violet-600">Tehlikelerden Koruyun</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Mivvo, yapay zeka ile çocuğunuzun mesajlarını analiz ederek zorbalık, tehdit, küfür ve
            riskli içerikleri anında tespit eder. Siz haberdar olursunuz, çocuğunuz güvende kalır.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/kayit"
              className="inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-base font-semibold px-8 py-4 rounded-xl transition-colors shadow-lg shadow-violet-200"
            >
              Ücretsiz Deneyin <ChevronRight className="w-5 h-5" />
            </Link>
            <a
              href="#nasil-calisir"
              className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-violet-300 text-gray-700 text-base font-semibold px-8 py-4 rounded-xl transition-colors"
            >
              Nasıl Çalışır?
            </a>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-gray-100 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-extrabold text-violet-600 mb-1">{s.value}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <p className="text-center text-sm font-semibold text-gray-500 uppercase tracking-widest mb-6">
            Tespit edilen içerik kategorileri
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((c) => (
              <span
                key={c.label}
                className={`${c.color} text-white text-sm font-semibold px-4 py-1.5 rounded-full`}
              >
                {c.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="ozellikler" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Neden Mivvo?
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Çocuğunuzun dijital güvenliği için tasarlanmış, Türkçe içerik analizinde uzmanlaşmış akıllı koruma sistemi.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f) => (
              <div
                key={f.title}
                className="p-6 rounded-2xl border border-gray-100 hover:border-violet-200 hover:shadow-md transition-all"
              >
                <div className={`w-12 h-12 ${f.color} rounded-xl flex items-center justify-center mb-4`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="nasil-calisir" className="py-24 bg-violet-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Nasıl Çalışır?
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Uygulamayı Yükleyin",
                desc: "Ebeveyn ve çocuk telefonlarına Mivvo'yu yükleyin. Her iki tarafın onayı alınır (KVKK uyumu).",
              },
              {
                step: "2",
                title: "Yapay Zeka Analiz Eder",
                desc: "Çocuğun mesajları arka planda Mivvo'nun yapay zeka motoruna gönderilir. Sadece riskli içerik işlenir.",
              },
              {
                step: "3",
                title: "Siz Anında Haberdar Olun",
                desc: "Risk tespit edildiğinde telefonunuza anlık bildirim gelir. Dashboard'dan detayları görebilirsiniz.",
              },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-2xl p-6 shadow-sm text-center">
                <div className="w-12 h-12 bg-violet-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* KVKK */}
      <section id="kvkk" className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
            KVKK&apos;ya Tam Uyumlu
          </h2>
          <p className="text-gray-500 leading-relaxed mb-8">
            6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında; açık rıza alınır, veri minimizasyonu
            sağlanır, tüm konuşmalar değil yalnızca riskli kısımlar işlenir ve kullanıcı istediğinde
            tüm verilerini silebilir.
          </p>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            {[
              { title: "Açık Rıza", desc: "Hem ebeveyn hem çocuk onayı" },
              { title: "Veri Minimizasyonu", desc: "Sadece riskli kısım saklanır" },
              { title: "Silme Hakkı", desc: "Anında veri silme talebi" },
            ].map((item) => (
              <div key={item.title} className="bg-emerald-50 rounded-xl p-4">
                <div className="font-semibold text-emerald-700 mb-1">{item.title}</div>
                <div className="text-gray-500">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-violet-600 py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Çocuğunuzu Bugün Korumaya Başlayın
          </h2>
          <p className="text-violet-200 mb-8">
            Ücretsiz hesap oluşturun, birkaç dakikada kurulum tamamlansın.
          </p>
          <Link
            href="/kayit"
            className="inline-flex items-center gap-2 bg-white text-violet-600 hover:bg-violet-50 font-bold text-base px-8 py-4 rounded-xl transition-colors shadow-lg"
          >
            Ücretsiz Başla <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-violet-400" />
              <span className="text-white font-bold">Mivvo</span>
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/gizlilik" className="hover:text-white transition-colors">Gizlilik Politikası</Link>
              <Link href="/kvkk" className="hover:text-white transition-colors">KVKK Aydınlatma</Link>
              <Link href="/iletisim" className="hover:text-white transition-colors">İletişim</Link>
            </div>
            <p className="text-xs">© {new Date().getFullYear()} Mivvo. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

