import type { Dictionary } from './en';

/** Spanish (es). Machine-drafted - review by a native speaker before release. */
const es: Dictionary = {
  meta: {
    titleDefault: 'Locklune: seguimiento del ciclo privado y sin conexión',
    description:
      'Locklune mantiene tu ciclo en tu dispositivo, cifrado con tu PIN. Sin nube, sin cuenta, sin rastreo.',
    supportTitle: 'Soporte',
    supportDescription: 'Preguntas frecuentes y cómo contactar con el equipo de Locklune.',
  },
  nav: {
    privacy: 'Privacidad',
    tracking: 'Seguimiento',
    security: 'Seguridad',
    support: 'Soporte',
    download: 'Descargar',
    home: 'Inicio de Locklune',
    language: 'Idioma',
  },
  footer: {
    tagline: 'Un rastreador de ciclos que permanece en tu dispositivo. Privado. Seguro. Solo tuyo.',
    product: 'Producto',
    privacyFirst: 'Privacidad primero',
    security: 'Seguridad',
    support: 'Soporte',
    legal: 'Legal',
    privacyPolicy: 'Política de Privacidad',
    terms: 'Términos',
    elsewhere: 'En otros sitios',
    disclaimer:
      'Locklune es solo para fines de registro y no proporciona consejo médico o de salud.',
    noTracking: 'Sin cookies. Sin rastreo. Sin servidores.',
    madeWith: 'Hecho con',
    supportCreator: 'Apoya al creador',
  },
  hero: {
    badge: 'Solo en el dispositivo · cifrado · sin rastreo',
    tagline: 'Por fin, un rastreador de períodos que es realmente privado.',
    sub1: 'Los datos de tu ciclo nunca salen de tu dispositivo.',
    sub2: 'Protegido con tu PIN. Sin nube. Sin cuenta. Sin registro digital.',
    downloadFree: 'Descargar gratis',
    learnPrivacy: 'Descubre cómo se protege tu privacidad',
    availability: 'Ya en Android e iOS.',
  },
  privacySection: {
    eyebrow: 'Privacidad primero',
    title: 'Diseñado para no revelar nada',
    cards: [
      {
        title: 'Protegido por PIN',
        body: 'Un PIN que eliges deriva la clave que lo cifra todo. Nunca se almacena ni se envía a ningún lugar.',
      },
      {
        title: 'Todo permanece en tu dispositivo',
        body: 'Tu ciclo, síntomas y notas viven en una base de datos cifrada en tu teléfono, y solo ahí.',
      },
      {
        title: 'Sin nube. Sin cuenta. Sin recopilación de datos.',
        body: 'No hay registro ni servidor. Nada que vulnerar, nada que vender, nada que compartir.',
      },
    ],
  },
  trackingSection: {
    eyebrow: 'Seguimiento hermoso',
    title: 'Sereno, minimalista y silenciosamente potente',
    intro:
      'Una línea de tiempo, un calendario elegante, seguimiento del estado de ánimo y predicciones adaptativas, todo en una interfaz oscura y tranquila diseñada para desaparecer en el fondo. Ya sea que sigas tu ciclo, busques concebir, uses anticoncepción o estés embarazada, Locklune se adapta a ti.',
    calendarTitle: 'Calendario elegante',
    predictionsTitle: 'Predicciones del ciclo',
    nextPeriod: 'Próximo período',
    inDays: 'en 6 días',
    fertileWindow: 'Ventana fértil',
    fertileDates: '9–14 jul',
    moodTitle: 'Ánimo y síntomas',
    tags: ['cólicos', 'tranquila', 'cansada', 'concentrada'],
  },
  whySection: {
    eyebrow: 'Por qué Locklune',
    title: 'Otro conjunto de valores por defecto',
    others: 'Otros',
    rows: [
      {
        label: 'Dónde viven tus datos',
        locklune: 'Solo local, en tu dispositivo',
        others: 'Sincronizados en la nube',
      },
      { label: 'Acceso', locklune: 'Protegido con PIN', others: 'Requiere inicio de sesión' },
      { label: 'Analíticas', locklune: 'Ninguna', others: 'Seguimiento de uso' },
      { label: 'Cuenta', locklune: 'Sin cuenta', others: 'Requiere correo' },
      {
        label: 'Cifrado',
        locklune: 'AES-256 en el dispositivo',
        others: 'Varía, a menudo en el servidor',
      },
      {
        label: 'Solicitudes legales o gubernamentales',
        locklune: 'No hay datos que incautar',
        others: 'Los datos en la nube pueden entregarse',
      },
      {
        label: 'PIN incorrecto repetido',
        locklune: 'Borra todo tras 5 intentos',
        others: 'Bloqueo de cuenta',
      },
    ],
  },
  securitySection: {
    eyebrow: 'Seguridad',
    title: 'Tranquilidad, por diseño',
    items: [
      {
        title: 'Cifrado local de extremo a extremo',
        body: 'Tus datos viven en una base de datos cifrada con AES-256 (SQLCipher), desbloqueada solo con tu PIN.',
      },
      {
        title: 'Bloqueo con PIN',
        body: 'Un PIN que eliges deriva la clave de cifrado. Nunca se almacena ni se transmite.',
      },
      {
        title: 'Compatible sin conexión',
        body: 'Todo funciona sin conexión. No hay nada que sincronizar.',
      },
      {
        title: 'Sin servidores',
        body: 'No hay backend que vulnerar, citar judicialmente o vender. No guardamos nada.',
      },
      {
        title: 'Sin analíticas de terceros',
        body: 'Sin SDK, sin rastreadores, sin identificadores. Ni en la app, ni en este sitio.',
      },
      {
        title: 'Autoborrado',
        body: 'Tras 5 intentos de PIN incorrectos, todo en el dispositivo se borra, así un teléfono perdido o robado no revela nada.',
      },
    ],
  },
  download: {
    title: 'Tu ciclo. Bloqueado en tu dispositivo.',
    body: 'Sin cuenta, sin nube, sin rastreo. Solo un lugar sereno y privado para entender tu cuerpo.',
    googlePlay: 'Consíguelo en Google Play',
    appStore: 'Descargar en la App Store',
    readPrivacy: 'Leer la política de privacidad',
    availability: 'Gratis en Android e iOS.',
  },
  support: {
    title: 'Soporte',
    intro:
      'Preguntas comunes abajo. ¿Aún necesitas ayuda? Envíanos un mensaje y responderemos por correo.',
    contactTitle: 'Contáctanos',
    contactIntro:
      'Navegar por este sitio no recopila nada. Cuando envías este formulario, tu correo (opcional) y mensaje se envían a nuestra bandeja de soporte para poder responder, y no se usan para nada más.',
    faqs: [
      {
        question: 'Olvidé mi PIN. ¿Pueden restablecerlo?',
        answer:
          'No, y nosotros tampoco. Tu PIN es la clave de cifrado de tus datos, y nunca lo recibimos ni almacenamos. Un PIN olvidado significa que los datos no se pueden recuperar: este es el precio de la verdadera privacidad. Si te quedas bloqueada, puedes elegir Restablecer y empezar de nuevo en la pantalla de bloqueo: esto borra todo en el dispositivo y te permite configurarlo de nuevo con un nuevo PIN.',
      },
      {
        question: '¿Se respaldan mis datos en la nube?',
        answer:
          'No. Nada se sube a ningún lugar. Tus datos viven solo en tu dispositivo. Si obtienes un teléfono nuevo, los datos previos no se transfieren automáticamente.',
      },
      {
        question: '¿Cómo se calculan las predicciones?',
        answer:
          'Locklune estima tu próximo período a partir de un promedio ponderado por recencia de tus últimas duraciones de ciclo, con un rango de incertidumbre según lo regulares que sean tus ciclos. La ovulación se estima a partir de una fase lútea aproximadamente constante, y la ventana fértil a partir de la viabilidad típica del espermatozoide y el óvulo. Todo se calcula en tu dispositivo y se adapta a medida que registras más ciclos.',
      },
      {
        question: '¿Son las predicciones consejo médico o anticonceptivo?',
        answer:
          'No. Son estimaciones solo para tu información y no deben usarse para anticoncepción ni decisiones médicas.',
      },
      {
        question: '¿Cómo borro todo?',
        answer:
          'Abre Ajustes, luego Borrar todos los datos, o simplemente elimina la app. No hay nada almacenado en otro lugar.',
      },
    ],
  },
  contact: {
    emailInvalid: 'Esa dirección de correo no parece correcta.',
    messageMin: 'Introduce un mensaje de al menos 10 caracteres.',
    sentTitle: 'Gracias, tu mensaje fue enviado.',
    sentReplyEmail: 'Te responderemos por correo.',
    sentAnon: 'Tu mensaje se recibió de forma anónima.',
    noPersonalInfoBefore: 'Por favor, ',
    noPersonalInfoBold: 'no',
    noPersonalInfoAfter:
      ' incluyas información personal sobre tu fertilidad o ciclo menstrual en este formulario.',
    emailLabel: 'Correo',
    optional: '(opcional)',
    emailHint:
      'Incluye tu correo si quieres una respuesta, o déjalo en blanco para contactar de forma anónima.',
    messageLabel: 'Mensaje',
    sendError: 'No se pudo enviar ahora. Inténtalo de nuevo.',
    sending: 'Enviando',
    sendMessage: 'Enviar mensaje',
    company: 'Empresa',
  },
  legalNote: 'Esta página solo está disponible en inglés.',
};

export default es;
