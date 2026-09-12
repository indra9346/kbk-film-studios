export const BOOM_KNOWLEDGE = [
  { topics: ['hello', 'hi', 'hey', 'who are you'], answer: "Hi! I’m Boom, a friend of Bharath at KBK Film Studios. I can help with services, pricing, booking, delivery tracking, revisions, and how the private client portal works." },
  { topics: ['service', 'services', 'editing', 'wedding', 'video'], answer: 'KBK Films offers pre-wedding edits, wedding highlights, Haldi and Sangeeth films, reception edits, same-day spot edits, maternity/baby ceremonies, teasers/reels, and event montages. Open Services & Pricing for the current catalogue and inclusions.' },
  { topics: ['price', 'pricing', 'cost', 'quote', 'budget'], answer: 'Every project is quoted from its scope, footage volume, delivery timeline, and any custom requirements. The Services & Pricing page shows starting prices; Bharath confirms the final scope and quote after reviewing your booking request.' },
  { topics: ['book', 'booking', 'book a service', 'contact'], answer: 'You can use Book Service to share your event date, footage details, preferred delivery date, references, and budget. KBK Films will review it and confirm the project scope and schedule.' },
  { topics: ['track', 'tracking', 'delivery', 'status', 'portal'], answer: 'Use Track My Service with your booking reference and registered phone or email. Your private portal shows the project lifecycle, messages, and any released deliverables.' },
  { topics: ['revision', 'revisions', 'change'], answer: 'Revision handling follows the service scope agreed for your booking. Please share clear, consolidated feedback through your project communication so the studio can assess the request and timeline.' },
  { topics: ['privacy', 'private', 'secure', 'data'], answer: 'Client deliveries are intended for the registered client portal and are kept separate by booking. Please keep tracking details and delivery links private, and download a personal backup during the stated access period.' },
  { topics: ['whatsapp', 'phone', 'email', 'bharath'], answer: 'For a direct studio conversation, use the WhatsApp or contact details shown on the site. Boom can help you prepare the right information before you contact Bharath.' },
];

export function findBoomAnswer(message: string): string {
  const normalized = message.toLowerCase();
  const match = BOOM_KNOWLEDGE.map(item => ({ item, score: item.topics.reduce((score, topic) => score + (normalized.includes(topic) ? 1 : 0), 0) }))
    .sort((a, b) => b.score - a.score)[0];
  return match?.score ? match.item.answer : 'I can help with KBK Films services, starting-price guidance, booking, tracking a project, deliveries, revisions, or contacting Bharath. Which one would you like to know about?';
}
