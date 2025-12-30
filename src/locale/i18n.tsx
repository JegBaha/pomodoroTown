import React, { createContext, useContext, useMemo, useState } from 'react';

type Locale = 'tr' | 'en';

type Dict = Record<string, Record<Locale, string>>;

const translations: Dict = {
  'tab.pomodoro': { tr: 'Pomodoro', en: 'Pomodoro' },
  'tab.town': { tr: 'Kasaba', en: 'Town' },
  'tab.notes': { tr: 'Notlar', en: 'Notes' },
  'tab.profile': { tr: 'Profil', en: 'Profile' },
  'profile.title': { tr: 'Profil', en: 'Profile' },
  'profile.subtitle': { tr: 'Tema ve tercihlerini burada degistir.', en: 'Change theme and preferences here.' },
  'profile.queue.title': { tr: 'Komut Kuyrugu', en: 'Command Queue' },
  'profile.queue.subtitle': { tr: '(Profil) sayfasindasin. Pending vb. durumlari buradan takip edebilirsin.', en: 'You are on Profile. Track Pending/Acked/Rejected here.' },
  'profile.theme': { tr: 'Tema', en: 'Theme' },
  'profile.theme.dark': { tr: 'Koyu', en: 'Dark' },
  'profile.theme.light': { tr: 'Acik', en: 'Light' },
  'notes.title': { tr: 'Notlar', en: 'Notes' },
  'notes.subtitle.empty': { tr: 'Aklina geleni ekle.', en: 'Jot down anything on your mind.' },
  'notes.subtitle.count': { tr: '{{count}} not saklaniyor.', en: '{{count}} notes saved.' },
  'notes.placeholder': { tr: 'Yeni not yaz...', en: 'Write a new note...' },
  'notes.add': { tr: 'Ekle', en: 'Add' },
  'notes.empty': { tr: 'Henuz not yok.', en: 'No notes yet.' },
  'notes.edit': { tr: 'Duzenle', en: 'Edit' },
  'notes.save': { tr: 'Kaydet', en: 'Save' },
  'notes.cancel': { tr: 'Iptal', en: 'Cancel' },
  'notes.delete': { tr: 'Sil', en: 'Delete' },
  'town.map.title': { tr: 'Kasaba Haritasi', en: 'Town Map' },
  'town.map.subtitle': { tr: 'Cam gibi katmanlarla capcanli', en: 'Layered and lively' },
  'town.resources.title': { tr: 'Kaynaklar', en: 'Resources' },
  'town.resources.gold': { tr: 'Gold', en: 'Gold' },
  'town.resources.wood': { tr: 'Wood', en: 'Wood' },
  'town.resources.stone': { tr: 'Stone', en: 'Stone' },
  'town.resources.food': { tr: 'Food', en: 'Food' },
  'town.buildings.title': { tr: 'Binalar', en: 'Buildings' },
  'town.buildings.subtitle': { tr: 'Kaynaklarini parlak butonlarla yatir', en: 'Invest resources with bright buttons' },
  'town.place.farm': { tr: 'Ciftlik (G{{g}}/W{{w}}/S{{s}})', en: 'Farm (G{{g}}/W{{w}}/S{{s}})' },
  'town.place.sawmill': { tr: 'Odun atolyesi (G{{g}}/W{{w}}/S{{s}})', en: 'Sawmill (G{{g}}/W{{w}}/S{{s}})' },
  'town.place.mine': { tr: 'Maden (G{{g}}/W{{w}}/S{{s}})', en: 'Mine (G{{g}}/W{{w}}/S{{s}})' },
  'town.place.market': { tr: 'Pazar (G{{g}}/W{{w}}/S{{s}})', en: 'Market (G{{g}}/W{{w}}/S{{s}})' },
  'town.upgrade': { tr: 'Town Hall yukselt (Lv{{level}})', en: 'Upgrade Town Hall (Lv{{level}})' },
  'town.sync': { tr: 'Sync', en: 'Sync' },
  'town.move.banner': { tr: 'Tasima modu: haritada konum sec', en: 'Move mode: tap a tile to place' },
  'town.move.selected': { tr: 'Secildi', en: 'Selected' },
  'town.move.action': { tr: 'Tasi', en: 'Move' },
  'town.delete': { tr: 'Sil', en: 'Delete' },
  'pom.hero.badge': { tr: 'Forest Focus', en: 'Forest Focus' },
  'pom.hero.title': { tr: 'Pomodoro Town', en: 'Pomodoro Town' },
  'pom.hero.subtitle': { tr: 'Ormanda derin odaklan, sonra kasabana yatirim yap. Sakin ama guclu bir akis.', en: 'Focus deep in the forest, invest in your town. Calm but powerful flow.' },
  'pom.active.session': { tr: 'Aktif Oturum', en: 'Active Session' },
  'pom.active.subtitle': { tr: 'Odak suren premium bir akisla takip ediliyor', en: 'Your focus is tracked in a premium flow' },
  'pom.start.section': { tr: 'Baslat', en: 'Start' },
  'pom.start.subtitle': { tr: 'Dakika ve aktiviteyi pop-up ile sec', en: 'Choose duration and activity from popup' },
  'pom.resources.title': { tr: 'Kaynaklar', en: 'Resources' },
  'pom.resources.subtitle': { tr: 'Odagin kasabada altin, odun, tas ve yemek olur', en: 'Your focus yields gold, wood, stone, food' },
  'pom.table.title': { tr: 'Gunluk Tablo', en: 'Daily Table' },
  'pom.table.subtitle': { tr: 'Bugun hangi aktiviteye kac dakika ayirdin', en: 'How many minutes per activity today' },
  'pom.table.total': { tr: 'Toplam: {{total}} dk', en: 'Total: {{total}} min' },
  'pom.table.empty': { tr: 'Bugun icin veri yok', en: 'No data for today' },
  'pom.tasks.title': { tr: 'Gorevler', en: 'Tasks' },
  'pom.tasks.subtitle': { tr: 'Kucuk isler icin ekstra XP', en: 'Extra XP for small tasks' },
  'pom.task.placeholder': { tr: 'Gorev adi', en: 'Task name' },
  'pom.task.target.placeholder': { tr: 'Hedef (bos => tek adim)', en: 'Target (blank => single step)' },
  'pom.task.empty': { tr: 'Gorev yok', en: 'No tasks' },
  'pom.task.add': { tr: 'Ekle', en: 'Add' },
  'pom.task.complete': { tr: 'Tamamla', en: 'Complete' },
  'pom.task.increment.placeholder': { tr: '+ miktar', en: '+ amount' },
  'pom.modal.start.title': { tr: 'Pomodoro baslat', en: 'Start Pomodoro' },
  'pom.modal.start.subtitle': { tr: 'Dakika, aktivite ve kaynak sec', en: 'Pick duration, activity, and resource' },
  'pom.modal.minutes': { tr: 'Dakika', en: 'Minutes' },
  'pom.modal.activity': { tr: 'Aktivite', en: 'Activity' },
  'pom.modal.resource': { tr: 'Kaynak turu', en: 'Resource type' },
  'pom.modal.start': { tr: 'Baslat', en: 'Start' },
  'pom.modal.emptyActivity': { tr: 'Once aktivite ekle.', en: 'Add an activity first.' },
  'pom.lock.title': { tr: 'Pomodoro suruyor', en: 'Pomodoro running' },
  'pom.lock.subtitle': { tr: 'Sure bitene kadar ekran kilitli. Bitire basarak erkenden tamamlayabilirsin.', en: 'Screen locked until end. Tap Finish to end early.' },
  'pom.lock.remaining': { tr: 'Kalan sure', en: 'Remaining time' },
  'pom.level': { tr: 'Seviye {{level}} · XP {{xp}}', en: 'Level {{level}} · XP {{xp}}' },
  'pom.level.hint': { tr: 'XP bloklari 10 dakikada 2x artar', en: 'XP blocks double every 10 min' },
  'pom.timer.start': { tr: 'Baslat', en: 'Start' },
  'pom.timer.finish': { tr: 'Bitir', en: 'Finish' },
  'pom.timer.none': { tr: 'Henuz oturum yok. Dakika sec ve baslat.', en: 'No session yet. Pick minutes and start.' },
  'pom.session.startedAt': { tr: 'Baslangic', en: 'Started' },
  'pom.addActivity': { tr: 'Aktivite ekle', en: 'Add activity' },
  'pom.sync': { tr: 'Sync', en: 'Sync' },
  'common.select': { tr: 'Sec', en: 'Select' },
  'common.delete': { tr: 'Sil', en: 'Delete' },
};

type LocaleContextType = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export const LocaleProvider = ({ children }: { children: React.ReactNode }) => {
  const [locale, setLocale] = useState<Locale>('tr');

  const t = (key: string, vars?: Record<string, string | number>) => {
    const entry = translations[key];
    const base = entry ? entry[locale] ?? entry.tr ?? entry.en ?? key : key;
    if (!vars) return base;
    return Object.entries(vars).reduce((acc, [k, v]) => acc.replace(`{{${k}}}`, String(v)), base);
  };

  const value = useMemo(() => ({ locale, setLocale, t }), [locale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
};

export const useLocale = () => {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
};

