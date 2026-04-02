// Demo data for when API is not configured or for development/preview

export function generateDemoData(query) {
  const now = new Date();
  const articles = [];

  const demoSources = ['ТАСС', 'РБК', 'Коммерсантъ', 'Ведомости', 'vc.ru', 'Интерфакс', 'Google News', 'Лента.ру', 'Forbes Russia', 'РИА Новости', 'Газета.ру', 'Известия', 'Хабр', 'CNews'];

  const templates = [
    { title: `${query} объявил о новой стратегии развития на 2026 год`, sentiment: 'positive', desc: 'Компания представила амбициозные планы по расширению присутствия на рынке.' },
    { title: `Выручка ${query} выросла на 23% по итогам квартала`, sentiment: 'positive', desc: 'Финансовые показатели превысили ожидания аналитиков.' },
    { title: `${query} инвестирует в ИИ-технологии для оптимизации процессов`, sentiment: 'positive', desc: 'Партнерство с ведущими технологическими компаниями.' },
    { title: `${query}: обзор рынка и текущее положение компании`, sentiment: 'neutral', desc: 'Аналитический обзор основных показателей и трендов.' },
    { title: `Эксперты оценили перспективы ${query} на ближайший год`, sentiment: 'neutral', desc: 'Мнения аналитиков разделились.' },
    { title: `${query} планирует выход на новые рынки`, sentiment: 'neutral', desc: 'Рассматриваются возможности расширения в страны СНГ.' },
    { title: `Конкуренты ${query} наращивают давление на рынке`, sentiment: 'neutral', desc: 'Обострение конкуренции в ключевых сегментах.' },
    { title: `${query} столкнулся с проверкой ФНС`, sentiment: 'negative', desc: 'Налоговая служба инициировала проверку за последние 3 года.' },
    { title: `Суд рассмотрит иск против ${query} по делу о задолженности`, sentiment: 'negative', desc: 'Арбитражный суд назначил слушание на следующий месяц.' },
    { title: `${query}: сотрудники жалуются на условия труда`, sentiment: 'negative', desc: 'На профильных площадках появились негативные отзывы.' },
    { title: `Акции ${query} показали умеренный рост на торгах`, sentiment: 'positive', desc: 'Инвесторы положительно оценили последние новости компании.' },
    { title: `${query} получил государственную субсидию на развитие`, sentiment: 'positive', desc: 'Поддержка в рамках программы импортозамещения.' },
    { title: `${query}: итоги года и планы на будущее`, sentiment: 'neutral', desc: 'Годовой отчет компании опубликован в открытом доступе.' },
    { title: `Партнерство ${query} с крупным международным игроком`, sentiment: 'positive', desc: 'Подписано стратегическое соглашение о сотрудничестве.' },
    { title: `Расследование в отношении бывших менеджеров ${query}`, sentiment: 'negative', desc: 'Правоохранительные органы заинтересовались деятельностью ряда бывших руководителей.' },
  ];

  for (let i = 0; i < templates.length; i++) {
    const t = templates[i];
    const daysAgo = Math.floor(Math.random() * 28) + 1;
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);

    articles.push({
      id: `demo-${i}`,
      title: t.title,
      description: t.desc,
      content: t.desc,
      url: '#',
      source: demoSources[i % demoSources.length],
      publishedAt: date.toISOString(),
      image: null,
      origin: 'demo',
      sentiment: {
        label: t.sentiment,
        score: t.sentiment === 'neutral' ? 0.5 : 0.7,
      }
    });
  }

  articles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  // Timeline
  const dateMap = {};
  for (const a of articles) {
    const date = a.publishedAt.split('T')[0];
    if (!dateMap[date]) dateMap[date] = { date, total: 0, positive: 0, negative: 0, neutral: 0 };
    dateMap[date].total++;
    dateMap[date][a.sentiment.label]++;
  }
  const timeline = Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));

  // Stats
  const pos = articles.filter(a => a.sentiment.label === 'positive').length;
  const neg = articles.filter(a => a.sentiment.label === 'negative').length;
  const neu = articles.filter(a => a.sentiment.label === 'neutral').length;

  return {
    query,
    totalResults: articles.length,
    articles,
    timeline,
    sentimentStats: { positive: pos, neutral: neu, negative: neg },
    summary: {
      text: `По запросу "${query}" найдено ${articles.length} публикаций из ${demoSources.length} источников (${demoSources.slice(0, 3).join(', ')} и др.). Информационный фон — умеренно позитивный: ${Math.round(pos/articles.length*100)}% позитивных, ${Math.round(neg/articles.length*100)}% негативных. Выявлено 2 сигнала, требующих дополнительной проверки.`,
      redFlags: [
        { level: 'medium', text: 'Найдены судебные/юридические упоминания (2)' },
        { level: 'medium', text: 'Упоминания проверок контролирующих органов (1)' },
      ],
      stats: { total: articles.length, pos, neg, neu, sources: demoSources.length, trend: 'умеренно позитивный' }
    },
    timestamp: new Date().toISOString(),
    isDemo: true,
  };
}
