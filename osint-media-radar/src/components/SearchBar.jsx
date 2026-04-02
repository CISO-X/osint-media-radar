import React, { useState } from 'react';
import { Search, Radio, Filter } from 'lucide-react';

export default function SearchBar({ onSearch, isLoading }) {
  const [query, setQuery] = useState('');
  const [period, setPeriod] = useState('30d');
  const [lang, setLang] = useState('ru');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim().length >= 2) {
      onSearch({ query: query.trim(), period, lang });
    }
  };

  const quickSearches = ['Сбербанк', 'Яндекс', 'Газпром', 'Роснефть', 'Тинькофф', 'Wildberries'];

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-radar-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Введите название компании, ФИО или ключевое слово..."
            className="w-full pl-12 pr-4 py-4 bg-[#1a2332] border border-radar-800/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-radar-500 focus:border-transparent text-lg transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || query.trim().length < 2}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-radar-600 hover:bg-radar-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg font-medium transition-all flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Поиск...
              </>
            ) : (
              <>
                <Radio className="w-4 h-4" />
                Сканировать
              </>
            )}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Filter className="w-4 h-4" />
            <span>Период:</span>
          </div>
          {[
            { value: '1d', label: '24 часа' },
            { value: '7d', label: 'Неделя' },
            { value: '30d', label: 'Месяц' },
            { value: '90d', label: '3 месяца' },
          ].map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setPeriod(value)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                period === value
                  ? 'bg-radar-600 text-white'
                  : 'bg-[#1a2332] text-gray-400 hover:text-white hover:bg-[#243044]'
              }`}
            >
              {label}
            </button>
          ))}

          <div className="w-px h-6 bg-gray-700 mx-1" />

          <span className="text-sm text-gray-400">Язык:</span>
          {[
            { value: 'ru', label: 'RU' },
            { value: 'en', label: 'EN' },
          ].map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setLang(value)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                lang === value
                  ? 'bg-radar-600 text-white'
                  : 'bg-[#1a2332] text-gray-400 hover:text-white hover:bg-[#243044]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-600 bg-[#1a2332]/50 rounded-lg px-3 py-2">
          <span className="text-radar-400 font-medium">50+ источников:</span>
          <span>Google News</span><span className="text-gray-700">|</span>
          <span>ТАСС</span><span className="text-gray-700">|</span>
          <span>РБК</span><span className="text-gray-700">|</span>
          <span>Коммерсант</span><span className="text-gray-700">|</span>
          <span>Ведомости</span><span className="text-gray-700">|</span>
          <span>Forbes</span><span className="text-gray-700">|</span>
          <span>Лента.ру</span><span className="text-gray-700">|</span>
          <span>РИА</span><span className="text-gray-700">|</span>
          <span className="text-gray-500">и ещё 40+</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-gray-500 self-center mr-1">Быстрый поиск:</span>
          {quickSearches.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => { setQuery(q); onSearch({ query: q, period, lang }); }}
              className="px-3 py-1 rounded-full text-xs bg-[#1a2332] text-gray-400 hover:text-radar-300 hover:bg-[#243044] border border-gray-700/50 transition-all"
            >
              {q}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
}
