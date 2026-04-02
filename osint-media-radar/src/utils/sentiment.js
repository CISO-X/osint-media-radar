// Client-side sentiment analysis (mirrors server logic for offline demo)

const POSITIVE_RU = ['рост', 'прибыль', 'успех', 'достижение', 'развитие', 'инвестиц', 'партнер', 'выигра', 'победа', 'рекорд', 'увеличени', 'улучшени', 'инновац', 'запуск', 'соглашени', 'одобрен', 'поддержк', 'награ', 'эффективн', 'позитивн', 'хорош', 'отличн', 'выросл', 'повыш', 'перспектив', 'прорыв', 'лидер'];
const NEGATIVE_RU = ['убыток', 'банкротств', 'скандал', 'штраф', 'арест', 'суд', 'задолженност', 'долг', 'кризис', 'падени', 'снижени', 'санкци', 'обыск', 'мошенничеств', 'увольнени', 'закрыти', 'провал', 'ликвидаци', 'обвинени', 'нарушени', 'жалоб', 'иск', 'угроз', 'потер', 'риск', 'проблем', 'негативн', 'конфликт', 'расследовани'];

export function analyzeSentiment(text) {
  const lower = text.toLowerCase();
  let pos = 0, neg = 0;

  for (const w of POSITIVE_RU) if (lower.includes(w)) pos++;
  for (const w of NEGATIVE_RU) if (lower.includes(w)) neg++;

  if (pos > neg && pos >= 1) return { label: 'positive', score: Math.min(pos / 5, 1) };
  if (neg > pos && neg >= 1) return { label: 'negative', score: Math.min(neg / 5, 1) };
  return { label: 'neutral', score: 0.5 };
}

export const SENTIMENT_COLORS = {
  positive: '#22c55e',
  neutral: '#6b7280',
  negative: '#ef4444',
};

export const SENTIMENT_LABELS = {
  positive: 'Позитив',
  neutral: 'Нейтрал',
  negative: 'Негатив',
};
