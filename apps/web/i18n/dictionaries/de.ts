import type { Dictionary } from './en';

/** German (de). Machine-drafted - review by a native speaker before release. */
const de: Dictionary = {
  meta: {
    titleDefault: 'Locklune: private, offline Zyklus-Aufzeichnung',
    description:
      'Locklune behält deinen Zyklus auf deinem Gerät, verschlüsselt mit deiner PIN. Keine Cloud, kein Konto, kein Tracking.',
    supportTitle: 'Hilfe',
    supportDescription: 'Häufige Fragen und wie du das Locklune-Team erreichst.',
  },
  nav: {
    privacy: 'Datenschutz',
    tracking: 'Aufzeichnung',
    security: 'Sicherheit',
    support: 'Hilfe',
    download: 'Herunterladen',
    home: 'Locklune Startseite',
    language: 'Sprache',
  },
  footer: {
    tagline: 'Ein Zyklus-Tracker, der auf deinem Gerät bleibt. Privat. Sicher. Nur deiner.',
    product: 'Produkt',
    privacyFirst: 'Datenschutz zuerst',
    security: 'Sicherheit',
    support: 'Hilfe',
    legal: 'Rechtliches',
    privacyPolicy: 'Datenschutzerklärung',
    terms: 'AGB',
    elsewhere: 'Anderswo',
    disclaimer:
      'Locklune dient nur zu Aufzeichnungszwecken und bietet keine medizinische oder gesundheitliche Beratung.',
    noTracking: 'Keine Cookies. Kein Tracking. Keine Server.',
    madeWith: 'Gemacht mit',
    supportCreator: 'Unterstütze die Entwicklerin',
  },
  hero: {
    badge: 'Nur auf dem Gerät · verschlüsselt · kein Tracking',
    tagline: 'Endlich ein Perioden-Tracker, der wirklich privat ist.',
    sub1: 'Deine Zyklusdaten verlassen niemals dein Gerät.',
    sub2: 'Mit deiner PIN geschützt. Keine Cloud. Kein Konto. Keine digitale Spur.',
    downloadFree: 'Kostenlos herunterladen',
    learnPrivacy: 'Erfahre, wie deine Privatsphäre geschützt wird',
    availability: 'Jetzt für Android und iOS.',
  },
  privacySection: {
    eyebrow: 'Datenschutz zuerst',
    title: 'Gebaut, um nichts preiszugeben',
    cards: [
      {
        title: 'Durch PIN geschützt',
        body: 'Eine PIN, die du wählst, leitet den Schlüssel ab, der alles verschlüsselt. Sie wird niemals gespeichert oder irgendwohin gesendet.',
      },
      {
        title: 'Alles bleibt auf deinem Gerät',
        body: 'Dein Zyklus, deine Symptome und Notizen liegen in einer verschlüsselten Datenbank auf deinem Telefon – und nur dort.',
      },
      {
        title: 'Keine Cloud. Kein Konto. Keine Datenerfassung.',
        body: 'Es gibt keine Anmeldung und keinen Server. Nichts zu hacken, nichts zu verkaufen, nichts zu teilen.',
      },
    ],
  },
  trackingSection: {
    eyebrow: 'Schönes Tracking',
    title: 'Ruhig, minimal und leise kraftvoll',
    intro:
      'Eine Zeitleiste, ein eleganter Kalender, Stimmungs-Tracking und adaptive Vorhersagen – alles in einer ruhigen, dunklen Oberfläche, die in den Hintergrund tritt. Ob du deinen Zyklus verfolgst, schwanger werden möchtest, verhütest oder schwanger bist – Locklune passt sich dir an.',
    calendarTitle: 'Eleganter Kalender',
    predictionsTitle: 'Zyklusvorhersagen',
    nextPeriod: 'Nächste Periode',
    inDays: 'in 6 Tagen',
    fertileWindow: 'Fruchtbares Fenster',
    fertileDates: '9.–14. Juli',
    moodTitle: 'Stimmung & Symptome',
    tags: ['Krämpfe', 'ruhig', 'müde', 'fokussiert'],
  },
  whySection: {
    eyebrow: 'Warum Locklune',
    title: 'Andere Standardeinstellungen',
    others: 'Andere',
    rows: [
      { label: 'Wo deine Daten liegen', locklune: 'Nur lokal, auf deinem Gerät', others: 'In die Cloud synchronisiert' },
      { label: 'Zugang', locklune: 'PIN-geschützt', others: 'Anmeldung erforderlich' },
      { label: 'Analysen', locklune: 'Keine', others: 'Nutzungs-Tracking' },
      { label: 'Konto', locklune: 'Kein Konto', others: 'E-Mail erforderlich' },
      { label: 'Verschlüsselung', locklune: 'AES-256 auf dem Gerät', others: 'Variiert, oft serverseitig' },
      {
        label: 'Behördliche oder rechtliche Anfragen',
        locklune: 'Es existieren keine Daten zum Beschlagnahmen',
        others: 'Cloud-Daten können herausgegeben werden',
      },
      { label: 'Wiederholt falsche PINs', locklune: 'Löscht alle Daten nach 5 Versuchen', others: 'Kontosperrung' },
    ],
  },
  securitySection: {
    eyebrow: 'Sicherheit',
    title: 'Seelenfrieden, von Grund auf',
    items: [
      {
        title: 'Lokale Ende-zu-Ende-Verschlüsselung',
        body: 'Deine Daten liegen in einer AES-256-verschlüsselten Datenbank (SQLCipher), die nur mit deiner PIN entsperrt wird.',
      },
      {
        title: 'PIN-Sperre',
        body: 'Eine PIN, die du wählst, leitet den Verschlüsselungsschlüssel ab. Sie wird niemals gespeichert oder übertragen.',
      },
      { title: 'Offline-Unterstützung', body: 'Alles funktioniert ohne Verbindung. Es gibt nichts zu synchronisieren.' },
      { title: 'Keine Server', body: 'Es gibt kein Backend zum Hacken, Vorladen oder Verkaufen. Wir halten nichts.' },
      {
        title: 'Keine Analysen von Drittanbietern',
        body: 'Keine SDKs, keine Tracker, keine Identifikatoren. Weder in der App noch auf dieser Website.',
      },
      {
        title: 'Automatisches Löschen',
        body: 'Nach 5 falschen PIN-Versuchen wird alles auf dem Gerät gelöscht, sodass ein verlorenes oder gestohlenes Telefon nichts preisgibt.',
      },
    ],
  },
  download: {
    title: 'Dein Zyklus. An dein Gerät gebunden.',
    body: 'Kein Konto, keine Cloud, kein Tracking. Nur ein ruhiger, privater Ort, um deinen Körper zu verstehen.',
    googlePlay: 'Bei Google Play herunterladen',
    appStore: 'Im App Store laden',
    readPrivacy: 'Datenschutzerklärung lesen',
    availability: 'Kostenlos für Android und iOS.',
  },
  support: {
    title: 'Hilfe',
    intro: 'Häufige Fragen unten. Brauchst du noch Hilfe? Schreib uns eine Nachricht und wir antworten per E-Mail.',
    contactTitle: 'Kontaktiere uns',
    contactIntro:
      'Das Durchsuchen dieser Website erfasst nichts. Wenn du dieses Formular sendest, werden deine E-Mail (optional) und deine Nachricht an unser Support-Postfach gesendet, damit wir antworten können, und für nichts anderes verwendet.',
    faqs: [
      {
        question: 'Ich habe meine PIN vergessen. Könnt ihr sie zurücksetzen?',
        answer:
          'Nein, und wir können es auch nicht. Deine PIN ist der Verschlüsselungsschlüssel zu deinen Daten, und wir erhalten oder speichern sie niemals. Eine vergessene PIN bedeutet, dass die Daten nicht wiederhergestellt werden können – das ist der Preis echter Privatsphäre. Wenn du ausgesperrt bist, kannst du auf dem Sperrbildschirm Zurücksetzen und neu beginnen wählen: Dies löscht alles auf dem Gerät und lässt dich mit einer neuen PIN neu einrichten.',
      },
      {
        question: 'Werden meine Daten in der Cloud gesichert?',
        answer:
          'Nein. Nichts wird irgendwohin hochgeladen. Deine Daten liegen nur auf deinem Gerät. Wenn du ein neues Telefon bekommst, werden frühere Daten nicht automatisch übertragen.',
      },
      {
        question: 'Wie werden Vorhersagen berechnet?',
        answer:
          'Locklune schätzt deine nächste Periode aus einem nach Aktualität gewichteten Durchschnitt deiner letzten Zykluslängen, mit einem Unsicherheitsbereich basierend darauf, wie regelmäßig deine Zyklen sind. Der Eisprung wird aus einer annähernd konstanten Lutealphase geschätzt und das fruchtbare Fenster aus der typischen Lebensdauer von Spermien und Eizelle. Alles wird auf deinem Gerät berechnet und passt sich an, je mehr Zyklen du erfasst.',
      },
      {
        question: 'Sind Vorhersagen medizinische oder verhütungsbezogene Beratung?',
        answer:
          'Nein. Sie sind nur Schätzungen zu deiner Information und sollten nicht für Verhütung oder medizinische Entscheidungen herangezogen werden.',
      },
      {
        question: 'Wie lösche ich alles?',
        answer:
          'Öffne die Einstellungen, dann Alle Daten löschen, oder lösche einfach die App. Es ist nichts anderswo gespeichert.',
      },
    ],
  },
  contact: {
    emailInvalid: 'Diese E-Mail-Adresse sieht nicht richtig aus.',
    messageMin: 'Bitte gib eine Nachricht mit mindestens 10 Zeichen ein.',
    sentTitle: 'Danke, deine Nachricht wurde gesendet.',
    sentReplyEmail: 'Wir melden uns per E-Mail bei dir.',
    sentAnon: 'Deine Nachricht wurde anonym empfangen.',
    noPersonalInfoBefore: 'Bitte gib in diesem Formular ',
    noPersonalInfoBold: 'keine',
    noPersonalInfoAfter: ' persönlichen Informationen über deine Fruchtbarkeit oder deinen Menstruationszyklus an.',
    emailLabel: 'E-Mail',
    optional: '(optional)',
    emailHint: 'Gib deine E-Mail an, wenn du eine Antwort möchtest – oder lass sie leer, um anonym zu kontaktieren.',
    messageLabel: 'Nachricht',
    sendError: 'Konnte gerade nicht gesendet werden. Bitte versuche es erneut.',
    sending: 'Wird gesendet',
    sendMessage: 'Nachricht senden',
    company: 'Firma',
  },
  legalNote: 'Diese Seite ist nur auf Englisch verfügbar.',
};

export default de;
