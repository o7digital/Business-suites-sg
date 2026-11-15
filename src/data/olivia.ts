export const oliviaCopy = {
  es: {
    name: 'Olivia IA', open: 'Abrir Olivia IA', close: 'Cerrar el chat', concierge: 'Concierge digital',
    available: 'Disponible', away: 'Ausente', checking: 'Comprobando…',
    welcome: 'Hola, soy Olivia, tu concierge digital. Te ayudo a elegir tu suite en Business Suites SG y a planear tu estancia en Ciudad de México. ¿Qué te gustaría saber?',
    languages: 'Idioma del chat', message: 'Tu mensaje', placeholder: 'Escribe tu pregunta…', send: 'Enviar',
    consentBefore: 'He leído y acepto el ', privacy: 'Aviso de privacidad',
    consentAfter: ' para conversar con Olivia IA. Los mensajes se guardan para atender mi solicitud.',
    contact: 'Contactar al hotel', call: 'Llamar', booking: 'Consultar disponibilidad',
    footnote: 'Disponibilidad y tarifas confirmadas en Cloudbeds o por el hotel.',
    typing: 'Un momento…', rate: 'Demasiados mensajes. Espera un minuto e inténtalo de nuevo.',
    error: 'Olivia no está disponible ahora. Inténtalo de nuevo o contacta al hotel.',
    actions: [
      { label: 'Suites', prompt: '¿Qué diferencias hay entre las seis suites de Business Suites SG?' },
      { label: 'Ubicación', prompt: '¿Dónde está Business Suites SG y cómo puedo llegar?' },
      { label: 'Servicios', prompt: '¿Qué servicios ofrecen y qué debo saber antes de mi estancia?' },
      { label: 'Planear mi estancia', prompt: '¿Cómo puedo consultar disponibilidad y tarifas para mi estancia?' },
    ],
  },
  en: {
    name: 'Olivia AI', open: 'Open Olivia AI', close: 'Close chat', concierge: 'Digital concierge',
    available: 'Available', away: 'Away', checking: 'Checking…',
    welcome: 'Hello, I’m Olivia, your digital concierge. I can help you choose your suite at Business Suites SG and plan your stay in Mexico City. What would you like to know?',
    languages: 'Chat language', message: 'Your message', placeholder: 'Ask your question…', send: 'Send',
    consentBefore: 'I have read and accept the ', privacy: 'Privacy notice',
    consentAfter: ' to chat with Olivia AI. Messages are stored to help with my enquiry.',
    contact: 'Contact the hotel', call: 'Call', booking: 'Check availability',
    footnote: 'Availability and rates confirmed in Cloudbeds or by the hotel.',
    typing: 'One moment…', rate: 'Too many messages. Wait a minute and try again.',
    error: 'Olivia is unavailable right now. Try again or contact the hotel.',
    actions: [
      { label: 'Suites', prompt: 'What are the differences between the six suites at Business Suites SG?' },
      { label: 'Location', prompt: 'Where is Business Suites SG and how can I get there?' },
      { label: 'Services', prompt: 'What services do you offer and what should I know before my stay?' },
      { label: 'Plan my stay', prompt: 'How can I check availability and rates for my stay?' },
    ],
  },
  zh: {
    name: 'Olivia AI', open: '打开 Olivia AI', close: '关闭聊天', concierge: '数字礼宾',
    available: '在线', away: '暂时离线', checking: '检查中…',
    welcome: '您好，我是 Olivia，您的数字礼宾。我可以帮您了解 Business Suites SG 的套房，并规划您的墨西哥城之旅。您想了解什么？',
    languages: '聊天语言', message: '您的消息', placeholder: '请输入您的问题…', send: '发送',
    consentBefore: '我已阅读并同意', privacy: '隐私声明',
    consentAfter: '，并同意使用 Olivia AI 聊天。对话将被保存，以便处理我的咨询。',
    contact: '联系酒店', call: '致电', booking: '查询房态',
    footnote: '房态及价格以 Cloudbeds 或酒店确认为准。',
    typing: '请稍候…', rate: '消息过多，请稍等一分钟后重试。',
    error: 'Olivia 暂时无法回复，请重试或联系酒店。',
    actions: [
      { label: '套房', prompt: 'Business Suites SG 的六间套房有什么区别？' },
      { label: '位置', prompt: 'Business Suites SG 在哪里？如何到达？' },
      { label: '服务', prompt: '酒店提供哪些服务？入住前需要了解什么？' },
      { label: '规划住宿', prompt: '如何查询入住日期的房态和价格？' },
    ],
  },
};

export type OliviaLanguage = keyof typeof oliviaCopy;
export const privacyPath = (lang: OliviaLanguage) => lang === 'es' ? '/privacy-policy/' : `/${lang}/privacy-policy/`;
export const bookingUrl = (lang: OliviaLanguage) => `https://hotels.cloudbeds.com/${lang === 'es' ? 'es' : 'en'}/reservation/Z2jMb3/?currency=mxn`;
