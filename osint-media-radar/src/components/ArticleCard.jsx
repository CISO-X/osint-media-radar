import React from 'react';
import { ExternalLink, Clock, Newspaper } from 'lucide-react';

const SENTIMENT_STYLES = {
  positive: { bg: 'bg-green-500/10', border: 'border-green-500/30', badge: 'bg-green-500/20 text-green-400', label: 'Позитив' },
  neutral: { bg: 'bg-gray-500/10', border: 'border-gray-600/30', badge: 'bg-gray-500/20 text-gray-400', label: 'Нейтрал' },
  negative: { bg: 'bg-red-500/10', border: 'border-red-500/30', badge: 'bg-red-500/20 text-red-400', label: 'Негатив' },
};

export default function ArticleCard({ article }) {
  const style = SENTIMENT_STYLES[article.sentiment?.label] || SENTIMENT_STYLES.neutral;
  const date = new Date(article.publishedAt);
  const formattedDate = date.toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`block ${style.bg} border ${style.border} rounded-xl p-4 hover:scale-[1.01] transition-all duration-200 group`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${style.badge}`}>
              {style.label}
            </span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Newspaper className="w-3 h-3" />
              {article.source}
            </span>
            <span className="text-xs text-gray-600 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formattedDate}
            </span>
          </div>
          <h4 className="text-sm font-medium text-white group-hover:text-radar-300 transition-colors line-clamp-2 mb-1">
            {article.title}
          </h4>
          {article.description && (
            <p className="text-xs text-gray-500 line-clamp-2">{article.description}</p>
          )}
        </div>
        <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-radar-400 flex-shrink-0 mt-1 transition-colors" />
      </div>
    </a>
  );
}

export function ArticleList({ articles, filter = 'all' }) {
  const filtered = filter === 'all'
    ? articles
    : articles.filter(a => a.sentiment?.label === filter);

  if (!filtered || filtered.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Нет статей для отображения
      </div>
    );
  }

  return (
    <div className="bg-[#141e30] rounded-2xl p-6 border border-radar-800/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-radar-500" />
          Найденные публикации
          <span className="text-sm font-normal text-gray-500">({filtered.length})</span>
        </h3>
      </div>
      <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-1">
        {filtered.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}
