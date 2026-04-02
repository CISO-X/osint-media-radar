import React from 'react';

const TABS = [
  { key: 'all', label: 'Все', color: 'text-radar-400' },
  { key: 'positive', label: 'Позитив', color: 'text-green-400' },
  { key: 'neutral', label: 'Нейтрал', color: 'text-gray-400' },
  { key: 'negative', label: 'Негатив', color: 'text-red-400' },
];

export default function FilterTabs({ activeFilter, onFilterChange, stats }) {
  return (
    <div className="flex gap-2">
      {TABS.map(({ key, label, color }) => {
        const count = key === 'all'
          ? (stats?.positive || 0) + (stats?.neutral || 0) + (stats?.negative || 0)
          : stats?.[key] || 0;

        return (
          <button
            key={key}
            onClick={() => onFilterChange(key)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-1.5 ${
              activeFilter === key
                ? 'bg-radar-600/30 text-white border border-radar-500/40'
                : 'bg-[#1a2332] text-gray-500 hover:text-gray-300 border border-transparent'
            }`}
          >
            <span className={activeFilter === key ? color : ''}>{label}</span>
            <span className="text-xs opacity-60">{count}</span>
          </button>
        );
      })}
    </div>
  );
}
