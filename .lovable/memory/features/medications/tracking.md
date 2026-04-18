---
name: Medication Tracking
description: Deduplication, async cloud updates, click event isolation, taken cancels notification, undo dose support
type: feature
---

نظام تتبع الأدوية يتضمن:
- آلية لمنع تكرار الجرعات (Deduplication) بناءً على مفتاح فريد (معرف الدواء + الوقت + التاريخ).
- مزامنة سحابية غير متزامنة (async) للسجلات.
- عزل أحداث النقر (stopPropagation) لمنع فتح صفحة التعديل عند الضغط على "تم/فائتة".
- **عند تسجيل جرعة كـ "تم أخذها"**: يتم إلغاء التنبيه المجدول لذلك الدواء في ذلك الوقت تلقائياً (cancelDoseNotification) لمنع إزعاج المستخدم. التنبيه يعاد جدولته في اليوم التالي عبر scheduleMedicationNotifications.
- **التراجع عن الجرعة (Undo)**: تتوفر دالة `undoDose` في `src/lib/dose-tracker.ts` تعيد الحالة إلى pending وتسترجع وحدة من المخزون إذا كانت الجرعة قد أُخذت سابقاً، وتعيد جدولة التنبيهات. متاحة عبر زر "تراجع" في toast الصفحة الرئيسية، وعبر زر مباشر في صفحة السجل (HistoryPage) للجرعات المؤرشفة كـ "تم".
