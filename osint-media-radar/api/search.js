// Vercel Serverless Function: OSINT Media Radar — News Search
// Maximum coverage: 30+ RSS feeds + 3 News APIs + Google News RSS
// Endpoint: GET /api/search?q=keyword&lang=ru&period=7d

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { q, lang = 'ru', period = '7d' } = req.query;

  if (!q || q.trim().length < 2) {
    return res.status(400).json({ error: 'Параметр q обязателен (мин. 2 символа)' });
  }

  const query = q.trim();
  const results = [];
  const sourceStats = {};

  // ============================================
  // 1. GOOGLE NEWS RSS (бесплатно, без ключа, без лимитов)
  // ============================================
  try {
    const googleLang = lang === 'ru' ? 'ru' : 'en';
    const googleCountry = lang === 'ru' ? 'RU' : 'US';
    const googleUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=${googleLang}&gl=${googleCountry}&ceid=${googleCountry}:${googleLang}`;
    const googleResults = await fetchRSSGeneric(googleUrl, 'Google News', query, period, true);
    results.push(...googleResults);
    if (googleResults.length > 0) sourceStats['Google News'] = googleResults.length;
  } catch (e) {
    console.error('Google News RSS error:', e.message);
  }

  // ============================================
  // 2. GNews API (100 запросов/день бесплатно)
  // ============================================
  const gnewsKey = process.env.GNEWS_API_KEY;
  if (gnewsKey) {
    try {
      const gnewsUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=${lang}&max=50&from=${getDateFrom(period)}&apikey=${gnewsKey}`;
      const gnewsRes = await fetchWithTimeout(gnewsUrl, 8000);
      if (gnewsRes.ok) {
        const data = await gnewsRes.json();
        if (data.articles) {
          for (const a of data.articles) {
            results.push(makeArticle(a.title, a.description || '', a.url, a.source?.name || 'GNews', a.publishedAt, a.image, 'gnews'));
          }
          sourceStats['GNews API'] = data.articles.length;
        }
      }
    } catch (e) {
      console.error('GNews error:', e.message);
    }
  }

  // ============================================
  // 3. NewsData.io API (200 кредитов/день бесплатно)
  // ============================================
  const newsdataKey = process.env.NEWSDATA_API_KEY;
  if (newsdataKey) {
    try {
      const ndLang = lang === 'ru' ? 'ru' : 'en';
      const ndUrl = `https://newsdata.io/api/1/latest?apikey=${newsdataKey}&q=${encodeURIComponent(query)}&language=${ndLang}&size=50`;
      const ndRes = await fetchWithTimeout(ndUrl, 8000);
      if (ndRes.ok) {
        const data = await ndRes.json();
        if (data.results) {
          for (const a of data.results) {
            results.push(makeArticle(a.title, a.description || '', a.link, a.source_name || a.source_id || 'NewsData', a.pubDate, a.image_url, 'newsdata'));
          }
          sourceStats['NewsData.io'] = data.results.length;
        }
      }
    } catch (e) {
      console.error('NewsData error:', e.message);
    }
  }

  // ============================================
  // 4. Currents API (бесплатно, 600 запросов/день)
  // ============================================
  const currentsKey = process.env.CURRENTS_API_KEY;
  if (currentsKey) {
    try {
      const cLang = lang === 'ru' ? 'ru' : 'en';
      const cUrl = `https://api.currentsapi.services/v1/search?keywords=${encodeURIComponent(query)}&language=${cLang}&apiKey=${currentsKey}`;
      const cRes = await fetchWithTimeout(cUrl, 8000);
      if (cRes.ok) {
        const data = await cRes.json();
        if (data.news) {
          for (const a of data.news) {
            results.push(makeArticle(a.title, a.description || '', a.url, a.author || 'Currents', a.published, a.image, 'currents'));
          }
          sourceStats['Currents API'] = data.news.length;
        }
      }
    } catch (e) {
      console.error('Currents error:', e.message);
    }
  }

  // ============================================
  // 5. RSS-ЛЕНТЫ: 30+ РОССИЙСКИХ И МЕЖДУНАРОДНЫХ СМИ
  // ============================================
  const feeds = getRSSFeeds(lang);
  const feedPromises = feeds.map(async (feed) => {
    try {
      const feedResults = await fetchRSSGeneric(feed.url, feed.name, query, period, false);
      if (feedResults.length > 0) {
        results.push(...feedResults);
        sourceStats[feed.name] = feedResults.length;
      }
    } catch (e) { /* skip failed feeds */ }
  });
  await Promise.allSettled(feedPromises);

  // ============================================
  // 6. POST-PROCESSING
  // ============================================

  // Deduplicate
  const unique = deduplicateArticles(results);

  // Sort by date (newest first)
  unique.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  // Analyze sentiment
  const analyzed = unique.map(article => ({
    ...article,
    sentiment: analyzeSentiment(article.title + ' ' + (article.description || ''), lang)
  }));

  // Generate summary
  const summary = generateSummary(analyzed, query, sourceStats);

  // Build timeline
  const timeline = buildTimeline(analyzed);

  // Sentiment distribution
  const sentimentStats = {
    positive: analyzed.filter(a => a.sentiment.label === 'positive').length,
    neutral: analyzed.filter(a => a.sentiment.label === 'neutral').length,
    negative: analyzed.filter(a => a.sentiment.label === 'negative').length,
  };

  return res.status(200).json({
    query,
    totalResults: analyzed.length,
    articles: analyzed.slice(0, 200), // Limit response size
    timeline,
    sentimentStats,
    summary,
    sourceStats,
    timestamp: new Date().toISOString()
  });
}


// ====================================================================
// RSS FEEDS DATABASE — 30+ источников
// ====================================================================

function getRSSFeeds(lang) {
  if (lang === 'ru') {
    return [
      // === ИНФОРМАЦИОННЫЕ АГЕНТСТВА ===
      { name: 'ТАСС', url: 'https://tass.ru/rss/v2.xml' },
      { name: 'РИА Новости', url: 'https://ria.ru/export/rss2/archive/index.xml' },
      { name: 'Интерфакс', url: 'https://www.interfax.ru/rss.asp' },

      // === ДЕЛОВЫЕ / ЭКОНОМИЧЕСКИЕ ===
      { name: 'РБК', url: 'https://rssexport.rbc.ru/rbcnews/news/30/full.rss' },
      { name: 'Коммерсантъ', url: 'https://www.kommersant.ru/RSS/news.xml' },
      { name: 'Коммерсантъ Бизнес', url: 'https://www.kommersant.ru/RSS/corp.xml' },
      { name: 'Ведомости', url: 'https://www.vedomosti.ru/rss/news' },
      { name: 'Forbes Russia', url: 'https://www.forbes.ru/newrss.xml' },
      { name: 'Банки.ру', url: 'https://www.banki.ru/xml/news.rss' },

      // === ОБЩИЕ НОВОСТИ ===
      { name: 'Лента.ру', url: 'https://lenta.ru/rss' },
      { name: 'Газета.ру', url: 'https://www.gazeta.ru/export/rss/lenta.xml' },
      { name: 'Известия', url: 'https://iz.ru/xml/rss/all.xml' },
      { name: 'RT на русском', url: 'https://russian.rt.com/rss' },
      { name: 'Новая газета', url: 'https://novayagazeta.ru/rss' },
      { name: 'Фонтанка', url: 'https://www.fontanka.ru/fontanka.rss' },
      { name: 'Медуза', url: 'https://meduza.io/rss/all' },

      // === ТЕХНОЛОГИИ / IT ===
      { name: 'vc.ru', url: 'https://vc.ru/rss/all' },
      { name: 'Хабр', url: 'https://habr.com/ru/rss/all/all/' },
      { name: 'CNews', url: 'https://www.cnews.ru/inc/rss/news.xml' },
      { name: 'TAdviser', url: 'https://www.tadviser.ru/xml/tadviser_rss.xml' },
      { name: '3DNews', url: 'https://3dnews.ru/news/rss/' },
      { name: 'iXBT', url: 'https://www.ixbt.com/export/news.rss' },

      // === ОТРАСЛЕВЫЕ ===
      { name: 'Право.ру', url: 'https://pravo.ru/rss/' },
      { name: 'Российская газета', url: 'https://rg.ru/xml/index.xml' },
      { name: 'Regnum', url: 'https://regnum.ru/rss' },
      { name: 'Взгляд', url: 'https://vz.ru/rss.xml' },
      { name: 'Секрет фирмы', url: 'https://secretmag.ru/rss' },
      { name: 'The Bell', url: 'https://thebell.io/feed' },
    ];
  }

  // === ENGLISH SOURCES ===
  return [
    // === WIRE SERVICES ===
    { name: 'Reuters', url: 'https://feeds.reuters.com/reuters/topNews' },
    { name: 'AP News', url: 'https://rsshub.app/apnews/topics/apf-topnews' },

    // === MAJOR OUTLETS ===
    { name: 'BBC News', url: 'https://feeds.bbci.co.uk/news/rss.xml' },
    { name: 'BBC Business', url: 'https://feeds.bbci.co.uk/news/business/rss.xml' },
    { name: 'The Guardian', url: 'https://www.theguardian.com/world/rss' },
    { name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml' },
    { name: 'NPR News', url: 'https://feeds.npr.org/1001/rss.xml' },
    { name: 'ABC News', url: 'https://abcnews.go.com/abcnews/topstories' },

    // === BUSINESS / FINANCE ===
    { name: 'CNBC', url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html' },
    { name: 'Bloomberg', url: 'https://feeds.bloomberg.com/markets/news.rss' },
    { name: 'Financial Times', url: 'https://www.ft.com/?format=rss' },
    { name: 'MarketWatch', url: 'https://feeds.marketwatch.com/marketwatch/topstories/' },

    // === TECH ===
    { name: 'TechCrunch', url: 'https://techcrunch.com/feed/' },
    { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml' },
    { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index' },
    { name: 'Wired', url: 'https://www.wired.com/feed/rss' },
    { name: 'Hacker News', url: 'https://hnrss.org/newest' },
  ];
}


// ====================================================================
// HELPERS
// ====================================================================

async function fetchWithTimeout(url, ms = 8000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'OSINT-Media-Radar/1.0' }
    });
    return res;
  } finally {
    clearTimeout(timeout);
  }
}

function makeArticle(title, description, url, source, publishedAt, image, origin) {
  return {
    id: hashStr(url || title),
    title: stripHtml(title || ''),
    description: stripHtml(description || ''),
    content: stripHtml(description || ''),
    url: url || '#',
    source,
    publishedAt: publishedAt ? new Date(publishedAt).toISOString() : new Date().toISOString(),
    image: image || null,
    origin
  };
}

function getDateFrom(period) {
  const now = new Date();
  const days = { '1d': 1, '7d': 7, '30d': 30, '90d': 90, '365d': 365 }[period] || 7;
  now.setDate(now.getDate() - days);
  return now.toISOString().split('T')[0] + 'T00:00:00Z';
}

function hashStr(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

// ====================================================================
// RSS PARSER (works with both RSS 2.0 and Atom feeds)
// ====================================================================

async function fetchRSSGeneric(url, sourceName, query, period, isSearchFeed) {
  const results = [];
  try {
    const response = await fetchWithTimeout(url, 8000);
    if (!response.ok) return results;
    const xml = await response.text();

    const items = parseRSSXml(xml);
    const queryLower = query.toLowerCase();
    const periodDate = new Date(getDateFrom(period));

    for (const item of items) {
      const text = (item.title + ' ' + item.description).toLowerCase();
      const pubDate = new Date(item.pubDate);
      const isValid = isNaN(pubDate.getTime()) ? true : pubDate >= periodDate;

      // For search feeds (Google News), include all results
      // For regular RSS, filter by query keyword
      if ((isSearchFeed || text.includes(queryLower)) && isValid) {
        results.push(makeArticle(item.title, item.description, item.link, sourceName, item.pubDate, item.image, 'rss'));
      }
    }
  } catch (e) { /* silently fail */ }
  return results;
}

function parseRSSXml(xml) {
  const items = [];

  // RSS 2.0 <item>
  const rssRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = rssRegex.exec(xml)) !== null) {
    items.push(parseItem(match[1]));
  }

  // Atom <entry> (if no RSS items found)
  if (items.length === 0) {
    const atomRegex = /<entry[^>]*>([\s\S]*?)<\/entry>/gi;
    while ((match = atomRegex.exec(xml)) !== null) {
      const content = match[1];
      const title = extractTag(content, 'title');
      const link = content.match(/<link[^>]*href=["']([^"']+)["']/i)?.[1] || extractTag(content, 'link');
      const description = extractTag(content, 'summary') || extractTag(content, 'content');
      const pubDate = extractTag(content, 'published') || extractTag(content, 'updated');
      if (title) items.push({ title, link, description: stripHtml(description), pubDate, image: null });
    }
  }

  return items;
}

function parseItem(xml) {
  return {
    title: extractTag(xml, 'title'),
    link: extractTag(xml, 'link'),
    description: stripHtml(extractTag(xml, 'description')),
    pubDate: extractTag(xml, 'pubDate') || extractTag(xml, 'dc:date'),
    image: extractImageFromXml(xml)
  };
}

function extractTag(xml, tag) {
  const cdataRegex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, 'i');
  const cdataMatch = xml.match(cdataRegex);
  if (cdataMatch) return cdataMatch[1].trim();
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const m = xml.match(regex);
  return m ? m[1].trim() : '';
}

function extractImageFromXml(xml) {
  const enclosure = xml.match(/enclosure[^>]*url=["']([^"']+)["']/i);
  if (enclosure) return enclosure[1];
  const media = xml.match(/<media:content[^>]*url=["']([^"']+)["']/i);
  if (media) return media[1];
  const img = xml.match(/<img[^>]*src=["']([^"']+)["']/i);
  if (img) return img[1];
  return null;
}

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

// ====================================================================
// DEDUPLICATION
// ====================================================================

function deduplicateArticles(articles) {
  const seen = new Map();
  const unique = [];

  for (const article of articles) {
    if (!article.title) continue;
    // Normalize: lowercase, remove punctuation, take first 8 words
    const words = article.title.toLowerCase()
      .replace(/[^а-яёa-z0-9\s]/gi, '')
      .trim()
      .split(/\s+/)
      .slice(0, 8)
      .join(' ');

    if (words.length > 3 && !seen.has(words)) {
      seen.set(words, true);
      unique.push(article);
    }
  }
  return unique;
}

// ====================================================================
// SENTIMENT ANALYSIS (keyword-based, optimized for Russian)
// ====================================================================

function analyzeSentiment(text, lang) {
  const lower = text.toLowerCase();

  const positive = lang === 'ru'
    ? ['рост', 'прибыль', 'успех', 'достижение', 'развитие', 'инвестиц', 'партнер', 'выигра', 'победа', 'рекорд',
       'увеличени', 'улучшени', 'инновац', 'запуск', 'соглашени', 'одобрен', 'поддержк', 'награ', 'эффективн',
       'позитивн', 'хорош', 'отличн', 'выросл', 'повыш', 'перспектив', 'прорыв', 'лидер', 'стабильн', 'надежн',
       'рекордн', 'прирост', 'дивиденд', 'субсиди', 'грант', 'модернизац', 'оптимизац', 'расширени', 'сотрудничеств',
       'контракт подписа', 'одобри', 'утверд', 'преимуществ', 'укрепл']
    : ['growth', 'profit', 'success', 'achieve', 'develop', 'invest', 'partner', 'win', 'victory', 'record',
       'increase', 'improve', 'innovat', 'launch', 'agreement', 'approv', 'support', 'award', 'efficient',
       'positive', 'good', 'excellent', 'rise', 'boost', 'prospect', 'breakthrough', 'lead', 'stable',
       'reliable', 'dividend', 'expand', 'collaborat', 'strengthen'];

  const negative = lang === 'ru'
    ? ['убыток', 'банкротств', 'скандал', 'штраф', 'арест', 'суд', 'задолженност', 'долг', 'кризис', 'падени',
       'снижени', 'санкци', 'обыск', 'мошенничеств', 'увольнени', 'закрыти', 'провал', 'ликвидаци', 'обвинени',
       'нарушени', 'жалоб', 'иск', 'угроз', 'потер', 'риск', 'проблем', 'негативн', 'конфликт', 'расследовани',
       'хищени', 'коррупц', 'дефицит', 'деградац', 'отставк', 'уголовн', 'взыскани', 'блокировк', 'запрет',
       'ограничени', 'срыв', 'авари', 'катастроф', 'утечк', 'дефолт', 'рецесси', 'инфляци']
    : ['loss', 'bankrupt', 'scandal', 'fine', 'arrest', 'court', 'debt', 'crisis', 'decline', 'drop',
       'sanction', 'raid', 'fraud', 'layoff', 'clos', 'fail', 'liquidat', 'accus', 'violat',
       'complaint', 'lawsuit', 'threat', 'risk', 'problem', 'negative', 'conflict', 'investigat',
       'theft', 'corrupt', 'deficit', 'recession', 'inflation', 'default', 'restrict', 'ban'];

  let posScore = 0, negScore = 0;
  for (const w of positive) if (lower.includes(w)) posScore++;
  for (const w of negative) if (lower.includes(w)) negScore++;

  if (posScore > negScore && posScore >= 1) return { label: 'positive', score: Math.min(posScore / 5, 1) };
  if (negScore > posScore && negScore >= 1) return { label: 'negative', score: Math.min(negScore / 5, 1) };
  return { label: 'neutral', score: 0.5 };
}

// ====================================================================
// EXECUTIVE SUMMARY
// ====================================================================

function generateSummary(articles, query, sourceStats) {
  const total = articles.length;
  if (total === 0) {
    return { text: `По запросу "${query}" не найдено упоминаний в открытых источниках за указанный период.`, redFlags: [], stats: null };
  }

  const pos = articles.filter(a => a.sentiment.label === 'positive').length;
  const neg = articles.filter(a => a.sentiment.label === 'negative').length;
  const neu = articles.filter(a => a.sentiment.label === 'neutral').length;

  const allSources = [...new Set(articles.map(a => a.source))];
  const posPercent = Math.round(pos / total * 100);
  const negPercent = Math.round(neg / total * 100);

  let trend = 'нейтральный';
  if (posPercent > 50) trend = 'преимущественно позитивный';
  else if (negPercent > 40) trend = 'с выраженным негативным уклоном';
  else if (posPercent > negPercent + 15) trend = 'умеренно позитивный';
  else if (negPercent > posPercent + 15) trend = 'с негативным уклоном';

  let text = `По запросу "${query}" найдено ${total} уникальных публикаций из ${allSources.length} источников (${allSources.slice(0, 5).join(', ')}${allSources.length > 5 ? ` и ещё ${allSources.length - 5}` : ''}). `;
  text += `Информационный фон — ${trend}: ${posPercent}% позитивных, ${negPercent}% негативных, ${100 - posPercent - negPercent}% нейтральных. `;

  // Red flags
  const redFlags = [];

  if (negPercent > 40) {
    redFlags.push({ level: 'high', text: `Высокая доля негатива (${negPercent}%) — требует внимания` });
  }

  const scandalKw = ['скандал', 'scandal', 'мошенничеств', 'fraud', 'арест', 'arrest', 'обыск', 'raid', 'хищени', 'коррупц'];
  const scandalCount = articles.filter(a =>
    a.sentiment.label === 'negative' && scandalKw.some(kw => (a.title + ' ' + a.description).toLowerCase().includes(kw))
  ).length;
  if (scandalCount > 0) {
    redFlags.push({ level: 'critical', text: `Упоминания скандалов / расследований / мошенничества (${scandalCount})` });
  }

  const courtKw = ['суд', 'court', 'иск', 'lawsuit', 'банкротств', 'bankrupt', 'ликвидаци', 'liquidat', 'взыскани'];
  const courtCount = articles.filter(a =>
    courtKw.some(kw => (a.title + ' ' + a.description).toLowerCase().includes(kw))
  ).length;
  if (courtCount > 0) {
    redFlags.push({ level: 'medium', text: `Судебные / юридические упоминания (${courtCount})` });
  }

  const sanctionKw = ['санкци', 'sanction', 'блокировк', 'запрет', 'ограничени', 'restrict', 'ban'];
  const sanctionCount = articles.filter(a =>
    sanctionKw.some(kw => (a.title + ' ' + a.description).toLowerCase().includes(kw))
  ).length;
  if (sanctionCount > 0) {
    redFlags.push({ level: 'medium', text: `Упоминания санкций / ограничений (${sanctionCount})` });
  }

  if (redFlags.length > 0) {
    text += `Выявлено ${redFlags.length} сигнал(ов), требующих дополнительной проверки.`;
  } else {
    text += 'Критических сигналов не обнаружено.';
  }

  return { text, redFlags, stats: { total, pos, neg, neu, sources: allSources.length, trend } };
}

// ====================================================================
// TIMELINE
// ====================================================================

function buildTimeline(articles) {
  const dateMap = {};
  for (const a of articles) {
    const date = a.publishedAt?.split('T')[0];
    if (!date) continue;
    if (!dateMap[date]) dateMap[date] = { date, total: 0, positive: 0, negative: 0, neutral: 0 };
    dateMap[date].total++;
    dateMap[date][a.sentiment.label]++;
  }
  return Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));
}
