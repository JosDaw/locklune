/**
 * English dictionary - the source of truth for all translatable marketing copy.
 * Its shape (`Dictionary`) is imported by the other locales so a missing or
 * misspelled key fails typechecking. Legal page bodies live in the pages
 * themselves (English-only) and are not part of this dictionary.
 */
export const en = {
  meta: {
    titleDefault: 'Locklune: private, offline period tracking',
    description:
      'Locklune keeps your cycle on your device, encrypted with your PIN. No cloud, no account, no tracking.',
    supportTitle: 'Support',
    supportDescription: 'Frequently asked questions and how to reach the Locklune team.',
  },
  nav: {
    privacy: 'Privacy',
    tracking: 'Tracking',
    security: 'Security',
    support: 'Support',
    download: 'Download',
    home: 'Locklune home',
    language: 'Language',
  },
  footer: {
    tagline: 'A period tracker that stays on your device. Private. Secure. Only yours.',
    product: 'Product',
    privacyFirst: 'Privacy first',
    security: 'Security',
    support: 'Support',
    legal: 'Legal',
    privacyPolicy: 'Privacy Policy',
    terms: 'Terms',
    elsewhere: 'Elsewhere',
    disclaimer:
      'Locklune is for record keeping purposes only and does not provide medical or health advice.',
    noTracking: 'No cookies. No tracking. No servers.',
    madeWith: 'Made with',
  },
  hero: {
    badge: 'Device-only · encrypted · no tracking',
    tagline: "Finally, a period tracker that's actually private.",
    sub1: 'Your cycle data never leaves your device.',
    sub2: 'Protected with your PIN. No cloud. No account. No digital record.',
    downloadFree: 'Download Free',
    learnPrivacy: 'Learn how your privacy is protected',
    availability: 'Now on Android and iOS.',
  },
  privacySection: {
    eyebrow: 'Privacy first',
    title: 'Built to reveal nothing',
    cards: [
      {
        title: 'Protected by PIN',
        body: 'A PIN you choose derives the key that encrypts everything. It is never stored or sent anywhere.',
      },
      {
        title: 'Everything stays on your device',
        body: 'Your cycle, symptoms and notes live in an encrypted database on your phone, and only there.',
      },
      {
        title: 'No cloud. No account. No data collection.',
        body: 'There is no sign-up and no server. Nothing to breach, nothing to sell, nothing to share.',
      },
    ],
  },
  trackingSection: {
    eyebrow: 'Beautiful tracking',
    title: 'Calm, minimal, and quietly powerful',
    intro:
      'A timeline, an elegant calendar, mood tracking, and adaptive predictions, all in a peaceful dark interface designed to disappear into the background. Whether you are tracking your cycle, trying to conceive, on contraception, or pregnant, Locklune adapts to you.',
    calendarTitle: 'Elegant calendar',
    predictionsTitle: 'Cycle predictions',
    nextPeriod: 'Next period',
    inDays: 'in 6 days',
    fertileWindow: 'Fertile window',
    fertileDates: 'Jul 9–14',
    moodTitle: 'Mood & symptoms',
    tags: ['cramps', 'calm', 'tired', 'focused'],
  },
  whySection: {
    eyebrow: 'Why Locklune',
    title: 'A different set of defaults',
    others: 'Others',
    rows: [
      {
        label: 'Where your data lives',
        locklune: 'Local-only, on your device',
        others: 'Synced to the cloud',
      },
      { label: 'Access', locklune: 'PIN protected', others: 'Login required' },
      { label: 'Analytics', locklune: 'None', others: 'Usage tracking' },
      { label: 'Account', locklune: 'No account', others: 'Email required' },
      { label: 'Encryption', locklune: 'On-device AES-256', others: 'Varies, often server-side' },
      {
        label: 'Government or legal requests',
        locklune: 'No data exists to seize',
        others: 'Cloud data can be handed over',
      },
      {
        label: 'Repeated wrong PINs',
        locklune: 'Erases all data after 5 tries',
        others: 'Account lockout',
      },
    ],
  },
  securitySection: {
    eyebrow: 'Security',
    title: 'Peace of mind, by design',
    items: [
      {
        title: 'End-to-end local encryption',
        body: 'Your data lives in an AES-256 encrypted database (SQLCipher), unlocked only by your PIN.',
      },
      {
        title: 'PIN lock',
        body: 'A PIN you choose derives the encryption key. It is never stored or transmitted.',
      },
      {
        title: 'Offline support',
        body: 'Everything works with no connection. There is nothing to sync.',
      },
      {
        title: 'No servers',
        body: 'There is no backend to breach, subpoena, or sell. We hold nothing.',
      },
      {
        title: 'No third-party analytics',
        body: 'No SDKs, no trackers, no identifiers. Not in the app, not on this site.',
      },
      {
        title: 'Auto-erase',
        body: 'After 5 incorrect PIN attempts, everything on the device is wiped, so a lost or stolen phone reveals nothing.',
      },
    ],
  },
  download: {
    title: 'Your cycle. Locked to your device.',
    body: 'No account, no cloud, no tracking. Just a calm, private place to understand your body.',
    googlePlay: 'Get it on Google Play',
    appStore: 'Download on the App Store',
    readPrivacy: 'Read the privacy policy',
    availability: 'Free on Android and iOS.',
  },
  support: {
    title: 'Support',
    intro: 'Common questions below. Still need help? Send us a message and we will reply by email.',
    contactTitle: 'Contact us',
    contactIntro:
      'Browsing this site collects nothing. When you send this form, your email (optional) and message are emailed to our support inbox so we can reply, and used for nothing else.',
    faqs: [
      {
        question: 'I forgot my PIN. Can you reset it?',
        answer:
          'No, and neither can we. Your PIN is the encryption key to your data, and we never receive or store it. A forgotten PIN means the data cannot be recovered - this is the price of true privacy. If you are locked out, you can choose Reset and start over on the lock screen: this erases everything on the device and lets you set up again with a new PIN.',
      },
      {
        question: 'Is my data backed up to the cloud?',
        answer:
          'No. Nothing is uploaded anywhere. Your data lives only on your device. If you get a new phone, previous data does not transfer automatically.',
      },
      {
        question: 'How are predictions calculated?',
        answer:
          'Locklune estimates your next period from a recency-weighted average of your recent cycle lengths, with an uncertainty range based on how regular your cycles are. Ovulation is estimated from a roughly constant luteal phase, and the fertile window from typical sperm and egg viability. Everything is computed on your device and adapts as you log more cycles.',
      },
      {
        question: 'Are predictions medical or contraceptive advice?',
        answer:
          'No. They are estimates for your awareness only and should not be relied on for contraception or medical decisions.',
      },
      {
        question: 'How do I erase everything?',
        answer:
          'Open Settings, then Erase all data, or simply delete the app. There is nothing stored elsewhere.',
      },
    ],
  },
  contact: {
    emailInvalid: "That email address doesn't look right.",
    messageMin: 'Please enter a message of at least 10 characters.',
    sentTitle: 'Thanks, your message was sent.',
    sentReplyEmail: 'We will get back to you by email.',
    sentAnon: 'Your message was received anonymously.',
    noPersonalInfoBefore: 'Please do ',
    noPersonalInfoBold: 'not',
    noPersonalInfoAfter:
      ' include any personal information about your fertility or menstrual cycle in this form.',
    emailLabel: 'Email',
    optional: '(optional)',
    emailHint:
      "Include your email if you'd like a reply - or leave it blank to contact anonymously.",
    messageLabel: 'Message',
    sendError: 'Could not send right now. Please try again.',
    sending: 'Sending',
    sendMessage: 'Send message',
    company: 'Company',
  },
  legalNote: 'This page is available in English only.',
} as const;

/** Recursively widen leaf strings so other locales aren't pinned to en's literals. */
type Widen<T> = T extends string ? string : { [K in keyof T]: Widen<T[K]> };

export type Dictionary = Widen<typeof en>;

export default en;
