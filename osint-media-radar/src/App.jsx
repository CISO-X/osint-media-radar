import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import Timeline from './components/Timeline';
import SentimentChart from './components/SentimentChart';
import Summary from './components/Summary';
import { ArticleList } from './components/ArticleCard';
import FilterTabs from './components/FilterTabs';
import OsintLinks from './components/OsintLinks';
import { generateDemoData } from './utils/demo-data';
import { Radar, AlertCircle, Zap } from 'lucide-react';

export default function App() {
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [articleFilter, setArticleFilter] = useState('all');

  const handleSearch = useCallback(async ({ query, period, lang }) => {
    setIsLoading(true);
    setError(null);
    setArticleFilter('all');

    try {
      // Try real API first
      const params = new URLSearchParams({ q: query, period, lang });
      const response = await fetch(`/api/search?${params}`);

      if (response.ok) {
        const data = await response.json();
        if (data.totalResults > 0) {
          setResults(data);
          setIsLoading(false);
          return;
        }
      }
    } catch (e) {
      console.log('API not available, using demo data');
    }

    // Fallback to demo data
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate loading
    const demoData = generateDemoData(query);
    setResults(demoData);
    setIsLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-[#0f1729]">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        {!results && !isLoading && (
          <div className="text-center mb-12 mt-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-radar-500 to-radar-700 mb-6 relative">
              <Radar className="w-10 h-10 text-white" />
              <div className="absolute inset-0 rounded-2xl bg-radar-500/20 animate-radar" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">
              Мониторинг информационного фона
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto mb-2">
              Введите название компании или ФИО — система соберёт новости из открытых источников,
              проанализирует тональность и сгенерирует аналитическую сводку
            </p>
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-600">
              <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> RSS-ленты крупных СМИ</span>
              <span>|</span>
              <span>Анализ тональности</span>
              <span>|</span>
              <span>Executive Summary</span>
              <span>|</span>
              <span>Красные флаги</span>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mb-8">
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative w-20 h-20 mb-6">
              <div className="absolute inset-0 rounded-full border-2 border-radar-800/50" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-radar-500 animate-spin" />
              <div className="absolute inset-3 rounded-full border-2 border-transparent border-t-radar-400 animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
              <Radar className="absolute inset-0 m-auto w-6 h-6 text-radar-400" />
            </div>
            <p className="text-gray-400 animate-pulse">Сканирование открытых источников...</p>
            <p className="text-xs text-gray-600 mt-2">Сбор новостей, анализ тональности, генерация сводки</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-sm text-red-300">{error}</span>
          </div>
        )}

        {/* Results */}
        {results && !isLoading && (
          <div className="space-y-6">
            {/* Demo banner */}
            {results.isDemo && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <div>
                  <span className="text-sm text-yellow-300">Демо-режим. </span>
                  <span className="text-sm text-gray-400">
                    Для работы с реальными данными добавьте GNEWS_API_KEY в переменные окружения Vercel.
                    Бесплатный ключ: <a href="https://gnews.io" target="_blank" rel="noopener noreferrer" className="text-radar-400 hover:underline">gnews.io</a>
                  </span>
                </div>
              </div>
            )}

            {/* Summary */}
            <Summary summary={results.summary} isDemo={results.isDemo} />

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Timeline data={results.timeline} />
              <SentimentChart stats={results.sentimentStats} />
            </div>

            {/* Articles */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <FilterTabs
                  activeFilter={articleFilter}
                  onFilterChange={setArticleFilter}
                  stats={results.sentimentStats}
                />
              </div>
              <ArticleList articles={results.articles} filter={articleFilter} />
            </div>

            {/* OSINT Resources */}
            <OsintLinks />
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 pb-8 border-t border-radar-800/30 pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <Radar className="w-4 h-4 text-radar-600" />
              <span>OSINT Media Radar — ВШЭ, Институт проблем безопасности, 2026</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Только открытые источники</span>
              <span>|</span>
              <span>Соответствие ФЗ-152</span>
              <span>|</span>
              <a href="https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/"
                target="_blank" rel="noopener noreferrer" className="hover:text-radar-400 transition-colors">
                OWASP Agentic Top 10
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
