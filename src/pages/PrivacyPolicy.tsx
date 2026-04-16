import React from "react";
import QuranHeader from "@/components/QuranHeader";
import BackButton from "@/components/BackButton";
import { useTranslation } from "react-i18next";
import { Shield, Lock, Eye, CheckCircle2 } from "lucide-react";

const PrivacyPolicy = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  const sections = [
    {
      icon: <Eye className="text-primary" />,
      title: isAr ? "البيانات التي نجمعها" : "Data We Collect",
      content: isAr 
        ? "نحن نجمع فقط المعلومات الضرورية لتشغيل التطبيق، مثل الاسم والبريد الإلكتروني عند تسجيل الدخول عبر جوجل لمزامنة تقدمك."
        : "We only collect essential information required to operate the app, such as your name and email address when you sign in with Google to sync your progress."
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
        <section className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-soft">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Shield className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-primary">
                {isAr ? "التزامنا بالخصوصية" : "Our Privacy Commitment"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {isAr ? "آخر تحديث: أبريل 2024" : "Last Updated: April 2024"}
              </p>
            </div>
          </div>

          <p className="text-sm text-foreground/80 leading-relaxed font-naskh">
            {isAr 
              ? "نحن في تطبيق قرآنيات نقدر خصوصيتك. تم تصميم هذا التطبيق ليكون خادماً لك في رحلتك مع كتاب الله، ونحن نلتزم بحماية بياناتك بأعلى معايير الأمان."
              : "At Quraaniat app, we value your privacy. This app is designed to serve you in your journey with the Book of Allah, and we are committed to protecting your data with the highest security standards."}
          </p>
        </section>

        <div className="grid gap-6">
          {sections.map((section, i) => (
            <div key={i} className="bg-muted/30 border border-border/50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                {section.icon}
                <h3 className="font-serif font-bold text-base">{section.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed font-naskh">
                {section.content}
              </p>
            </div>
          ))}
        </div>

        <section className="bg-gold/5 border border-gold/20 rounded-2xl p-6 text-center">
          <h3 className="font-serif font-bold text-primary mb-2">
            {isAr ? "تواصل معنا" : "Contact Us"}
          </h3>
          <p className="text-sm text-primary/70 mb-4">
            {isAr 
              ? "إذا كان لديك أي أسئلة حول سياسة الخصوصية، يرجى التواصل معنا."
              : "If you have any questions about our privacy policy, please contact us."}
          </p>
          <a 
            href="mailto:contact@quraaniat.app" 
            className="text-primary font-bold underline"
          >
            contact@quraaniat.app
          </a>
        </section>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
