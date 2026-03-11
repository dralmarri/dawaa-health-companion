import { useLanguage } from "@/contexts/LanguageContext";
import PageHeader from "@/components/PageHeader";

const TermsOfUsePage = () => {
  const { isRTL } = useLanguage();

  return (
    <div className="pb-24">
      <PageHeader title={isRTL ? "شروط الاستخدام" : "Terms of Use"} showBack />
      <div className="px-4 space-y-4">
        <div className="bg-card rounded-2xl border border-border p-5 space-y-4 text-foreground text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-bold mb-2">{isRTL ? "القبول بالشروط" : "Acceptance of Terms"}</h2>
            <p>{isRTL
              ? "باستخدامك لتطبيق Dawaa+ (دواء بلس)، فإنك توافق على الالتزام بشروط الاستخدام هذه. إذا لم توافق على هذه الشروط، يرجى عدم استخدام التطبيق."
              : "By using the Dawaa+ app, you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use the app."
            }</p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">{isRTL ? "الغرض من التطبيق" : "App Purpose"}</h2>
            <p>{isRTL
              ? "تطبيق Dawaa+ هو أداة لإدارة الأدوية والمواعيد الطبية. التطبيق ليس بديلاً عن الاستشارة الطبية المتخصصة ولا يقدم نصائح طبية."
              : "Dawaa+ is a medication and appointment management tool. The app is not a substitute for professional medical advice and does not provide medical recommendations."
            }</p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">{isRTL ? "إخلاء المسؤولية" : "Disclaimer"}</h2>
            <p>{isRTL
              ? "التطبيق يُقدَّم 'كما هو' دون أي ضمانات. لا نتحمل مسؤولية أي أضرار ناتجة عن استخدام التطبيق أو الاعتماد على المعلومات المقدمة فيه. استشر طبيبك دائماً."
              : "The app is provided 'as is' without any warranties. We are not responsible for any damages resulting from the use of the app or reliance on the information provided. Always consult your doctor."
            }</p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">{isRTL ? "حقوق الملكية" : "Intellectual Property"}</h2>
            <p>{isRTL
              ? "جميع حقوق الملكية الفكرية للتطبيق محفوظة. لا يجوز نسخ أو توزيع أي جزء من التطبيق دون إذن مسبق."
              : "All intellectual property rights in the app are reserved. No part of the app may be copied or distributed without prior permission."
            }</p>
          </section>

          <p className="text-muted-foreground text-xs pt-2">
            {isRTL ? "آخر تحديث: مارس 2026" : "Last updated: March 2026"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUsePage;
