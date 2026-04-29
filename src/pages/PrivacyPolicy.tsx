import React from "react";
import QuranHeader from "@/components/QuranHeader";
import BackButton from "@/components/BackButton";
import { useTranslation } from "react-i18next";
import { Shield, Lock, Eye, CheckCircle2, MessageSquare } from "lucide-react";

const PrivacyPolicy = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  const sections = [
    {
      icon: <Eye className="text-primary" />,
      content: isAr 
        ? "نحن نجمع فقط المعلومات الضرورية لتشغيل التطبيق، مثل الاسم والبريد الإلكتروني عند تسجيل الدخول، كما نقوم بحفظ حالة الجولة التعريفية محلياً لتجنب تكرارها."
        : "We only collect essential information required to operate the app, such as your name and email address when you sign in, and we save the site tour completion status locally."
    },
    {
      icon: <Lock className="text-gold" />,
      title: isAr ? "كيفية استخدام البيانات" : "How We Use Data",
      content: isAr
        ? "تُستخدم بياناتك فقط لتوفير ميزاتنا الأساسية: مزامنة قائمة المفضلات، وحفظ تقدم القراءة، وتخصيص تجربتك."
        : "Your data is used solely to provide our core features: syncing your favorites, saving reading progress, and personalizing your experience."
    },
    {
      icon: <CheckCircle2 className="text-emerald-500" />,
      title: isAr ? "مشاركة البيانات" : "Data Sharing",
      content: isAr
        ? "نحن لا نبيع أو نشارك بياناتك الشخصية مع أي طرف ثالث لأغراض تسويقية. يتم تخزين البيانات بشكل آمن باستخدام خدمات جوجل."
        : "We do not sell or share your personal data with any third parties for marketing purposes. Data is stored securely using Google Cloud services."
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <QuranHeader title={isAr ? "سياسة الخصوصية" : "Privacy Policy"} variant="compact">
        <div className="mt-4">
          <BackButton />
        </div>
      </QuranHeader>

      <main className="container max-w-2xl mx-auto px-4 py-8 space-y-8">
        <section className="bg-card border border-border rounded-[2.5rem] p-8 md:p-10 shadow-soft relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
          <div className="flex items-center gap-5 mb-8 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Shield className="text-primary w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold text-primary">
                {isAr ? "التزامنا بالخصوصية" : "Our Privacy Commitment"}
              </h2>
              <p className="text-sm text-muted-foreground font-bold">
                {isAr ? "آخر تحديث: أبريل 2026" : "Last Updated: April 2026"}
              </p>
            </div>
          </div>

          <div className="space-y-4 text-foreground/80 leading-relaxed font-naskh text-base relative z-10">
            <p>
              {isAr 
                ? "نحن في تطبيق قرآنيات نؤمن بأن خصوصيتك هي أمانة. تم تطوير هذا التطبيق لخدمة كتاب الله وتسهيل قيام الليل، دون أي أهداف تجارية أو تطفلية."
                : "At Quraaniat, we believe your privacy is a trust. This app was developed to serve the Book of Allah and facilitate Night Prayer, without any commercial or intrusive goals."}
            </p>
            <p>
              {isAr
                ? "بياناتك الشخصية وتقدمك في التلاوة تبقى ملكاً لك، ونحن نستخدم أحدث التقنيات لضمان حمايتها ومزامنتها بأمان."
                : "Your personal data and reading progress remain yours. We use the latest technologies to ensure they are protected and synced securely."}
            </p>
          </div>
        </section>

        <div className="grid gap-6">
          {sections.map((section, i) => (
            <div key={i} className="bg-card border border-border/50 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  {section.icon}
                </div>
                <h3 className="font-serif font-bold text-lg text-foreground">{section.title}</h3>
              </div>
              <p className="text-base text-muted-foreground leading-relaxed font-naskh pr-2">
                {section.content}
              </p>
            </div>
          ))}
        </div>

        <section className="bg-primary/5 border border-primary/20 rounded-[2.5rem] p-8 text-center space-y-4">
          <h3 className="font-serif font-bold text-xl text-primary">
            {isAr ? "هل لديك استفسار؟" : "Have a question?"}
          </h3>
          <p className="text-base text-primary/70">
            {isAr 
              ? "فريقنا مستعد دائماً للإجابة على تساؤلاتكم حول كيفية حماية بياناتكم."
              : "Our team is always ready to answer your questions about how we protect your data."}
          </p>
          <div className="pt-2">
            <a 
              href="mailto:contact@quraaniat.app" 
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-md"
            >
              <MessageSquare size={18} />
              <span>{isAr ? "تواصل معنا عبر البريد" : "Contact via Email"}</span>
            </a>
          </div>
        </section>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
