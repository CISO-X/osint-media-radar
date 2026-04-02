# OSINT Media Radar

Веб-приложение для мониторинга и анализа информационного фона вокруг компаний и персон.

**Возможности:**
- Сбор новостей из RSS-лент крупных СМИ (ТАСС, РБК, Коммерсант, Ведомости, vc.ru, Интерфакс)
- Анализ тональности (позитив / нейтрал / негатив) для русских и английских текстов
- Таймлайн упоминаний с цветовой кодировкой
- Executive Summary с автоматическим выявлением красных флагов
- Каталог OSINT-ресурсов (cipher387, RuOSINT, OSINT Framework и др.)

---

## Быстрый старт (локально)

```bash
# 1. Клонировать
git clone <your-repo-url>
cd osint-media-radar

# 2. Установить зависимости
npm install

# 3. Запустить
npm run dev

# Откроется на http://localhost:5173
```

Приложение работает в **демо-режиме** без API-ключа. Для реальных данных нужен GNews API.

---

## Деплой на Vercel (5 минут)

### Шаг 1: Создать GitHub-репозиторий

```bash
cd osint-media-radar
git init
git add .
git commit -m "Initial commit: OSINT Media Radar"
git remote add origin https://github.com/YOUR_USERNAME/osint-media-radar.git
git push -u origin main
```

### Шаг 2: Получить API-ключ GNews (бесплатно)

1. Зайти на https://gnews.io
2. Зарегистрироваться (бесплатно, 100 запросов/день)
3. Скопировать API-ключ

### Шаг 3: Развернуть на Vercel

1. Зайти на https://vercel.com и войти через GitHub
2. Нажать **"Add New Project"**
3. Выбрать репозиторий `osint-media-radar`
4. В настройках проекта:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. В разделе **Environment Variables** добавить:
   - `GNEWS_API_KEY` = ваш ключ от gnews.io
6. Нажать **Deploy**

Через ~1 минуту сайт будет доступен по адресу `https://osint-media-radar.vercel.app`

---

## Альтернатива: деплой на Netlify

```bash
# Установить Netlify CLI
npm install -g netlify-cli

# Собрать проект
npm run build

# Развернуть
netlify deploy --prod --dir=dist
```

> Примечание: на Netlify serverless API (`/api/search`) не будет работать из коробки — приложение будет работать в демо-режиме. Для полной функциональности используйте Vercel.

---

## Структура проекта

```
osint-media-radar/
├── api/
│   └── search.js          # Vercel serverless: сбор новостей + анализ
├── src/
│   ├── App.jsx            # Главный компонент
│   ├── components/
│   │   ├── SearchBar.jsx      # Панель поиска с фильтрами
│   │   ├── Timeline.jsx       # График упоминаний (Recharts)
│   │   ├── SentimentChart.jsx # Диаграмма тональности
│   │   ├── Summary.jsx        # Executive Summary
│   │   ├── ArticleCard.jsx    # Карточки статей
│   │   ├── FilterTabs.jsx     # Фильтры по тональности
│   │   ├── Header.jsx         # Шапка с навигацией
│   │   └── OsintLinks.jsx     # Каталог OSINT-ресурсов
│   └── utils/
│       ├── sentiment.js       # Анализ тональности
│       └── demo-data.js       # Демо-данные
├── package.json
├── vercel.json
├── vite.config.js
└── tailwind.config.js
```

---

## Источники данных (50+ источников)

### Без API-ключа (работает сразу):

| Источник | Тип | Кол-во |
|----------|-----|--------|
| **Google News RSS** | Поисковая RSS-лента | Неограниченно |
| **Информагентства** (ТАСС, РИА Новости, Интерфакс) | RSS | 3 |
| **Деловые СМИ** (РБК, Коммерсант, Ведомости, Forbes) | RSS | 5 |
| **Общие новости** (Лента.ру, Газета.ру, Известия, RT и др.) | RSS | 7 |
| **IT/Технологии** (vc.ru, Хабр, CNews, TAdviser, 3DNews) | RSS | 6 |
| **Отраслевые** (Право.ру, Рос. газета, The Bell и др.) | RSS | 6 |
| **EN источники** (BBC, Reuters, Guardian, CNBC, TechCrunch и др.) | RSS | 17 |

### С бесплатным API-ключом (опционально):

| API | Лимит (бесплатно) | Регистрация |
|-----|-------------------|-------------|
| **GNews API** | 100 запросов/день | https://gnews.io |
| **NewsData.io** | 200 кредитов/день | https://newsdata.io |
| **Currents API** | 600 запросов/день | https://currentsapi.services |

---

## Правовые аспекты

- Работает только с **открытыми источниками** (RSS, публичные API)
- Не собирает и не хранит персональные данные
- Соответствует принципам OSINT: легальность, этичность, методичность
- Учтены рекомендации OWASP Top 10 for Agentic Applications 2026

---

## Технологии

React, Vite, Tailwind CSS, Recharts, Lucide Icons, Vercel Serverless Functions

---

*ВШЭ, Институт проблем безопасности, магистерская программа «Аналитик деловой разведки», 2026*
