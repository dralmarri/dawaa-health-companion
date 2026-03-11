import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, FlaskConical, Users, FileText, Shield, Mail, Info, LogOut, Trash2, ChevronRight } from "lucide-react";
import { store } from "@/lib/store";
import ChipSelector from "@/components/ChipSelector";
import type { AppSettings } from "@/types";

const SettingsPage = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<AppSettings>(store.getSettings());

  const update = (partial: Partial<AppSettings>) => {
    const next = { ...settings, ...partial };
    setSettings(next);
    store.saveSettings(next);
  };

  const menuItems = [
    { icon: Users, label: "Emergency Contact", path: "#" },
    { icon: FlaskConical, label: "Lab Tests", path: "/lab-tests" },
    { icon: CalendarDays, label: "Appointments", path: "/appointments" },
  ];

  const aboutItems = [
    { icon: FileText, label: "Terms of Use" },
    { icon: Shield, label: "Privacy Policy" },
    { icon: Mail, label: "Contact Us" },
    { icon: Info, label: "Version", value: "1.0.1" },
  ];

  return (
    <div className="pb-24">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
      </div>

      <div className="px-4 space-y-4">
        {/* Language */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <label className="text-base font-bold text-foreground block mb-3">Language</label>
          <div className="flex gap-3">
            {(["ar", "en"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => update({ language: lang })}
                className={`flex-1 py-3 rounded-xl border text-center font-semibold transition-colors ${
                  settings.language === lang
                    ? "border-primary bg-chip-active text-chip-active-foreground"
                    : "border-border bg-chip text-chip-foreground"
                }`}
              >
                {lang === "ar" ? "العربية" : "English"}
              </button>
            ))}
          </div>
        </div>

        {/* User Name */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <label className="text-base font-bold text-foreground block mb-2">User Name</label>
          <input
            value={settings.userName}
            onChange={(e) => update({ userName: e.target.value })}
            placeholder="Your name..."
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Notifications */}
        <div className="bg-card rounded-2xl border border-border p-5 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-foreground">Notifications</h3>
            <p className="text-sm text-muted-foreground">
              {settings.notifications ? "Enabled" : "Disabled"} - 0 scheduled
            </p>
          </div>
          <button
            onClick={() => update({ notifications: !settings.notifications })}
            className={`w-12 h-7 rounded-full transition-colors relative ${
              settings.notifications ? "bg-primary" : "bg-border"
            }`}
          >
            <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-card shadow transition-transform ${
              settings.notifications ? "right-0.5" : "left-0.5"
            }`} />
          </button>
        </div>

        {/* Voice Notifications */}
        <div className="bg-card rounded-2xl border border-border p-5 flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-bold text-foreground flex items-center gap-2">🔊 Voice Notifications</h3>
            <p className="text-sm text-muted-foreground">
              Read medication names aloud when reminders fire - great for elderly users
            </p>
          </div>
          <button
            onClick={() => update({ voiceNotifications: !settings.voiceNotifications })}
            className={`w-12 h-7 rounded-full transition-colors relative flex-shrink-0 ${
              settings.voiceNotifications ? "bg-primary" : "bg-border"
            }`}
          >
            <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-card shadow transition-transform ${
              settings.voiceNotifications ? "right-0.5" : "left-0.5"
            }`} />
          </button>
        </div>

        {/* Reminder */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <label className="text-base font-bold text-foreground block mb-3">Reminder before dose</label>
          <ChipSelector
            options={["At time", "5 minutes", "10 minutes", "15 minutes"]}
            value={settings.reminderBefore}
            onChange={(v) => update({ reminderBefore: v })}
          />
        </div>

        {/* Escalation */}
        <div className="bg-card rounded-2xl border border-border p-5 flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-bold text-foreground">Escalation on missed doses</h3>
            <p className="text-sm text-muted-foreground">
              Notify emergency contact when 2 consecutive doses are missed
            </p>
          </div>
          <button
            onClick={() => update({ escalationOnMissed: !settings.escalationOnMissed })}
            className={`w-12 h-7 rounded-full transition-colors relative flex-shrink-0 ${
              settings.escalationOnMissed ? "bg-primary" : "bg-border"
            }`}
          >
            <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-card shadow transition-transform ${
              settings.escalationOnMissed ? "right-0.5" : "left-0.5"
            }`} />
          </button>
        </div>

        {/* Menu Items */}
        <div className="bg-card rounded-2xl border border-border divide-y divide-border">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => item.path !== "#" && navigate(item.path)}
              className="w-full flex items-center justify-between px-5 py-4"
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5 text-primary" />
                <span className="text-foreground font-medium">{item.label}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}
        </div>

        {/* About */}
        <div className="bg-card rounded-2xl border border-border divide-y divide-border">
          <div className="px-5 py-3">
            <h3 className="font-bold text-foreground">About</h3>
          </div>
          {aboutItems.map((item) => (
            <div key={item.label} className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5 text-primary" />
                <span className="text-foreground font-medium">{item.label}</span>
              </div>
              {item.value ? (
                <span className="text-muted-foreground">{item.value}</span>
              ) : (
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>

        {/* Sign Out */}
        <button className="bg-card rounded-2xl border border-border w-full flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <LogOut className="w-5 h-5 text-destructive" />
            <span className="text-destructive font-medium">Sign Out</span>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Delete Account */}
        <button className="bg-card rounded-2xl border border-border w-full flex items-center justify-between px-5 py-4 mb-4">
          <div className="flex items-center gap-3">
            <Trash2 className="w-5 h-5 text-destructive" />
            <span className="text-destructive font-medium">Delete Account & All Data</span>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
