import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, FlaskConical, Users, FileText, Shield, Mail, Info, LogOut, Trash2, ChevronRight, ChevronLeft, Bell } from "lucide-react";
import { store } from "@/lib/store";
import ChipSelector from "@/components/ChipSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import { requestNotificationPermission, scheduleMedicationNotifications, getPermissionStatus } from "@/lib/notifications";
import { toast } from "sonner";
import type { AppSettings } from "@/types";

const SettingsPage = () => {
  const navigate = useNavigate();
  const { t, lang, setLang, isRTL } = useLanguage();
  const [settings, setSettings] = useState<AppSettings>(store.getSettings());

  const update = (partial: Partial<AppSettings>) => {
    const next = { ...settings, ...partial };
    setSettings(next);
    store.saveSettings(next);
  };

  const Chevron = isRTL ? ChevronLeft : ChevronRight;

  const menuItems = [
    { icon: Users, label: t.emergencyContact, path: "#" },
    { icon: FlaskConical, label: t.labTests, path: "/lab-tests" },
    { icon: CalendarDays, label: t.appointments, path: "/appointments" },
  ];

  const aboutItems = [
    { icon: FileText, label: t.termsOfUse },
    { icon: Shield, label: t.privacyPolicy },
    { icon: Mail, label: t.contactUs },
    { icon: Info, label: t.version, value: "1.0.1" },
  ];

  const reminderMap: Record<string, string> = {
    "At time": t.atTime, "5 minutes": t.min5, "10 minutes": t.min10, "15 minutes": t.min15,
  };
  const reminderKeys = Object.keys(reminderMap);
  const reminderLabels = Object.values(reminderMap);

  return (
    <div className="pb-24">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-3xl font-bold text-foreground">{t.settings}</h1>
      </div>

      <div className="px-4 space-y-4">
        {/* Language */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <label className="text-base font-bold text-foreground block mb-3">{t.language}</label>
          <div className="flex gap-3">
            <button onClick={() => { setLang("ar"); update({ language: "ar" }); }}
              className={`flex-1 py-3 rounded-xl border text-center font-semibold transition-colors ${lang === "ar" ? "border-primary bg-chip-active text-chip-active-foreground" : "border-border bg-chip text-chip-foreground"}`}>
              العربية
            </button>
            <button onClick={() => { setLang("en"); update({ language: "en" }); }}
              className={`flex-1 py-3 rounded-xl border text-center font-semibold transition-colors ${lang === "en" ? "border-primary bg-chip-active text-chip-active-foreground" : "border-border bg-chip text-chip-foreground"}`}>
              English
            </button>
          </div>
        </div>

        {/* User Name */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <label className="text-base font-bold text-foreground block mb-2">{t.userName}</label>
          <input value={settings.userName} onChange={(e) => update({ userName: e.target.value })}
            placeholder={t.userName + "..."}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>

        {/* Notifications */}
        <div className="bg-card rounded-2xl border border-border p-5 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-foreground">{t.notifications}</h3>
            <p className="text-sm text-muted-foreground">
              {settings.notifications ? t.enabled : t.disabled} - 0 {t.scheduled}
            </p>
          </div>
          <button onClick={() => update({ notifications: !settings.notifications })}
            className={`w-12 h-7 rounded-full transition-colors relative ${settings.notifications ? "bg-primary" : "bg-border"}`}>
            <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-card shadow transition-all ${settings.notifications ? "ltr:right-0.5 rtl:left-0.5" : "ltr:left-0.5 rtl:right-0.5"}`} />
          </button>
        </div>

        {/* Voice Notifications */}
        <div className="bg-card rounded-2xl border border-border p-5 flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-bold text-foreground flex items-center gap-2">🔊 {t.voiceNotifications}</h3>
            <p className="text-sm text-muted-foreground">{t.voiceNotificationsDesc}</p>
          </div>
          <button onClick={() => update({ voiceNotifications: !settings.voiceNotifications })}
            className={`w-12 h-7 rounded-full transition-colors relative flex-shrink-0 ${settings.voiceNotifications ? "bg-primary" : "bg-border"}`}>
            <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-card shadow transition-all ${settings.voiceNotifications ? "ltr:right-0.5 rtl:left-0.5" : "ltr:left-0.5 rtl:right-0.5"}`} />
          </button>
        </div>

        {/* Reminder */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <label className="text-base font-bold text-foreground block mb-3">{t.reminderBefore}</label>
          <ChipSelector options={reminderLabels} value={reminderMap[settings.reminderBefore] || settings.reminderBefore}
            onChange={(v) => update({ reminderBefore: reminderKeys[reminderLabels.indexOf(v)] || v })} />
        </div>

        {/* Escalation */}
        <div className="bg-card rounded-2xl border border-border p-5 flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-bold text-foreground">{t.escalationOnMissed}</h3>
            <p className="text-sm text-muted-foreground">{t.escalationDesc}</p>
          </div>
          <button onClick={() => update({ escalationOnMissed: !settings.escalationOnMissed })}
            className={`w-12 h-7 rounded-full transition-colors relative flex-shrink-0 ${settings.escalationOnMissed ? "bg-primary" : "bg-border"}`}>
            <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-card shadow transition-all ${settings.escalationOnMissed ? "ltr:right-0.5 rtl:left-0.5" : "ltr:left-0.5 rtl:right-0.5"}`} />
          </button>
        </div>

        {/* Menu Items */}
        <div className="bg-card rounded-2xl border border-border divide-y divide-border">
          {menuItems.map((item) => (
            <button key={item.label} onClick={() => item.path !== "#" && navigate(item.path)}
              className="w-full flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5 text-primary" />
                <span className="text-foreground font-medium">{item.label}</span>
              </div>
              <Chevron className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}
        </div>

        {/* About */}
        <div className="bg-card rounded-2xl border border-border divide-y divide-border">
          <div className="px-5 py-3"><h3 className="font-bold text-foreground">{t.about}</h3></div>
          {aboutItems.map((item) => (
            <div key={item.label} className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5 text-primary" />
                <span className="text-foreground font-medium">{item.label}</span>
              </div>
              {item.value ? <span className="text-muted-foreground">{item.value}</span> : <Chevron className="w-5 h-5 text-muted-foreground" />}
            </div>
          ))}
        </div>

        <button className="bg-card rounded-2xl border border-border w-full flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <LogOut className="w-5 h-5 text-destructive" />
            <span className="text-destructive font-medium">{t.signOut}</span>
          </div>
          <Chevron className="w-5 h-5 text-muted-foreground" />
        </button>

        <button className="bg-card rounded-2xl border border-border w-full flex items-center justify-between px-5 py-4 mb-4">
          <div className="flex items-center gap-3">
            <Trash2 className="w-5 h-5 text-destructive" />
            <span className="text-destructive font-medium">{t.deleteAccount}</span>
          </div>
          <Chevron className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
