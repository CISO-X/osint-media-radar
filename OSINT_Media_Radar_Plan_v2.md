# OSINT Media Radar — План реализации MVP v2.0

> Обновлено с учётом: подборки ИИ-агентов для ОСИНТ, коллекции cipher387, Maigret, ruosint.guru, OWASP Top 10 for Agentic Applications 2026

---

## 1. Концепция

**OSINT Media Radar** — веб-приложение для мониторинга и анализа информационного фона вокруг компаний и персон. Аналитик вводит ключевые слова (название компании, ФИО, юзернейм) — приложение собирает новости из открытых источников, анализирует тональность, строит таймлайн упоминаний, находит связанные аккаунты в соцсетях и генерирует аналитическую сводку.

**Что изменилось в v2:** добавлен модуль поиска по юзернеймам (на базе Maigret), агентный пайплайн сбора данных (по паттерну AI Journalist Agent), интеграция с каталогами cipher387 и ruosint.guru, учтены рекомендации OWASP по безопасности ИИ-агентов.

---

## 2. Архитектура

```
┌──────────────────────────────────────────────────────────┐
│                      FRONTEND                             │
│               React + Tailwind CSS + Recharts             │
│                                                           │
│  ┌───────────┐ ┌───────────┐ ┌─────────────────────────┐ │
│  │ Поисковая │ │ Таймлайн  │ │ Дашборд тональности     │ │
│  │ панель    │ │ упоминан. │ │ (pie + bar charts)      │ │
│  └───────────┘ └───────────┘ └─────────────────────────┘ │
│  ┌───────────┐ ┌───────────┐ ┌─────────────────────────┐ │
│  │ Карточки  │ │ Облако    │ │ Профили в соцсетях      │ │
│  │ статей    │ │ сущностей │ │ (Maigret-модуль)        │ │
│  └───────────┘ └───────────┘ └─────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Executive Summary + Экспорт (PDF / CSV)              │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────┬─────────────────────────────────┘
                         │ REST API (FastAPI)
┌────────────────────────┴─────────────────────────────────┐
│                      BACKEND                              │
│                 Python 3.11 + FastAPI                      │
│                                                           │
│  ┌─── Коллекторы (сбор) ──────────────────────────────┐  │
│  │ RSS-парсер │ GNews API │ NewsAPI │ Maigret-модуль  │  │
│  └────────────────────────────────────────────────────┘  │
│  ┌─── Анализаторы ────────────────────────────────────┐  │
│  │ Тональность    │ NER (сущности)  │ Дедупликация    │  │
│  │ (dostoevsky)   │ (Natasha)       │ (fuzzy match)   │  │
│  └────────────────────────────────────────────────────┘  │
│  ┌─── Генераторы ─────────────────────────────────────┐  │
│  │ Executive Summary │ PDF-отчёт │ CSV-экспорт        │  │
│  └────────────────────────────────────────────────────┘  │
│  ┌─── Хранилище ──────────────────────────────────────┐  │
│  │ SQLite: статьи, запросы, профили, кэш              │  │
│  └────────────────────────────────────────────────────┘  │
│  ┌─── Безопасность (OWASP Agentic Top 10) ───────────┐  │
│  │ Rate limiting │ Input validation │ Audit log        │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

---

## 3. Стек технологий

| Компонент | Технология | Почему |
|-----------|-----------|--------|
| **Backend** | Python 3.11 + FastAPI | Быстрый async API, богатая экосистема NLP |
| **Frontend** | React + Tailwind CSS + Recharts | Современный UI, красивые графики |
| **БД** | SQLite (→ PostgreSQL для прода) | Zero-config для MVP |
| **Тональность** | dostoevsky (RU) + TextBlob (EN) | Лучшие бесплатные сентимент-модели |
| **NER** | Natasha (RU) | Извлечение имён, компаний, мест из русских текстов |
| **Юзернейм-поиск** | Maigret (Python-библиотека) | 3000+ сайтов, без API-ключей, pip install |
| **Новости** | feedparser + GNews API + NewsAPI | Бесплатные легальные источники |
| **PDF-экспорт** | WeasyPrint | HTML→PDF с графиками |
| **Фоновые задачи** | asyncio + APScheduler | Для периодического мониторинга |

---

## 4. Модули MVP

### 4.1. Поиск и сбор новостей
- **Ввод:** ключевые слова, название компании, ФИО
- **Фильтры:** период (неделя / месяц / год), язык (RU / EN), тип источника
- **Источники:**
  - RSS-ленты крупных СМИ (ТАСС, РБК, Коммерсант, Ведомости, vc.ru, Интерфакс)
  - GNews API (100 запросов/день бесплатно)
  - NewsAPI (100 запросов/день dev-тариф)
- **Дедупликация:** fuzzy-matching заголовков (fuzzywuzzy, порог 85%)
- Вдохновлено: паттерн **AI Journalist Agent** из подборки awesome-llm-apps

### 4.2. Таймлайн упоминаний
- Интерактивная ось: X = даты, Y = количество упоминаний
- Цветовая кодировка по тональности (зелёный / жёлтый / красный)
- Клик по точке раскрывает список статей за дату
- Библиотека: **Recharts** (AreaChart с градиентной заливкой)

### 4.3. Анализ тональности
- Классификация каждой статьи: позитивная / нейтральная / негативная
- **dostoevsky** для русскоязычных текстов (модель FastTextSocialNetworkModel)
- **TextBlob** для англоязычных (polarity score)
- Визуализация: PieChart (распределение) + BarChart (тренд по времени)

### 4.4. Извлечение сущностей (NER)
- **Natasha** (MorphVocab, NamesExtractor, DatesExtractor, MoneyExtractor, AddrExtractor)
- Автоматическое выделение: персоны, организации, локации, даты, суммы
- Облако связанных сущностей (кто/что ещё упоминается вместе с объектом)
- Таблица топ-15 связанных сущностей с частотой

### 4.5. Поиск по юзернейму / персоне (новый модуль)
- Интеграция **Maigret** как Python-библиотеки
- Ввод: юзернейм → поиск по 500 самых популярных сайтов (быстрый режим)
- Результат: список найденных профилей с ссылками, категориями сайтов
- Визуализация: карточки профилей, группировка по категориям (соцсети, форумы, блоги, IT)
- Ссылки на дополнительные OSINT-ресурсы из каталогов **cipher387** и **ruosint.guru**

### 4.6. Executive Summary
- Автоматическая генерация сводки (3-5 предложений):
  - Общее количество упоминаний и тренд
  - Соотношение позитива/негатива
  - Ключевые связанные персоны и организации
  - Красные флаги (резкий рост негатива, упоминания судов/банкротства/скандалов)
- Генерация по шаблону (без LLM для MVP, чтобы не зависеть от API)

### 4.7. Экспорт
- **PDF-отчёт:** графики + таймлайн + summary + список статей (WeasyPrint)
- **CSV:** таблица всех найденных статей с метаданными
- **JSON:** полный дамп результатов для интеграции

---

## 5. Структура проекта

```
osint-media-radar/
│
├── backend/
│   ├── main.py                     # FastAPI: точка входа, CORS, роуты
│   ├── requirements.txt
│   ├── config.py                   # Настройки, API-ключи (env vars)
│   │
│   ├── collectors/                 # Модуль сбора данных
│   │   ├── __init__.py
│   │   ├── base.py                 # Абстрактный коллектор
│   │   ├── rss_collector.py        # feedparser: RSS-ленты СМИ
│   │   ├── gnews_collector.py      # GNews API
│   │   ├── newsapi_collector.py    # NewsAPI.org
│   │   └── username_collector.py   # Обёртка над Maigret
│   │
│   ├── analyzers/                  # Модуль анализа
│   │   ├── __init__.py
│   │   ├── sentiment.py            # dostoevsky + TextBlob
│   │   ├── ner.py                  # Natasha NER
│   │   ├── deduplicator.py         # Fuzzy-дедупликация
│   │   └── summarizer.py           # Шаблонный executive summary
│   │
│   ├── exporters/                  # Модуль экспорта
│   │   ├── __init__.py
│   │   ├── pdf_export.py           # WeasyPrint HTML→PDF
│   │   └── csv_export.py           # CSV генератор
│   │
│   ├── models/                     # БД и модели данных
│   │   ├── __init__.py
│   │   ├── database.py             # SQLite init, сессии
│   │   └── schemas.py              # Pydantic-модели (запрос/ответ)
│   │
│   ├── security/                   # Безопасность (OWASP)
│   │   ├── __init__.py
│   │   ├── rate_limiter.py         # Ограничение запросов
│   │   ├── input_validator.py      # Валидация и санитизация
│   │   └── audit_log.py            # Журнал действий
│   │
│   └── osint_links/                # Каталог внешних OSINT-ресурсов
│       └── resources.json          # Ссылки из cipher387, ruosint.guru
│
├── frontend/
│   ├── package.json
│   ├── tailwind.config.js
│   ├── src/
│   │   ├── App.jsx                 # Главный компонент
│   │   ├── index.css               # Tailwind imports
│   │   │
│   │   ├── components/
│   │   │   ├── SearchBar.jsx       # Панель поиска с фильтрами
│   │   │   ├── Timeline.jsx        # Recharts AreaChart
│   │   │   ├── SentimentChart.jsx  # PieChart + BarChart
│   │   │   ├── EntityCloud.jsx     # Облако сущностей
│   │   │   ├── ArticleCard.jsx     # Карточка статьи
│   │   │   ├── ProfileCard.jsx     # Карточка найденного профиля (Maigret)
│   │   │   ├── Summary.jsx         # Executive Summary
│   │   │   ├── ExportPanel.jsx     # Кнопки экспорта
│   │   │   ├── OsintLinks.jsx      # Ссылки на внешние OSINT-ресурсы
│   │   │   └── Loader.jsx          # Анимация загрузки
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx       # Основная страница результатов
│   │   │   ├── Search.jsx          # Страница поиска
│   │   │   └── History.jsx         # История запросов
│   │   │
│   │   └── api/
│   │       └── client.js           # Axios API-клиент
│   │
│   └── public/
│       └── index.html
│
└── README.md
```

---

## 6. API Endpoints

| Метод | Путь | Описание |
|-------|------|----------|
| `POST` | `/api/search` | Запуск поиска (новости + анализ) |
| `GET` | `/api/results/{id}` | Результаты поиска |
| `GET` | `/api/timeline/{id}` | Данные для таймлайна |
| `GET` | `/api/sentiment/{id}` | Анализ тональности |
| `GET` | `/api/entities/{id}` | Извлечённые сущности |
| `GET` | `/api/summary/{id}` | Executive summary |
| `POST` | `/api/username-search` | Поиск по юзернейму (Maigret) |
| `GET` | `/api/profiles/{id}` | Найденные профили |
| `GET` | `/api/export/pdf/{id}` | PDF-отчёт |
| `GET` | `/api/export/csv/{id}` | CSV-экспорт |
| `GET` | `/api/history` | История запросов |
| `GET` | `/api/osint-links` | Каталог внешних OSINT-ресурсов |

---

## 7. RSS-источники для MVP

| СМИ | RSS | Тематика |
|-----|-----|----------|
| ТАСС | `tass.ru/rss/v2.xml` | Общие новости |
| РБК | `rbc.ru/v10/helper/api/get` | Бизнес, экономика |
| Коммерсантъ | `kommersant.ru/RSS/news.xml` | Бизнес, политика |
| Ведомости | `vedomosti.ru/rss/news` | Экономика, финансы |
| vc.ru | `vc.ru/rss/all` | Технологии, стартапы |
| Интерфакс | `interfax.ru/rss.asp` | Общие новости |
| Хабр | `habr.com/ru/rss/all/all/` | IT и технологии |

---

## 8. Интеграция Maigret (юзернейм-поиск)

**Maigret** — Python-инструмент для поиска аккаунтов по юзернейму на 3000+ сайтах.

```python
# Пример интеграции в backend
import asyncio
from maigret.maigret import maigret_search

async def search_username(username: str):
    """Поиск профилей по юзернейму через Maigret."""
    results = await maigret_search(
        username=username,
        top_sites=500,          # Топ-500 по трафику (быстрый режим)
        timeout=10,
        no_recursion=True,      # Без рекурсивного поиска (для MVP)
    )
    return [
        {
            "site": r.site_name,
            "url": r.url,
            "category": r.site.category,
            "status": r.status
        }
        for r in results if r.status == "Claimed"
    ]
```

**Установка:** `pip install maigret`

---

## 9. Каталог внешних OSINT-ресурсов

Встроенная панель со ссылками на проверенные ресурсы (из cipher387, ruosint.guru, подборки из курса):

| Категория | Ресурс | URL |
|-----------|--------|-----|
| **Каталоги инструментов** | cipher387 OSINT Collection | cipher387.github.io/osint_stuff_tool_collection/ |
| | RuOSINT.guru | ruosint.guru |
| | OSINT Framework | osintframework.com |
| **Проверка компаний (РФ)** | ЕГРЮЛ / ФНС | egrul.nalog.ru |
| | Контур.Фокус | focus.kontur.ru |
| | Rusprofile | rusprofile.ru |
| | Судебные дела | kad.arbitr.ru |
| **Мониторинг СМИ** | Brand Analytics | br-analytics.ru |
| | Медиалогия | mlg.ru |
| **Соцсети и персоны** | Maigret | github.com/soxoj/maigret |
| | Social Links | sociallinks.io |
| **ИИ-агенты для OSINT** | AI Journalist Agent | awesome-llm-apps (GitHub) |
| | AI Deep Research Agent | awesome-llm-apps (GitHub) |
| | AI Competitor Intelligence | awesome-llm-apps (GitHub) |
| | OWASP Social OSINT Agent | owasp.org |

---

## 10. Безопасность (OWASP Top 10 for Agentic Applications 2026)

При разработке учитываем ключевые риски из OWASP:

| Риск | Как митигируем |
|------|---------------|
| **Prompt Injection** | В MVP нет LLM-генерации; summary по шаблону, не по промпту |
| **Tool Misuse** | Ограничение вызовов Maigret (rate limit 5 запросов/мин) |
| **Excessive Agency** | Принцип наименьших полномочий: приложение только читает открытые данные |
| **Data Leakage** | Логи не содержат содержимого статей; API-ключи в env vars |
| **Input Validation** | Санитизация всех входных данных; whitelist символов для юзернеймов |
| **Audit Trail** | Журнал всех запросов с timestamp, IP, типом поиска |
| **Denial of Service** | Rate limiting на API (slowapi); ограничение размера ответов |

---

## 11. План реализации по этапам

### Этап 1: Каркас и инфраструктура (1 день)
- [ ] Инициализация FastAPI-проекта со структурой папок
- [ ] SQLite-модели (articles, searches, profiles)
- [ ] Pydantic-схемы для API
- [ ] React-каркас с Tailwind CSS, роутинг
- [ ] Базовый UI: SearchBar + пустой Dashboard

### Этап 2: Сбор новостей (1-2 дня)
- [ ] RSS-коллектор (feedparser) — парсинг 7 источников
- [ ] GNews API коллектор (с обработкой лимитов)
- [ ] Дедупликация заголовков (fuzzywuzzy)
- [ ] Сохранение в SQLite с индексацией по дате и ключевым словам
- [ ] API endpoint: POST /api/search → GET /api/results/{id}

### Этап 3: NLP-анализ (2 дня)
- [ ] Анализ тональности (dostoevsky FastTextSocialNetworkModel)
- [ ] NER через Natasha (персоны, организации, локации)
- [ ] Шаблонный Executive Summary (без LLM)
- [ ] API endpoints для sentiment, entities, summary

### Этап 4: Юзернейм-поиск (1 день)
- [ ] Интеграция Maigret как Python-модуля
- [ ] Асинхронный поиск с таймаутами
- [ ] API: POST /api/username-search → GET /api/profiles/{id}
- [ ] Кэширование результатов (TTL: 24 часа)

### Этап 5: Визуализация (2 дня)
- [ ] Таймлайн на Recharts (AreaChart)
- [ ] Круговая диаграмма тональности (PieChart)
- [ ] Гистограмма тренда (BarChart)
- [ ] Облако/таблица сущностей
- [ ] Карточки статей с цветовой маркировкой
- [ ] Карточки профилей (Maigret-результаты)
- [ ] Панель Executive Summary

### Этап 6: Экспорт и polish (1 день)
- [ ] PDF-генератор (WeasyPrint: HTML-шаблон → PDF)
- [ ] CSV-экспорт
- [ ] История запросов
- [ ] Панель внешних OSINT-ресурсов
- [ ] Адаптивный дизайн + loading states + error handling

### Этап 7: Безопасность и тестирование (1 день)
- [ ] Rate limiting (slowapi)
- [ ] Input validation / sanitization
- [ ] Audit logging
- [ ] Тест на реальных запросах: Сбербанк, Яндекс, Газпром
- [ ] Проверка NER и тональности на русских текстах
- [ ] Нагрузочный тест (100+ статей)

**Итого: 8-10 рабочих дней до работающего MVP.**

---

## 12. Установка и запуск

```bash
# 1. Клонировать репозиторий
git clone <repo-url> && cd osint-media-radar

# 2. Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# Скачать модель тональности для dostoevsky
python -m dostoevsky download fasttext-social-network-model

# Запуск
uvicorn main:app --reload --port 8000

# 3. Frontend (в другом терминале)
cd frontend
npm install
npm start
# Откроется на http://localhost:3000
```

### requirements.txt
```
fastapi==0.110.0
uvicorn[standard]==0.29.0
feedparser==6.0.11
aiohttp==3.9.3
python-dotenv==1.0.1
dostoevsky==0.6.0
natasha==1.6.0
fuzzywuzzy==0.18.0
python-Levenshtein==0.25.0
maigret==0.4.4
weasyprint==62.0
slowapi==0.1.9
pydantic==2.6.0
sqlalchemy==2.0.27
```

---

## 13. Пример использования

```
1. Аналитик открывает OSINT Media Radar в браузере
2. Вводит: "Яндекс" | период: последний месяц | язык: RU
3. Система собирает ~150 статей из RSS + GNews
4. Дедупликация оставляет ~95 уникальных
5. dostoevsky классифицирует: 40 позитив, 35 нейтрал, 20 негатив
6. Natasha выделяет: "Аркадий Волож", "Mail.ru", "Казахстан", "IPO"
7. Таймлайн показывает пик упоминаний 15 марта (запуск нового продукта)
8. Summary: "За последний месяц Яндекс упоминался 95 раз..."
9. Аналитик переключается на вкладку "Юзернеймы" → ищет "yandex_official"
10. Maigret находит 12 профилей на разных платформах
11. Экспорт в PDF → отчёт готов для руководства
```

---

## 14. Дальнейшее развитие (v2.0+)

На основе изученных ресурсов, после MVP можно расширить:

| Фича | Источник идеи |
|-------|--------------|
| **ИИ-агент для автоматического исследования** | AI Deep Research Agent (awesome-llm-apps) |
| **Конкурентная разведка** | AI Competitor Intelligence Agent Team |
| **Due Diligence модуль** | AI VC Due Diligence Agent Team |
| **RAG по собранным документам** | Agentic RAG with Reasoning |
| **Мониторинг Telegram-каналов** | cipher387 collection / Social Links |
| **Граф связей (мини-Maltego)** | Social Links Crimewall, D3.js force graph |
| **Проверка ЕГРЮЛ** | rusprofile API / SPARK |
| **Интеграция локальных LLM** | Ollama + Qwen/LLaMA для summary |
| **Автомониторинг по расписанию** | APScheduler + email/Telegram уведомления |
| **Анализ YouTube-видео** | Chat with YouTube (awesome-llm-apps) |

---

## 15. Правовые аспекты

Приложение работает исключительно с **открытыми источниками** в соответствии с принципами курса ВШЭ "ИИ в OSINT":

- RSS-ленты — публичные, предназначены для машинного чтения
- Новостные API — официальные интерфейсы с условиями использования
- Maigret — проверяет только публичные профили (без авторизации)
- Никакого парсинга закрытых разделов, авторизованного контента
- Соблюдение ФЗ-152: не собираем и не храним персональные данные
- Соответствие OWASP Top 10 for Agentic Applications 2026
- Принципы OSINT: **легальность, этичность, методичность**
