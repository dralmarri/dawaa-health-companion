import { useLanguage } from "@/contexts/LanguageContext";
import PageHeader from "@/components/PageHeader";

const PrivacyPolicyPage = () => {
  const { isRTL } = useLanguage();

  return (
    <div className="pb-24">
      <PageHeader title={isRTL ? "سياسة الخصوصية" : "Privacy Policy"} showBack />
      <div className="px-4 space-y-4">
        <div className="bg-card rounded-2xl border border-border p-5 space-y-4 text-foreground text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-bold mb-2">{isRTL ? "مقدمة" : "Introduction"}</h2>
            <p>{isRTL
              ? "تطبيق Dawaa+ (دواء بلس) يحترم خصوصيتك ويلتزم بحماية بياناتك الشخصية. توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية معلوماتك."
              : "Dawaa+ respects your privacy and is committed to protecting your personal data. This privacy policy explains how we collect, use, and protect your information."
            }</p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">{isRTL ? "البيانات التي نجمعها" : "Data We Collect"}</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>{isRTL ? "معلومات الأدوية (الاسم، الجرعة، أوقات التناول)" : "Medication information (name, dosage, schedule times)"}</li>
              <li>{isRTL ? "قراءات ضغط الدم ومعدل النبض" : "Blood pressure readings and heart rate"}</li>
              <li>{isRTL ? "مواعيد الأطباء والتخصصات" : "Doctor appointments and specialties"}</li>
              <li>{isRTL ? "نتائج التحاليل المخبرية" : "Lab test results"}</li>
              <li>{isRTL ? "اسم المستخدم وإعدادات التطبيق" : "User name and app settings"}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">{isRTL ? "كيف نستخدم بياناتك" : "How We Use Your Data"}</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>{isRTL ? "تذكيرك بمواعيد أدويتك لضمان الالتزام بالعلاج" : "Remind you of medication schedules to ensure treatment adherence"}</li>
              <li>{isRTL ? "تتبع قراءات ضغط الدم وإنشاء تقارير للطبيب" : "Track blood pressure readings and generate reports for your doctor"}</li>
              <li>{isRTL ? "إدارة مواعيدك الطبية وإرسال تنبيهات" : "Manage your medical appointments and send reminders"}</li>
              <li>{isRTL ? "تحليل نتائج التحاليل المخبرية ومقارنتها بالمعدلات الطبيعية" : "Analyze lab test results and compare them with normal ranges"}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">{isRTL ? "تخزين البيانات" : "Data Storage"}</h2>
            <p>{isRTL
              ? "جميع بياناتك تُخزّن محلياً على جهازك فقط. لا يتم إرسال أي بيانات شخصية أو طبية إلى خوادم خارجية. أنت المتحكم الوحيد في بياناتك."
              : "All your data is stored locally on your device only. No personal or medical data is sent to external servers. You are the sole controller of your data."
            }</p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">{isRTL ? "الإشعارات" : "Notifications"}</h2>
            <p>{isRTL
              ? "يستخدم التطبيق الإشعارات المحلية لتذكيرك بمواعيد الأدوية ومواعيد الأطباء. يمكنك تفعيل أو تعطيل الإشعارات من إعدادات التطبيق في أي وقت."
              : "The app uses local notifications to remind you of medication schedules and doctor appointments. You can enable or disable notifications from the app settings at any time."
            }</p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">{isRTL ? "الأذونات المستخدمة" : "Permissions Used"}</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>{isRTL
                ? "الإشعارات: لإرسال تذكيرات مواعيد الأدوية والمواعيد الطبية في الوقت المحدد"
                : "Notifications: To send medication and appointment reminders at scheduled times"
              }</li>
              <li>{isRTL
                ? "الكاميرا/مكتبة الصور: لالتقاط صور الأدوية أو رفع نتائج التحاليل المخبرية"
                : "Camera/Photo Library: To capture medication photos or upload lab test results"
              }</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">{isRTL ? "حذف البيانات" : "Data Deletion"}</h2>
            <p>{isRTL
              ? "يمكنك حذف جميع بياناتك في أي وقت من خلال خيار 'حذف الحساب وجميع البيانات' في صفحة الإعدادات. سيتم مسح جميع المعلومات المخزنة نهائياً من جهازك."
              : "You can delete all your data at any time through the 'Delete Account & All Data' option in Settings. All stored information will be permanently erased from your device."
            }</p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">{isRTL ? "التواصل معنا" : "Contact Us"}</h2>
            <p>{isRTL
              ? "إذا كان لديك أي استفسار حول سياسة الخصوصية، يرجى التواصل معنا عبر البريد الإلكتروني: support@dawaaplus.app"
              : "If you have any questions about this privacy policy, please contact us at: support@dawaaplus.app"
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

export default PrivacyPolicyPage;
