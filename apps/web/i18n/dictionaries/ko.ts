import type { Dictionary } from './en';

/** Korean (ko). Machine-drafted - review by a native speaker before release. */
const ko: Dictionary = {
  meta: {
    titleDefault: 'Locklune: 비공개 오프라인 생리 주기 기록',
    description:
      'Locklune은 주기를 PIN으로 암호화하여 기기에 보관합니다. 클라우드 없음, 계정 없음, 추적 없음.',
    supportTitle: '지원',
    supportDescription: '자주 묻는 질문과 Locklune 팀에 연락하는 방법.',
  },
  nav: {
    privacy: '개인정보',
    tracking: '기록',
    security: '보안',
    support: '지원',
    download: '다운로드',
    home: 'Locklune 홈',
    language: '언어',
  },
  footer: {
    tagline: '기기에 머무는 주기 추적기. 비공개. 안전함. 오직 당신만의 것.',
    product: '제품',
    privacyFirst: '개인정보 우선',
    security: '보안',
    support: '지원',
    legal: '법적 고지',
    privacyPolicy: '개인정보 처리방침',
    terms: '이용약관',
    elsewhere: '다른 곳',
    disclaimer: 'Locklune은 기록 목적으로만 사용되며 의료 또는 건강 조언을 제공하지 않습니다.',
    noTracking: '쿠키 없음. 추적 없음. 서버 없음.',
    madeWith: '만든 정성',
    supportCreator: '제작자 후원하기',
  },
  hero: {
    badge: '기기 전용 · 암호화 · 추적 없음',
    tagline: '드디어, 진짜로 비공개인 생리 주기 추적기.',
    sub1: '주기 데이터는 절대 기기를 벗어나지 않습니다.',
    sub2: 'PIN으로 보호됩니다. 클라우드 없음. 계정 없음. 디지털 기록 없음.',
    downloadFree: '무료 다운로드',
    learnPrivacy: '개인정보가 어떻게 보호되는지 알아보기',
    availability: '이제 Android와 iOS에서.',
  },
  privacySection: {
    eyebrow: '개인정보 우선',
    title: '아무것도 드러내지 않도록 설계됨',
    cards: [
      {
        title: 'PIN으로 보호',
        body: '당신이 선택한 PIN이 모든 것을 암호화하는 키를 생성합니다. 저장되거나 어디에도 전송되지 않습니다.',
      },
      {
        title: '모든 것이 기기에 남습니다',
        body: '주기, 증상, 메모가 휴대폰의 암호화된 데이터베이스에만 저장됩니다.',
      },
      {
        title: '클라우드 없음. 계정 없음. 데이터 수집 없음.',
        body: '가입도 서버도 없습니다. 침해할 것도, 팔 것도, 공유할 것도 없습니다.',
      },
    ],
  },
  trackingSection: {
    eyebrow: '아름다운 기록',
    title: '차분하고, 미니멀하며, 조용히 강력한',
    intro:
      '타임라인, 우아한 달력, 기분 기록, 적응형 예측이 모두 배경으로 사라지도록 설계된 평온한 다크 인터페이스에 담겨 있습니다. 주기를 추적하든, 임신을 준비하든, 피임 중이든, 임신 중이든 Locklune은 당신에게 맞춥니다.',
    calendarTitle: '우아한 달력',
    predictionsTitle: '주기 예측',
    nextPeriod: '다음 생리',
    inDays: '6일 후',
    fertileWindow: '가임기',
    fertileDates: '7월 9–14일',
    moodTitle: '기분 & 증상',
    tags: ['생리통', '차분함', '피곤함', '집중됨'],
  },
  whySection: {
    eyebrow: '왜 Locklune인가',
    title: '다른 기본값',
    others: '다른 앱',
    rows: [
      { label: '데이터가 있는 곳', locklune: '기기에만 로컬 저장', others: '클라우드에 동기화' },
      { label: '접근', locklune: 'PIN 보호', others: '로그인 필요' },
      { label: '분석', locklune: '없음', others: '사용 추적' },
      { label: '계정', locklune: '계정 없음', others: '이메일 필요' },
      { label: '암호화', locklune: '기기 내 AES-256', others: '다양함, 종종 서버 측' },
      {
        label: '정부 또는 법적 요청',
        locklune: '압수할 데이터가 없음',
        others: '클라우드 데이터가 넘겨질 수 있음',
      },
      { label: 'PIN 반복 오류', locklune: '5회 시도 후 모든 데이터 삭제', others: '계정 잠금' },
    ],
  },
  securitySection: {
    eyebrow: '보안',
    title: '설계로 얻는 안심',
    items: [
      {
        title: '종단 간 로컬 암호화',
        body: '데이터는 AES-256으로 암호화된 데이터베이스(SQLCipher)에 저장되며, 오직 PIN으로만 잠금 해제됩니다.',
      },
      {
        title: 'PIN 잠금',
        body: '당신이 선택한 PIN이 암호화 키를 생성합니다. 저장되거나 전송되지 않습니다.',
      },
      { title: '오프라인 지원', body: '연결 없이도 모든 것이 작동합니다. 동기화할 것이 없습니다.' },
      {
        title: '서버 없음',
        body: '침해하거나 소환하거나 팔 백엔드가 없습니다. 우리는 아무것도 보관하지 않습니다.',
      },
      {
        title: '제3자 분석 없음',
        body: 'SDK도, 추적기도, 식별자도 없습니다. 앱에도, 이 사이트에도 없습니다.',
      },
      {
        title: '자동 삭제',
        body: 'PIN을 5회 잘못 입력하면 기기의 모든 것이 지워져, 분실하거나 도난당한 휴대폰이 아무것도 드러내지 않습니다.',
      },
    ],
  },
  download: {
    title: '당신의 주기. 당신의 기기에 잠금.',
    body: '계정 없음, 클라우드 없음, 추적 없음. 그저 당신의 몸을 이해할 수 있는 차분하고 비공개된 공간.',
    googlePlay: 'Google Play에서 받기',
    appStore: 'App Store에서 다운로드',
    readPrivacy: '개인정보 처리방침 읽기',
    availability: 'Android와 iOS에서 무료.',
  },
  support: {
    title: '지원',
    intro:
      '아래에서 자주 묻는 질문을 확인하세요. 도움이 더 필요하신가요? 메시지를 보내주시면 이메일로 답변드립니다.',
    contactTitle: '문의하기',
    contactIntro:
      '이 사이트를 둘러보는 것은 아무것도 수집하지 않습니다. 이 양식을 보내면 이메일(선택)과 메시지가 답변을 위해 지원 수신함으로 전송되며, 그 외의 용도로는 사용되지 않습니다.',
    faqs: [
      {
        question: 'PIN을 잊었습니다. 재설정해 주실 수 있나요?',
        answer:
          '아니요, 저희도 할 수 없습니다. PIN은 데이터의 암호화 키이며 저희는 이를 받거나 저장하지 않습니다. PIN을 잊으면 데이터를 복구할 수 없습니다. 이것이 진정한 개인정보 보호의 대가입니다. 잠겼다면 잠금 화면에서 재설정하고 다시 시작을 선택할 수 있습니다. 이는 기기의 모든 것을 지우고 새 PIN으로 다시 설정하게 해줍니다.',
      },
      {
        question: '내 데이터가 클라우드에 백업되나요?',
        answer:
          '아니요. 아무것도 어디에도 업로드되지 않습니다. 데이터는 오직 기기에만 있습니다. 새 휴대폰을 사면 이전 데이터는 자동으로 전송되지 않습니다.',
      },
      {
        question: '예측은 어떻게 계산되나요?',
        answer:
          'Locklune은 최근 주기 길이의 최신 가중 평균으로 다음 생리를 추정하며, 주기가 얼마나 규칙적인지에 따라 불확실성 범위를 둡니다. 배란은 대략 일정한 황체기에서 추정하고, 가임기는 일반적인 정자와 난자의 생존력에서 추정합니다. 모든 것은 기기에서 계산되며 더 많은 주기를 기록할수록 적응합니다.',
      },
      {
        question: '예측이 의료 또는 피임 조언인가요?',
        answer: '아니요. 참고용 추정치일 뿐이며 피임이나 의료 결정에 의존해서는 안 됩니다.',
      },
      {
        question: '모든 것을 어떻게 지우나요?',
        answer:
          '설정을 열고 모든 데이터 삭제를 선택하거나, 앱을 삭제하기만 하면 됩니다. 다른 곳에 저장된 것은 없습니다.',
      },
    ],
  },
  contact: {
    emailInvalid: '이메일 주소가 올바르지 않은 것 같습니다.',
    messageMin: '10자 이상의 메시지를 입력하세요.',
    sentTitle: '감사합니다. 메시지가 전송되었습니다.',
    sentReplyEmail: '이메일로 답변드리겠습니다.',
    sentAnon: '메시지가 익명으로 접수되었습니다.',
    noPersonalInfoBefore: '이 양식에는 생식 능력이나 생리 주기에 관한 개인 정보를 ',
    noPersonalInfoBold: '포함하지 마세요',
    noPersonalInfoAfter: '.',
    emailLabel: '이메일',
    optional: '(선택)',
    emailHint: '답변을 원하시면 이메일을 입력하고, 익명으로 문의하려면 비워 두세요.',
    messageLabel: '메시지',
    sendError: '지금 보낼 수 없습니다. 다시 시도하세요.',
    sending: '전송 중',
    sendMessage: '메시지 보내기',
    company: '회사',
  },
  legalNote: '이 페이지는 영어로만 제공됩니다.',
};

export default ko;
